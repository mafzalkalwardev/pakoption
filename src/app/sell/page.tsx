import type { Metadata } from "next";
import { withCanonical } from "@/lib/seo";
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
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/primitives";
import { AUCTION_DURATIONS, FEES } from "@/lib/constants";
import { formatPKR, formatPKRShort } from "@/lib/format";

export const metadata: Metadata = withCanonical("/sell", {
  title: "Sell your car",
  description:
    "List a car as a timed auction or a classified. The wizard covers identity, photos, a hidden reserve, and an optional inspection.",
});

const REASONS = [
  {
    Icon: Users,
    title: "Proxy bidding",
    body: "A bidder submits a maximum. The engine bids the minimum increment needed to lead, up to that maximum. The hammer is one increment above the second-highest maximum.",
  },
  {
    Icon: TrendingUp,
    title: "Hidden reserve",
    body: "You can set a reserve. Bidders never see the number — only whether it is met, not met, or there is no reserve.",
  },
  {
    Icon: BadgeCheck,
    title: "Inspection on the listing",
    body: "The wizard can attach an inspection. Standard is 212 checkpoints. A grade of A or B within 30 days shows the Certified badge.",
  },
  {
    Icon: Clock,
    title: "A length you choose",
    body: `Auction length is ${AUCTION_DURATIONS.map((d) => `${d.days} days`).join(", ")}. A bid inside the final three minutes moves the close to three minutes after that bid.`,
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
    a: "A reserve is a hidden minimum. Bidders see only whether it has been met, never the number. If the auction ends below it, the auction rules give the highest bidder 24 hours to make a best offer and you 24 hours to respond.",
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
    a: "No. Booking one in the wizard sets the auction listing fee to zero on the review step. A report graded A or B within 30 days shows the Certified badge.",
  },
  {
    q: "When do I get paid?",
    a: "This build does not take payment or hold a deposit. The pricing page lists the fees the app is configured to calculate.",
  },
];

export default function SellPage() {
  return (
    <>
      <PageHeader
        eyebrow="Sell"
        title="List by auction or classified"
        description="Seven wizard steps. Book an inspection and the review step sets the auction listing fee to zero."
        actions={
          <Button size="lg" asChild>
            <Link href="/sell/new">
              Start your listing
              <ArrowRight />
            </Link>
          </Button>
        }
      />

      {/* reasons */}
      <section className="container-page py-12 md:py-16">
        <Reveal className="max-w-2xl">
          <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.03em] text-ivory">
            What the listing flow actually does
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
              The rules the wizard and the auction engine implement.
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
