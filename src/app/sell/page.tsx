import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Clock,
  Gavel,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Counter } from "@/components/motion/counter";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/primitives";
import { getStats } from "@/lib/db/repository";
import { FEES } from "@/lib/constants";
import { formatPKR, formatPKRShort } from "@/lib/format";

export const metadata: Metadata = {
  title: "Sell your car",
  description:
    "List your car by auction or classified on PakOption. Free listing when you book an inspection, 64,000 verified bidders, median sale in 7 days.",
};

const REASONS = [
  {
    Icon: Users,
    title: "64,000 verified bidders",
    body: "Every bidder is phone-verified before they can place a bid, and CNIC-verified for lots above PKR 50 lakh. No time-wasters, no fake calls.",
  },
  {
    Icon: TrendingUp,
    title: "The market sets the price",
    body: "You stop guessing what the car is worth and stop defending a number. Proxy bidding does the negotiating, and a hidden reserve protects your floor.",
  },
  {
    Icon: BadgeCheck,
    title: "The report argues for you",
    body: "A 212-point inspection with photographs answers the questions buyers would otherwise use to knock the price down.",
  },
  {
    Icon: Clock,
    title: "Median sale in 7 days",
    body: "A fixed end date creates urgency that an open-ended classified never will. Most auctions close above reserve inside a week.",
  },
];

const WIZARD_STEPS = [
  {
    Icon: Camera,
    title: "Vehicle",
    body: "Make, model, variant, year and registration city.",
  },
  {
    Icon: TrendingUp,
    title: "Condition & photos",
    body: "Specs, features, and at least 8 guided photos.",
  },
  {
    Icon: ShieldCheck,
    title: "Disclosure",
    body: "Accident and flood history, with a signed attestation.",
  },
  {
    Icon: Gavel,
    title: "Format & price",
    body: "Auction or classified, hidden reserve, duration.",
  },
];

const FAQS = [
  {
    q: "What does it cost me?",
    a: `Listing an auction is ${formatPKR(FEES.auctionListingFee)}, waived entirely if you book an inspection. On a completed sale there's a 1% success fee capped at ${formatPKRShort(FEES.successFeeCap)}. The 2% buyer's premium is paid by the buyer, not you.`,
  },
  {
    q: "What is a reserve price and should I set one?",
    a: "A reserve is a hidden minimum. Bidders see only whether it has been met, never the number. Set one if you genuinely cannot sell below a figure — but set it realistically, because lots that end below reserve sell far less often. No-reserve lots attract noticeably more bidders.",
  },
  {
    q: "Can someone snipe my auction in the last second?",
    a: "No. Any bid placed inside the final three minutes pushes the close out by three more minutes, with no limit on extensions. Bidding ends when bidding actually stops.",
  },
  {
    q: "What if the reserve isn't met?",
    a: "The highest bidder gets 24 hours to submit a best offer, and you get 24 hours to accept, decline or counter. If nothing comes of it, you can relist once for free.",
  },
  {
    q: "Do I have to get an inspection?",
    a: "No, but Certified lots sell through about 20 percentage points more often, and the listing fee is waived when you book one — so for most sellers it's cheaper to have it than not.",
  },
  {
    q: "When do I get paid?",
    a: "PakOption does not hold funds in v1. The winner pays a deposit through our payment partner, contact details unlock, and you settle the balance directly at handover using our transfer checklist.",
  },
];

export default async function SellPage() {
  const stats = await getStats();

  return (
    <>
      <PageHeader
        eyebrow="Sell"
        title="Stop haggling. Let the market decide."
        description="List by auction or classified in about six minutes. Book an inspection and the listing fee disappears."
        actions={
          <Button size="lg" asChild>
            <Link href="/sell/new">
              Start your listing
              <ArrowRight />
            </Link>
          </Button>
        }
      />

      {/* stats */}
      <section className="container-page py-12">
        <dl className="edge-light grid grid-cols-2 divide-line rounded-xl border border-line bg-surface md:grid-cols-4 md:divide-x">
          {[
            { label: "Sell-through rate", value: 58, suffix: "%", fmt: (n: number) => String(Math.round(n)) },
            { label: "Median days to sell", value: 7, suffix: "", fmt: (n: number) => String(Math.round(n)) },
            { label: "Verified bidders", value: stats.registeredBidders, suffix: "+", fmt: (n: number) => Math.round(n).toLocaleString("en-PK") },
            { label: "Cars sold", value: stats.carsSold, suffix: "+", fmt: (n: number) => Math.round(n).toLocaleString("en-PK") },
          ].map((s) => (
            <div key={s.label} className="border-b border-line px-5 py-6 text-center md:border-b-0">
              <dd className="font-mono text-2xl font-semibold text-ivory tnum md:text-3xl">
                <Counter value={s.value} format={s.fmt} suffix={s.suffix} />
              </dd>
              <dt className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                {s.label}
              </dt>
            </div>
          ))}
        </dl>
      </section>

      {/* reasons */}
      <section className="container-page py-12 md:py-16">
        <Reveal className="max-w-2xl">
          <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.03em] text-ivory">
            Why sellers move here from the classifieds sites
          </h2>
        </Reveal>

        <StaggerGroup className="mt-10 grid gap-5 md:grid-cols-2">
          {REASONS.map((r) => (
            <StaggerItem key={r.title}>
              <div className="edge-light flex h-full gap-4 rounded-lg border border-line bg-surface p-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-brand-700 bg-brand-900 text-brand-300">
                  <r.Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <h3 className="text-[16px] font-semibold tracking-tight text-ivory">
                    {r.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">
                    {r.body}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* steps */}
      <section className="border-y border-line bg-ink-2/50">
        <div className="container-page py-16 md:py-20">
          <Reveal className="max-w-2xl">
            <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.03em] text-ivory">
              Seven steps, about six minutes
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              It autosaves, so you can start on a laptop and finish on your phone
              standing next to the car.
            </p>
          </Reveal>

          <StaggerGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WIZARD_STEPS.map((step, i) => (
              <StaggerItem key={step.title}>
                <div className="edge-light h-full rounded-lg border border-line bg-surface p-5">
                  <div className="flex items-center justify-between">
                    <step.Icon className="size-5 text-brand-400" aria-hidden />
                    <span className="font-mono text-xl font-bold text-line-strong">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold text-ivory">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                    {step.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* faq */}
      <section className="container-page py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.03em] text-ivory">
              Before you list
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              The things sellers ask us most.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/sell/new">
                Start your listing
                <ArrowRight />
              </Link>
            </Button>
          </Reveal>

          <Reveal direction="left">
            <Accordion
              type="single"
              collapsible
              className="rounded-xl border border-line bg-surface px-6"
            >
              {FAQS.map((f, i) => (
                <AccordionItem key={f.q} value={`s-faq-${i}`}>
                  <AccordionTrigger>{f.q}</AccordionTrigger>
                  <AccordionContent>{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>
    </>
  );
}
