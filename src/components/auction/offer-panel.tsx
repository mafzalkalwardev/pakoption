"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Calculator,
  Handshake,
  Heart,
  Info,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CurrencyInput, FieldHint, Label, Textarea } from "@/components/ui/input";
import { Slider } from "@/components/ui/primitives";
import { formatPKR, formatPKRShort } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Simple reducing-balance instalment. Illustrative only — not a quote. */
function monthlyInstalment(principal: number, annualRate: number, months: number) {
  const r = annualRate / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

export function OfferPanel({
  askingPrice,
  negotiable,
  city,
}: {
  askingPrice: number;
  negotiable: boolean;
  city: string;
}) {
  const [raw, setRaw] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [watching, setWatching] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [showCalc, setShowCalc] = React.useState(false);

  // financing calculator
  const [downPct, setDownPct] = React.useState(30);
  const [months, setMonths] = React.useState(60);
  const RATE = 0.215; // representative Pakistani auto-finance KIBOR+spread

  const amount = Number(raw.replace(/[^\d]/g, "")) || 0;
  const tooLow = amount > 0 && amount < askingPrice * 0.7;

  const down = Math.round((askingPrice * downPct) / 100);
  const financed = askingPrice - down;
  const instalment = Math.round(monthlyInstalment(financed, RATE, months));

  async function send() {
    setSending(true);
    await new Promise((r) => setTimeout(r, 600));
    setSending(false);
    setRaw("");
    setMessage("");
    toast.success("Offer sent", {
      description: `The seller has 48 hours to accept, decline or counter your offer of ${formatPKR(amount)}.`,
    });
  }

  return (
    <aside className="edge-light rounded-xl border border-line-strong bg-surface p-6 shadow-lift">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            Asking price
          </p>
          <p
            data-price
            className="mt-1.5 font-mono text-[clamp(1.75rem,4vw,2.25rem)] font-semibold leading-none tracking-tight text-gold tnum"
          >
            {formatPKR(askingPrice)}
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] text-muted">
            <MapPin className="size-3.5" aria-hidden />
            {city}
          </p>
        </div>
        {negotiable ? (
          <Badge variant="brand">Negotiable</Badge>
        ) : (
          <Badge variant="outline">Fixed price</Badge>
        )}
      </div>

      {/* offer */}
      <div className="mt-6 border-t border-line pt-6">
        <Label htmlFor="offer">Make an offer</Label>
        <CurrencyInput
          id="offer"
          value={raw}
          onChange={(e) => {
            const d = e.target.value.replace(/[^\d]/g, "");
            setRaw(d ? Number(d).toLocaleString("en-PK") : "");
          }}
          placeholder={Math.round(askingPrice * 0.92).toLocaleString("en-PK")}
          aria-describedby="offer-hint"
        />
        <FieldHint id="offer-hint" error={tooLow}>
          {tooLow
            ? "Offers more than 30% below asking are usually declined without a reply."
            : "The seller has 48 hours to accept, decline or counter."}
        </FieldHint>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {[0.9, 0.95, 1].map((m) => {
            const v = Math.round((askingPrice * m) / 5000) * 5000;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setRaw(v.toLocaleString("en-PK"))}
                className={cn(
                  "rounded-md border py-2 font-mono text-[12.5px] font-semibold transition-colors tnum",
                  amount === v
                    ? "border-brand-500 bg-brand-900 text-brand-300"
                    : "border-line bg-ink-2 text-muted hover:border-line-strong hover:text-ivory",
                )}
              >
                {formatPKRShort(v, false)}
              </button>
            );
          })}
        </div>

        <div className="mt-3">
          <Label htmlFor="offer-msg">Message (optional)</Label>
          <Textarea
            id="offer-msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Cash ready, can collect this weekend. Happy to arrange a PakOption inspection first."
            className="min-h-20 text-[13.5px]"
          />
        </div>

        <Button
          variant="gold"
          size="lg"
          className="mt-4 w-full"
          disabled={amount <= 0}
          loading={sending}
          onClick={send}
        >
          <Handshake />
          Send offer
        </Button>
      </div>

      {/* financing */}
      <div className="mt-6 border-t border-line pt-6">
        <button
          type="button"
          onClick={() => setShowCalc((v) => !v)}
          aria-expanded={showCalc}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="flex items-center gap-2 text-[13.5px] font-medium text-ivory">
            <Calculator className="size-4 text-brand-500" aria-hidden />
            Financing calculator
          </span>
          <span className="text-muted-2">{showCalc ? "−" : "+"}</span>
        </button>

        {showCalc && (
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-baseline justify-between text-[12.5px]">
                <span className="text-muted">Down payment</span>
                <span className="font-mono font-semibold text-ivory tnum">
                  {downPct}% · {formatPKRShort(down)}
                </span>
              </div>
              <Slider
                value={[downPct]}
                onValueChange={([v]) => setDownPct(v ?? 30)}
                min={10}
                max={80}
                step={5}
                className="mt-2"
                aria-label="Down payment percentage"
              />
            </div>

            <div>
              <div className="flex items-baseline justify-between text-[12.5px]">
                <span className="text-muted">Tenure</span>
                <span className="font-mono font-semibold text-ivory tnum">
                  {months} months
                </span>
              </div>
              <Slider
                value={[months]}
                onValueChange={([v]) => setMonths(v ?? 60)}
                min={12}
                max={84}
                step={12}
                className="mt-2"
                aria-label="Loan tenure in months"
              />
            </div>

            <div className="rounded-md border border-line bg-ink-2 p-4 text-center">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-2">
                Estimated monthly instalment
              </p>
              <p className="mt-1.5 font-mono text-2xl font-semibold text-brand-300 tnum">
                {formatPKR(instalment)}
              </p>
              <p className="mt-1.5 text-[11.5px] text-muted-2">
                on {formatPKRShort(financed)} financed at 21.5% p.a.
              </p>
            </div>

            <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-muted-2">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span>
                An illustration using a representative rate, not an offer of
                credit. Actual rates depend on the lender, your profile and the
                vehicle&rsquo;s age. PakOption is not a financial adviser.
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-line pt-6">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            setWatching((w) => !w);
            toast.success(watching ? "Removed from watchlist" : "Added to watchlist");
          }}
        >
          <Heart className={cn(watching && "fill-danger text-danger")} />
          {watching ? "Watching" : "Add to watchlist"}
        </Button>
      </div>

      <p className="mt-5 flex items-start gap-2.5 border-t border-line pt-5 text-[12px] leading-relaxed text-muted">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden />
        <span>
          Never pay a deposit before seeing the car. PakOption does not hold
          funds for classified sales.
        </span>
      </p>
    </aside>
  );
}
