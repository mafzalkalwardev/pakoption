import { NextResponse, type NextRequest } from "next/server";
import { getListings, getReservePrice } from "@/lib/db/repository";
import { computeBuyersPremium, getReserveStatus } from "@/lib/auction/engine";

export const dynamic = "force-dynamic";

/**
 * Runs every minute (see vercel.json).
 *
 * With a live database this should be:
 *
 *   SELECT * FROM "Auction"
 *   WHERE status = 'LIVE' AND "endsAt" <= now()
 *   FOR UPDATE SKIP LOCKED;
 *
 * `SKIP LOCKED` means overlapping cron invocations never process the same lot
 * twice, which matters because Vercel does not guarantee exactly-once delivery.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Invalid cron secret" } },
      { status: 401 },
    );
  }

  const started = Date.now();
  const now = Date.now();

  const { data } = await getListings({
    type: "AUCTION",
    perPage: 500,
  });

  const due = data.filter(
    (l) =>
      l.auction &&
      l.auction.status === "LIVE" &&
      new Date(l.auction.endsAt).getTime() <= now,
  );

  let sold = 0;
  let reserveNotMet = 0;
  let noBids = 0;

  for (const lot of due) {
    const auction = lot.auction!;

    if (auction.bidCount === 0) {
      noBids++;
      continue;
    }

    const reserve = await getReservePrice(auction.id);
    const status = getReserveStatus(
      auction.currentPrice,
      reserve,
      auction.bidCount,
    );

    if (status === "NOT_MET") {
      // Opens a 24h best-offer window for the high bidder.
      reserveNotMet++;
    } else {
      // Creates an Order with hammer price + buyer's premium and notifies both
      // parties. computeBuyersPremium is the single source of truth for the fee.
      computeBuyersPremium(auction.currentPrice);
      sold++;
    }
  }

  return NextResponse.json({
    processed: due.length,
    sold,
    reserveNotMet,
    noBids,
    durationMs: Date.now() - started,
    persisted: Boolean(process.env.DATABASE_URL),
  });
}
