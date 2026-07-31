"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Home,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Progress } from "@/components/ui/primitives";
import {
  INSPECTION_CITIES,
  INSPECTION_PACKAGES,
} from "@/lib/constants";
import { formatPKR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { InspectionPackageId } from "@/types";

const STEPS = ["Package", "Location", "Schedule", "Confirm"] as const;

const SLOTS = [
  "09:00 – 11:00",
  "11:00 – 13:00",
  "13:00 – 15:00",
  "15:00 – 17:00",
  "17:00 – 19:00",
];

function nextDays(n: number) {
  const out: { iso: string; day: string; date: string; month: string }[] = [];
  for (let i = 1; i <= n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    out.push({
      iso: d.toISOString().slice(0, 10),
      day: d.toLocaleDateString("en-PK", { weekday: "short" }),
      date: String(d.getDate()),
      month: d.toLocaleDateString("en-PK", { month: "short" }),
    });
  }
  return out;
}

export function BookingFlow() {
  const params = useSearchParams();
  const presetPackage = params.get("package") as InspectionPackageId | null;
  const presetListing = params.get("listing");

  const [step, setStep] = React.useState(presetPackage ? 1 : 0);
  const [pkg, setPkg] = React.useState<InspectionPackageId>(
    presetPackage ?? "STANDARD",
  );
  const [city, setCity] = React.useState<string>("");
  const [doorstep, setDoorstep] = React.useState(true);
  const [address, setAddress] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [date, setDate] = React.useState("");
  const [slot, setSlot] = React.useState("");
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [reference, setReference] = React.useState<string | null>(null);

  const selected = INSPECTION_PACKAGES.find((p) => p.id === pkg)!;
  const days = React.useMemo(() => nextDays(10), []);

  const canAdvance = [
    true,
    Boolean(city && (!doorstep || address.trim().length > 8)),
    Boolean(date && slot),
    Boolean(name.trim() && /^(\+92|0)3\d{9}$/.test(phone.replace(/[\s-]/g, ""))),
  ][step];

  async function submit() {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    const ref = `PO-INS-2026-${Math.floor(10000 + Math.random() * 89999)}`;
    setReference(ref);
    toast.success("Inspection booked", { description: ref });
  }

  /* ---------------------------------------------------------------- done */
  if (reference) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full border border-brand-600 bg-brand-900">
          <CheckCircle2 className="size-8 text-brand-400" aria-hidden />
        </span>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-ivory">
          Inspection booked
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          We&rsquo;ll assign a technician and text you their name and arrival
          window within the hour.
        </p>

        <dl className="mt-7 space-y-3 rounded-xl border border-line bg-surface p-6 text-left text-sm">
          {[
            ["Reference", reference],
            ["Package", `${selected.name} · ${selected.checkpoints} checkpoints`],
            ["Where", `${doorstep ? "Doorstep" : "Service centre"} · ${city}`],
            ["When", `${date} · ${slot}`],
            ["Paid on completion", formatPKR(selected.price)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <dt className="text-muted">{k}</dt>
              <dd className="text-right font-medium text-ivory">{v}</dd>
            </div>
          ))}
        </dl>

        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setReference(null);
            setStep(0);
          }}
        >
          Book another inspection
        </Button>
      </div>
    );
  }

  /* --------------------------------------------------------------- steps */
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
      <div className="min-w-0">
        {/* progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-[12.5px]">
            <span className="font-medium text-ivory">
              Step {step + 1} of {STEPS.length} · {STEPS[step]}
            </span>
            <span className="text-muted-2 tnum">
              {Math.round(((step + 1) / STEPS.length) * 100)}%
            </span>
          </div>
          <Progress
            value={((step + 1) / STEPS.length) * 100}
            className="mt-2.5"
          />
        </div>

        <div className="edge-light rounded-xl border border-line bg-surface p-6 md:p-8">
          {/* ---- 0 · package ---- */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-ivory">
                Choose a package
              </h2>
              <p className="mt-2 text-[14px] text-muted">
                Standard is the full 200+ point report and the one that earns the
                Certified badge.
              </p>

              <div className="mt-6 space-y-3">
                {INSPECTION_PACKAGES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPkg(p.id)}
                    aria-pressed={pkg === p.id}
                    className={cn(
                      "flex w-full items-start gap-4 rounded-lg border p-5 text-left transition-all duration-200",
                      pkg === p.id
                        ? "border-brand-500 bg-brand-900/40 shadow-glow"
                        : "border-line bg-ink-2 hover:border-line-strong",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2",
                        pkg === p.id
                          ? "border-brand-500 bg-brand-500"
                          : "border-line-strong",
                      )}
                    >
                      {pkg === p.id && (
                        <Check className="size-3 text-ink" strokeWidth={3} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[15px] font-semibold text-ivory">
                          {p.name}
                        </span>
                        {p.popular && (
                          <Badge variant="brand" size="sm">
                            Most booked
                          </Badge>
                        )}
                      </span>
                      <span className="mt-1 block text-[13px] leading-relaxed text-muted">
                        {p.blurb}
                      </span>
                      <span className="mt-2 flex items-center gap-3 text-[12px] text-muted-2">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" aria-hidden />
                          {p.duration}
                        </span>
                        <span className="tnum">{p.checkpoints} checkpoints</span>
                      </span>
                    </span>
                    <span
                      data-price
                      className="shrink-0 font-mono text-lg font-semibold text-gold tnum"
                    >
                      {formatPKR(p.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ---- 1 · location ---- */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-ivory">
                Where is the car?
              </h2>
              <p className="mt-2 text-[14px] text-muted">
                We come to you, or you bring it to a service centre for a more
                thorough underbody check.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    v: true,
                    Icon: Home,
                    t: "Doorstep",
                    d: "Technician travels to your address",
                  },
                  {
                    v: false,
                    Icon: Building2,
                    t: "Service centre",
                    d: "Lift access, paint-depth mapping",
                  },
                ].map(({ v, Icon, t, d }) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDoorstep(v)}
                    aria-pressed={doorstep === v}
                    className={cn(
                      "rounded-lg border p-5 text-left transition-all duration-200",
                      doorstep === v
                        ? "border-brand-500 bg-brand-900/40"
                        : "border-line bg-ink-2 hover:border-line-strong",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-5",
                        doorstep === v ? "text-brand-400" : "text-muted-2",
                      )}
                      aria-hidden
                    />
                    <span className="mt-3 block text-[14.5px] font-semibold text-ivory">
                      {t}
                    </span>
                    <span className="mt-1 block text-[12.5px] text-muted">
                      {d}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <Label>City</Label>
                <div className="flex flex-wrap gap-2">
                  {INSPECTION_CITIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCity(c)}
                      aria-pressed={city === c}
                      className={cn(
                        "rounded-full border px-3.5 py-2 text-[13px] transition-colors",
                        city === c
                          ? "border-brand-500 bg-brand-900 text-brand-300"
                          : "border-line bg-ink-2 text-muted hover:border-line-strong hover:text-ivory",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {doorstep && (
                <div className="mt-6">
                  <Label htmlFor="addr">Full address</Label>
                  <Textarea
                    id="addr"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House 42, Street 7, Phase 5 DHA, Lahore — nearest landmark helps"
                    className="min-h-24"
                  />
                </div>
              )}

              <div className="mt-6">
                <Label htmlFor="notes">Anything we should know? (optional)</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Seller is only available before noon"
                />
              </div>
            </div>
          )}

          {/* ---- 2 · schedule ---- */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-ivory">
                Pick a slot
              </h2>
              <p className="mt-2 text-[14px] text-muted">
                All times are Pakistan Standard Time. Same-day slots open at 8am.
              </p>

              <div className="mt-6">
                <Label>Date</Label>
                <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
                  {days.map((d) => (
                    <button
                      key={d.iso}
                      type="button"
                      onClick={() => setDate(d.iso)}
                      aria-pressed={date === d.iso}
                      className={cn(
                        "flex min-w-16 shrink-0 flex-col items-center rounded-lg border px-3 py-3 transition-colors",
                        date === d.iso
                          ? "border-brand-500 bg-brand-900 text-brand-300"
                          : "border-line bg-ink-2 text-muted hover:border-line-strong",
                      )}
                    >
                      <span className="text-[11px] uppercase tracking-wide">
                        {d.day}
                      </span>
                      <span className="mt-1 font-mono text-lg font-semibold tnum">
                        {d.date}
                      </span>
                      <span className="text-[11px]">{d.month}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <Label>Arrival window</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {SLOTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSlot(s)}
                      aria-pressed={slot === s}
                      className={cn(
                        "rounded-md border py-2.5 font-mono text-[13px] transition-colors tnum",
                        slot === s
                          ? "border-brand-500 bg-brand-900 text-brand-300"
                          : "border-line bg-ink-2 text-muted hover:border-line-strong hover:text-ivory",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---- 3 · confirm ---- */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-ivory">
                Your details
              </h2>
              <p className="mt-2 text-[14px] text-muted">
                We text the technician&rsquo;s name and arrival window to this
                number.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="bk-name">Full name</Label>
                  <Input
                    id="bk-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Afzal Jani"
                  />
                </div>
                <div>
                  <Label htmlFor="bk-phone">Mobile number</Label>
                  <Input
                    id="bk-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="03XX XXXXXXX"
                    aria-invalid={
                      phone !== "" &&
                      !/^(\+92|0)3\d{9}$/.test(phone.replace(/[\s-]/g, ""))
                    }
                  />
                </div>
              </div>

              <p className="mt-6 flex items-start gap-2.5 rounded-lg border border-line bg-ink-2 p-4 text-[12.5px] leading-relaxed text-muted">
                <ShieldCheck
                  className="mt-0.5 size-4 shrink-0 text-brand-500"
                  aria-hidden
                />
                <span>
                  Payment is taken on completion, not now. The report describes
                  the vehicle&rsquo;s condition at the time of inspection and is
                  not a warranty — the full scope is printed on every report.
                </span>
              </p>
            </div>
          )}

          {/* nav */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ArrowLeft />
              Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance}
              >
                Continue
                <ArrowRight />
              </Button>
            ) : (
              <Button
                variant="gold"
                onClick={submit}
                disabled={!canAdvance}
                loading={submitting}
              >
                <ShieldCheck />
                Confirm booking
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* summary rail */}
      <aside className="lg:sticky lg:top-24">
        <div className="edge-light rounded-xl border border-line bg-surface p-6">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-2">
            Your booking
          </h3>

          <dl className="mt-5 space-y-3.5 text-[13.5px]">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Package</dt>
              <dd className="text-right font-medium text-ivory">
                {selected.name}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Checkpoints</dt>
              <dd className="font-mono text-ivory tnum">
                {selected.checkpoints}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Duration</dt>
              <dd className="text-ivory">{selected.duration}</dd>
            </div>
            {city && (
              <div className="flex justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-muted">
                  <MapPin className="size-3.5" aria-hidden />
                  Location
                </dt>
                <dd className="text-right text-ivory">
                  {doorstep ? "Doorstep" : "Centre"} · {city}
                </dd>
              </div>
            )}
            {date && slot && (
              <div className="flex justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-muted">
                  <Calendar className="size-3.5" aria-hidden />
                  When
                </dt>
                <dd className="text-right text-ivory">
                  {date}
                  <br />
                  <span className="font-mono text-[12.5px] text-muted tnum">
                    {slot}
                  </span>
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
            <span className="text-[13.5px] text-muted">Total</span>
            <span
              data-price
              className="font-mono text-xl font-semibold text-gold tnum"
            >
              {formatPKR(selected.price)}
            </span>
          </div>
          <p className="mt-1.5 text-right text-[11.5px] text-muted-2">
            Paid on completion
          </p>

          {presetListing && (
            <p className="mt-5 rounded-md border border-line bg-ink-2 p-3 text-[12px] leading-relaxed text-muted">
              This inspection will be linked to the listing{" "}
              <span className="font-mono text-ivory">{presetListing}</span>.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
