import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ListingCard } from "@/components/auction/listing-card";
import { FilterRail, SortBar, EmptyState } from "@/components/search/filter-rail";
import { Pagination } from "@/components/search/pagination";
import { ListingGridSkeleton } from "@/components/ui/skeleton";
import { getListings } from "@/lib/db/repository";
import { parseQuery, type SearchParams } from "@/lib/query";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Live car auctions",
  description:
    "Bid on inspection-backed cars across Pakistan. Proxy bidding, hidden reserves and a three-minute soft close on every lot.",
};

export const revalidate = 30;

const TABS = [
  { value: "live", label: "Live" },
  { value: "upcoming", label: "Upcoming" },
  { value: "ended", label: "Results" },
] as const;

async function AuctionGrid({ sp }: { sp: SearchParams }) {
  const query = parseQuery(sp);
  const { data, meta } = await getListings({ ...query, type: "AUCTION" });

  return (
    <>
      <SortBar total={meta.total} />

      {data.length === 0 ? (
        <div className="mt-6">
          <EmptyState />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((l, i) => (
            <ListingCard key={l.id} listing={l} priority={i < 3} />
          ))}
        </div>
      )}

      <Pagination
        page={meta.page}
        totalPages={meta.totalPages}
        searchParams={sp}
        basePath="/auctions"
      />
    </>
  );
}

export default async function AuctionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const status = (Array.isArray(sp.status) ? sp.status[0] : sp.status) ?? "live";

  return (
    <>
      <PageHeader
        eyebrow="Auctions"
        title="Live car auctions"
        description="Set a maximum once and the proxy engine bids for you. A bid in the final three minutes extends the clock, so the last second is never the deciding one."
      />

      <div className="container-page py-8 md:py-10">
        {/* status tabs */}
        <div className="mb-8 inline-flex items-center gap-1 rounded-lg border border-line bg-ink-2 p-1">
          {TABS.map((t) => (
            <Link
              key={t.value}
              href={`/auctions?status=${t.value}`}
              className={cn(
                "rounded-md px-4 py-2 text-[13.5px] font-medium transition-colors",
                status === t.value
                  ? "bg-surface-2 text-ivory shadow-card"
                  : "text-muted hover:text-ivory",
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="flex gap-8">
          <Suspense fallback={null}>
            <FilterRail />
          </Suspense>

          <div className="min-w-0 flex-1">
            <Suspense fallback={<ListingGridSkeleton count={9} />}>
              <AuctionGrid sp={sp} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
