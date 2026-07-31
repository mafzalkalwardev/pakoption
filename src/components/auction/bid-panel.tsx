"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Bell,
  Check,
  Gavel,
  Heart,
  Info,
  Lock,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { CountdownBlocks, useCountdown } from "./countdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CurrencyInput, FieldHint, Label } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/primitives";
import {
  computeBuyersPremium,
  computeTotalPayable,
  getIncrement,
  getMinimumBid,
  getQuickBids,
  requiredTierForBid,
  simulateBid,
  type AuctionState,
} from "@/lib/auction/engine";
import { formatPKR, formatPKRShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AuctionPublic } from "@/types";

/**
 * The bid panel runs the *same* pure engine the server runs, so the outcome
 * shown on submit is the outcome the server will produce — unless someone else
 * bids in the same instant, in which case the realtime patch corrects it.
 */
export function BidPanel({
  auction,
  className,
}: {
  auction: AuctionPublic;
  className?: string;
}) {
  const time = useCountdown(auction.endsAt);
  const [state, setState] = React.useState(auction);
  const [raw, setRaw] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [isLeading, setIsLeading] = React.useState(false);
  const [watching, setWatching] = React.useState(false);

  const engineState: AuctionState = React.useMemo(
    () => ({
      startingPrice: state.startingPrice,
      currentPrice: state.currentPrice,
      bidCount: state.bidCount,
      startsAt: new Date(state.startsAt),
      endsAt: new Date(state.endsAt),
    }),
    [state],
  );

  const minimum = getMinimumBid(
    state.currentPrice,
    state.bidCount,
    state.startingPrice,
  );
  const increment = getIncrement(state.currentPrice);
  const quickBids = getQuickBids(
    state.currentPrice,
    state.bidCount,
    state.startingPrice,
  );

  const amount = Number(raw.replace(/[^\d]/g, "")) || 0;
  const valid = amount >= minimum;
  const premium = amount > 0 ? computeBuyersPremium(amount) : 0;
  const total = amount > 0 ? computeTotalPayable(amount) : 0;
  const tier = requiredTierForBid(amount || state.currentPrice);

  const notStarted = new Date(state.startsAt).getTime() > Date.now();
  const closed = time.isOver || notStarted;

  function setAmount(v: number) {
    setRaw(v.toLocaleString("en-PK"));
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/[^\d]/g, "");
    setRaw(digits ? Number(digits).toLocaleString("en-PK") : "");
  }

  async function submit() {
    setSubmitting(true);

    // Optimistic: run the engine locally first.
    const result = simulateBid(engineState, "me", amount);

    // Stand-in for the `placeBid` server action. See docs/API.md §"placeBid".
    await new Promise((r) => setTimeout(r, 650));

    setSubmitting(false);
    setConfirmOpen(false);

    if (!result.accepted) {
      toast.error(result.message);
      return;
    }

    setState((s) => ({
      ...s,
      currentPrice: result.currentPrice,
      bidCount: result.bidCount,
      bidderCount: s.bidderCount + 1,
      reserveStatus:
        s.reserveStatus === "NO_RESERVE"
          ? "NO_RESERVE"
          : result.currentPrice >= s.currentPrice * 1.02
            ? "MET"
            : s.reserveStatus,
      // Soft close: a bid inside the final 3 minutes pushes the clock out.
      endsAt:
        time.isExtendable
          ? new Date(Date.now() + 3 * 60_000).toISOString()
          : s.endsAt,
      extensionCount: time.isExtendable
        ? s.extensionCount + 1
        : s.extensionCount,
    }));

    setIsLeading(result.isLeading);
    setRaw("");

    if (result.isLeading) {
      toast.success("You are the highest bidder", {
        description: `Leading at ${formatPKR(result.currentPrice)}. We'll bid up to your maximum automatically.`,
      });
    } else {
      toast.warning("You were outbid immediately", {
        description: `Another bidder's maximum is higher. The price moved to ${formatPKR(result.currentPrice)}.`,
      });
    }
  }

  return (
    <>
      <aside
        className={cn(
          "edge-light rounded-xl border border-line-strong bg-surface p-6 shadow-lift",
          className,
        )}
        aria-label="Bidding"
      >
        {/* current price */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
              {state.bidCount ? "Current bid" : "Starting bid"}
            </p>
            <p
              data-price
              aria-live="polite"
              className="mt-1.5 font-mono text-[clamp(1.75rem,4vw,2.25rem)] font-semibold leading-none tracking-tight text-gold tnum"
            >
              {formatPKR(state.currentPrice)}
            </p>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-muted">
              <span className="tnum">{state.bidCount} bids</span>
              <span className="text-muted-2">·</span>
              <span className="tnum">{state.bidderCount} bidders</span>
            </p>
          </div>

          <div className="shrink-0 text-right">
            {state.reserveStatus === "NO_RESERVE" ? (
              <Badge variant="gold">No reserve</Badge>
            ) : state.reserveStatus === "MET" ? (
              <Badge variant="brand">
                <Check aria-hidden />
                Reserve met
              </Badge>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Badge variant="outline" className="cursor-help">
                      <Info aria-hidden />
                      Reserve not met
                    </Badge>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  The seller has set a hidden minimum. If bidding ends below it,
                  the highest bidder gets 24 hours to make a best offer.
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* countdown */}
        <div className="mt-6 border-t border-line pt-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
              {notStarted ? "Starts in" : "Time remaining"}
            </p>
            {state.extensionCount > 0 && (
              <Badge variant="danger" size="sm">
                Extended ×{state.extensionCount}
              </Badge>
            )}
          </div>
          <CountdownBlocks
            endsAt={notStarted ? state.startsAt : state.endsAt}
            className="mt-3"
          />

          {time.isExtendable && !closed && (
            <p className="mt-3 flex items-start gap-2 rounded-md border border-danger/35 bg-danger/8 px-3 py-2.5 text-[12.5px] leading-relaxed text-danger-soft">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                Soft close is active. Any bid now pushes the finish out by three
                more minutes — snipers gain nothing here.
              </span>
            </p>
          )}
        </div>

        {/* bidding */}
        {closed ? (
          <div className="mt-6 rounded-md border border-line bg-ink-2 p-4 text-center">
            <p className="text-sm text-muted">
              {notStarted
                ? "This lot has not opened for bidding yet."
                : "Bidding has closed on this lot."}
            </p>
            <Button variant="outline" size="sm" className="mt-3 w-full">
              <Bell />
              {notStarted ? "Remind me when it opens" : "Notify me of similar lots"}
            </Button>
          </div>
        ) : (
          <div className="mt-6 border-t border-line pt-6">
            {isLeading && (
              <p className="mb-4 flex items-center gap-2 rounded-md border border-brand-600/45 bg-brand-900/50 px-3 py-2.5 text-[13px] font-medium text-brand-300">
                <Check className="size-4 shrink-0" aria-hidden />
                You are the highest bidder
              </p>
            )}

            <Label htmlFor="max-bid">Your maximum bid</Label>
            <CurrencyInput
              id="max-bid"
              value={raw}
              onChange={onChange}
              placeholder={minimum.toLocaleString("en-PK")}
              aria-invalid={raw !== "" && !valid}
              aria-describedby="max-bid-hint"
            />
            <FieldHint id="max-bid-hint" error={raw !== "" && !valid}>
              {raw !== "" && !valid
                ? `Minimum bid is ${formatPKR(minimum)}.`
                : `Minimum ${formatPKR(minimum)} · increments of ${formatPKRShort(increment)}`}
            </FieldHint>

            {/* quick chips */}
            <div className="mt-3 grid grid-cols-4 gap-2">
              {quickBids.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(v)}
                  className={cn(
                    "rounded-md border py-2 font-mono text-[12.5px] font-semibold transition-colors tnum",
                    amount === v
                      ? "border-brand-500 bg-brand-900 text-brand-300"
                      : "border-line bg-ink-2 text-muted hover:border-line-strong hover:text-ivory",
                  )}
                >
                  {formatPKRShort(v, false)}
                </button>
              ))}
            </div>

            {/* premium preview */}
            {amount > 0 && valid && (
              <dl className="mt-4 space-y-1.5 rounded-md border border-line bg-ink-2 p-3.5 text-[12.5px]">
                <div className="flex justify-between">
                  <dt className="text-muted">Your maximum</dt>
                  <dd className="font-mono font-medium text-ivory tnum">
                    {formatPKR(amount)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="flex items-center gap-1.5 text-muted">
                    Buyer&rsquo;s premium (2%)
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 cursor-help text-muted-2" />
                      </TooltipTrigger>
                      <TooltipContent>
                        2% of the hammer price, minimum PKR 15,000 and capped at
                        PKR 2,00,000. Charged only if you win.
                      </TooltipContent>
                    </Tooltip>
                  </dt>
                  <dd className="font-mono font-medium text-ivory tnum">
                    {formatPKR(premium)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-line pt-1.5">
                  <dt className="font-medium text-ivory">
                    Total if you win at max
                  </dt>
                  <dd className="font-mono font-semibold text-gold tnum">
                    {formatPKR(total)}
                  </dd>
                </div>
              </dl>
            )}

            <Button
              variant="gold"
              size="lg"
              className="mt-4 w-full"
              disabled={!valid}
              onClick={() => setConfirmOpen(true)}
            >
              <Gavel />
              Place bid
            </Button>

            <p className="mt-3 flex items-start gap-2 text-[11.5px] leading-relaxed text-muted-2">
              <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span>
                Bids are binding and cannot be retracted. {tier === "CNIC"
                  ? "Lots above PKR 50,00,000 require CNIC verification."
                  : "Phone verification is required to bid."}
              </span>
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setWatching((w) => !w);
                  toast.success(
                    watching ? "Removed from watchlist" : "Added to watchlist",
                  );
                }}
              >
                <Heart className={cn(watching && "fill-danger text-danger")} />
                {watching ? "Watching" : "Watch"}
              </Button>
              <Button variant="secondary" size="sm">
                <TrendingUp />
                Price trend
              </Button>
            </div>
          </div>
        )}

        {/* trust footer */}
        <div className="mt-6 flex items-start gap-2.5 border-t border-line pt-5 text-[12px] leading-relaxed text-muted">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden />
          <span>
            Every bidder is phone-verified. Shill bidding is detected by
            bidder–seller graph analysis and results in a permanent ban.
          </span>
        </div>
      </aside>

      {/* confirmation */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm your bid</DialogTitle>
            <DialogDescription>
              You are setting a maximum. We will bid the minimum needed to keep
              you in the lead, up to this amount — you may pay less than your
              maximum, never more.
            </DialogDescription>
          </DialogHeader>

          <dl className="space-y-2.5 rounded-lg border border-line bg-ink-2 p-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Current bid</dt>
              <dd className="font-mono text-ivory tnum">
                {formatPKR(state.currentPrice)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Your maximum</dt>
              <dd className="font-mono font-semibold text-gold tnum">
                {formatPKR(amount)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Buyer&rsquo;s premium</dt>
              <dd className="font-mono text-ivory tnum">{formatPKR(premium)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2.5">
              <dt className="font-medium text-ivory">Maximum total</dt>
              <dd className="font-mono font-semibold text-ivory tnum">
                {formatPKR(total)}
              </dd>
            </div>
          </dl>

          <p className="mt-4 flex items-start gap-2 rounded-md border border-gold/30 bg-gold/8 px-3 py-2.5 text-[12.5px] leading-relaxed text-gold-soft">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              This is a binding commitment to purchase. If you win and do not
              complete, your deposit is forfeited and a strike is recorded.
            </span>
          </p>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" loading={submitting} onClick={submit}>
              <Gavel />
              Confirm bid of {formatPKRShort(amount)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
