import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Eye,
  Handshake,
  MessageSquare,
  Phone,
  ShieldCheck,
  Star,
  Store,
  Users,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/page-header";
import { Gallery } from "@/components/auction/gallery";
import { SpecTable } from "@/components/auction/spec-table";
import { ListingCard } from "@/components/auction/listing-card";
import { ReportViewer } from "@/components/inspection/report-viewer";
import { OfferPanel } from "@/components/auction/offer-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/primitives";
import { getListingBySlug, getSimilarListings } from "@/lib/db/repository";
import { formatCompact, formatDatePK, label } from "@/lib/format";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return { title: "Listing not found" };
  return {
    title: listing.title,
    description: listing.description.slice(0, 155),
    openGraph: {
      images: listing.images[0] ? [listing.images[0].url] : undefined,
    },
  };
}

export default async function ClassifiedDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const similar = await getSimilarListings(listing, 3);
  const certified =
    !!listing.inspection &&
    (listing.inspection.grade === "A" || listing.inspection.grade === "B");

  return (
    <div className="container-page py-8 md:py-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/buy", label: "Buy" },
          { href: `/buy?make=${listing.make}`, label: listing.make },
          { label: listing.title },
        ]}
      />

      <header className="mb-7">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Classified</Badge>
          {certified && (
            <Badge variant="gold">
              <ShieldCheck aria-hidden />
              PakOption Certified
            </Badge>
          )}
          {listing.isNegotiable && <Badge variant="brand">Negotiable</Badge>}
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
              <TabsTrigger value="seller">Seller</TabsTrigger>
            </TabsList>

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
                  {listing.description.split("\n\n").map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="inspection">
              {listing.inspection ? (
                <ReportViewer inspection={listing.inspection} />
              ) : (
                <div className="rounded-xl border border-dashed border-line bg-ink-2 p-10 text-center">
                  <ShieldCheck className="mx-auto size-8 text-muted-2" aria-hidden />
                  <h3 className="mt-4 text-lg font-semibold text-ivory">
                    Not yet inspected
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-muted">
                    Book an inspection before you pay. A technician attends at
                    your convenience and the report lands in about an hour.
                  </p>
                  <Button className="mt-5" asChild>
                    <Link href={`/inspection/book?listing=${listing.slug}`}>
                      Book an inspection
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="seller">
              <div className="rounded-xl border border-line bg-surface p-6">
                <div className="flex items-center gap-4">
                  <span className="grid size-14 place-items-center rounded-full border border-line bg-ink-2 text-xl font-semibold text-brand-400">
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
                    <p className="mt-1 flex items-center gap-3 text-[13px] text-muted">
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
                <p className="mt-5 text-[13.5px] leading-relaxed text-muted">
                  {label(listing.seller.tier)} verified · member since{" "}
                  {formatDatePK(listing.seller.memberSince)}. Phone numbers in
                  listing text are automatically removed — message through the
                  platform so there&rsquo;s a record.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm">
                    <MessageSquare />
                    Message seller
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Phone />
                    Request a call back
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:sticky lg:top-24">
          <OfferPanel
            askingPrice={listing.askingPrice ?? 0}
            negotiable={listing.isNegotiable}
            city={listing.registrationCity}
          />
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-20">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-ivory">
            <Handshake className="size-5 text-brand-500" aria-hidden />
            Similar cars
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
