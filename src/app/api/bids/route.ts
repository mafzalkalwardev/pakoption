import { NextResponse, type NextRequest } from "next/server";
import { getBidsForAuction, getListingById, getReservePrice } from "@/lib/db/repository";
import {
  applySoftClose,
  getAuctionPhase,
  resolveBid,
  shouldExtend,
  type AuctionState,
} from "@/lib/auction/engine";
import { bidSchema } from "@/lib/validations";

/**
 * Public bid log for an auction. Bidder maximums are never included.
 */
export async function GET(req: NextRequest) {
  const auctionId = new URL(req.url).searchParams.get("auctionId");
  if (!auctionId) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "auctionId is required" } },
      { status: 422 },
    );
  }

  const bids = await getBidsForAuction(auctionId);
  return NextResponse.json({
    data: bids.map((b) => ({
      handle: b.bidderHandle,
      amount: b.amount,
      isAutoBid: b.isAutoBid,
      placedAt: b.placedAt,
    })),
  });
}

/**
 * JSON mirror of the `placeBid` server action.
 *
 * NOTE: this handler runs the real engine but does not yet persist, because the
 * seed adapter is read-only. When `DATABASE_URL` is set, wrap steps 3–7 in a
 * transaction that takes `SELECT … FOR UPDATE` on the auction row — see
 * docs/API.md §"placeBid" for the exact sequence.
 */
export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid JSON body" } },
      { status: 422 },
    );
  }

  const parsed = bidSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Check the submitted values",
          details: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 422 },
    );
  }

  const { listingId, maxAmount } = parsed.data;

  const listing = await getListingById(listingId);
  if (!listing?.auction) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Lot not found" } },
      { status: 404 },
    );
  }

  const now = new Date();
  const phase = getAuctionPhase(
    new Date(listing.auction.startsAt),
    new Date(listing.auction.endsAt),
    now,
  );

  if (phase === "ENDED" || phase === "UPCOMING") {
    return NextResponse.json(
      {
        error: {
          code: "AUCTION_NOT_LIVE",
          message:
            phase === "ENDED"
              ? "Bidding has closed on this lot"
              : "This lot has not opened for bidding yet",
        },
      },
      { status: 409 },
    );
  }

  const reservePrice = await getReservePrice(listing.auction.id);

  const state: AuctionState = {
    startingPrice: listing.auction.startingPrice,
    currentPrice: listing.auction.currentPrice,
    bidCount: listing.auction.bidCount,
    reservePrice,
    startsAt: new Date(listing.auction.startsAt),
    endsAt: new Date(listing.auction.endsAt),
  };

  // TODO: replace "anonymous" with the authenticated session user id.
  const resolution = resolveBid(state, {
    bidderId: "anonymous",
    maxAmount,
    placedAt: now,
  });

  if (!resolution.accepted) {
    return NextResponse.json(
      {
        error: {
          code: resolution.reason,
          message: resolution.message,
          field: "maxAmount",
        },
        minimumBid: resolution.minimumBid,
      },
      { status: 422 },
    );
  }

  const extended = shouldExtend(state.endsAt, now);
  const endsAt = applySoftClose(state.endsAt, now);

  return NextResponse.json({
    ok: true,
    outcome: resolution.isLeading ? "LEADING" : "OUTBID",
    currentPrice: resolution.currentPrice,
    bidCount: resolution.bidCount,
    endsAt: endsAt.toISOString(),
    extended,
    persisted: false,
    note: "Running in demo mode — set DATABASE_URL to persist bids.",
  });
}
