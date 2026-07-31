/**
 * Database seed.
 *
 * Reads the same deterministic dataset the app uses in no-DB mode
 * (`src/lib/db/seed-data.ts`) and writes it into Postgres, so a freshly
 * provisioned database looks exactly like the demo.
 *
 *   npx prisma migrate dev --name init
 *   npm run db:seed
 */

import { PrismaClient } from "@prisma/client";
import { LISTINGS, SELLERS, BIDS_BY_AUCTION, RESERVES } from "../src/lib/db/seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing existing data…");
  // Order matters — children first.
  await prisma.inspectionItem.deleteMany();
  await prisma.inspectionCategory.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.watchlist.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  console.log(`Seeding ${SELLERS.length} users…`);
  for (const s of SELLERS) {
    await prisma.user.create({
      data: {
        id: s.id,
        email: `${s.handle}@seed.pakoption.pk`,
        name: s.name,
        handle: s.handle,
        role: s.role,
        tier: s.tier,
        city: s.city,
        rating: s.rating,
        salesCount: s.salesCount,
        createdAt: new Date(s.memberSince),
      },
    });
  }

  // A pool of bidder accounts so bid rows have a real foreign key.
  const bidderHandles = Array.from(
    new Set(
      Object.values(BIDS_BY_AUCTION)
        .flat()
        .map((b) => b.bidderHandle),
    ),
  );

  console.log(`Seeding ${bidderHandles.length} bidders…`);
  const bidderIds = new Map<string, string>();
  for (const handle of bidderHandles) {
    const user = await prisma.user.create({
      data: {
        email: `${handle}@seed.pakoption.pk`,
        name: handle,
        handle,
        role: "BUYER",
        tier: "CNIC",
      },
    });
    bidderIds.set(handle, user.id);
  }

  console.log(`Seeding ${LISTINGS.length} listings…`);
  for (const l of LISTINGS) {
    await prisma.listing.create({
      data: {
        id: l.id,
        slug: l.slug,
        sellerId: l.seller.id,
        type: l.type,
        status: l.status,
        title: l.title,
        description: l.description,
        make: l.make,
        model: l.model,
        variant: l.variant,
        year: l.year,
        registrationCity: l.registrationCity,
        registrationYear: l.registrationYear,
        chassisNumber: l.chassisNumber,
        mileageKm: l.mileageKm,
        transmission: l.transmission,
        fuelType: l.fuelType,
        bodyType: l.bodyType,
        assembly: l.assembly,
        engineCc: l.engineCc,
        colour: l.colour,
        ownersCount: l.ownersCount,
        hasAccidentHistory: l.hasAccidentHistory,
        accidentNotes: l.accidentNotes,
        hasFloodDamage: l.hasFloodDamage,
        serviceHistoryAvailable: l.serviceHistoryAvailable,
        auctionSheetGrade: l.auctionSheetGrade,
        askingPrice: l.askingPrice,
        isNegotiable: l.isNegotiable,
        features: l.features,
        viewCount: l.viewCount,
        watchCount: l.watchCount,
        isFeatured: l.isFeatured,
        publishedAt: new Date(l.publishedAt),
        images: {
          create: l.images.map((img) => ({
            url: img.url,
            alt: img.alt,
            order: img.order,
            isPrimary: img.isPrimary,
            angle: img.angle,
          })),
        },
      },
    });

    // ---- auction ----
    if (l.auction) {
      const a = l.auction;
      const bids = BIDS_BY_AUCTION[a.id] ?? [];
      const leaderHandle = bids[0]?.bidderHandle;

      await prisma.auction.create({
        data: {
          id: a.id,
          listingId: l.id,
          status: a.status,
          startingPrice: a.startingPrice,
          reservePrice: RESERVES[a.id] ?? null,
          currentPrice: a.currentPrice,
          leaderId: leaderHandle ? bidderIds.get(leaderHandle) : null,
          leaderMaxBid: bids[0] ? bids[0].amount + 100_000 : null,
          bidCount: a.bidCount,
          bidderCount: a.bidderCount,
          startsAt: new Date(a.startsAt),
          endsAt: new Date(a.endsAt),
          originalEndsAt: new Date(a.originalEndsAt),
          extensionCount: a.extensionCount,
          soldPrice: a.soldPrice ?? null,
        },
      });

      for (const b of bids) {
        const bidderId = bidderIds.get(b.bidderHandle);
        if (!bidderId) continue;
        await prisma.bid.create({
          data: {
            auctionId: a.id,
            bidderId,
            amount: b.amount,
            maxAmount: b.amount,
            isAutoBid: b.isAutoBid,
            status: b.status,
            placedAt: new Date(b.placedAt),
          },
        });
      }
    }

    // ---- inspection ----
    if (l.inspection) {
      const insp = l.inspection;
      await prisma.inspection.create({
        data: {
          id: insp.id,
          reference: insp.reference,
          publicToken: insp.publicToken,
          listingId: l.id,
          customerId: l.seller.id,
          package: insp.packageId,
          status: insp.status,
          city: insp.city,
          isDoorstep: insp.isDoorstep,
          scheduledAt: insp.scheduledAt ? new Date(insp.scheduledAt) : null,
          completedAt: insp.completedAt ? new Date(insp.completedAt) : null,
          overallScore: insp.overallScore,
          grade: insp.grade,
          checkpointsTotal: insp.checkpointsTotal,
          checkpointsPassed: insp.checkpointsPassed,
          summary: insp.summary,
          price: insp.price,
          categories: {
            create: insp.categories.map((c) => ({
              name: c.name,
              slug: c.slug,
              score: c.score,
              weight: c.weight,
              itemsTotal: c.itemsTotal,
              itemsPassed: c.itemsPassed,
              items: {
                create: c.items.map((i) => ({
                  label: i.label,
                  severity: i.severity,
                  note: i.note,
                  photoUrls: i.photoUrls ?? [],
                })),
              },
            })),
          },
        },
      });
    }
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
