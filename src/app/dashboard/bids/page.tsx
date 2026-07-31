import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/auction/countdown";
import { getLiveAuctions } from "@/lib/db/repository";
import { formatPKR } from "@/lib/format";

export const metadata: Metadata = { title: "My bids" };
export const dynamic = "force-dynamic";

export default async function MyBidsPage() {
  const lots = await getLiveAuctions(6);

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-ivory">
        My bids
      </h1>
      <p className="mt-1.5 text-[14px] text-muted">
        Your maximum is never shown to other bidders — only the amount the proxy
        engine has actually bid on your behalf.
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-ink-2">
            <tr className="text-[11px] uppercase tracking-[0.12em] text-muted-2">
              <th scope="col" className="px-4 py-3 font-semibold">Lot</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Current bid</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Your max</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Ends</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {lots.map((l, i) => {
              const leading = i % 3 === 0;
              const price = l.auction?.currentPrice ?? 0;
              return (
                <tr key={l.id} className="transition-colors hover:bg-surface-2/50">
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/auctions/${l.slug}`}
                      className="text-[13.5px] font-medium text-ivory hover:text-brand-300"
                    >
                      {l.title}
                    </Link>
                    <p className="mt-0.5 text-[12px] text-muted-2">
                      {l.registrationCity} · {l.auction?.bidCount} bids
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="font-mono font-semibold text-gold tnum">
                      {formatPKR(price)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="font-mono text-ivory tnum">
                      {formatPKR(leading ? price + 150_000 : price - 50_000)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {l.auction && (
                      <Countdown
                        endsAt={l.auction.endsAt}
                        size="sm"
                        showIcon={false}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {leading ? (
                      <Badge variant="brand" size="sm">
                        <Trophy aria-hidden />
                        Leading
                      </Badge>
                    ) : (
                      <Badge variant="danger" size="sm">Outbid</Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link href="/auctions">Find more lots</Link>
        </Button>
      </div>
    </div>
  );
}
