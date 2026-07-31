import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Eye,
  FileText,
  Flag,
  Heart,
  MessageSquare,
  ShieldCheck,
  Star,
  Store,
  Users,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/page-header";
import { Gallery } from "@/components/auction/gallery";
import { BidPanel } from "@/components/auction/bid-panel";
import { BidHistory } from "@/components/auction/bid-history";
import { SpecTable } from "@/components/auction/spec-table";
import { ListingCard } from "@/components/auction/listing-card";
import { ReportViewer } from "@/components/inspection/report-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/primitives";
import {
  getBidsForAuction,
  getListingBySlug,
  getSimilarListings,
} from "@/lib/db/repository";
import { formatCompact, formatDatePK, label } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return { title: "Lot not found" };

  return {
    title: listing.title,
    description: listing.description.slice(0, 155),
    openGraph: {
      title: listing.title,
      description: listing.description.slice(0, 155),
      images: listing.images[0] ? [listing.images[0].url] : undefined,
    },
  };
}

export default async function AuctionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing || !listing.auction) notFound();

  const [bids, similar] = await Promise.all([
    getBidsForAuction(listing.auction.id),
    getSimilarListings(listing, 3),
  ]);

  const certified =
    !!listing.inspection &&
    (listing.inspection.grade === "A" || listing.inspection.grade === "B");

  return (
    <div className="container-page py-8 md:py-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/auctions", label: "Auctions" },
          { href: `/auctions?make=${listing.make}`, label: listing.make },
          { label: listing.title },
        ]}
      />

      {/* title block */}
      <header className="mb-7">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="brand">Lot #{listing.id.replace("lst_", "")}</Badge>
          {certified && (
            <Badge variant="gold">
              <ShieldCheck aria-hidden />
              PakOption Certified
            </Badge>
          )}
          {listing.auction.reserveStatus === "NO_RESERVE" && (
            <Badge variant="gold">No reserve</Badge>
          )}
          {listing.auctionSheetGrade && (
            <Badge variant="outline">
              Auction sheet {listing.auctionSheetGrade}
            </Badge>
          )}
        </div>

        <h1 className="mt-3 text-balance text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.035em] text-ivory">
          {listing.title}
        </h1>

        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13.5px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Eye className="size-4 text-muted-2" aria-hidden />
            {formatCompact(listing.viewCount)} views
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-4 text-muted-2" aria-hidden />
            {listing.watchCount} watching
          </span>
          <span className="text-muted-2">
            Listed {formatDatePK(listing.publishedAt)}
          </span>
        </p>
      </header>

      {/* main grid */}
      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="min-w-0 space-y-10">
          <Gallery images={listing.images} title={listing.title} />

          <Tabs defaultValue="overview">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="inspection">
                Inspection
                {listing.inspection && (
                  <Badge variant="brand" size="sm">
                    {listing.inspection.overallScore.toFixed(1)}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="bids">
                Bid history
                <Badge variant="default" size="sm">
                  {listing.auction.bidCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="seller">Seller</TabsTrigger>
            </TabsList>

            {/* --- Overview --- */}
            <TabsContent value="overview" className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-ivory">
                  Specification
                </h2>
                <div className="mt-4">
                  <SpecTable listing={listing} />
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold tracking-tight text-ivory">
                  Seller&rsquo;s description
                </h2>
                <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted">
                  {listing.description.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* --- Inspection --- */}
            <TabsContent value="inspection">
              {listing.inspection ? (
                <ReportViewer inspection={listing.inspection} />
              ) : (
                <div className="rounded-xl border border-dashed border-line bg-ink-2 p-10 text-center">
                  <ShieldCheck
                    className="mx-auto size-8 text-muted-2"
                    aria-hidden
                  />
                  <h3 className="mt-4 text-lg font-semibold text-ivory">
                    This lot has not been inspected
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-muted">
                    The seller has not booked a PakOption inspection. You can
                    book one yourself before bidding — a technician will attend
                    and you&rsquo;ll have the report in about an hour.
                  </p>
                  <Button className="mt-5" asChild>
                    <Link href={`/inspection/book?listing=${listing.slug}`}>
                      Book an inspection
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* --- Bids --- */}
            <TabsContent value="bids" className="space-y-4">
              <div className="flex items-start gap-2.5 rounded-lg border border-line bg-ink-2 p-4 text-[13px] leading-relaxed text-muted">
                <FileText className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden />
                <span>
                  Bidder identities are masked. Rows marked{" "}
                  <em className="not-italic text-ivory">auto-bid</em> were placed
                  by the proxy engine defending an existing maximum — nobody was
                  sitting at a keyboard.
                </span>
              </div>
              <BidHistory bids={bids} />
            </TabsContent>

            {/* --- Seller --- */}
            <TabsContent value="seller">
              <div className="rounded-xl border border-line bg-surface p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="grid size-14 shrink-0 place-items-center rounded-full border border-line bg-ink-2 text-xl font-semibold text-brand-400">
                      {listing.seller.name.charAt(0)}
                    </span>
                    <div>
                      <p className="flex items-center gap-2 text-[15px] font-semibold text-ivory">
                        {listing.seller.name}
                        {listing.seller.role === "DEALER" && (
                          <Badge variant="brand" size="sm">
                            <Store aria-hidden />
                            Dealer
                          </Badge>
                        )}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
                        <span className="inline-flex items-center gap-1">
                          <Star className="size-3.5 fill-gold text-gold" aria-hidden />
                          <span className="tnum">
                            {listing.seller.rating.toFixed(1)}
                          </span>
                        </span>
                        <span className="tnum">
                          {listing.seller.salesCount} sales
                        </span>
                        <span>{listing.seller.city}</span>
                      </p>
                    </div>
                  </div>

                  <Badge variant="outline" size="lg">
                    <ShieldCheck aria-hidden />
                    {label(listing.seller.tier)} verified
                  </Badge>
                </div>

                <p className="mt-5 text-[13.5px] leading-relaxed text-muted">
                  Member since {formatDatePK(listing.seller.memberSince)}.
                  Contact details unlock for the winning bidder once the deposit
                  is paid — until then, message through the platform.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm">
                    <MessageSquare />
                    Message seller
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Flag />
                    Report this listing
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* sticky bid panel */}
        <div className="lg:sticky lg:top-24">
          <BidPanel auction={listing.auction} />

          <div className="mt-4 flex gap-2 lg:hidden">
            <Button variant="secondary" size="sm" className="flex-1">
              <Heart />
              Watch
            </Button>
            <Button variant="secondary" size="sm" className="flex-1">
              <MessageSquare />
              Message
            </Button>
          </div>
        </div>
      </div>

      {/* similar */}
      {similar.length > 0 && (
        <section className="mt-20">
          <h2 className="text-lg font-semibold tracking-tight text-ivory">
            Similar lots
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
