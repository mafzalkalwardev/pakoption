import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/auction/countdown";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getAccountSnapshot } from "@/lib/db/repository";
import { formatPKR } from "@/lib/format";

export const metadata: Metadata = { title: "My listings" };
export const dynamic = "force-dynamic";

export default async function MyListingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const account = await getAccountSnapshot(session.id);
  const lots = account.listings;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ivory">
            My listings
          </h1>
          <p className="mt-1.5 text-[14px] text-muted">
            Watch bid velocity in real time — a flat line in the first 48 hours
            usually means the starting price is too high.
          </p>
        </div>
        <Button asChild>
          <Link href="/sell/new">
            <Plus />
            New listing
          </Link>
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        {lots.map((l) => (
          <article
            key={l.id}
            className="edge-light rounded-lg border border-line bg-surface p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" size="sm">
                    {l.type === "AUCTION" ? "Auction" : "Classified"}
                  </Badge>
                  {l.isCertified && (
                    <Badge variant="gold" size="sm">Certified</Badge>
                  )}
                </div>
                <Link
                  href={`/auctions/${l.slug}`}
                  className="mt-2 block text-[15px] font-semibold text-ivory hover:text-brand-300"
                >
                  {l.title}
                </Link>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="size-3.5" aria-hidden />
                    {l.watchCount} watching
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-3.5" aria-hidden />
                    {l.watchCount} watching
                  </span>
                  <span className="tnum">{l.auction?.bidCount} bids</span>
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10.5px] uppercase tracking-[0.12em] text-muted-2">
                  Current bid
                </p>
                <p className="font-mono text-lg font-semibold text-gold tnum">
                  {formatPKR(l.auction?.currentPrice ?? 0)}
                </p>
                {l.auction && (
                  <Countdown
                    endsAt={l.auction.endsAt}
                    size="sm"
                    className="mt-1 justify-end"
                  />
                )}
              </div>
            </div>

          </article>
        ))}
      </div>
    </div>
  );
}
