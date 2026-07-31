import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Clock,
  Gavel,
  Handshake,
  Repeat,
  Search,
  ShieldCheck,
  Timer,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { INCREMENT_TABLE } from "@/lib/auction/engine";
import { FEES } from "@/lib/constants";
import { formatPKR, formatPKRShort } from "@/lib/format";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How PakOption auctions work: proxy bidding, hidden reserves, three-minute soft close, and what happens when a reserve isn't met.",
};

const BUYER_STEPS = [
  {
    Icon: Search,
    title: "Find a lot",
    body: "Filter by make, city, budget, body type and inspection grade. Certified lots carry a 212-point report you can read before you bid a rupee.",
  },
  {
    Icon: ShieldCheck,
    title: "Get verified",
    body: "Phone verification is required before your first bid. Lots above PKR 50,00,000 additionally need CNIC verification. This is what keeps fake bidders out.",
  },
  {
    Icon: Gavel,
    title: "Set your maximum",
    body: "You submit the most you're willing to pay, not what you want to bid now. The engine bids the minimum needed to keep you leading — you often pay less than your maximum.",
  },
  {
    Icon: Handshake,
    title: "Win and complete",
    body: "Pay the deposit, the seller's contact details unlock, and you work through a transfer checklist together. Buyer's premium is 2%, capped.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="How it works"
        title="No mystery, no games"
        description="The mechanics of a PakOption auction, written out plainly — including the bits most platforms bury in the terms."
      />

      {/* ---------- Buyers ---------- */}
      <section className="container-page py-16 md:py-20" id="buyers">
        <Reveal className="max-w-2xl">
          <Badge variant="brand">For buyers</Badge>
          <h2 className="mt-4 text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.03em] text-ivory">
            Bidding, step by step
          </h2>
        </Reveal>

        <StaggerGroup className="mt-10 grid gap-5 md:grid-cols-2">
          {BUYER_STEPS.map((s, i) => (
            <StaggerItem key={s.title}>
              <div className="edge-light flex h-full gap-4 rounded-lg border border-line bg-surface p-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-brand-700 bg-brand-900 text-brand-300">
                  <s.Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-mono text-[11px] text-muted-2">
                    STEP 0{i + 1}
                  </p>
                  <h3 className="mt-1 text-[16px] font-semibold tracking-tight text-ivory">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">
                    {s.body}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* ---------- Proxy bidding explained ---------- */}
      <section className="border-y border-line bg-ink-2/50">
        <div className="container-page py-16 md:py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <Reveal>
              <Badge variant="gold">
                <TrendingUp aria-hidden />
                The part people get wrong
              </Badge>
              <h2 className="mt-4 text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.03em] text-ivory">
                You pay one increment above the runner-up, not your maximum
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                This is the single most misunderstood thing about proxy bidding,
                and it&rsquo;s the reason bidding your true maximum early is
                usually the right move.
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-lg border border-line bg-surface p-5">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-2">
                    Worked example
                  </p>
                  <ol className="mt-4 space-y-3 text-[14px] leading-relaxed text-muted">
                    <li className="flex gap-3">
                      <span className="font-mono text-brand-400">1.</span>
                      <span>
                        Current bid is{" "}
                        <span className="font-mono text-ivory tnum">
                          {formatPKR(6_000_000)}
                        </span>
                        . Increment at this level is{" "}
                        <span className="font-mono text-ivory tnum">
                          {formatPKR(50_000)}
                        </span>
                        .
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-mono text-brand-400">2.</span>
                      <span>
                        Bidder A sets a maximum of{" "}
                        <span className="font-mono text-ivory tnum">
                          {formatPKR(6_500_000)}
                        </span>
                        . They now lead at{" "}
                        <span className="font-mono text-gold tnum">
                          {formatPKR(6_050_000)}
                        </span>
                        .
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-mono text-brand-400">3.</span>
                      <span>
                        Bidder B sets a maximum of{" "}
                        <span className="font-mono text-ivory tnum">
                          {formatPKR(6_300_000)}
                        </span>
                        . A&rsquo;s proxy defends automatically. B is outbid
                        instantly, and A now leads at{" "}
                        <span className="font-mono text-gold tnum">
                          {formatPKR(6_350_000)}
                        </span>
                        .
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-mono text-brand-400">4.</span>
                      <span>
                        A wins at{" "}
                        <span className="font-mono text-gold tnum">
                          {formatPKR(6_350_000)}
                        </span>{" "}
                        — not their {formatPKR(6_500_000)} maximum. They saved{" "}
                        {formatPKR(150_000)} by bidding honestly.
                      </span>
                    </li>
                  </ol>
                </div>
              </div>
            </Reveal>

            <Reveal direction="left">
              {/* increments */}
              <div className="edge-light rounded-xl border border-line-strong bg-surface p-7">
                <h3 className="text-[15px] font-semibold text-ivory">
                  Bid increments
                </h3>
                <p className="mt-1.5 text-[13px] text-muted">
                  The step size rises with the price, so a PKR 4 crore lot
                  doesn&rsquo;t crawl upward in five-thousand jumps.
                </p>

                <table className="mt-5 w-full text-left text-[13.5px]">
                  <thead>
                    <tr className="border-b border-line text-[11px] uppercase tracking-[0.1em] text-muted-2">
                      <th scope="col" className="pb-2 font-semibold">
                        Current price
                      </th>
                      <th scope="col" className="pb-2 text-right font-semibold">
                        Increment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {INCREMENT_TABLE.map((tier, i) => {
                      const from =
                        i === 0 ? 0 : INCREMENT_TABLE[i - 1]!.upTo;
                      return (
                        <tr key={tier.increment}>
                          <td className="py-2.5 font-mono text-muted tnum">
                            {tier.upTo === Number.POSITIVE_INFINITY
                              ? `${formatPKRShort(from, false)} and above`
                              : `${formatPKRShort(from, false)} – ${formatPKRShort(tier.upTo, false)}`}
                          </td>
                          <td className="py-2.5 text-right font-mono font-semibold text-ivory tnum">
                            {formatPKR(tier.increment)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* soft close */}
              <div className="edge-light mt-5 rounded-xl border border-line-strong bg-surface p-7">
                <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ivory">
                  <Timer className="size-4 text-danger" aria-hidden />
                  Soft close — anti-sniping
                </h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted">
                  Any bid placed inside the final three minutes pushes the
                  finish out to three minutes from that moment. There is no cap
                  on extensions. Waiting until the last second gains you nothing
                  — the auction ends when bidding actually stops, not when a
                  clock runs out.
                </p>
              </div>

              {/* reserve not met */}
              <div className="edge-light mt-5 rounded-xl border border-line-strong bg-surface p-7">
                <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ivory">
                  <Repeat className="size-4 text-gold" aria-hidden />
                  When the reserve isn&rsquo;t met
                </h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted">
                  The lot doesn&rsquo;t simply die. The highest bidder gets 24
                  hours to submit a best offer, and the seller gets 24 hours to
                  accept, decline or counter. Roughly a third of reserve-not-met
                  lots close this way.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Sellers ---------- */}
      <section className="container-page py-16 md:py-20" id="sellers">
        <Reveal className="max-w-2xl">
          <Badge variant="brand">For sellers</Badge>
          <h2 className="mt-4 text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.03em] text-ivory">
            What it costs, and when
          </h2>
        </Reveal>

        <StaggerGroup className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              Icon: Camera,
              t: "Listing fee",
              v: formatPKR(FEES.auctionListingFee),
              d: "Waived entirely when you book an inspection. Charged at publish.",
            },
            {
              Icon: Handshake,
              t: "Success fee",
              v: `1% · max ${formatPKRShort(FEES.successFeeCap)}`,
              d: "Only on a completed sale. Nothing if the lot doesn't sell.",
            },
            {
              Icon: Clock,
              t: "Buyer's premium",
              v: "2% · paid by buyer",
              d: `Minimum ${formatPKRShort(FEES.buyersPremiumMin)}, capped at ${formatPKRShort(FEES.buyersPremiumMax)}. Not deducted from your proceeds.`,
            },
          ].map((f) => (
            <StaggerItem key={f.t}>
              <div className="edge-light h-full rounded-lg border border-line bg-surface p-6">
                <f.Icon className="size-5 text-brand-400" aria-hidden />
                <h3 className="mt-4 text-[15px] font-semibold text-ivory">
                  {f.t}
                </h3>
                <p className="mt-2 font-mono text-lg font-semibold text-gold tnum">
                  {f.v}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">
                  {f.d}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <Reveal className="mt-10">
          <Button size="lg" asChild>
            <Link href="/sell/new">
              Start your listing
              <ArrowRight />
            </Link>
          </Button>
        </Reveal>
      </section>
    </>
  );
}
