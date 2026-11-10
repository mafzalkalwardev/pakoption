import { randomBytes } from "node:crypto";
import { INSPECTION_PACKAGES } from "@/lib/constants";
import { prisma } from "@/lib/db/client";
import { DomainError } from "@/lib/domain/errors";
import { publishListingSchema } from "@/lib/validations";

function slugify(parts: string[]) {
  const base = parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${base}-${randomBytes(3).toString("hex")}`;
}

export async function createListing(userId: string, raw: unknown) {
  const parsed = publishListingSchema.safeParse(raw);
  if (!parsed.success) {
    throw new DomainError("VALIDATION_ERROR", "Check the listing and try again.", 422, {
      details: parsed.error.flatten(),
    });
  }
  const input = parsed.data;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new DomainError("UNAUTHENTICATED", "Sign in to list a car.", 401);

  const now = new Date();
  const durationMs = (input.type === "AUCTION" ? input.durationDays ?? 7 : 0) * 24 * 60 * 60 * 1000;
  const endsAt = new Date(now.getTime() + (durationMs || 7 * 24 * 60 * 60 * 1000));
  const title = `${input.year} ${input.make} ${input.model} ${input.variant}`.replace(/\s+/g, " ").trim();
  const slug = slugify([String(input.year), input.make, input.model, input.variant, input.registrationCity]);

  const listing = await prisma.listing.create({
    data: {
      slug,
      sellerId: user.id,
      type: input.type,
      status: "PENDING_REVIEW",
      title,
      description: input.description,
      make: input.make,
      model: input.model,
      variant: input.variant,
      year: input.year,
      registrationCity: input.registrationCity,
      mileageKm: input.mileageKm,
      transmission: input.transmission,
      fuelType: input.fuelType,
      bodyType: input.bodyType,
      assembly: input.assembly,
      engineCc: input.engineCc,
      colour: input.colour,
      ownersCount: input.ownersCount,
      hasAccidentHistory: input.hasAccidentHistory,
      accidentNotes: input.accidentNotes,
      hasFloodDamage: input.hasFloodDamage,
      serviceHistoryAvailable: input.serviceHistoryAvailable,
      auctionSheetGrade: input.auctionSheetGrade,
      askingPrice: input.type === "CLASSIFIED" ? input.askingPrice : null,
      isNegotiable: input.isNegotiable ?? true,
      features: input.features,
      images: {
        create: input.photos.map((url, order) => ({
          url,
          alt: `${title} — photo ${order + 1}`,
          order,
          isPrimary: order === 0,
        })),
      },
      auction:
        input.type === "AUCTION"
          ? {
              create: {
                status: "SCHEDULED",
                startingPrice: input.startingPrice ?? input.askingPrice ?? 0,
                reservePrice: input.reservePrice,
                currentPrice: input.startingPrice ?? input.askingPrice ?? 0,
                startsAt: now,
                endsAt,
                originalEndsAt: endsAt,
              },
            }
          : undefined,
    },
  });

  if (input.bookInspection) {
    const pack = INSPECTION_PACKAGES.find((item) => item.id === input.inspectionPackage) ?? INSPECTION_PACKAGES[1]!;
    const year = now.getFullYear();
    const count = await prisma.inspection.count();
    await prisma.inspection.create({
      data: {
        reference: `PO-INS-${year}-${String(count + 1).padStart(5, "0")}`,
        listingId: listing.id,
        customerId: user.id,
        package: pack.id,
        status: "REQUESTED",
        city: input.registrationCity,
        isDoorstep: true,
        price: pack.price,
      },
    });
  }

  if (user.role === "BUYER") {
    await prisma.user.update({ where: { id: user.id }, data: { role: "SELLER" } });
  }

  return { id: listing.id, slug: listing.slug, status: listing.status };
}

export async function approveListing(listingId: string, actorId: string) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId }, include: { auction: true } });
  if (!listing) throw new DomainError("NOT_FOUND", "Listing not found.", 404);
  const now = new Date();
  const duration = listing.auction
    ? listing.auction.endsAt.getTime() - listing.auction.startsAt.getTime()
    : 0;
  await prisma.listing.update({
    where: { id: listingId },
    data: {
      status: "LIVE",
      publishedAt: now,
      auction: listing.auction
        ? {
            update: {
              status: "LIVE",
              startsAt: now,
              endsAt: new Date(now.getTime() + Math.max(duration, 60 * 60 * 1000)),
              originalEndsAt: new Date(now.getTime() + Math.max(duration, 60 * 60 * 1000)),
            },
          }
        : undefined,
    },
  });
  await prisma.auditLog.create({
    data: { actorId, action: "LISTING_APPROVED", entity: "Listing", entityId: listingId },
  });
}

export async function rejectListing(listingId: string, actorId: string) {
  await prisma.listing.update({ where: { id: listingId }, data: { status: "REJECTED" } });
  await prisma.auditLog.create({
    data: { actorId, action: "LISTING_REJECTED", entity: "Listing", entityId: listingId },
  });
}
