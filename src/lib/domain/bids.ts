import { prisma } from "@/lib/db/client";
import { notify } from "@/lib/notify";
import {
  applySoftClose,
  CNIC_REQUIRED_ABOVE,
  getAuctionPhase,
  resolveBid,
  type AuctionState,
} from "@/lib/auction/engine";
import { DomainError } from "@/lib/domain/errors";

const TIER_RANK = { NONE: 0, EMAIL: 1, PHONE: 2, CNIC: 3, DEALER_VERIFIED: 4 } as const;

export async function placeBid(input: { userId: string; listingId: string; maxAmount: number }) {
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) throw new DomainError("UNAUTHENTICATED", "Sign in to bid.", 401);
  if (TIER_RANK[user.tier] < TIER_RANK.EMAIL) {
    throw new DomainError("NOT_VERIFIED", "Verify your email before bidding.", 403);
  }

  return prisma.$transaction(async (tx) => {
    const listing = await tx.listing.findUnique({
      where: { id: input.listingId },
      include: { auction: true },
    });
    if (!listing?.auction) throw new DomainError("NOT_FOUND", "Auction not found.", 404);
    if (listing.sellerId === user.id) {
      throw new DomainError("SELF_BID", "You cannot bid on your own lot.", 422);
    }
    if (input.maxAmount > CNIC_REQUIRED_ABOVE && TIER_RANK[user.tier] < TIER_RANK.CNIC) {
      throw new DomainError("NOT_VERIFIED", "Lots above PKR 5,000,000 require CNIC verification.", 403);
    }

    await tx.$queryRaw`SELECT id FROM "Auction" WHERE id = ${listing.auction.id} FOR UPDATE`;
    const auction = await tx.auction.findUniqueOrThrow({ where: { id: listing.auction.id } });
    const now = new Date();
    const phase = getAuctionPhase(auction.startsAt, auction.endsAt, now);
    if (auction.status !== "LIVE" || phase === "UPCOMING" || phase === "ENDED") {
      throw new DomainError("AUCTION_NOT_LIVE", "This auction is not accepting bids.", 409);
    }

    const duplicate = await tx.bid.findFirst({
      where: {
        auctionId: auction.id,
        bidderId: user.id,
        maxAmount: input.maxAmount,
        placedAt: { gte: new Date(now.getTime() - 3000) },
      },
    });
    if (duplicate) {
      return {
        ok: true as const,
        outcome: auction.leaderId === user.id ? ("LEADING" as const) : ("OUTBID" as const),
        currentPrice: auction.currentPrice,
        bidCount: auction.bidCount,
        endsAt: auction.endsAt.toISOString(),
        extended: false,
        persisted: true,
      };
    }

    const state: AuctionState = {
      startingPrice: auction.startingPrice,
      currentPrice: auction.currentPrice,
      bidCount: auction.bidCount,
      leaderId: auction.leaderId ?? undefined,
      leaderMaxBid: auction.leaderMaxBid ?? undefined,
      reservePrice: auction.reservePrice ?? undefined,
      startsAt: auction.startsAt,
      endsAt: auction.endsAt,
    };
    const resolution = resolveBid(state, {
      bidderId: user.id,
      maxAmount: input.maxAmount,
      placedAt: now,
    });
    if (!resolution.accepted) {
      throw new DomainError(resolution.reason, resolution.message, 422, { minimumBid: resolution.minimumBid });
    }

    const endsAt = applySoftClose(auction.endsAt, now);
    const extended = endsAt.getTime() !== auction.endsAt.getTime();
    const previousLeader = auction.leaderId;

    await tx.bid.updateMany({
      where: { auctionId: auction.id, status: "LEADING" },
      data: { status: "OUTBID" },
    });

    for (const row of resolution.bidsToRecord) {
      const created = await tx.bid.create({
        data: {
          auctionId: auction.id,
          bidderId: row.bidderId,
          amount: row.amount,
          maxAmount: row.maxAmount,
          isAutoBid: row.isAutoBid,
          status: "OUTBID",
          placedAt: now,
        },
      });
      if (row.bidderId === resolution.leaderId && row.amount === resolution.currentPrice) {
        await tx.bid.update({ where: { id: created.id }, data: { status: "LEADING" } });
      }
    }

    const bidders = await tx.bid.groupBy({ by: ["bidderId"], where: { auctionId: auction.id } });
    await tx.auction.update({
      where: { id: auction.id },
      data: {
        currentPrice: resolution.currentPrice,
        bidCount: resolution.bidCount,
        bidderCount: bidders.length,
        leaderId: resolution.leaderId,
        leaderMaxBid: resolution.leaderMaxBid,
        endsAt,
        extensionCount: extended ? { increment: 1 } : undefined,
      },
    });

    if (previousLeader && previousLeader !== resolution.leaderId) {
      const previous = await tx.user.findUnique({ where: { id: previousLeader } });
      if (previous) {
        await notify(
          previous.id,
          "OUTBID",
          { listingId: listing.id, slug: listing.slug, currentPrice: resolution.currentPrice },
          {
            to: previous.email,
            subject: `Outbid on ${listing.title}`,
            text: `You were outbid on ${listing.title}. The current price is PKR ${resolution.currentPrice.toLocaleString("en-PK")}.`,
          },
        );
      }
    }

    return {
      ok: true as const,
      outcome: resolution.isLeading ? ("LEADING" as const) : ("OUTBID" as const),
      currentPrice: resolution.currentPrice,
      bidCount: resolution.bidCount,
      endsAt: endsAt.toISOString(),
      extended,
      persisted: true,
    };
  });
}
