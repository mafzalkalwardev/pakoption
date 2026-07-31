import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ListingCard } from "@/components/auction/listing-card";
import { EmptyState, FilterRail, SortBar } from "@/components/search/filter-rail";
import { Pagination } from "@/components/search/pagination";
import { ListingGridSkeleton } from "@/components/ui/skeleton";
import { getClassifieds } from "@/lib/db/repository";
import { parseQuery, type SearchParams } from "@/lib/query";

export const metadata: Metadata = {
  title: "Buy a used car",
  description:
    "Browse fixed-price used cars across Pakistan. Filter by make, city, budget and inspection grade, and make an offer directly.",
};

export const revalidate = 300;

async function Grid({ sp }: { sp: SearchParams }) {
  const query = parseQuery(sp);
  const { data, meta } = await getClassifieds(query);

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
        basePath="/buy"
      />
    </>
  );
}

export default async function BuyPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  return (
    <>
      <PageHeader
        eyebrow="Classifieds"
        title="Buy a used car"
        description="Fixed-price listings with the same disclosure rules as our auctions. Make an offer, or ask the seller to book an inspection before you commit."
      />

      <div className="container-page py-8 md:py-10">
        <div className="flex gap-8">
          <Suspense fallback={null}>
            <FilterRail />
          </Suspense>
          <div className="min-w-0 flex-1">
            <Suspense fallback={<ListingGridSkeleton count={9} />}>
              <Grid sp={sp} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
