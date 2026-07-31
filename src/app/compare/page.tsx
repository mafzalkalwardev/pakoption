import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Fuel, Gauge, MapPin, ShieldCheck, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getListingCardsBySlugs, getLiveAuctions } from "@/lib/db/repository";
import { formatMileage, formatPKR, label } from "@/lib/format";
import type { SearchParams } from "@/lib/query";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Compare cars",
  description:
    "Compare up to four cars side by side — specification, price, inspection score and estimated five-year running cost.",
};

/** Very rough five-year running cost model for Pakistan. Illustrative only. */
function runningCost(engineCc: number, fuel: string, mileageKm: number) {
  const PETROL_PER_L = 268; // PKR
  const KM_PER_YEAR = 12_000;
  const kmpl =
    fuel === "ELECTRIC"
      ? 0
      : fuel === "HYBRID"
        ? 22
        : engineCc <= 1000
          ? 16
          : engineCc <= 1500
            ? 13
            : engineCc <= 2000
              ? 11
              : 8;

  const fuelCost =
    fuel === "ELECTRIC"
      ? 5 * KM_PER_YEAR * 6 // ~PKR 6/km on domestic tariff
      : 5 * ((KM_PER_YEAR / kmpl) * PETROL_PER_L);

  // Token tax scales with engine size; EVs are exempt in most provinces.
  const tokenTax =
    fuel === "ELECTRIC"
      ? 0
      : engineCc <= 1000
        ? 5 * 1_500
        : engineCc <= 1300
          ? 5 * 4_000
          : engineCc <= 2000
            ? 5 * 9_000
            : 5 * 15_000;

  // Older, higher-mileage cars cost more to keep on the road.
  const maintenance =
    5 * (35_000 + Math.min(60_000, Math.floor(mileageKm / 10_000) * 4_000));

  const insurance = 5 * 45_000;

  return { fuelCost, tokenTax, maintenance, insurance, total: fuelCost + tokenTax + maintenance + insurance };
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const raw = sp.slug;
  const slugs = (Array.isArray(raw) ? raw : raw ? [raw] : []).slice(0, 4);

  const [selected, suggestions] = await Promise.all([
    getListingCardsBySlugs(slugs),
    getLiveAuctions(6),
  ]);

  const removeHref = (slug: string) => {
    const p = new URLSearchParams();
    slugs.filter((s) => s !== slug).forEach((s) => p.append("slug", s));
    return `/compare?${p.toString()}`;
  };

  const addHref = (slug: string) => {
    const p = new URLSearchParams();
    [...slugs, slug].forEach((s) => p.append("slug", s));
    return `/compare?${p.toString()}`;
  };

  /* ---------------------------------------------------------------- empty */
  if (selected.length === 0) {
    return (
      <>
        <PageHeader
          eyebrow="Compare"
          title="Put them side by side"
          description="Add up to four cars and see specification, price, inspection score and estimated five-year running cost in one table."
        />
        <div className="container-page py-12">
          <div className="rounded-xl border border-dashed border-line bg-ink-2 p-14 text-center">
            <h2 className="text-lg font-semibold text-ivory">
              Nothing to compare yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-muted">
              Pick a car below to start, or add cars from any listing page.
            </p>
          </div>

          <h3 className="mt-12 text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-2">
            Popular right now
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((c) => (
              <Link
                key={c.id}
                href={addHref(c.slug)}
                className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3 transition-colors hover:border-brand-700"
              >
                <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-ink-2">
                  <Image src={c.image} alt="" fill sizes="56px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-ivory">
                    {c.title}
                  </p>
                  <p className="mt-0.5 font-mono text-[12.5px] text-gold tnum">
                    {formatPKR(c.auction?.currentPrice ?? c.askingPrice ?? 0)}
                  </p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-2" aria-hidden />
              </Link>
            ))}
          </div>
        </div>
      </>
    );
  }

  /* ---------------------------------------------------------------- table */
  const costs = selected.map((c) =>
    runningCost(1500, c.fuelType, c.mileageKm),
  );

  const rows: {
    label: string;
    render: (i: number) => ReactNode;
    /** true = lower is better; false = higher is better; undefined = no winner */
    lowerBetter?: boolean;
    values?: number[];
  }[] = [
    {
      label: "Price",
      values: selected.map((c) => c.auction?.currentPrice ?? c.askingPrice ?? 0),
      lowerBetter: true,
      render: (i) => (
        <span className="font-mono font-semibold text-gold tnum">
          {formatPKR(
            selected[i]!.auction?.currentPrice ?? selected[i]!.askingPrice ?? 0,
          )}
        </span>
      ),
    },
    {
      label: "Year",
      values: selected.map((c) => c.year),
      lowerBetter: false,
      render: (i) => <span className="tnum">{selected[i]!.year}</span>,
    },
    {
      label: "Mileage",
      values: selected.map((c) => c.mileageKm),
      lowerBetter: true,
      render: (i) => (
        <span className="tnum">{formatMileage(selected[i]!.mileageKm)}</span>
      ),
    },
    {
      label: "Inspection score",
      values: selected.map((c) => c.inspectionScore ?? 0),
      lowerBetter: false,
      render: (i) =>
        selected[i]!.inspectionScore !== undefined ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="font-mono font-semibold tnum">
              {selected[i]!.inspectionScore!.toFixed(1)}
            </span>
            <Badge variant="brand" size="sm">
              {selected[i]!.inspectionGrade}
            </Badge>
          </span>
        ) : (
          <span className="text-muted-2">Not inspected</span>
        ),
    },
    {
      label: "Transmission",
      render: (i) => label(selected[i]!.transmission),
    },
    { label: "Fuel", render: (i) => label(selected[i]!.fuelType) },
    { label: "Body type", render: (i) => label(selected[i]!.bodyType) },
    { label: "City", render: (i) => selected[i]!.registrationCity },
    {
      label: "Listing type",
      render: (i) =>
        selected[i]!.type === "AUCTION" ? (
          <Badge variant="brand" size="sm">Auction</Badge>
        ) : (
          <Badge variant="outline" size="sm">Classified</Badge>
        ),
    },
    {
      label: "5-yr fuel cost",
      values: costs.map((c) => c.fuelCost),
      lowerBetter: true,
      render: (i) => (
        <span className="font-mono tnum">{formatPKR(costs[i]!.fuelCost)}</span>
      ),
    },
    {
      label: "5-yr token tax",
      values: costs.map((c) => c.tokenTax),
      lowerBetter: true,
      render: (i) => (
        <span className="font-mono tnum">{formatPKR(costs[i]!.tokenTax)}</span>
      ),
    },
    {
      label: "5-yr maintenance",
      values: costs.map((c) => c.maintenance),
      lowerBetter: true,
      render: (i) => (
        <span className="font-mono tnum">{formatPKR(costs[i]!.maintenance)}</span>
      ),
    },
    {
      label: "5-yr total running cost",
      values: costs.map((c) => c.total),
      lowerBetter: true,
      render: (i) => (
        <span className="font-mono font-semibold tnum">
          {formatPKR(costs[i]!.total)}
        </span>
      ),
    },
  ];

  function isWinner(row: (typeof rows)[number], i: number) {
    if (!row.values || row.lowerBetter === undefined) return false;
    const vals = row.values.filter((v) => v > 0);
    if (vals.length < 2) return false;
    const best = row.lowerBetter ? Math.min(...vals) : Math.max(...vals);
    return row.values[i] === best && row.values[i]! > 0;
  }

  return (
    <>
      <PageHeader
        eyebrow="Compare"
        title={`Comparing ${selected.length} ${selected.length === 1 ? "car" : "cars"}`}
        description="Green marks the better value in each row. Running costs are modelled estimates for 12,000 km a year, not quotes."
      />

      <div className="container-page py-10">
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <caption className="sr-only">
              Side-by-side comparison of selected vehicles
            </caption>

            <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-10 w-44 border-b border-r border-line bg-ink-2 p-4 align-bottom text-[11px] uppercase tracking-[0.12em] text-muted-2"
                >
                  Vehicle
                </th>
                {selected.map((c) => (
                  <th
                    key={c.id}
                    scope="col"
                    className="min-w-56 border-b border-line bg-surface p-4 align-top font-normal"
                  >
                    <div className="relative">
                      <Link
                        href={removeHref(c.slug)}
                        aria-label={`Remove ${c.title} from comparison`}
                        className="absolute -right-1 -top-1 grid size-7 place-items-center rounded-full border border-line bg-ink text-muted-2 transition-colors hover:border-danger/50 hover:text-danger"
                      >
                        <X className="size-3.5" />
                      </Link>

                      <div className="relative mb-3 aspect-video overflow-hidden rounded-md bg-ink-2">
                        <Image
                          src={c.image}
                          alt={c.imageAlt}
                          fill
                          sizes="240px"
                          className="object-cover"
                        />
                        {c.isCertified && (
                          <span className="absolute bottom-1.5 left-1.5">
                            <Badge variant="gold" size="sm">
                              <ShieldCheck aria-hidden />
                              Certified
                            </Badge>
                          </span>
                        )}
                      </div>

                      <Link
                        href={`${c.type === "AUCTION" ? "/auctions" : "/buy"}/${c.slug}`}
                        className="block text-[14px] font-semibold leading-snug text-ivory hover:text-brand-300"
                      >
                        {c.title}
                      </Link>
                      <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted">
                        <span className="inline-flex items-center gap-1">
                          <Gauge className="size-3" aria-hidden />
                          {formatMileage(c.mileageKm)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Fuel className="size-3" aria-hidden />
                          {label(c.fuelType)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3" aria-hidden />
                          {c.registrationCity}
                        </span>
                      </p>
                    </div>
                  </th>
                ))}
                {selected.length < 4 && (
                  <th
                    scope="col"
                    className="min-w-48 border-b border-line bg-ink-2 p-4 align-middle font-normal"
                  >
                    <p className="text-center text-[13px] text-muted-2">
                      Add another car from any
                      <br />
                      listing page
                    </p>
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="even:bg-ink-2/40">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 border-r border-line bg-ink-2 p-4 text-[13px] font-medium text-muted"
                  >
                    {row.label}
                  </th>
                  {selected.map((c, i) => (
                    <td
                      key={c.id}
                      className={cn(
                        "border-t border-line p-4 text-[13.5px] text-ivory",
                        isWinner(row, i) && "bg-brand-900/35",
                      )}
                    >
                      <span className="inline-flex items-center gap-2">
                        {row.render(i)}
                        {isWinner(row, i) && (
                          <span className="rounded-full bg-brand-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-300">
                            best
                          </span>
                        )}
                      </span>
                    </td>
                  ))}
                  {selected.length < 4 && (
                    <td className="border-t border-line bg-ink-2/40" />
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-5 max-w-3xl text-[12px] leading-relaxed text-muted-2">
          Running costs assume 12,000 km per year, petrol at PKR 268/litre and
          typical provincial token tax bands. Maintenance scales with recorded
          mileage. These are modelled estimates to make cars comparable — not
          quotes, and not financial advice.
        </p>

        {/* add more */}
        {selected.length < 4 && (
          <section className="mt-12">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-2">
              Add another
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {suggestions
                .filter((c) => !slugs.includes(c.slug))
                .slice(0, 3)
                .map((c) => (
                  <Link
                    key={c.id}
                    href={addHref(c.slug)}
                    className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3 transition-colors hover:border-brand-700"
                  >
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-ink-2">
                      <Image src={c.image} alt="" fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium text-ivory">
                        {c.title}
                      </p>
                      <p className="mt-0.5 font-mono text-[12.5px] text-gold tnum">
                        {formatPKR(c.auction?.currentPrice ?? c.askingPrice ?? 0)}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        )}

        <div className="mt-10">
          <Button variant="outline" asChild>
            <Link href="/auctions">
              Browse more auctions
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
