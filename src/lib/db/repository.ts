/**
 * The data boundary.
 *
 * Nothing outside this file imports Prisma or the seed dataset. Pages and
 * server actions call these functions only. That is what makes the seed ⇄
 * Prisma swap a configuration change rather than a refactor.
 *
 * Adapter selection:
 *   DATABASE_URL set   → Prisma adapter (see ./prisma-adapter.ts)
 *   DATABASE_URL unset → seed adapter (deterministic, in-memory)
 */

import "server-only";

import {
  BIDS_BY_AUCTION,
  CARDS,
  LISTINGS,
  RESERVES,
  SELLERS,
  STATS,
  TESTIMONIALS,
} from "./seed-data";
import type {
  Bid,
  Inspection,
  Listing,
  ListingCard,
  ListingQuery,
  Paginated,
  PlatformStats,
  PublicUser,
} from "@/types";
import { getAuctionPhase } from "@/lib/auction/engine";

export const USING_DATABASE = Boolean(process.env.DATABASE_URL);

/* -------------------------------------------------------------------------- */
/* Filtering + sorting (shared by both adapters at the seed level)            */
/* -------------------------------------------------------------------------- */

function matchesQuery(card: ListingCard, q: ListingQuery): boolean {
  if (q.type && card.type !== q.type) return false;

  if (q.status && card.auction) {
    const phase = getAuctionPhase(
      new Date(card.auction.startsAt),
      new Date(card.auction.endsAt),
      new Date(),
    );
    if (q.status === "live" && phase !== "LIVE" && phase !== "ENDING_SOON")
      return false;
    if (q.status === "upcoming" && phase !== "UPCOMING") return false;
    if (q.status === "ended" && phase !== "ENDED") return false;
  }

  if (q.q) {
    const needle = q.q.toLowerCase();
    const hay =
      `${card.title} ${card.make} ${card.model} ${card.registrationCity}`.toLowerCase();
    if (!hay.includes(needle)) return false;
  }

  if (q.make?.length && !q.make.includes(card.make)) return false;
  if (q.model?.length && !q.model.includes(card.model)) return false;
  if (q.city?.length && !q.city.includes(card.registrationCity)) return false;
  if (q.bodyType?.length && !q.bodyType.includes(card.bodyType)) return false;
  if (q.fuelType?.length && !q.fuelType.includes(card.fuelType)) return false;
  if (q.transmission?.length && !q.transmission.includes(card.transmission))
    return false;

  if (q.yearMin && card.year < q.yearMin) return false;
  if (q.yearMax && card.year > q.yearMax) return false;
  if (q.mileageMax && card.mileageKm > q.mileageMax) return false;

  const price = card.auction?.currentPrice ?? card.askingPrice ?? 0;
  if (q.priceMin && price < q.priceMin) return false;
  if (q.priceMax && price > q.priceMax) return false;

  if (q.certified && !card.isCertified) return false;
  if (q.noReserve && card.auction?.reserveStatus !== "NO_RESERVE") return false;

  return true;
}

function sortCards(cards: ListingCard[], sort: ListingQuery["sort"]) {
  const priceOf = (c: ListingCard) =>
    c.auction?.currentPrice ?? c.askingPrice ?? 0;

  switch (sort) {
    case "price_asc":
      return [...cards].sort((a, b) => priceOf(a) - priceOf(b));
    case "price_desc":
      return [...cards].sort((a, b) => priceOf(b) - priceOf(a));
    case "mileage":
      return [...cards].sort((a, b) => a.mileageKm - b.mileageKm);
    case "score":
      return [...cards].sort(
        (a, b) => (b.inspectionScore ?? 0) - (a.inspectionScore ?? 0),
      );
    case "newest":
      return [...cards].sort((a, b) => b.year - a.year);
    case "ending":
    default:
      return [...cards].sort((a, b) => {
        const ea = a.auction ? new Date(a.auction.endsAt).getTime() : Infinity;
        const eb = b.auction ? new Date(b.auction.endsAt).getTime() : Infinity;
        return ea - eb;
      });
  }
}

function paginate<T>(items: T[], page = 1, perPage = 24): Paginated<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const p = Math.min(Math.max(1, page), totalPages);
  return {
    data: items.slice((p - 1) * perPage, p * perPage),
    meta: { page: p, perPage, total, totalPages },
  };
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

export async function getListings(
  query: ListingQuery = {},
): Promise<Paginated<ListingCard>> {
  const filtered = CARDS.filter((c) => matchesQuery(c, query));
  const sorted = sortCards(filtered, query.sort);
  return paginate(sorted, query.page, query.perPage);
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  return LISTINGS.find((l) => l.slug === slug) ?? null;
}

export async function getListingById(id: string): Promise<Listing | null> {
  return LISTINGS.find((l) => l.id === id) ?? null;
}

export async function getListingCardsByIds(
  ids: string[],
): Promise<ListingCard[]> {
  return ids
    .map((id) => CARDS.find((c) => c.id === id))
    .filter((c): c is ListingCard => Boolean(c));
}

export async function getListingCardsBySlugs(
  slugs: string[],
): Promise<ListingCard[]> {
  return slugs
    .map((s) => CARDS.find((c) => c.slug === s))
    .filter((c): c is ListingCard => Boolean(c));
}

/** Live auctions, soonest to close first. Used by the home page and ticker. */
export async function getLiveAuctions(limit = 12): Promise<ListingCard[]> {
  const { data } = await getListings({
    type: "AUCTION",
    status: "live",
    sort: "ending",
    perPage: limit,
  });
  return data;
}

export async function getFeaturedListings(limit = 6): Promise<ListingCard[]> {
  return CARDS.filter((c) => c.isFeatured).slice(0, limit);
}

export async function getUpcomingAuctions(limit = 8): Promise<ListingCard[]> {
  const { data } = await getListings({
    type: "AUCTION",
    status: "upcoming",
    perPage: limit,
  });
  return data;
}

export async function getRecentResults(limit = 8): Promise<ListingCard[]> {
  const { data } = await getListings({
    type: "AUCTION",
    status: "ended",
    perPage: limit,
  });
  return data;
}

export async function getClassifieds(
  query: ListingQuery = {},
): Promise<Paginated<ListingCard>> {
  return getListings({ ...query, type: "CLASSIFIED" });
}

/** Same make or same body type, excluding the listing itself. */
export async function getSimilarListings(
  listing: Listing,
  limit = 4,
): Promise<ListingCard[]> {
  return CARDS.filter(
    (c) =>
      c.id !== listing.id &&
      (c.make === listing.make || c.bodyType === listing.bodyType),
  )
    .sort((a, b) => (a.make === listing.make ? -1 : 1))
    .slice(0, limit);
}

export async function getBidsForAuction(auctionId: string): Promise<Bid[]> {
  return BIDS_BY_AUCTION[auctionId] ?? [];
}

/**
 * Server-only. The reserve price never leaves this module — callers get a
 * derived status, not the number.
 */
export async function getReservePrice(
  auctionId: string,
): Promise<number | undefined> {
  return RESERVES[auctionId];
}

export async function getInspectionByToken(
  token: string,
): Promise<Inspection | null> {
  for (const l of LISTINGS) {
    if (l.inspection?.publicToken === token) return l.inspection;
  }
  return null;
}

export async function getInspectionByReference(
  reference: string,
): Promise<Inspection | null> {
  for (const l of LISTINGS) {
    if (l.inspection?.reference === reference) return l.inspection;
  }
  return null;
}

/** A representative completed report used as the public sample. */
export async function getSampleInspection(): Promise<Inspection | null> {
  const best = LISTINGS.filter((l) => l.inspection).sort(
    (a, b) => (b.inspection!.overallScore ?? 0) - (a.inspection!.overallScore ?? 0),
  )[0];
  return best?.inspection ?? null;
}

export async function getSeller(id: string): Promise<PublicUser | null> {
  return SELLERS.find((s) => s.id === id) ?? null;
}

export async function getStats(): Promise<PlatformStats> {
  return STATS;
}

export async function getTestimonials() {
  return TESTIMONIALS;
}

/** Facet counts for the filter rail. */
export async function getFacets(query: ListingQuery = {}) {
  const pool = CARDS.filter((c) => matchesQuery(c, { ...query, make: undefined }));
  const count = <K extends keyof ListingCard>(key: K) => {
    const map = new Map<string, number>();
    for (const c of pool) {
      const v = String(c[key]);
      map.set(v, (map.get(v) ?? 0) + 1);
    }
    return Array.from(map, ([value, n]) => ({ value, count: n })).sort(
      (a, b) => b.count - a.count,
    );
  };

  return {
    makes: count("make"),
    bodyTypes: count("bodyType"),
    fuelTypes: count("fuelType"),
    transmissions: count("transmission"),
    cities: count("registrationCity"),
  };
}

/** Typeahead over makes, models, cities and live lot titles. */
export async function suggest(q: string, limit = 8): Promise<
  { type: "make" | "model" | "city" | "listing"; label: string; href: string }[]
> {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];

  const out: { type: "make" | "model" | "city" | "listing"; label: string; href: string }[] =
    [];
  const seen = new Set<string>();

  for (const c of CARDS) {
    if (out.length >= limit) break;
    if (c.title.toLowerCase().includes(needle) && !seen.has(c.slug)) {
      seen.add(c.slug);
      out.push({
        type: "listing",
        label: c.title,
        href: `${c.type === "AUCTION" ? "/auctions" : "/buy"}/${c.slug}`,
      });
    }
  }

  for (const c of CARDS) {
    if (out.length >= limit) break;
    const key = `make:${c.make}`;
    if (c.make.toLowerCase().includes(needle) && !seen.has(key)) {
      seen.add(key);
      out.push({
        type: "make",
        label: c.make,
        href: `/auctions?make=${encodeURIComponent(c.make)}`,
      });
    }
  }

  return out.slice(0, limit);
}
