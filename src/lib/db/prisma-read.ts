import type { Prisma } from "@prisma/client";
import { getAuctionPhase } from "@/lib/auction/engine";
import type { ListingQuery, Paginated, PlatformStats } from "@/types";
import { prisma } from "@/lib/db/client";
import { listingInclude, priceOf, toCard, toInspection, toListing, type ListingRow } from "@/lib/db/map";

function matches(row: ListingRow, query: ListingQuery): boolean {
  if (query.type && row.type !== query.type) return false;
  if (query.status && row.auction) {
    const phase = getAuctionPhase(row.auction.startsAt, row.auction.endsAt, new Date());
    if (query.status === "live" && phase !== "LIVE" && phase !== "ENDING_SOON") return false;
    if (query.status === "upcoming" && phase !== "UPCOMING") return false;
    if (query.status === "ended" && phase !== "ENDED") return false;
  }
  if (query.status === "live" && row.type === "AUCTION" && !row.auction) return false;
  if (query.q) {
    const needle = query.q.toLowerCase();
    const hay = `${row.title} ${row.make} ${row.model} ${row.registrationCity} ${row.description}`.toLowerCase();
    if (!hay.includes(needle)) return false;
  }
  if (query.make?.length && !query.make.includes(row.make)) return false;
  if (query.model?.length && !query.model.includes(row.model)) return false;
  if (query.city?.length && !query.city.includes(row.registrationCity)) return false;
  if (query.bodyType?.length && !query.bodyType.includes(row.bodyType)) return false;
  if (query.fuelType?.length && !query.fuelType.includes(row.fuelType)) return false;
  if (query.transmission?.length && !query.transmission.includes(row.transmission)) return false;
  if (query.yearMin && row.year < query.yearMin) return false;
  if (query.yearMax && row.year > query.yearMax) return false;
  if (query.mileageMax && row.mileageKm > query.mileageMax) return false;
  const price = priceOf(row);
  if (query.priceMin && price < query.priceMin) return false;
  if (query.priceMax && price > query.priceMax) return false;
  if (query.certified && !toCard(row).isCertified) return false;
  if (query.noReserve && row.auction?.reservePrice != null) return false;
  return true;
}

function sortRows(rows: ListingRow[], sort: ListingQuery["sort"]): ListingRow[] {
  const copy = [...rows];
  switch (sort) {
    case "price_asc":
      return copy.sort((a, b) => priceOf(a) - priceOf(b));
    case "price_desc":
      return copy.sort((a, b) => priceOf(b) - priceOf(a));
    case "mileage":
      return copy.sort((a, b) => a.mileageKm - b.mileageKm);
    case "score":
      return copy.sort((a, b) => (b.inspection?.overallScore ?? 0) - (a.inspection?.overallScore ?? 0));
    case "newest":
      return copy.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    case "ending":
    default:
      return copy.sort((a, b) => {
        const ea = a.auction?.endsAt.getTime() ?? Number.POSITIVE_INFINITY;
        const eb = b.auction?.endsAt.getTime() ?? Number.POSITIVE_INFINITY;
        return ea - eb;
      });
  }
}

async function loadPublic(where: Prisma.ListingWhereInput = {}): Promise<ListingRow[]> {
  return prisma.listing.findMany({
    where: { status: { in: ["LIVE", "SOLD", "EXPIRED"] }, ...where },
    include: listingInclude,
  });
}

export async function prismaGetListings(query: ListingQuery = {}): Promise<Paginated<ReturnType<typeof toCard>>> {
  const rows = sortRows((await loadPublic()).filter((row) => matches(row, query)), query.sort);
  const page = query.page ?? 1;
  const perPage = query.perPage ?? 24;
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const p = Math.min(Math.max(1, page), totalPages);
  return {
    data: rows.slice((p - 1) * perPage, p * perPage).map(toCard),
    meta: { page: p, perPage, total, totalPages },
  };
}

export async function prismaGetListingBySlug(slug: string) {
  const row = await prisma.listing.findUnique({ where: { slug }, include: listingInclude });
  return row ? toListing(row) : null;
}

export async function prismaGetListingById(id: string) {
  const row = await prisma.listing.findUnique({ where: { id }, include: listingInclude });
  return row ? toListing(row) : null;
}

export async function prismaGetCardsBySlugs(slugs: string[]) {
  const rows = await prisma.listing.findMany({ where: { slug: { in: slugs } }, include: listingInclude });
  const bySlug = new Map(rows.map((row) => [row.slug, row]));
  return slugs.map((slug) => bySlug.get(slug)).filter((row): row is ListingRow => Boolean(row)).map(toCard);
}

export async function prismaGetCardsByIds(ids: string[]) {
  const rows = await prisma.listing.findMany({ where: { id: { in: ids } }, include: listingInclude });
  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids.map((id) => byId.get(id)).filter((row): row is ListingRow => Boolean(row)).map(toCard);
}

export async function prismaGetBids(auctionId: string) {
  const rows = await prisma.bid.findMany({
    where: { auctionId },
    include: { bidder: true },
    orderBy: { placedAt: "desc" },
    take: 50,
  });
  return rows.map((row) => ({
    id: row.id,
    auctionId: row.auctionId,
    bidderHandle: row.bidder.handle,
    amount: row.amount,
    isAutoBid: row.isAutoBid,
    status: row.status,
    placedAt: row.placedAt.toISOString(),
  }));
}

export async function prismaGetReserve(auctionId: string) {
  const row = await prisma.auction.findUnique({ where: { id: auctionId }, select: { reservePrice: true } });
  return row?.reservePrice ?? undefined;
}

export async function prismaGetInspectionByToken(token: string) {
  const row = await prisma.inspection.findUnique({
    where: { publicToken: token },
    include: listingInclude.inspection.include,
  });
  return row ? toInspection(row) : null;
}

export async function prismaGetInspectionByReference(reference: string) {
  const row = await prisma.inspection.findUnique({
    where: { reference },
    include: listingInclude.inspection.include,
  });
  return row ? toInspection(row) : null;
}

export async function prismaGetSampleInspection() {
  const row = await prisma.inspection.findFirst({
    where: { status: "COMPLETED" },
    orderBy: { overallScore: "desc" },
    include: listingInclude.inspection.include,
  });
  return row ? toInspection(row) : null;
}

export async function prismaGetStats(): Promise<PlatformStats> {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const [liveAuctions, carsSold, inspectionsCompleted, registeredBidders, soldThisMonth, ended] = await Promise.all([
    prisma.auction.count({ where: { status: "LIVE", endsAt: { gt: now }, startsAt: { lte: now } } }),
    prisma.listing.count({ where: { status: "SOLD" } }),
    prisma.inspection.count({ where: { status: "COMPLETED" } }),
    prisma.user.count(),
    prisma.order.aggregate({ _sum: { hammerPrice: true }, where: { createdAt: { gte: monthStart }, status: { not: "CANCELLED" } } }),
    prisma.auction.count({ where: { status: { in: ["SOLD", "RESERVE_NOT_MET", "ENDED_NO_BIDS"] } } }),
  ]);
  const sold = await prisma.auction.count({ where: { status: "SOLD" } });
  return {
    liveAuctions,
    carsSold,
    inspectionsCompleted,
    registeredBidders,
    gmvThisMonth: soldThisMonth._sum.hammerPrice ?? 0,
    averageSellThrough: ended === 0 ? 0 : sold / ended,
  };
}

export async function prismaSuggest(q: string, limit = 8) {
  const needle = q.trim();
  if (!needle) return [];
  const rows = await prisma.listing.findMany({
    where: {
      status: "LIVE",
      OR: [
        { title: { contains: needle, mode: "insensitive" } },
        { make: { contains: needle, mode: "insensitive" } },
        { model: { contains: needle, mode: "insensitive" } },
        { registrationCity: { contains: needle, mode: "insensitive" } },
      ],
    },
    take: limit,
    select: { title: true, slug: true, type: true, make: true },
  });
  return rows.map((row) => ({
    type: "listing" as const,
    label: row.title,
    href: `${row.type === "AUCTION" ? "/auctions" : "/buy"}/${row.slug}`,
  }));
}

export async function prismaFacets(query: ListingQuery) {
  const rows = (await loadPublic()).filter((row) => matches(row, { ...query, make: undefined }));
  const count = (key: "make" | "bodyType" | "fuelType" | "transmission" | "registrationCity") => {
    const map = new Map<string, number>();
    for (const row of rows) map.set(row[key], (map.get(row[key]) ?? 0) + 1);
    return Array.from(map, ([value, n]) => ({ value, count: n })).sort((a, b) => b.count - a.count);
  };
  return {
    makes: count("make"),
    bodyTypes: count("bodyType"),
    fuelTypes: count("fuelType"),
    transmissions: count("transmission"),
    cities: count("registrationCity"),
  };
}
