/**
 * Formatting helpers.
 *
 * Currency is PKR everywhere. Pakistani readers think in lakh (100,000) and
 * crore (10,000,000), so short forms use those units rather than K/M/B.
 * Full values use the `en-PK` grouping (12,34,567) which is what people expect
 * on a price tag here.
 */

const LAKH = 100_000;
const CRORE = 10_000_000;

/** `PKR 62,50,000` */
export function formatPKR(amount: number, withSymbol = true): string {
  const n = new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return withSymbol ? `PKR ${n}` : n;
}

/** `62.5 L` / `1.24 Cr` / `85,000` — for tight spaces like cards and chips. */
export function formatPKRShort(amount: number, withSymbol = true): string {
  const abs = Math.abs(amount);
  let out: string;

  if (abs >= CRORE) {
    const v = amount / CRORE;
    out = `${trimZeros(v.toFixed(v < 10 ? 2 : 1))} Cr`;
  } else if (abs >= LAKH) {
    const v = amount / LAKH;
    out = `${trimZeros(v.toFixed(v < 10 ? 2 : 1))} L`;
  } else {
    out = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(
      Math.round(amount),
    );
  }

  return withSymbol ? `PKR ${out}` : out;
}

function trimZeros(s: string): string {
  return s.replace(/\.?0+$/, "");
}

/** `48,000 km` */
export function formatMileage(km: number): string {
  return `${new Intl.NumberFormat("en-PK").format(Math.round(km))} km`;
}

/** `1,798 cc` */
export function formatEngine(cc: number): string {
  return `${new Intl.NumberFormat("en-PK").format(cc)} cc`;
}

/** `1.2 K`, `14.8 K`, `312` — for view/watch counts. */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${trimZeros((n / 1_000_000).toFixed(1))}M`;
  if (n >= 1_000) return `${trimZeros((n / 1_000).toFixed(1))}K`;
  return String(n);
}

/** `2 Aug 2026, 7:00 PM` in Asia/Karachi — the authoritative auction timezone. */
export function formatDateTimePK(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("en-PK", {
    timeZone: "Asia/Karachi",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

/** `2 Aug 2026` */
export function formatDatePK(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("en-PK", {
    timeZone: "Asia/Karachi",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** `3 minutes ago`, `in 2 days` */
export function formatRelative(input: string | Date, now: Date = new Date()) {
  const d = typeof input === "string" ? new Date(input) : input;
  const diff = d.getTime() - now.getTime();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000_000],
    ["month", 2_592_000_000],
    ["day", 86_400_000],
    ["hour", 3_600_000],
    ["minute", 60_000],
    ["second", 1000],
  ];

  for (const [unit, ms] of units) {
    if (abs >= ms || unit === "second") {
      return rtf.format(Math.round(diff / ms), unit);
    }
  }
  return "just now";
}

/* -------------------------------------------------------------------------- */
/* Enum → label                                                               */
/* -------------------------------------------------------------------------- */

const TITLE_CASE: Record<string, string> = {
  MANUAL: "Manual",
  AUTOMATIC: "Automatic",
  CVT: "CVT",
  DCT: "DCT",
  AMT: "AMT",
  PETROL: "Petrol",
  DIESEL: "Diesel",
  HYBRID: "Hybrid",
  ELECTRIC: "Electric",
  CNG: "CNG",
  LPG: "LPG",
  HATCHBACK: "Hatchback",
  SEDAN: "Sedan",
  SUV: "SUV",
  CROSSOVER: "Crossover",
  MPV: "MPV",
  PICKUP: "Pickup",
  COUPE: "Coupé",
  CONVERTIBLE: "Convertible",
  WAGON: "Wagon",
  VAN: "Van",
  LOCAL: "Local assembled",
  IMPORTED: "Imported",
  BASIC: "Basic",
  STANDARD: "Standard",
  COMPREHENSIVE: "Comprehensive",
  OK: "Pass",
  ADVISORY: "Advisory",
  MINOR: "Minor",
  MAJOR: "Major",
  CRITICAL: "Critical",
  NO_RESERVE: "No reserve",
  MET: "Reserve met",
  NOT_MET: "Reserve not met",
  LIVE: "Live",
  SCHEDULED: "Upcoming",
  SOLD: "Sold",
  RESERVE_NOT_MET: "Reserve not met",
  ENDED_NO_BIDS: "Ended — no bids",
  CANCELLED: "Cancelled",
};

export function label(value: string | undefined | null): string {
  if (!value) return "—";
  return (
    TITLE_CASE[value] ??
    value
      .toLowerCase()
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

/** Chassis numbers are shown partially masked in public views. */
export function maskChassis(chassis?: string): string {
  if (!chassis) return "—";
  if (chassis.length <= 6) return chassis;
  return `${chassis.slice(0, 4)}${"•".repeat(Math.max(0, chassis.length - 8))}${chassis.slice(-4)}`;
}
