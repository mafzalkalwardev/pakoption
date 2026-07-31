import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Gavel,
  Heart,
  Plus,
  ShieldCheck,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { ListingCard } from "@/components/auction/listing-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLiveAuctions } from "@/lib/db/repository";
import { formatPKR } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

const STATS = [
  { label: "Active bids", value: "4", Icon: Gavel, tone: "brand" },
  { label: "Leading on", value: "2", Icon: Trophy, tone: "gold" },
  { label: "Watching", value: "11", Icon: Heart, tone: "default" },
  { label: "Inspections", value: "1", Icon: ShieldCheck, tone: "brand" },
] as const;

export default async function DashboardPage() {
  const live = await getLiveAuctions(3);

  return (
    <div className="space-y-10">
      {/* stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map(({ label, value, Icon }) => (
          <div
            key={label}
            className="edge-light rounded-lg border border-line bg-surface p-5"
          >
            <Icon className="size-5 text-brand-400" aria-hidden />
            <p className="mt-4 font-mono text-2xl font-semibold text-ivory tnum">
              {value}
            </p>
            <p className="mt-1 text-[12.5px] text-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* alert strip */}
      <div className="flex flex-col gap-3 rounded-xl border border-danger/35 bg-danger/8 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <TrendingUp className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden />
          <div>
            <p className="text-[14.5px] font-semibold text-ivory">
              You were outbid on 2019 Honda Civic RS Turbo
            </p>
            <p className="mt-1 text-[13px] text-muted">
              The price moved to{" "}
              <span className="font-mono text-gold tnum">
                {formatPKR(6_300_000)}
              </span>{" "}
              — your maximum was {formatPKR(6_250_000)}. Ends in 2 hours.
            </p>
          </div>
        </div>
        <Button variant="danger" size="sm" asChild className="shrink-0">
          <Link href="/auctions">Raise your bid</Link>
        </Button>
      </div>

      {/* active bids */}
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ivory">
              Your active bids
            </h2>
            <p className="mt-1 text-[13.5px] text-muted">
              Lots where you have a live maximum.
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/bids">
              See all
              <ArrowRight />
            </Link>
          </Button>
        </div>

        <div className="mt-5 space-y-3">
          {live.map((l, i) => (
            <div
              key={l.id}
              className="flex flex-wrap items-center gap-4 rounded-lg border border-line bg-surface p-4"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/auctions/${l.slug}`}
                  className="text-[14.5px] font-medium text-ivory hover:text-brand-300"
                >
                  {l.title}
                </Link>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-muted">
                  <span className="tnum">{l.auction?.bidCount} bids</span>
                  <span>{l.registrationCity}</span>
                  {i === 0 ? (
                    <Badge variant="brand" size="sm">Leading</Badge>
                  ) : (
                    <Badge variant="danger" size="sm">Outbid</Badge>
                  )}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10.5px] uppercase tracking-[0.12em] text-muted-2">
                  Current bid
                </p>
                <p className="font-mono text-[15px] font-semibold text-gold tnum">
                  {formatPKR(l.auction?.currentPrice ?? 0)}
                </p>
              </div>

              <Button variant="outline" size="sm" asChild>
                <Link href={`/auctions/${l.slug}`}>View lot</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* recommendations */}
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ivory">
              Based on what you&rsquo;re watching
            </h2>
            <p className="mt-1 text-[13.5px] text-muted">
              Similar lots closing soon.
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auctions">
              Browse all
              <ArrowRight />
            </Link>
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {live.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      {/* sell prompt */}
      <section className="edge-light rounded-xl border border-line-strong bg-gradient-to-br from-brand-900 via-surface to-ink p-8 text-center">
        <h2 className="text-xl font-bold tracking-tight text-ivory">
          Got a car to sell?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-muted">
          Listing fee waived when you book an inspection. About six minutes from
          start to submitted.
        </p>
        <Button className="mt-5" asChild>
          <Link href="/sell/new">
            <Plus />
            Create a listing
          </Link>
        </Button>
      </section>
    </div>
  );
}
