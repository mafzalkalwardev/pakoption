import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Info } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FEES, INSPECTION_PACKAGES } from "@/lib/constants";
import { formatPKR, formatPKRShort } from "@/lib/format";

export const metadata: Metadata = {
  title: "Fees & pricing",
  description:
    "Every PakOption fee in one table: listing fee, success fee, buyer's premium, inspection packages and featured placement.",
};

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Every fee, on one page"
        description="No percentage buried in clause 14. If it costs money, it's in this table."
      />

      <div className="container-page space-y-14 py-14">
        {/* selling */}
        <Reveal>
          <h2 className="text-xl font-semibold tracking-tight text-ivory">
            Selling
          </h2>
          <div className="mt-5 overflow-hidden rounded-xl border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink-2">
                <tr className="text-[11px] uppercase tracking-[0.12em] text-muted-2">
                  <th scope="col" className="px-5 py-3.5 font-semibold">Fee</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Amount</th>
                  <th scope="col" className="hidden px-5 py-3.5 font-semibold md:table-cell">
                    When
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {[
                  [
                    "Auction listing fee",
                    formatPKR(FEES.auctionListingFee),
                    "At publish — waived if you book an inspection",
                  ],
                  ["Classified listing", "Free", "Always"],
                  [
                    "Success fee",
                    `1% · capped at ${formatPKRShort(FEES.successFeeCap)}`,
                    "Only on a completed sale",
                  ],
                  ["Relist after reserve not met", "Free (once)", "Within 14 days"],
                  [
                    "Featured placement",
                    FEES.featuredPrices
                      .map((f) => `${formatPKRShort(f.price, false)} / ${f.days}d`)
                      .join(" · "),
                    "Optional boost",
                  ],
                ].map(([fee, amount, when]) => (
                  <tr key={fee} className="bg-surface">
                    <td className="px-5 py-4 text-[13.5px] font-medium text-ivory">
                      {fee}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-[13.5px] font-semibold text-gold tnum">
                        {amount}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 text-[13px] text-muted md:table-cell">
                      {when}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        {/* buying */}
        <Reveal>
          <h2 className="text-xl font-semibold tracking-tight text-ivory">
            Buying
          </h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="edge-light rounded-xl border border-line bg-surface p-6">
              <h3 className="text-[15px] font-semibold text-ivory">
                Buyer&rsquo;s premium
              </h3>
              <p className="mt-3 font-mono text-2xl font-semibold text-gold tnum">
                2%
              </p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                Of the hammer price, with a floor of{" "}
                {formatPKR(FEES.buyersPremiumMin)} and a cap of{" "}
                {formatPKR(FEES.buyersPremiumMax)}. Shown to you before you
                confirm every bid — never a surprise at checkout.
              </p>
              <ul className="mt-4 space-y-1.5 text-[13px] text-muted">
                <li className="flex justify-between">
                  <span>Hammer {formatPKRShort(3_000_000)}</span>
                  <span className="font-mono text-ivory tnum">
                    + {formatPKR(60_000)}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Hammer {formatPKRShort(500_000)}</span>
                  <span className="font-mono text-ivory tnum">
                    + {formatPKR(15_000)} (floor)
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Hammer {formatPKRShort(20_000_000)}</span>
                  <span className="font-mono text-ivory tnum">
                    + {formatPKR(200_000)} (cap)
                  </span>
                </li>
              </ul>
            </div>

            <div className="edge-light rounded-xl border border-line bg-surface p-6">
              <h3 className="text-[15px] font-semibold text-ivory">
                Bidding &amp; browsing
              </h3>
              <p className="mt-3 font-mono text-2xl font-semibold text-brand-400">
                Free
              </p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                No subscription, no per-bid charge, no fee to watch or save
                searches.
              </p>
              <ul className="mt-4 space-y-2 text-[13px] text-muted">
                {[
                  "Unlimited bidding",
                  "Watchlist and outbid alerts",
                  "Saved searches with alerts",
                  "Full inspection reports on Certified lots",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-brand-500" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-md border border-line bg-ink-2 p-3 text-[12px] leading-relaxed text-muted-2">
                A refundable deposit is required to bid on lots above{" "}
                {formatPKRShort(5_000_000)}. It&rsquo;s returned in full if you
                don&rsquo;t win.
              </p>
            </div>
          </div>
        </Reveal>

        {/* inspection */}
        <Reveal>
          <h2 className="text-xl font-semibold tracking-tight text-ivory">
            Inspection
          </h2>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {INSPECTION_PACKAGES.map((p) => (
              <div
                key={p.id}
                className="edge-light rounded-xl border border-line bg-surface p-6"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[15px] font-semibold text-ivory">
                    {p.name}
                  </h3>
                  {p.popular && (
                    <Badge variant="brand" size="sm">Most booked</Badge>
                  )}
                </div>
                <p className="mt-3 font-mono text-2xl font-semibold text-gold tnum">
                  {formatPKR(p.price)}
                </p>
                <p className="mt-2 text-[13px] text-muted">
                  <span className="tnum">{p.checkpoints}</span> checkpoints ·{" "}
                  {p.duration}
                </p>
                <Button variant="outline" size="sm" className="mt-5 w-full" asChild>
                  <Link href={`/inspection/book?package=${p.id}`}>Book</Link>
                </Button>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <p className="flex items-start gap-2.5 rounded-xl border border-line bg-ink-2 p-5 text-[12.5px] leading-relaxed text-muted">
            <Info className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden />
            <span>
              All prices are in Pakistani Rupees and include applicable taxes
              where charged. PakOption does not hold sale funds in escrow — the
              deposit is processed by a licensed payment provider and the balance
              is settled directly between buyer and seller at handover.
            </span>
          </p>
        </Reveal>

        <Reveal>
          <Button size="lg" asChild>
            <Link href="/sell/new">
              Start your listing
              <ArrowRight />
            </Link>
          </Button>
        </Reveal>
      </div>
    </>
  );
}
