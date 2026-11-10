import { computeBuyersPremium, getReserveStatus } from "@/lib/auction/engine";
import { prisma } from "@/lib/db/client";
import { notify } from "@/lib/notify";

export async function closeDueAuctions(now = new Date()) {
  const due = await prisma.auction.findMany({
    where: { status: "LIVE", endsAt: { lte: now } },
    include: { listing: true, leader: true },
  });

  let sold = 0;
  let reserveNotMet = 0;
  let noBids = 0;

  for (const auction of due) {
    const outcome = await prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM "Auction"
        WHERE id = ${auction.id} AND status = 'LIVE' AND "endsAt" <= ${now}
        FOR UPDATE SKIP LOCKED
      `;
      if (!locked.length) return null;
      const fresh = await tx.auction.findUniqueOrThrow({
        where: { id: auction.id },
        include: { listing: true, leader: true },
      });
      const seller = await tx.user.findUniqueOrThrow({ where: { id: fresh.listing.sellerId } });

      if (fresh.bidCount === 0) {
        await tx.auction.update({ where: { id: fresh.id }, data: { status: "ENDED_NO_BIDS" } });
        await tx.listing.update({ where: { id: fresh.listingId }, data: { status: "EXPIRED" } });
        await notify(seller.id, "AUCTION_NO_BIDS", { listingId: fresh.listingId, slug: fresh.listing.slug }, {
          to: seller.email,
          subject: `No bids on ${fresh.listing.title}`,
          text: `${fresh.listing.title} ended with no bids. You can relist it from your dashboard.`,
        });
        return "none" as const;
      }

      const reserve = getReserveStatus(fresh.currentPrice, fresh.reservePrice ?? undefined, fresh.bidCount);
      if (reserve === "NOT_MET") {
        await tx.auction.update({ where: { id: fresh.id }, data: { status: "RESERVE_NOT_MET" } });
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        if (fresh.leaderId) {
          await tx.offer.create({
            data: {
              listingId: fresh.listingId,
              buyerId: fresh.leaderId,
              amount: fresh.currentPrice,
              status: "PENDING",
              message: "Best-offer window opened because the reserve was not met.",
              expiresAt,
            },
          });
          const leader = fresh.leader ?? (await tx.user.findUnique({ where: { id: fresh.leaderId } }));
          if (leader) {
            await notify(leader.id, "RESERVE_NOT_MET", { listingId: fresh.listingId, slug: fresh.listing.slug }, {
              to: leader.email,
              subject: `Reserve not met on ${fresh.listing.title}`,
              text: `You have 24 hours to submit a best offer on ${fresh.listing.title}.`,
            });
          }
        }
        await notify(seller.id, "RESERVE_NOT_MET", { listingId: fresh.listingId }, {
          to: seller.email,
          subject: `Reserve not met on ${fresh.listing.title}`,
          text: `Bidding ended below the reserve. The high bidder has 24 hours to make a best offer.`,
        });
        return "reserve" as const;
      }

      const premium = computeBuyersPremium(fresh.currentPrice);
      await tx.auction.update({
        where: { id: fresh.id },
        data: { status: "SOLD", soldPrice: fresh.currentPrice, buyersPremium: premium },
      });
      await tx.listing.update({ where: { id: fresh.listingId }, data: { status: "SOLD" } });
      await tx.bid.updateMany({
        where: { auctionId: fresh.id, bidderId: fresh.leaderId ?? undefined, status: "LEADING" },
        data: { status: "WON" },
      });
      if (fresh.leaderId) {
        await tx.order.create({
          data: {
            listingId: fresh.listingId,
            buyerId: fresh.leaderId,
            sellerId: fresh.listing.sellerId,
            hammerPrice: fresh.currentPrice,
            buyersPremium: premium,
            total: fresh.currentPrice + premium,
            status: "PENDING_DEPOSIT",
          },
        });
        const buyer = fresh.leader ?? (await tx.user.findUnique({ where: { id: fresh.leaderId } }));
        if (buyer) {
          await notify(buyer.id, "AUCTION_WON", { listingId: fresh.listingId, slug: fresh.listing.slug, total: fresh.currentPrice + premium }, {
            to: buyer.email,
            subject: `You won ${fresh.listing.title}`,
            text: `Hammer PKR ${fresh.currentPrice.toLocaleString("en-PK")}. Buyer's premium PKR ${premium.toLocaleString("en-PK")}. Pay the seller by bank transfer or cash. An admin marks the payment once it is received.`,
          });
        }
      }
      await tx.user.update({ where: { id: seller.id }, data: { salesCount: { increment: 1 } } });
      await notify(seller.id, "AUCTION_SOLD", { listingId: fresh.listingId, slug: fresh.listing.slug }, {
        to: seller.email,
        subject: `Sold: ${fresh.listing.title}`,
        text: `${fresh.listing.title} sold for PKR ${fresh.currentPrice.toLocaleString("en-PK")}.`,
      });
      return "sold" as const;
    });

    if (outcome === "sold") sold += 1;
    if (outcome === "reserve") reserveNotMet += 1;
    if (outcome === "none") noBids += 1;
  }

  return { processed: due.length, sold, reserveNotMet, noBids };
}
