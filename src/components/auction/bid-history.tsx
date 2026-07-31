"use client";

import * as React from "react";
import { Bot, Trophy, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTimePK, formatPKR, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Bid } from "@/types";

export function BidHistory({ bids }: { bids: Bid[] }) {
  const [showAll, setShowAll] = React.useState(false);
  const visible = showAll ? bids : bids.slice(0, 8);

  if (!bids.length) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-ink-2 p-10 text-center">
        <p className="text-sm text-muted">No bids yet.</p>
        <p className="mt-1 text-[13px] text-muted-2">
          Be the first — opening bids often set the tone for the whole auction.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">
          Bid history — bidder handles are masked for privacy
        </caption>
        <thead className="bg-ink-2">
          <tr className="text-[11px] uppercase tracking-[0.12em] text-muted-2">
            <th scope="col" className="px-4 py-3 font-semibold">
              Bidder
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">
              Amount
            </th>
            <th scope="col" className="hidden px-4 py-3 text-right font-semibold sm:table-cell">
              Placed
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {visible.map((bid, i) => (
            <tr
              key={bid.id}
              className={cn(
                "transition-colors hover:bg-surface-2/50",
                i === 0 && "bg-brand-900/25",
              )}
            >
              <td className="px-4 py-3">
                <span className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full border",
                      i === 0
                        ? "border-brand-600 bg-brand-900 text-brand-300"
                        : "border-line bg-ink-2 text-muted-2",
                    )}
                  >
                    {bid.isAutoBid ? (
                      <Bot className="size-3.5" aria-hidden />
                    ) : (
                      <User className="size-3.5" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-[13px] text-ivory">
                      {bid.bidderHandle}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {bid.isAutoBid && (
                        <span className="text-[11px] text-muted-2">
                          auto-bid
                        </span>
                      )}
                      {i === 0 && (
                        <Badge
                          variant={bid.status === "WON" ? "gold" : "brand"}
                          size="sm"
                        >
                          {bid.status === "WON" ? (
                            <>
                              <Trophy aria-hidden />
                              Won
                            </>
                          ) : (
                            "Leading"
                          )}
                        </Badge>
                      )}
                    </span>
                  </span>
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <span
                  data-price
                  className={cn(
                    "font-mono font-semibold tnum",
                    i === 0 ? "text-gold" : "text-ivory",
                  )}
                >
                  {formatPKR(bid.amount)}
                </span>
              </td>
              <td className="hidden px-4 py-3 text-right sm:table-cell">
                <time
                  dateTime={bid.placedAt}
                  title={formatDateTimePK(bid.placedAt)}
                  className="text-[12.5px] text-muted"
                  suppressHydrationWarning
                >
                  {formatRelative(bid.placedAt)}
                </time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {bids.length > 8 && (
        <div className="border-t border-line bg-ink-2 p-3 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? "Show fewer" : `Show all ${bids.length} bids`}
          </Button>
        </div>
      )}
    </div>
  );
}
