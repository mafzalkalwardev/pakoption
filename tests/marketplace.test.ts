import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { prisma } from "../src/lib/db/client";
import { loginAccount, registerAccount } from "../src/lib/auth/accounts";
import { placeBid } from "../src/lib/domain/bids";
import { closeDueAuctions } from "../src/lib/domain/close";
import { DomainError } from "../src/lib/domain/errors";
import { approveListing, createListing } from "../src/lib/domain/listings";

const stamp = Date.now();
const sellerEmail = `seller-${stamp}@test.pakoption.local`;
const buyerEmail = `buyer-${stamp}@test.pakoption.local`;

const listingInput = {
  make: "Toyota",
  model: "Corolla",
  variant: "Altis",
  year: 2020,
  registrationCity: "Lahore",
  mileageKm: 42000,
  transmission: "AUTOMATIC",
  fuelType: "PETROL",
  bodyType: "SEDAN",
  assembly: "LOCAL",
  engineCc: 1800,
  colour: "White",
  ownersCount: 1,
  features: ["ABS"],
  photos: Array.from({ length: 8 }, (_, index) => `/uploads/test-${stamp}-${index}.jpg`),
  hasAccidentHistory: false,
  hasFloodDamage: false,
  serviceHistoryAvailable: true,
  attestation: true,
  type: "AUCTION",
  startingPrice: 1_000_000,
  reservePrice: 1_200_000,
  durationDays: 3,
  isNegotiable: false,
  title: `2020 Toyota Corolla Altis ${stamp}`,
  description: "Test listing created by the marketplace suite. The car is described here so the minimum length is met.",
};

describe("marketplace", () => {
  let sellerId = "";
  let buyerId = "";
  let listingId = "";

  before(async () => {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
    const seller = await registerAccount({
      name: "Test Seller",
      email: sellerEmail,
      phone: `0300${String(stamp).slice(-7)}`,
      password: "seller-pass-1",
      confirmPassword: "seller-pass-1",
      acceptTerms: true,
    }, { session: false });
    sellerId = seller.id;
    const buyer = await registerAccount({
      name: "Test Buyer",
      email: buyerEmail,
      phone: `0311${String(stamp).slice(-7)}`,
      password: "buyer-pass-1",
      confirmPassword: "buyer-pass-1",
      acceptTerms: true,
    }, { session: false });
    buyerId = buyer.id;
  });

  after(async () => {
    const ids = [sellerId, buyerId].filter(Boolean);
    const listings = await prisma.listing.findMany({ where: { sellerId: { in: ids } }, select: { id: true } });
    const listingIds = listings.map((listing) => listing.id);
    await prisma.order.deleteMany({ where: { OR: [{ listingId: { in: listingIds } }, { buyerId: { in: ids } }, { sellerId: { in: ids } }] } });
    await prisma.offer.deleteMany({ where: { OR: [{ listingId: { in: listingIds } }, { buyerId: { in: ids } }] } });
    await prisma.inspection.deleteMany({ where: { OR: [{ listingId: { in: listingIds } }, { customerId: { in: ids } }] } });
    await prisma.auditLog.deleteMany({ where: { actorId: { in: ids } } });
    await prisma.notification.deleteMany({ where: { userId: { in: ids } } });
    await prisma.session.deleteMany({ where: { userId: { in: ids } } });
    await prisma.listing.deleteMany({ where: { sellerId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    await prisma.$disconnect();
  });

  it("rejects a wrong password", async () => {
    await assert.rejects(
      () => loginAccount({ email: sellerEmail, password: "not-the-password" }, false),
      (error: unknown) => error instanceof DomainError && error.code === "UNAUTHENTICATED",
    );
  });

  it("creates a listing that stays in review until an admin approves it", async () => {
    const created = await createListing(sellerId, listingInput);
    listingId = created.id;
    assert.equal(created.status, "PENDING_REVIEW");
    await approveListing(listingId, sellerId);
    const live = await prisma.listing.findUniqueOrThrow({ where: { id: listingId }, include: { auction: true } });
    assert.equal(live.status, "LIVE");
    assert.equal(live.auction?.status, "LIVE");
  });

  it("persists a bid and refuses a self-bid", async () => {
    await assert.rejects(
      () => placeBid({ userId: sellerId, listingId, maxAmount: 1_050_000 }),
      (error: unknown) => error instanceof DomainError && error.code === "SELF_BID",
    );
    const result = await placeBid({ userId: buyerId, listingId, maxAmount: 1_500_000 });
    assert.equal(result.persisted, true);
    assert.equal(result.outcome, "LEADING");
    const stored = await prisma.bid.findFirst({ where: { bidderId: buyerId } });
    assert.ok(stored);
    assert.equal(stored.maxAmount, 1_500_000);
  });

  it("closes an ended auction below reserve without inventing a sale", async () => {
    const auction = await prisma.auction.findUniqueOrThrow({ where: { listingId } });
    await prisma.auction.update({ where: { id: auction.id }, data: { endsAt: new Date(Date.now() - 1000) } });
    const closed = await closeDueAuctions();
    assert.ok(closed.reserveNotMet >= 1);
    const after = await prisma.auction.findUniqueOrThrow({ where: { id: auction.id } });
    assert.equal(after.status, "RESERVE_NOT_MET");
    const order = await prisma.order.findUnique({ where: { listingId } });
    assert.equal(order, null);
  });
});
