"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  Car,
  ClipboardCheck,
  FileSearch,
  Gavel,
  Handshake,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Wrench,
} from "lucide-react";
import { Marquee } from "@/components/motion/marquee";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { ListingCard, TickerCard } from "@/components/auction/listing-card";
import { ScoreRing } from "@/components/inspection/score-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BODY_TYPES, INSPECTION_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ListingCard as ListingCardType } from "@/types";

/* -------------------------------------------------------------------------- */
/* Section shell                                                              */
/* -------------------------------------------------------------------------- */

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center",
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "text-center")}>
        {eyebrow && (
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-400">
            {eyebrow}
          </p>
        )}
        <h2 className="text-balance text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.12] tracking-[-0.03em] text-ivory">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-pretty text-[15px] leading-relaxed text-muted md:text-base">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Reveal>
  );
}

/* -------------------------------------------------------------------------- */
/* Live ticker                                                                */
/* -------------------------------------------------------------------------- */

export function LiveTicker({ listings }: { listings: ListingCardType[] }) {
  if (!listings.length) return null;

  return (
    <section className="border-y border-line bg-ink-2/60 py-4">
      <div className="flex items-center gap-4">
        <div className="container-page flex max-w-none items-center gap-4 px-5 md:px-8">
          <span className="hidden shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-400 md:inline-flex">
            <span className="live-dot" aria-hidden />
            Closing soon
          </span>
          <Marquee className="flex-1">
            {listings.map((l) => (
              <TickerCard key={l.id} listing={l} />
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Featured auctions                                                          */
/* -------------------------------------------------------------------------- */

export function FeaturedAuctions({
  listings,
}: {
  listings: ListingCardType[];
}) {
  return (
    <section className="container-page py-20 md:py-28">
      <SectionHeading
        eyebrow="Live now"
        title="Auctions closing soonest"
        description="Proxy bidding means you set your maximum once and the system bids for you. A bid in the last three minutes extends the clock — no snipers."
        action={
          <Button variant="outline" asChild>
            <Link href="/auctions">
              View all auctions
              <ArrowRight />
            </Link>
          </Button>
        }
      />

      <StaggerGroup className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((l, i) => (
          <StaggerItem key={l.id}>
            <ListingCard listing={l} priority={i < 3} />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Browse by body type                                                        */
/* -------------------------------------------------------------------------- */

const CATEGORY_ICONS: Record<string, typeof Car> = {
  SUV: Truck,
  SEDAN: Car,
  HATCHBACK: Car,
  CROSSOVER: Truck,
  PICKUP: Truck,
  MPV: Truck,
  COUPE: Car,
  CONVERTIBLE: Car,
  WAGON: Car,
  VAN: Truck,
};

export function CategoryGrid() {
  return (
    <section className="border-y border-line bg-ink-2/50">
      <div className="container-page py-20 md:py-24">
        <SectionHeading
          eyebrow="Browse"
          title="Find your shape"
          description="Filter by body type, then narrow by make, city, budget and inspection grade."
        />

        <StaggerGroup className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {BODY_TYPES.slice(0, 10).map((bt) => {
            const Icon = CATEGORY_ICONS[bt.value] ?? Car;
            return (
              <StaggerItem key={bt.value}>
                <Link
                  href={`/auctions?bodyType=${bt.value}`}
                  className="group/cat edge-light flex h-full flex-col items-center gap-3 rounded-lg border border-line bg-surface p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-brand-700 hover:shadow-glow"
                >
                  <span className="grid size-12 place-items-center rounded-full border border-line bg-ink-2 text-brand-400 transition-colors group-hover/cat:border-brand-600 group-hover/cat:bg-brand-900">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="text-[13.5px] font-medium text-ivory">
                    {bt.label}
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* How it works                                                               */
/* -------------------------------------------------------------------------- */

const STEPS = [
  {
    n: "01",
    Icon: Camera,
    title: "List it in six minutes",
    body: "Seven guided steps: identity, condition, photos, disclosure, format, inspection, review. Autosaves as you go, so you can finish on your phone later.",
  },
  {
    n: "02",
    Icon: ClipboardCheck,
    title: "We inspect it",
    body: "A technician runs 200+ checkpoints across nine categories and photographs every fault. The report is attached to your listing in 45 to 60 minutes.",
  },
  {
    n: "03",
    Icon: Gavel,
    title: "Bidders compete in the open",
    body: "Verified bidders set a maximum, the proxy engine bids for them, and a hidden reserve protects your floor. Bids in the last three minutes extend the clock.",
  },
  {
    n: "04",
    Icon: Handshake,
    title: "Hand over with a checklist",
    body: "Winner pays the deposit, contact details unlock, and both sides work through a transfer checklist. Buyer's premium is 2%, capped at PKR 2,00,000.",
  },
];

export function HowItWorks() {
  return (
    <section className="container-page py-20 md:py-28" id="how-it-works">
      <SectionHeading
        eyebrow="How it works"
        title="Four steps, no phone tag"
        description="The whole point is that neither side has to trust the other's word. The report says what the car is; the auction says what it's worth."
        align="center"
      />

      <div className="relative mt-14">
        {/* connector line */}
        <div
          className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-line-strong to-transparent lg:block"
          aria-hidden
        />

        <StaggerGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <StaggerItem key={step.n}>
              <div className="edge-light relative h-full rounded-lg border border-line bg-surface p-6 transition-colors duration-300 hover:border-line-strong">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-full border border-brand-700 bg-brand-900 text-brand-300">
                    <step.Icon className="size-5" aria-hidden />
                  </span>
                  <span className="font-mono text-2xl font-bold tracking-tight text-line-strong">
                    {step.n}
                  </span>
                </div>
                <h3 className="mt-5 text-[17px] font-semibold tracking-tight text-ivory">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-muted">
                  {step.body}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Inspection trust section                                                   */
/* -------------------------------------------------------------------------- */

export function InspectionShowcase() {
  return (
    <section className="relative overflow-hidden border-y border-line bg-ink-2/50">
      <div
        className="pointer-events-none absolute -right-40 top-0 size-[32rem] rounded-full bg-brand-500/10 blur-[120px]"
        aria-hidden
      />

      <div className="container-page relative py-20 md:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Inspection"
              title={
                <>
                  212 checkpoints.
                  <br />
                  <span className="text-gradient-brand">
                    Photographic evidence on every fault.
                  </span>
                </>
              }
              description="Other platforms sell inspection as an upsell after you've already listed. We built it into the listing flow, because a marketplace where most cars are unverified is just a noticeboard."
            />

            <StaggerGroup className="mt-8 grid gap-2.5 sm:grid-cols-2">
              {INSPECTION_CATEGORIES.map((cat) => (
                <StaggerItem key={cat.slug}>
                  <div className="flex items-center gap-3 rounded-md border border-line bg-surface px-3.5 py-2.5">
                    <Wrench
                      className="size-4 shrink-0 text-brand-500"
                      aria-hidden
                    />
                    <span className="flex-1 text-[13.5px] text-ivory">
                      {cat.name}
                    </span>
                    <span className="font-mono text-[12px] text-muted-2 tnum">
                      {cat.items}
                    </span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/inspection/book">
                  <ShieldCheck />
                  Book an inspection
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/inspection#sample">
                  <FileSearch />
                  See a sample report
                </Link>
              </Button>
            </div>
          </div>

          {/* score card mock */}
          <Reveal direction="left">
            <div className="edge-light relative rounded-xl border border-line-strong bg-surface p-7 shadow-lift">
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/50 to-transparent"
                aria-hidden
              />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                    Report PO-INS-2026-48120
                  </p>
                  <h3 className="mt-1.5 text-lg font-semibold text-ivory">
                    2021 Toyota Corolla Altis Grande X
                  </h3>
                  <p className="mt-1 text-[13px] text-muted">
                    Karachi · Doorstep · Completed in 52 minutes
                  </p>
                </div>
                <Badge variant="gold" size="lg">
                  <ShieldCheck aria-hidden />
                  Certified
                </Badge>
              </div>

              <div className="mt-7 flex items-center gap-7">
                <ScoreRing score={9.1} grade="A" size={124} />
                <div className="flex-1 space-y-3">
                  {[
                    ["Engine", 9.4],
                    ["Body & Structure", 9.0],
                    ["Electrical", 8.6],
                    ["Brakes", 9.2],
                  ].map(([name, score]) => (
                    <div key={name as string}>
                      <div className="flex items-center justify-between text-[12.5px]">
                        <span className="text-muted">{name}</span>
                        <span className="font-mono font-semibold text-ivory tnum">
                          {(score as number).toFixed(1)}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-2">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
                          initial={{ width: 0 }}
                          whileInView={{
                            width: `${((score as number) / 10) * 100}%`,
                          }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 1,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-7 grid grid-cols-3 divide-x divide-line rounded-lg border border-line bg-ink-2">
                {[
                  ["212", "Checkpoints"],
                  ["205", "Passed"],
                  ["7", "Flagged"],
                ].map(([v, l]) => (
                  <div key={l} className="px-3 py-3.5 text-center">
                    <p className="font-mono text-lg font-semibold text-ivory tnum">
                      {v}
                    </p>
                    <p className="mt-0.5 text-[10.5px] uppercase tracking-[0.12em] text-muted-2">
                      {l}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-[13px] leading-relaxed text-muted">
                &ldquo;Excellent condition for its age and mileage. No structural
                concerns, no major mechanical faults. Seven advisory items
                only.&rdquo;
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Testimonials                                                               */
/* -------------------------------------------------------------------------- */

export function Testimonials({
  items,
}: {
  items: readonly {
    quote: string;
    name: string;
    role: string;
    city: string;
    score: string;
  }[];
}) {
  return (
    <section className="container-page py-20 md:py-28">
      <SectionHeading
        eyebrow="What people say"
        title="Sellers stop haggling. Buyers stop guessing."
        align="center"
      />

      <StaggerGroup className="mt-12 grid gap-5 md:grid-cols-2">
        {items.map((t) => (
          <StaggerItem key={t.name}>
            <figure className="edge-light flex h-full flex-col rounded-lg border border-line bg-surface p-7">
              <Quote
                className="size-7 shrink-0 text-brand-700"
                aria-hidden
              />
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ivory">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-5">
                <div>
                  <p className="text-[14px] font-semibold text-ivory">
                    {t.name}
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-muted">
                    {t.role} · {t.city}
                  </p>
                </div>
                <span className="shrink-0 rounded-md border border-brand-700 bg-brand-900/60 px-2.5 py-1 font-mono text-[12px] font-semibold text-brand-300 tnum">
                  {t.score}
                </span>
              </figcaption>
            </figure>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <Reveal className="mt-10 flex items-center justify-center gap-2 text-[13px] text-muted">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className="size-4 fill-gold text-gold" aria-hidden />
        ))}
        <span className="ml-1">
          4.8 average from 3,412 completed transactions
        </span>
      </Reveal>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Final CTA                                                                  */
/* -------------------------------------------------------------------------- */

export function FinalCTA() {
  return (
    <section className="container-page pb-8">
      <Reveal>
        <div className="edge-light relative overflow-hidden rounded-2xl border border-line-strong bg-gradient-to-br from-brand-900 via-surface to-ink px-7 py-16 text-center md:px-14 md:py-20">
          <div
            className="bg-grid pointer-events-none absolute inset-0 opacity-40"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-brand-500/20 blur-[100px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-gold/10 blur-[100px]"
            aria-hidden
          />

          <div className="relative mx-auto max-w-2xl">
            <Badge variant="brand" size="lg">
              <Sparkles aria-hidden />
              Free listing for your first auction
            </Badge>

            <h2 className="mt-6 text-balance text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.035em] text-ivory">
              Put your car in front of{" "}
              <span className="text-gradient-brand">64,000 verified bidders</span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-pretty text-[16px] leading-relaxed text-muted">
              Listing fee waived when you book an inspection. Six minutes to
              publish, seven days to sell, 2% buyer&rsquo;s premium — capped.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/sell/new">
                  Start your listing
                  <ArrowRight />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/pricing">See the fees</Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
