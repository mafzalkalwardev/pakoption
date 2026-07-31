import { NextResponse } from "next/server";
import { getBidsForAuction, getListingBySlug } from "@/lib/db/repository";
import { getAuctionPhase, getMinimumBid, getIncrement } from "@/lib/auction/engine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing || !listing.auction) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Lot not found" } },
      { status: 404 },
    );
  }

  const bids = await getBidsForAuction(listing.auction.id);
  const now = new Date();
  const phase = getAuctionPhase(
    new Date(listing.auction.startsAt),
    new Date(listing.auction.endsAt),
    now,
  );
  const ended = phase === "ENDED";

  // The reserve price and every bidder's maximum stay on the server. Clients
  // receive only the derived reserve status and the visible bid amounts.
  const body = {
    data: {
      ...listing,
      auction: {
        ...listing.auction,
        phase,
        nextMinimumBid: getMinimumBid(
          listing.auction.currentPrice,
          listing.auction.bidCount,
          listing.auction.startingPrice,
        ),
        increment: getIncrement(listing.auction.currentPrice),
      },
      bids: bids.slice(0, 50),
    },
  };

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": ended
        ? "public, s-maxage=3600, stale-while-revalidate=86400"
        : "no-store",
    },
  });
}
