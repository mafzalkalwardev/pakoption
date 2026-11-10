import { prisma } from "@/lib/db/client";
import { DomainError } from "@/lib/domain/errors";
import { notify } from "@/lib/notify";
import { offerSchema } from "@/lib/validations";

export async function submitOffer(userId: string, raw: unknown) {
  const parsed = offerSchema.safeParse(raw);
  if (!parsed.success) throw new DomainError("VALIDATION_ERROR", "Enter an offer amount.", 422);
  const listing = await prisma.listing.findUnique({
    where: { id: parsed.data.listingId },
    include: { seller: true, auction: true },
  });
  if (!listing) throw new DomainError("NOT_FOUND", "Listing not found.", 404);
  if (listing.sellerId === userId) throw new DomainError("FORBIDDEN", "You cannot offer on your own listing.", 403);
  const allowed =
    listing.type === "CLASSIFIED" ||
    listing.auction?.status === "RESERVE_NOT_MET";
  if (!allowed) throw new DomainError("FORBIDDEN", "Offers are open on classifieds and reserve-not-met auctions.", 403);

  const offer = await prisma.offer.create({
    data: {
      listingId: listing.id,
      buyerId: userId,
      amount: parsed.data.amount,
      message: parsed.data.message?.replace(/(\+92|0)?3\d{2}[\s-]?\d{7}/g, "[removed]"),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
  });
  await notify(listing.sellerId, "OFFER", { listingId: listing.id, amount: offer.amount, offerId: offer.id }, {
    to: listing.seller.email,
    subject: `New offer on ${listing.title}`,
    text: `A buyer offered PKR ${offer.amount.toLocaleString("en-PK")} on ${listing.title}.`,
  });
  return { id: offer.id, status: offer.status };
}

export async function respondToOffer(userId: string, offerId: string, action: "ACCEPTED" | "DECLINED") {
  const offer = await prisma.offer.findUnique({ include: { listing: true, buyer: true }, where: { id: offerId } });
  if (!offer) throw new DomainError("NOT_FOUND", "Offer not found.", 404);
  if (offer.listing.sellerId !== userId) throw new DomainError("FORBIDDEN", "Only the seller can respond.", 403);
  const updated = await prisma.offer.update({ where: { id: offerId }, data: { status: action } });
  if (action === "ACCEPTED") {
    await prisma.listing.update({ where: { id: offer.listingId }, data: { status: "SOLD" } });
    await prisma.order.upsert({
      where: { listingId: offer.listingId },
      update: { status: "PENDING_DEPOSIT", hammerPrice: offer.amount, total: offer.amount, buyersPremium: 0 },
      create: {
        listingId: offer.listingId,
        buyerId: offer.buyerId,
        sellerId: userId,
        hammerPrice: offer.amount,
        buyersPremium: 0,
        total: offer.amount,
        status: "PENDING_DEPOSIT",
      },
    });
  }
  await notify(offer.buyerId, "OFFER_RESPONSE", { offerId, status: action }, {
    to: offer.buyer.email,
    subject: `Offer ${action.toLowerCase()} on ${offer.listing.title}`,
    text: `The seller ${action === "ACCEPTED" ? "accepted" : "declined"} your offer.`,
  });
  return updated;
}

export async function toggleWatch(userId: string, listingId: string) {
  const existing = await prisma.watchlist.findUnique({ where: { userId_listingId: { userId, listingId } } });
  if (existing) {
    await prisma.watchlist.delete({ where: { userId_listingId: { userId, listingId } } });
    await prisma.listing.update({ where: { id: listingId }, data: { watchCount: { decrement: 1 } } });
    return { watching: false };
  }
  await prisma.watchlist.create({ data: { userId, listingId } });
  await prisma.listing.update({ where: { id: listingId }, data: { watchCount: { increment: 1 } } });
  return { watching: true };
}

export async function saveSearch(userId: string, name: string, query: unknown) {
  return prisma.savedSearch.create({
    data: { userId, name, queryJson: query as object, alertFrequency: "DAILY" },
  });
}

export async function sendMessage(userId: string, listingId: string, body: string) {
  const cleaned = body.replace(/(\+92|0)?3\d{2}[\s-]?\d{7}/g, "[removed]").trim();
  if (cleaned.length < 1) throw new DomainError("VALIDATION_ERROR", "Write a message.", 422);
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new DomainError("NOT_FOUND", "Listing not found.", 404);
  let conversation = await prisma.conversation.findFirst({
    where: { listingId, participantIds: { hasEvery: [userId, listing.sellerId] } },
  });
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { listingId, participantIds: [userId, listing.sellerId] },
    });
  }
  const message = await prisma.message.create({
    data: { conversationId: conversation.id, senderId: userId, body: cleaned },
  });
  const recipient = userId === listing.sellerId ? null : listing.sellerId;
  if (recipient) {
    await notify(recipient, "MESSAGE", { listingId, conversationId: conversation.id });
  }
  return message;
}
