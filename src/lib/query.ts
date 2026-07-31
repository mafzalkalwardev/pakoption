import type { BodyType, FuelType, ListingQuery, SortKey, Transmission } from "@/types";

/** Next 15 passes searchParams as a promise of this shape. */
export type SearchParams = Record<string, string | string[] | undefined>;

function arr(v: string | string[] | undefined): string[] | undefined {
  if (v === undefined) return undefined;
  const a = Array.isArray(v) ? v : [v];
  return a.length ? a : undefined;
}

function num(v: string | string[] | undefined): number | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  if (!s) return undefined;
  const n = Number(String(s).replace(/[^\d]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function str(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return s || undefined;
}

/** Turns URL search params into a typed repository query. */
export function parseQuery(sp: SearchParams): ListingQuery {
  const status = str(sp.status);
  return {
    q: str(sp.q),
    status:
      status === "live" || status === "upcoming" || status === "ended"
        ? status
        : undefined,
    make: arr(sp.make),
    model: arr(sp.model),
    city: arr(sp.city),
    bodyType: arr(sp.bodyType) as BodyType[] | undefined,
    fuelType: arr(sp.fuelType) as FuelType[] | undefined,
    transmission: arr(sp.transmission) as Transmission[] | undefined,
    yearMin: num(sp.yearMin),
    yearMax: num(sp.yearMax),
    priceMin: num(sp.priceMin),
    priceMax: num(sp.priceMax),
    mileageMax: num(sp.mileageMax),
    certified: str(sp.certified) === "1",
    noReserve: str(sp.noReserve) === "1",
    sort: (str(sp.sort) as SortKey | undefined) ?? "ending",
    page: num(sp.page) ?? 1,
    perPage: 24,
  };
}

/** Builds a href preserving current params with one override. */
export function withParam(
  sp: SearchParams,
  key: string,
  value: string,
): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (v === undefined) continue;
    (Array.isArray(v) ? v : [v]).forEach((x) => p.append(k, x));
  }
  p.set(key, value);
  return `?${p.toString()}`;
}
