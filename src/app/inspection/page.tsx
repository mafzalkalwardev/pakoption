import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Check,
  Clock,
  FileSearch,
  Home,
  MapPin,
  ShieldCheck,
  Star,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { ReportViewer } from "@/components/inspection/report-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/primitives";
import { getSampleInspection } from "@/lib/db/repository";
import {
  INSPECTION_CATEGORIES,
  INSPECTION_CITIES,
  INSPECTION_PACKAGES,
} from "@/lib/constants";
import { formatPKR } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Car inspection service",
  description:
    "212-point third-party car inspection in seven Pakistani cities. Doorstep or centre, digital report in 45–60 minutes, photographic evidence on every fault.",
};

const FAQS = [
  {
    q: "How long does the inspection take?",
    a: "Basic takes about 30 minutes, Standard about an hour, Comprehensive about 90 minutes because of the road test and paint-depth mapping. The digital report is delivered within an hour of the technician finishing.",
  },
  {
    q: "Can you inspect a car I'm buying somewhere else?",
    a: "Yes. Most of our inspection customers are buying privately or from another platform. Book a doorstep inspection at the seller's location — you don't need a PakOption listing.",
  },
  {
    q: "What happens if you miss a fault?",
    a: "The report records what was detectable by visual and diagnostic assessment at that time and place. It is not a warranty and does not cover faults that require dismantling to find. That scope is stated on every report. If you believe we missed something that was reasonably detectable, raise a dispute within 14 days and we will review the technician's evidence photographs.",
  },
  {
    q: "Do I get the Certified badge automatically?",
    a: "The PakOption Certified badge applies to Standard and Comprehensive reports that come back at grade B or above, and it expires 30 days after the inspection date. A grade C or D car still gets a full report — it just doesn't get a badge, which is the point.",
  },
  {
    q: "Can the seller see the report before I do?",
    a: "Whoever books and pays for the inspection receives the report. If a seller books it for a listing, the report is public on that listing. If you book it privately, only you get the shareable link.",
  },
  {
    q: "What if the car fails badly?",
    a: "You still get the full report — that is the outcome you paid for. A report that saves you from a PKR 4,00,000 gearbox is worth considerably more than the PKR 6,500 it cost.",
  },
];

export default async function InspectionPage() {
  const sample = await getSampleInspection();
  const totalCheckpoints = INSPECTION_CATEGORIES.reduce(
    (s, c) => s + c.items,
    0,
  );

  return (
    <>
      <PageHeader
        eyebrow="Inspection"
        title="Know exactly what you're buying"
        description={`A ${totalCheckpoints}-point independent inspection across nine categories, with a photograph attached to every fault we find. Doorstep or service centre, in seven cities.`}
        actions={
          <Button size="lg" asChild>
            <Link href="/inspection/book">
              Book an inspection
              <ArrowRight />
            </Link>
          </Button>
        }
      />

      {/* ---------------- Packages ---------------- */}
      <section className="container-page py-16 md:py-20" id="packages">
        <Reveal className="max-w-2xl">
          <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.03em] text-ivory">
            Three levels of thorough
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Standard is the one most people want — it&rsquo;s the full 200+
            point report and the one that earns the Certified badge.
          </p>
        </Reveal>

        <StaggerGroup className="mt-10 grid gap-5 lg:grid-cols-3">
          {INSPECTION_PACKAGES.map((pkg) => (
            <StaggerItem key={pkg.id}>
              <div
                className={cn(
                  "edge-light relative flex h-full flex-col rounded-xl border bg-surface p-7",
                  pkg.popular
                    ? "border-brand-600 shadow-glow"
                    : "border-line shadow-card",
                )}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-7">
                    <Badge variant="solid" size="lg">
                      <Star aria-hidden />
                      Most booked
                    </Badge>
                  </span>
                )}

                <h3 className="text-lg font-semibold tracking-tight text-ivory">
                  {pkg.name}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                  {pkg.blurb}
                </p>

                <p className="mt-5 flex items-baseline gap-2">
                  <span
                    data-price
                    className="font-mono text-3xl font-semibold tracking-tight text-gold tnum"
                  >
                    {formatPKR(pkg.price)}
                  </span>
                </p>

                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-muted-2">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5" aria-hidden />
                    {pkg.duration}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Wrench className="size-3.5" aria-hidden />
                    <span className="tnum">{pkg.checkpoints}</span> checkpoints
                  </span>
                </p>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13.5px]">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-brand-500"
                        aria-hidden
                      />
                      <span className="text-muted">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={pkg.popular ? "primary" : "outline"}
                  className="mt-7 w-full"
                  asChild
                >
                  <Link href={`/inspection/book?package=${pkg.id}`}>
                    Book {pkg.name}
                  </Link>
                </Button>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* ---------------- What we check ---------------- */}
      <section className="border-y border-line bg-ink-2/50">
        <div className="container-page py-16 md:py-20">
          <Reveal className="max-w-2xl">
            <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.03em] text-ivory">
              What we actually check
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Nine categories, weighted by how much each one moves the real
              value of the car. Engine and body structure carry the most weight
              because they carry the most cost.
            </p>
          </Reveal>

          <StaggerGroup className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {INSPECTION_CATEGORIES.map((cat) => (
              <StaggerItem key={cat.slug}>
                <div className="edge-light h-full rounded-lg border border-line bg-surface p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-[15px] font-semibold text-ivory">
                      {cat.name}
                    </h3>
                    <span className="shrink-0 rounded-full border border-line bg-ink-2 px-2 py-0.5 font-mono text-[11.5px] text-muted tnum">
                      {cat.items} pts
                    </span>
                  </div>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-muted">
                    {cat.detail}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-ink-2">
                      <div
                        className="h-full rounded-full bg-brand-600"
                        style={{ width: `${cat.weight * 500}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-muted-2 tnum">
                      {Math.round(cat.weight * 100)}% weight
                    </span>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ---------------- Coverage ---------------- */}
      <section className="container-page py-16 md:py-20" id="coverage">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.03em] text-ivory">
              We come to you
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Doorstep inspection at the seller&rsquo;s location, your home or
              your office — or bring the car to one of our service centres for a
              slightly faster turnaround and paint-depth mapping.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-line bg-surface p-5">
                <Home className="size-5 text-brand-400" aria-hidden />
                <h3 className="mt-3 text-[15px] font-semibold text-ivory">
                  Doorstep
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                  Technician travels to any address within the city. Same-day
                  slots available in Karachi, Lahore and Islamabad.
                </p>
              </div>
              <div className="rounded-lg border border-line bg-surface p-5">
                <MapPin className="size-5 text-brand-400" aria-hidden />
                <h3 className="mt-3 text-[15px] font-semibold text-ivory">
                  Service centre
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                  Lift access means underbody inspection and paint-depth mapping
                  are far more thorough. Walk-ins accepted.
                </p>
              </div>
            </div>

            <div className="mt-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                Cities covered
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {INSPECTION_CITIES.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[13px] text-ivory"
                  >
                    <span className="size-1.5 rounded-full bg-brand-500" aria-hidden />
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal direction="left">
            <div className="edge-light rounded-xl border border-line-strong bg-surface p-7">
              <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ivory">
                <Camera className="size-4 text-brand-400" aria-hidden />
                How a booking runs
              </h3>
              <ol className="mt-5 space-y-5">
                {[
                  ["Book", "Pick a package, city, date and address. Two minutes."],
                  [
                    "Confirm",
                    "We assign a technician and send you their name and arrival window.",
                  ],
                  [
                    "Inspect",
                    "30 to 90 minutes on site, photographing every finding as they go.",
                  ],
                  [
                    "Report",
                    "Digital report in your inbox within an hour, with a shareable public link.",
                  ],
                ].map(([title, body], i) => (
                  <li key={title} className="flex gap-4">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full border border-brand-700 bg-brand-900 font-mono text-[13px] font-semibold text-brand-300">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-[14px] font-medium text-ivory">{title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted">
                        {body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <Button className="mt-7 w-full" asChild>
                <Link href="/inspection/book">
                  <ShieldCheck />
                  Book now
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Sample report ---------------- */}
      {sample && (
        <section className="border-y border-line bg-ink-2/50" id="sample">
          <div className="container-page py-16 md:py-20">
            <Reveal className="max-w-2xl">
              <Badge variant="brand">
                <FileSearch aria-hidden />
                Sample report
              </Badge>
              <h2 className="mt-4 text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.03em] text-ivory">
                This is what you get
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                A real report from a completed inspection. Every finding is
                scored, categorised and photographed — nothing is summarised
                away.
              </p>
            </Reveal>

            <div className="mt-10">
              <ReportViewer inspection={sample} />
            </div>
          </div>
        </section>
      )}

      {/* ---------------- FAQ ---------------- */}
      <section className="container-page py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.03em] text-ivory">
              Questions people actually ask
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              If yours isn&rsquo;t here, message us — we&rsquo;ll add it.
            </p>
          </Reveal>

          <Reveal direction="left">
            <Accordion
              type="single"
              collapsible
              className="rounded-xl border border-line bg-surface px-6"
            >
              {FAQS.map((f, i) => (
                <AccordionItem key={f.q} value={`faq-${i}`}>
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
