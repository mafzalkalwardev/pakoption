import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/auction/countdown";
import { getLiveAuctions } from "@/lib/db/repository";
import { formatCompact, formatPKR } from "@/lib/format";

export const metadata: Metadata = { title: "My listings" };
export const dynamic = "force-dynamic";

export default async function MyListingsPage() {
  const lots = await getLiveAuctions(3);

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
        {lots.map((l, i) => (
          <article
            key={l.id}
            className="edge-light rounded-lg border border-line bg-surface p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={i === 0 ? "brand" : "outline"} size="sm">
                    {i === 0 ? "Live" : i === 1 ? "Under review" : "Draft"}
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
                    {formatCompact(l.watchCount * 18)} views
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

            {/* bid velocity sparkline */}
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-2">
                Bid velocity — last 7 days
              </p>
              <div className="mt-3 flex h-12 items-end gap-1">
                {[3, 5, 2, 8, 6, 11, 14].map((v, bi) => (
                  <div
                    key={bi}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-brand-700 to-brand-400"
                    style={{ height: `${(v / 14) * 100}%` }}
                    title={`${v} bids`}
                  />
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
