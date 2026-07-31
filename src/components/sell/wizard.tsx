"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  Gavel,
  ImagePlus,
  Info,
  ShieldCheck,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CurrencyInput,
  FieldHint,
  Input,
  Label,
  Textarea,
} from "@/components/ui/input";
import { Checkbox, Progress, Switch } from "@/components/ui/primitives";
import { useReducedMotion } from "@/components/motion/motion-provider";
import {
  AUCTION_DURATIONS,
  BODY_TYPES,
  CITIES,
  COLOURS,
  FEATURES,
  FUEL_TYPES,
  FEES,
  INSPECTION_PACKAGES,
  MAKES,
  MODELS_BY_MAKE,
  TRANSMISSIONS,
} from "@/lib/constants";
import { formatPKR, formatPKRShort } from "@/lib/format";
import { cn } from "@/lib/utils";

const STEPS = [
  "Vehicle",
  "Condition",
  "Photos",
  "Disclosure",
  "Format",
  "Inspection",
  "Review",
] as const;

const GUIDED_ANGLES = [
  "Front 3/4",
  "Rear 3/4",
  "Left side",
  "Right side",
  "Dashboard",
  "Front seats",
  "Rear seats",
  "Odometer",
  "Engine bay",
  "Boot",
];

interface WizardState {
  make: string;
  model: string;
  variant: string;
  year: string;
  registrationCity: string;
  mileageKm: string;
  transmission: string;
  fuelType: string;
  bodyType: string;
  assembly: string;
  engineCc: string;
  colour: string;
  ownersCount: string;
  features: string[];
  photos: string[];
  hasAccidentHistory: boolean;
  accidentNotes: string;
  hasFloodDamage: boolean;
  serviceHistoryAvailable: boolean;
  attestation: boolean;
  type: "AUCTION" | "CLASSIFIED";
  startingPrice: string;
  reservePrice: string;
  askingPrice: string;
  durationDays: number;
  isNegotiable: boolean;
  bookInspection: boolean;
  inspectionPackage: string;
  title: string;
  description: string;
}

const INITIAL: WizardState = {
  make: "",
  model: "",
  variant: "",
  year: "",
  registrationCity: "",
  mileageKm: "",
  transmission: "AUTOMATIC",
  fuelType: "PETROL",
  bodyType: "SEDAN",
  assembly: "LOCAL",
  engineCc: "",
  colour: "White",
  ownersCount: "1",
  features: [],
  photos: [],
  hasAccidentHistory: false,
  accidentNotes: "",
  hasFloodDamage: false,
  serviceHistoryAvailable: true,
  attestation: false,
  type: "AUCTION",
  startingPrice: "",
  reservePrice: "",
  askingPrice: "",
  durationDays: 7,
  isNegotiable: true,
  bookInspection: true,
  inspectionPackage: "STANDARD",
  title: "",
  description: "",
};

const digits = (s: string) => Number(s.replace(/[^\d]/g, "")) || 0;
const grouped = (s: string) => {
  const d = s.replace(/[^\d]/g, "");
  return d ? Number(d).toLocaleString("en-PK") : "";
};

/* -------------------------------------------------------------------------- */

function Field({
  label: text,
  children,
  hint,
  htmlFor,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  htmlFor?: string;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{text}</Label>
      {children}
      {hint && <FieldHint>{hint}</FieldHint>}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  id?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full rounded-md border border-line bg-ink-2 px-3.5 text-sm text-ivory transition-colors hover:border-line-strong focus-visible:border-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25"
    >
      <option value="">Select…</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Pills({
  values,
  selected,
  onToggle,
  multi = false,
}: {
  values: { value: string; label: string }[];
  selected: string | string[];
  onToggle: (v: string) => void;
  multi?: boolean;
}) {
  const isOn = (v: string) =>
    multi ? (selected as string[]).includes(v) : selected === v;

  return (
    <div className="flex flex-wrap gap-2">
      {values.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onToggle(o.value)}
          aria-pressed={isOn(o.value)}
          className={cn(
            "rounded-full border px-3.5 py-2 text-[13px] transition-colors",
            isOn(o.value)
              ? "border-brand-500 bg-brand-900 text-brand-300"
              : "border-line bg-ink-2 text-muted hover:border-line-strong hover:text-ivory",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function SellWizard() {
  const [step, setStep] = React.useState(0);
  const [s, setS] = React.useState<WizardState>(INITIAL);
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const reduced = useReducedMotion();

  const set = <K extends keyof WizardState>(k: K, v: WizardState[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));

  // Autosave shape — in production this calls `saveListingDraft`.
  React.useEffect(() => {
    const id = setTimeout(() => {
      if (s.make) {
        try {
          // Draft is kept in memory only; the real implementation posts to the
          // server action so the seller can resume on another device.
        } catch {
          /* no-op */
        }
      }
    }, 1200);
    return () => clearTimeout(id);
  }, [s]);

  // Auto-compose the title from identity fields.
  React.useEffect(() => {
    if (s.make && s.model && s.year) {
      set("title", `${s.year} ${s.make} ${s.model} ${s.variant}`.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.make, s.model, s.year, s.variant]);

  const models = s.make ? (MODELS_BY_MAKE[s.make] ?? []) : [];

  const valid: boolean[] = [
    Boolean(s.make && s.model && s.variant.length >= 2 && s.year && s.registrationCity),
    Boolean(s.mileageKm && s.engineCc !== "" && s.colour),
    s.photos.length >= 8,
    s.attestation && (!s.hasAccidentHistory || s.accidentNotes.trim().length >= 20),
    s.type === "AUCTION"
      ? digits(s.startingPrice) >= 50_000 &&
        (s.reservePrice === "" || digits(s.reservePrice) >= digits(s.startingPrice))
      : digits(s.askingPrice) >= 50_000,
    true,
    s.description.trim().length >= 80,
  ];

  const listingFee = s.bookInspection ? 0 : FEES.auctionListingFee;
  const inspectionPrice =
    INSPECTION_PACKAGES.find((p) => p.id === s.inspectionPackage)?.price ?? 0;

  function addPhotos(n = 1) {
    // Client-side preview only. Real upload goes to Supabase Storage via a
    // signed URL — see todo.md M3.
    setS((prev) => ({
      ...prev,
      photos: [
        ...prev.photos,
        ...Array.from({ length: n }, (_, i) => `photo-${prev.photos.length + i}`),
      ].slice(0, 30),
    }));
  }

  async function submit() {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1100));
    setSubmitting(false);
    setDone(true);
    toast.success("Listing submitted for review", {
      description: "Most listings go live within 30 minutes.",
    });
  }

  /* ------------------------------------------------------------------ done */
  if (done) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full border border-brand-600 bg-brand-900">
          <CheckCircle2 className="size-8 text-brand-400" aria-hidden />
        </span>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-ivory">
          Submitted for review
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          We run automated checks for duplicate chassis numbers, stock
          photography and price outliers, then a human takes a look. Most
          listings are live within 30 minutes.
        </p>

        <dl className="mt-7 space-y-3 rounded-xl border border-line bg-surface p-6 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Vehicle</dt>
            <dd className="text-right font-medium text-ivory">{s.title}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Format</dt>
            <dd className="text-ivory">
              {s.type === "AUCTION"
                ? `${s.durationDays}-day auction`
                : "Classified"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">
              {s.type === "AUCTION" ? "Starting bid" : "Asking price"}
            </dt>
            <dd className="font-mono font-semibold text-gold tnum">
              {formatPKR(
                digits(s.type === "AUCTION" ? s.startingPrice : s.askingPrice),
              )}
            </dd>
          </div>
          {s.bookInspection && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Inspection</dt>
              <dd className="text-ivory">
                {s.inspectionPackage} · {formatPKR(inspectionPrice)}
              </dd>
            </div>
          )}
        </dl>
      </div>
    );
  }

  /* ----------------------------------------------------------------- steps */
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
      <div className="min-w-0">
        {/* stepper */}
        <div className="mb-8">
          <div className="no-scrollbar -mx-1 mb-3 flex gap-1 overflow-x-auto px-1">
            {STEPS.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => i <= step && setStep(i)}
                disabled={i > step}
                className={cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                  i === step
                    ? "bg-surface-2 text-ivory"
                    : i < step
                      ? "text-brand-400 hover:bg-surface-2"
                      : "text-muted-2",
                )}
              >
                {i < step && <Check className="mr-1 inline size-3" aria-hidden />}
                {label}
              </button>
            ))}
          </div>
          <Progress value={((step + 1) / STEPS.length) * 100} />
        </div>

        <div className="edge-light rounded-xl border border-line bg-surface p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={reduced ? false : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? undefined : { opacity: 0, x: -16 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* ---- 0 vehicle ---- */}
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-ivory">
                      What are you selling?
                    </h2>
                    <p className="mt-2 text-[14px] text-muted">
                      Start with the basics. We&rsquo;ll compose the listing
                      title for you.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Make" htmlFor="w-make">
                      <Select
                        id="w-make"
                        value={s.make}
                        onChange={(v) => {
                          set("make", v);
                          set("model", "");
                        }}
                        options={MAKES.map((m) => ({ value: m, label: m }))}
                      />
                    </Field>
                    <Field label="Model" htmlFor="w-model">
                      <Select
                        id="w-model"
                        value={s.model}
                        onChange={(v) => set("model", v)}
                        options={models.map((m) => ({ value: m, label: m }))}
                      />
                    </Field>
                  </div>

                  <Field
                    label="Variant"
                    htmlFor="w-variant"
                    hint="The trim as written in the registration book, e.g. “Altis Grande X 1.8”"
                  >
                    <Input
                      id="w-variant"
                      value={s.variant}
                      onChange={(e) => set("variant", e.target.value)}
                      placeholder="Altis Grande X 1.8"
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Model year" htmlFor="w-year">
                      <Input
                        id="w-year"
                        inputMode="numeric"
                        value={s.year}
                        onChange={(e) =>
                          set("year", e.target.value.replace(/[^\d]/g, "").slice(0, 4))
                        }
                        placeholder="2021"
                      />
                    </Field>
                    <Field label="Registration city" htmlFor="w-city">
                      <Select
                        id="w-city"
                        value={s.registrationCity}
                        onChange={(v) => set("registrationCity", v)}
                        options={CITIES.map((c) => ({ value: c, label: c }))}
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* ---- 1 condition ---- */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-ivory">
                      Condition &amp; specification
                    </h2>
                    <p className="mt-2 text-[14px] text-muted">
                      Accuracy here matters — the inspection will cross-check the
                      odometer against the ECU.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Mileage (km)" htmlFor="w-km">
                      <Input
                        id="w-km"
                        inputMode="numeric"
                        value={s.mileageKm}
                        onChange={(e) => set("mileageKm", grouped(e.target.value))}
                        placeholder="48,000"
                        className="tnum"
                      />
                    </Field>
                    <Field label="Engine (cc)" htmlFor="w-cc">
                      <Input
                        id="w-cc"
                        inputMode="numeric"
                        value={s.engineCc}
                        onChange={(e) =>
                          set("engineCc", e.target.value.replace(/[^\d]/g, ""))
                        }
                        placeholder="1798"
                        className="tnum"
                      />
                    </Field>
                  </div>

                  <Field label="Transmission">
                    <Pills
                      values={TRANSMISSIONS}
                      selected={s.transmission}
                      onToggle={(v) => set("transmission", v)}
                    />
                  </Field>

                  <Field label="Fuel type">
                    <Pills
                      values={FUEL_TYPES}
                      selected={s.fuelType}
                      onToggle={(v) => set("fuelType", v)}
                    />
                  </Field>

                  <Field label="Body type">
                    <Pills
                      values={BODY_TYPES}
                      selected={s.bodyType}
                      onToggle={(v) => set("bodyType", v)}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Assembly">
                      <Select
                        value={s.assembly}
                        onChange={(v) => set("assembly", v)}
                        options={[
                          { value: "LOCAL", label: "Local assembled" },
                          { value: "IMPORTED", label: "Imported" },
                        ]}
                      />
                    </Field>
                    <Field label="Colour">
                      <Select
                        value={s.colour}
                        onChange={(v) => set("colour", v)}
                        options={COLOURS.map((c) => ({ value: c, label: c }))}
                      />
                    </Field>
                    <Field label="Previous owners">
                      <Input
                        inputMode="numeric"
                        value={s.ownersCount}
                        onChange={(e) =>
                          set("ownersCount", e.target.value.replace(/[^\d]/g, ""))
                        }
                        className="tnum"
                      />
                    </Field>
                  </div>

                  <Field label="Features">
                    <Pills
                      values={FEATURES.map((f) => ({ value: f, label: f }))}
                      selected={s.features}
                      multi
                      onToggle={(v) =>
                        set(
                          "features",
                          s.features.includes(v)
                            ? s.features.filter((x) => x !== v)
                            : [...s.features, v],
                        )
                      }
                    />
                  </Field>
                </div>
              )}

              {/* ---- 2 photos ---- */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-ivory">
                      Photos
                    </h2>
                    <p className="mt-2 text-[14px] text-muted">
                      Eight minimum. Listings with the full guided set get
                      roughly 40% more bids — natural light, no filters, and
                      shoot the flaws too.
                    </p>
                  </div>

                  <div className="rounded-lg border border-line bg-ink-2 p-4">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-2">
                      Guided angles
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {GUIDED_ANGLES.map((a, i) => (
                        <span
                          key={a}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px]",
                            i < s.photos.length
                              ? "border-brand-600 bg-brand-900/60 text-brand-300"
                              : "border-line text-muted-2",
                          )}
                        >
                          {i < s.photos.length && (
                            <Check className="size-3" aria-hidden />
                          )}
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => addPhotos(4)}
                    className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-line py-14 transition-colors hover:border-brand-700 hover:bg-surface-2/40"
                  >
                    <ImagePlus className="size-8 text-muted-2" aria-hidden />
                    <span className="text-[14px] font-medium text-ivory">
                      Drag photos here, or click to browse
                    </span>
                    <span className="text-[12.5px] text-muted-2">
                      JPG or PNG · up to 10 MB each · {s.photos.length}/30 added
                    </span>
                  </button>

                  {s.photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {s.photos.map((p, i) => (
                        <div
                          key={p}
                          className="group relative aspect-[4/3] overflow-hidden rounded-md border border-line bg-ink-2"
                        >
                          <span className="grid h-full place-items-center">
                            <Camera className="size-5 text-muted-2" aria-hidden />
                          </span>
                          {i === 0 && (
                            <span className="absolute left-1.5 top-1.5">
                              <Badge variant="solid" size="sm">
                                Cover
                              </Badge>
                            </span>
                          )}
                          <span className="absolute bottom-1.5 left-1.5 rounded bg-ink/80 px-1.5 py-0.5 text-[10px] text-muted">
                            {GUIDED_ANGLES[i % GUIDED_ANGLES.length]}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              set(
                                "photos",
                                s.photos.filter((x) => x !== p),
                              )
                            }
                            aria-label="Remove photo"
                            className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-ink/85 text-muted opacity-0 transition-opacity hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {s.photos.length > 0 && s.photos.length < 8 && (
                    <p className="flex items-center gap-2 text-[13px] text-gold-soft">
                      <AlertTriangle className="size-4" aria-hidden />
                      {8 - s.photos.length} more needed to continue
                    </p>
                  )}
                </div>
              )}

              {/* ---- 3 disclosure ---- */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-ivory">
                      Disclosure
                    </h2>
                    <p className="mt-2 text-[14px] text-muted">
                      Be straight here. Undisclosed damage that the inspection
                      finds voids the sale and costs you the listing.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        k: "hasAccidentHistory" as const,
                        t: "This car has been in an accident",
                        d: "Any impact requiring panel replacement or structural repair",
                      },
                      {
                        k: "hasFloodDamage" as const,
                        t: "This car has flood damage",
                        d: "Water ingress into the cabin or engine at any point",
                      },
                      {
                        k: "serviceHistoryAvailable" as const,
                        t: "Service history is available",
                        d: "Stamped book, workshop invoices or digital records",
                      },
                    ].map((row) => (
                      <div
                        key={row.k}
                        className="flex items-start justify-between gap-4 rounded-lg border border-line bg-ink-2 p-4"
                      >
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium text-ivory">
                            {row.t}
                          </p>
                          <p className="mt-1 text-[12.5px] text-muted">{row.d}</p>
                        </div>
                        <Switch
                          checked={s[row.k]}
                          onCheckedChange={(v) => set(row.k, v)}
                          aria-label={row.t}
                        />
                      </div>
                    ))}
                  </div>

                  {s.hasAccidentHistory && (
                    <Field
                      label="Describe the damage and the repair"
                      htmlFor="w-acc"
                      hint="What was hit, what was replaced, where it was repaired, and when."
                    >
                      <Textarea
                        id="w-acc"
                        value={s.accidentNotes}
                        onChange={(e) => set("accidentNotes", e.target.value)}
                        placeholder="Front left quarter panel and bumper replaced after a low-speed impact in 2022. Repaired at an authorised workshop; no structural members affected."
                        aria-invalid={
                          s.accidentNotes.length > 0 &&
                          s.accidentNotes.trim().length < 20
                        }
                      />
                    </Field>
                  )}

                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gold/35 bg-gold/8 p-4">
                    <Checkbox
                      checked={s.attestation}
                      onCheckedChange={(v) => set("attestation", v === true)}
                      className="mt-0.5"
                    />
                    <span className="text-[13px] leading-relaxed text-gold-soft">
                      I confirm this disclosure is accurate and complete to the
                      best of my knowledge. I understand that undisclosed
                      accident or flood damage discovered during inspection will
                      void the sale, forfeit my listing fee and may result in a
                      permanent ban.
                    </span>
                  </label>
                </div>
              )}

              {/* ---- 4 format ---- */}
              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-ivory">
                      How do you want to sell?
                    </h2>
                    <p className="mt-2 text-[14px] text-muted">
                      Auctions find the market price. Classifieds give you
                      control but take longer.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        v: "AUCTION" as const,
                        Icon: Gavel,
                        t: "Auction",
                        d: "Timed bidding with proxy bids, hidden reserve and soft close. Median sale in 7 days.",
                      },
                      {
                        v: "CLASSIFIED" as const,
                        Icon: Tag,
                        t: "Classified",
                        d: "Fixed asking price with offers. You accept, decline or counter.",
                      },
                    ].map(({ v, Icon, t, d }) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => set("type", v)}
                        aria-pressed={s.type === v}
                        className={cn(
                          "rounded-lg border p-5 text-left transition-all duration-200",
                          s.type === v
                            ? "border-brand-500 bg-brand-900/40 shadow-glow"
                            : "border-line bg-ink-2 hover:border-line-strong",
                        )}
                      >
                        <Icon
                          className={cn(
                            "size-5",
                            s.type === v ? "text-brand-400" : "text-muted-2",
                          )}
                          aria-hidden
                        />
                        <span className="mt-3 block text-[15px] font-semibold text-ivory">
                          {t}
                        </span>
                        <span className="mt-1.5 block text-[12.5px] leading-relaxed text-muted">
                          {d}
                        </span>
                      </button>
                    ))}
                  </div>

                  {s.type === "AUCTION" ? (
                    <>
                      <Field
                        label="Starting bid"
                        hint="Set it low. Lots that open cheap attract more bidders and usually close higher."
                      >
                        <CurrencyInput
                          value={s.startingPrice}
                          onChange={(e) =>
                            set("startingPrice", grouped(e.target.value))
                          }
                          placeholder="30,00,000"
                        />
                      </Field>

                      <Field
                        label="Reserve price (optional)"
                        hint="Hidden from bidders. If bidding ends below it, the top bidder gets 24 hours to make a best offer. Leave blank for a no-reserve lot."
                      >
                        <CurrencyInput
                          value={s.reservePrice}
                          onChange={(e) =>
                            set("reservePrice", grouped(e.target.value))
                          }
                          placeholder="No reserve"
                          aria-invalid={
                            s.reservePrice !== "" &&
                            digits(s.reservePrice) < digits(s.startingPrice)
                          }
                        />
                      </Field>

                      <Field label="Duration">
                        <div className="grid gap-2 sm:grid-cols-4">
                          {AUCTION_DURATIONS.map((d) => (
                            <button
                              key={d.days}
                              type="button"
                              onClick={() => set("durationDays", d.days)}
                              aria-pressed={s.durationDays === d.days}
                              className={cn(
                                "rounded-lg border p-3 text-left transition-colors",
                                s.durationDays === d.days
                                  ? "border-brand-500 bg-brand-900"
                                  : "border-line bg-ink-2 hover:border-line-strong",
                              )}
                            >
                              <span className="block text-[14px] font-semibold text-ivory">
                                {d.label}
                              </span>
                              <span className="mt-0.5 block text-[11.5px] text-muted-2">
                                {d.note}
                              </span>
                            </button>
                          ))}
                        </div>
                      </Field>
                    </>
                  ) : (
                    <>
                      <Field label="Asking price">
                        <CurrencyInput
                          value={s.askingPrice}
                          onChange={(e) =>
                            set("askingPrice", grouped(e.target.value))
                          }
                          placeholder="45,00,000"
                        />
                      </Field>
                      <div className="flex items-center justify-between rounded-lg border border-line bg-ink-2 p-4">
                        <div>
                          <p className="text-[14px] font-medium text-ivory">
                            Accept offers
                          </p>
                          <p className="mt-1 text-[12.5px] text-muted">
                            Buyers can offer below asking; you accept, decline or
                            counter within 48 hours.
                          </p>
                        </div>
                        <Switch
                          checked={s.isNegotiable}
                          onCheckedChange={(v) => set("isNegotiable", v)}
                          aria-label="Accept offers"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ---- 5 inspection ---- */}
              {step === 5 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-ivory">
                      Add an inspection?
                    </h2>
                    <p className="mt-2 text-[14px] text-muted">
                      Certified lots sell through about 20 percentage points more
                      often, and we waive the listing fee when you book one.
                    </p>
                  </div>

                  <div className="flex items-start justify-between gap-4 rounded-lg border border-brand-700 bg-brand-900/40 p-5">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-[15px] font-semibold text-ivory">
                        <ShieldCheck className="size-4 text-brand-400" aria-hidden />
                        Book a PakOption inspection
                      </p>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                        A technician attends, runs the checkpoints and the report
                        is attached to your listing automatically.
                      </p>
                    </div>
                    <Switch
                      checked={s.bookInspection}
                      onCheckedChange={(v) => set("bookInspection", v)}
                      aria-label="Book an inspection"
                    />
                  </div>

                  {s.bookInspection && (
                    <div className="space-y-3">
                      {INSPECTION_PACKAGES.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => set("inspectionPackage", p.id)}
                          aria-pressed={s.inspectionPackage === p.id}
                          className={cn(
                            "flex w-full items-center justify-between gap-4 rounded-lg border p-4 text-left transition-colors",
                            s.inspectionPackage === p.id
                              ? "border-brand-500 bg-brand-900/40"
                              : "border-line bg-ink-2 hover:border-line-strong",
                          )}
                        >
                          <span>
                            <span className="block text-[14.5px] font-semibold text-ivory">
                              {p.name}
                            </span>
                            <span className="mt-0.5 block text-[12.5px] text-muted">
                              {p.checkpoints} checkpoints · {p.duration}
                            </span>
                          </span>
                          <span className="font-mono text-[15px] font-semibold text-gold tnum">
                            {formatPKR(p.price)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {!s.bookInspection && (
                    <p className="flex items-start gap-2.5 rounded-lg border border-line bg-ink-2 p-4 text-[13px] leading-relaxed text-muted">
                      <Info className="mt-0.5 size-4 shrink-0 text-muted-2" aria-hidden />
                      <span>
                        Without an inspection your listing won&rsquo;t carry the
                        Certified badge and the {formatPKR(FEES.auctionListingFee)}{" "}
                        listing fee applies. You can add one later.
                      </span>
                    </p>
                  )}
                </div>
              )}

              {/* ---- 6 review ---- */}
              {step === 6 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-ivory">
                      Title &amp; description
                    </h2>
                    <p className="mt-2 text-[14px] text-muted">
                      Write it the way you&rsquo;d describe the car to a friend
                      who knows cars. Honesty about flaws builds more trust than
                      superlatives.
                    </p>
                  </div>

                  <Field label="Listing title" htmlFor="w-title">
                    <Input
                      id="w-title"
                      value={s.title}
                      onChange={(e) => set("title", e.target.value)}
                    />
                  </Field>

                  <Field
                    label="Description"
                    htmlFor="w-desc"
                    hint={`${s.description.trim().length} characters — 80 minimum. Phone numbers are removed automatically.`}
                  >
                    <Textarea
                      id="w-desc"
                      value={s.description}
                      onChange={(e) => set("description", e.target.value)}
                      placeholder="Owned for three years, second owner. Serviced every 10,000 km at the authorised dealer, book stamped. Tyres replaced last year. There's a small dent on the rear right door which I've photographed. Selling because I'm upgrading."
                      className="min-h-44"
                      aria-invalid={
                        s.description.length > 0 &&
                        s.description.trim().length < 80
                      }
                    />
                  </Field>

                  <div className="rounded-lg border border-line bg-ink-2 p-5">
                    <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-2">
                      What you&rsquo;ll pay
                    </h3>
                    <dl className="mt-4 space-y-2.5 text-[13.5px]">
                      <div className="flex justify-between">
                        <dt className="text-muted">Listing fee</dt>
                        <dd
                          className={cn(
                            "font-mono tnum",
                            listingFee === 0 ? "text-brand-400" : "text-ivory",
                          )}
                        >
                          {listingFee === 0 ? "Waived" : formatPKR(listingFee)}
                        </dd>
                      </div>
                      {s.bookInspection && (
                        <div className="flex justify-between">
                          <dt className="text-muted">Inspection</dt>
                          <dd className="font-mono text-ivory tnum">
                            {formatPKR(inspectionPrice)}
                          </dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-muted">
                          Success fee (on sale, capped)
                        </dt>
                        <dd className="font-mono text-ivory tnum">
                          1% · max {formatPKRShort(FEES.successFeeCap)}
                        </dd>
                      </div>
                      <div className="flex justify-between border-t border-line pt-2.5">
                        <dt className="font-medium text-ivory">Due today</dt>
                        <dd className="font-mono font-semibold text-gold tnum">
                          {formatPKR(listingFee + (s.bookInspection ? inspectionPrice : 0))}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* nav */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
            <Button
              variant="ghost"
              onClick={() => setStep((v) => Math.max(0, v - 1))}
              disabled={step === 0}
            >
              <ArrowLeft />
              Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => setStep((v) => v + 1)}
                disabled={!valid[step]}
              >
                Continue
                <ArrowRight />
              </Button>
            ) : (
              <Button
                variant="gold"
                onClick={submit}
                disabled={!valid[step]}
                loading={submitting}
              >
                Publish listing
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* summary rail */}
      <aside className="lg:sticky lg:top-24">
        <div className="edge-light rounded-xl border border-line bg-surface p-6">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-2">
            Your listing
          </h3>

          {s.make ? (
            <>
              <p className="mt-4 text-[15px] font-semibold leading-snug text-ivory">
                {s.title || `${s.year} ${s.make} ${s.model}`}
              </p>
              <dl className="mt-4 space-y-2.5 text-[13px]">
                {s.mileageKm && (
                  <div className="flex justify-between">
                    <dt className="text-muted">Mileage</dt>
                    <dd className="font-mono text-ivory tnum">
                      {s.mileageKm} km
                    </dd>
                  </div>
                )}
                {s.registrationCity && (
                  <div className="flex justify-between">
                    <dt className="text-muted">City</dt>
                    <dd className="text-ivory">{s.registrationCity}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted">Photos</dt>
                  <dd
                    className={cn(
                      "font-mono tnum",
                      s.photos.length >= 8 ? "text-brand-400" : "text-muted-2",
                    )}
                  >
                    {s.photos.length}/8
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Format</dt>
                  <dd className="text-ivory">
                    {s.type === "AUCTION"
                      ? `${s.durationDays}-day auction`
                      : "Classified"}
                  </dd>
                </div>
                {s.bookInspection && (
                  <div className="flex justify-between">
                    <dt className="text-muted">Inspection</dt>
                    <dd className="text-brand-400">
                      {s.inspectionPackage.toLowerCase()}
                    </dd>
                  </div>
                )}
              </dl>
            </>
          ) : (
            <p className="mt-4 text-[13.5px] leading-relaxed text-muted-2">
              Fill in the first step and a live summary of your listing will
              appear here.
            </p>
          )}

          <div className="mt-6 space-y-2 border-t border-line pt-5 text-[12px] leading-relaxed text-muted-2">
            <p className="flex gap-2">
              <Check className="mt-0.5 size-3.5 shrink-0 text-brand-500" aria-hidden />
              Progress saves automatically
            </p>
            <p className="flex gap-2">
              <Check className="mt-0.5 size-3.5 shrink-0 text-brand-500" aria-hidden />
              Reviewed before going live
            </p>
            <p className="flex gap-2">
              <Trash2 className="mt-0.5 size-3.5 shrink-0 text-muted-2" aria-hidden />
              Cancel any time before publishing
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
