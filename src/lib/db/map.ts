import type { Listing as DbListing, Prisma } from "@prisma/client";
import { getReserveStatus } from "@/lib/auction/engine";
import type {
  AuctionPublic,
  Bid,
  Inspection,
  Listing,
  ListingCard,
  PublicUser,
} from "@/types";

const DAY = 24 * 60 * 60 * 1000;

export const listingInclude = {
  seller: true,
  images: { orderBy: { order: "asc" as const } },
  auction: { include: { leader: true } },
  inspection: {
    include: {
      inspector: true,
      categories: { include: { items: true } },
    },
  },
} satisfies Prisma.ListingInclude;

export type ListingRow = Prisma.ListingGetPayload<{ include: typeof listingInclude }>;

export function toPublicUser(user: {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string | null;
  city: string | null;
  role: PublicUser["role"];
  tier: PublicUser["tier"];
  rating: number;
  salesCount: number;
  createdAt: Date;
}): PublicUser {
  return {
    id: user.id,
    name: user.name,
    handle: user.handle,
    avatarUrl: user.avatarUrl ?? undefined,
    city: user.city ?? undefined,
    role: user.role,
    tier: user.tier,
    rating: user.rating,
    salesCount: user.salesCount,
    memberSince: user.createdAt.toISOString(),
  };
}

export function toAuction(row: NonNullable<ListingRow["auction"]>): AuctionPublic {
  return {
    id: row.id,
    status: row.status,
    startingPrice: row.startingPrice,
    currentPrice: row.currentPrice,
    bidCount: row.bidCount,
    bidderCount: row.bidderCount,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    originalEndsAt: row.originalEndsAt.toISOString(),
    extensionCount: row.extensionCount,
    reserveStatus: getReserveStatus(row.currentPrice, row.reservePrice ?? undefined, row.bidCount),
    leaderHandle: row.leader?.handle,
    soldPrice: row.soldPrice ?? undefined,
  };
}

function certified(row: ListingRow): boolean {
  const report = row.inspection;
  if (!report || !report.completedAt || !report.grade) return false;
  if (report.grade !== "A" && report.grade !== "B") return false;
  return Date.now() - report.completedAt.getTime() < 30 * DAY;
}

export function toInspection(row: NonNullable<ListingRow["inspection"]>): Inspection {
  return {
    id: row.id,
    reference: row.reference,
    publicToken: row.publicToken,
    listingId: row.listingId ?? undefined,
    packageId: row.package,
    status: row.status,
    city: row.city,
    isDoorstep: row.isDoorstep,
    inspectorName: row.inspector?.name,
    scheduledAt: row.scheduledAt?.toISOString(),
    completedAt: row.completedAt?.toISOString(),
    overallScore: row.overallScore ?? 0,
    grade: row.grade ?? "D",
    checkpointsTotal: row.checkpointsTotal ?? 0,
    checkpointsPassed: row.checkpointsPassed ?? 0,
    summary: row.summary ?? "",
    price: row.price,
    categories: row.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      score: cat.score,
      weight: cat.weight,
      itemsTotal: cat.itemsTotal,
      itemsPassed: cat.itemsPassed,
      items: cat.items.map((item) => ({
        id: item.id,
        label: item.label,
        severity: item.severity,
        note: item.note ?? undefined,
        photoUrls: item.photoUrls,
      })),
    })),
  };
}

export function toListing(row: ListingRow): Listing {
  return {
    id: row.id,
    slug: row.slug,
    type: row.type,
    status: row.status,
    title: row.title,
    description: row.description,
    make: row.make,
    model: row.model,
    variant: row.variant,
    year: row.year,
    registrationCity: row.registrationCity,
    registrationYear: row.registrationYear ?? undefined,
    chassisNumber: row.chassisNumber ?? undefined,
    mileageKm: row.mileageKm,
    transmission: row.transmission,
    fuelType: row.fuelType,
    bodyType: row.bodyType,
    assembly: row.assembly,
    engineCc: row.engineCc,
    colour: row.colour,
    ownersCount: row.ownersCount,
    hasAccidentHistory: row.hasAccidentHistory,
    accidentNotes: row.accidentNotes ?? undefined,
    hasFloodDamage: row.hasFloodDamage,
    serviceHistoryAvailable: row.serviceHistoryAvailable,
    auctionSheetGrade: row.auctionSheetGrade ?? undefined,
    askingPrice: row.askingPrice ?? undefined,
    isNegotiable: row.isNegotiable,
    features: row.features,
    images: row.images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      order: image.order,
      isPrimary: image.isPrimary,
      angle: image.angle ?? undefined,
    })),
    seller: toPublicUser(row.seller),
    auction: row.auction ? toAuction(row.auction) : undefined,
    inspection: row.inspection ? toInspection(row.inspection) : undefined,
    viewCount: row.viewCount,
    watchCount: row.watchCount,
    isFeatured: row.isFeatured,
    publishedAt: (row.publishedAt ?? row.createdAt).toISOString(),
  };
}

export function toCard(row: ListingRow): ListingCard {
  const listing = toListing(row);
  const image = listing.images[0];
  return {
    id: listing.id,
    slug: listing.slug,
    type: listing.type,
    title: listing.title,
    make: listing.make,
    model: listing.model,
    year: listing.year,
    mileageKm: listing.mileageKm,
    registrationCity: listing.registrationCity,
    transmission: listing.transmission,
    fuelType: listing.fuelType,
    bodyType: listing.bodyType,
    image: image?.url ?? "",
    imageAlt: image?.alt ?? listing.title,
    askingPrice: listing.askingPrice,
    auction: listing.auction,
    isCertified: certified(row),
    inspectionScore: row.inspection?.overallScore ?? undefined,
    inspectionGrade: row.inspection?.grade ?? undefined,
    isFeatured: listing.isFeatured,
    watchCount: listing.watchCount,
  };
}

export function toBid(row: {
  id: string;
  auctionId: string;
  amount: number;
  isAutoBid: boolean;
  status: Bid["status"];
  placedAt: Date;
  bidder: { handle: string };
}): Bid {
  return {
    id: row.id,
    auctionId: row.auctionId,
    bidderHandle: row.bidder.handle,
    amount: row.amount,
    isAutoBid: row.isAutoBid,
    status: row.status,
    placedAt: row.placedAt.toISOString(),
  };
}

export function priceOf(row: ListingRow): number {
  return row.auction?.currentPrice ?? row.askingPrice ?? 0;
}

export type { DbListing };
