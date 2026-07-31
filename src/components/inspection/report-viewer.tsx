"use client";

import * as React from "react";
import Image from "next/image";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Info,
  MapPin,
  User,
} from "lucide-react";
import { CategoryBar, ScoreRing } from "./score-ring";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/primitives";
import { formatDatePK, label } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Inspection, ItemSeverity } from "@/types";

const SEVERITY_STYLE: Record<
  ItemSeverity,
  { icon: typeof Info; className: string; badge: string }
> = {
  OK: {
    icon: CheckCircle2,
    className: "text-brand-400",
    badge: "border-brand-700 bg-brand-900/60 text-brand-300",
  },
  ADVISORY: {
    icon: Info,
    className: "text-muted",
    badge: "border-line-strong bg-ink-2 text-muted",
  },
  MINOR: {
    icon: AlertTriangle,
    className: "text-gold",
    badge: "border-gold/40 bg-gold/10 text-gold-soft",
  },
  MAJOR: {
    icon: AlertTriangle,
    className: "text-danger",
    badge: "border-danger/45 bg-danger/10 text-danger-soft",
  },
  CRITICAL: {
    icon: AlertOctagon,
    className: "text-danger",
    badge: "border-danger bg-danger/20 text-danger-soft",
  },
};

export function ReportViewer({
  inspection,
  compact = false,
}: {
  inspection: Inspection;
  compact?: boolean;
}) {
  const flagged = inspection.categories.flatMap((c) => c.items);
  const flaggedCount = flagged.length;

  return (
    <section aria-label="Inspection report" className="space-y-8">
      {/* ---------- Summary ---------- */}
      <div className="edge-light rounded-xl border border-line-strong bg-surface p-6 md:p-7">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">
                <ClipboardCheck aria-hidden />
                {label(inspection.packageId)} inspection
              </Badge>
              {(inspection.grade === "A" || inspection.grade === "B") && (
                <Badge variant="gold">PakOption Certified</Badge>
              )}
            </div>

            <h3 className="mt-3 font-mono text-[15px] text-muted">
              {inspection.reference}
            </h3>

            <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-ivory">
              {inspection.summary}
            </p>

            <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[12.5px] text-muted">
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-muted-2" aria-hidden />
                <dt className="sr-only">Location</dt>
                <dd>
                  {inspection.city}
                  {inspection.isDoorstep ? " · doorstep" : " · service centre"}
                </dd>
              </div>
              {inspection.inspectorName && (
                <div className="flex items-center gap-1.5">
                  <User className="size-3.5 text-muted-2" aria-hidden />
                  <dt className="sr-only">Inspector</dt>
                  <dd>{inspection.inspectorName}</dd>
                </div>
              )}
              {inspection.completedAt && (
                <div>
                  <dt className="sr-only">Completed</dt>
                  <dd>Completed {formatDatePK(inspection.completedAt)}</dd>
                </div>
              )}
            </dl>
          </div>

          <ScoreRing
            score={inspection.overallScore}
            grade={inspection.grade}
            size={148}
            className="mx-auto shrink-0 md:mx-0"
          />
        </div>

        {/* counters */}
        <div className="mt-7 grid grid-cols-3 divide-x divide-line rounded-lg border border-line bg-ink-2">
          {[
            [inspection.checkpointsTotal, "Checkpoints"],
            [inspection.checkpointsPassed, "Passed"],
            [flaggedCount, "Flagged"],
          ].map(([v, l]) => (
            <div key={l as string} className="px-3 py-4 text-center">
              <p className="font-mono text-xl font-semibold text-ivory tnum">
                {v}
              </p>
              <p className="mt-1 text-[10.5px] uppercase tracking-[0.12em] text-muted-2">
                {l}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Category scores ---------- */}
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-ivory">
          Category breakdown
        </h3>
        <p className="mt-1.5 text-[14px] text-muted">
          Nine categories, weighted by how much each one affects what the car is
          actually worth.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {inspection.categories.map((cat, i) => (
            <CategoryBar
              key={cat.id}
              name={cat.name}
              score={cat.score}
              itemsPassed={cat.itemsPassed}
              itemsTotal={cat.itemsTotal}
              delay={i * 0.05}
            />
          ))}
        </div>
      </div>

      {/* ---------- Flagged items ---------- */}
      {!compact && (
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-ivory">
            Findings
          </h3>
          <p className="mt-1.5 text-[14px] text-muted">
            Every flagged item carries at least one photograph. Use these to
            negotiate — that is what they are for.
          </p>

          {flaggedCount === 0 ? (
            <div className="mt-6 flex items-center gap-3 rounded-lg border border-brand-700 bg-brand-900/40 p-5">
              <CheckCircle2 className="size-5 shrink-0 text-brand-400" aria-hidden />
              <p className="text-[14px] text-ivory">
                No faults were flagged. All {inspection.checkpointsTotal}{" "}
                checkpoints passed.
              </p>
            </div>
          ) : (
            <Accordion
              type="multiple"
              className="mt-5 overflow-hidden rounded-lg border border-line bg-surface px-5"
            >
              {inspection.categories
                .filter((c) => c.items.length > 0)
                .map((cat) => (
                  <AccordionItem key={cat.id} value={cat.id}>
                    <AccordionTrigger>
                      <span className="flex flex-1 items-center justify-between gap-3 pr-3">
                        <span>{cat.name}</span>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                            cat.items.some(
                              (i) => i.severity === "MAJOR" || i.severity === "CRITICAL",
                            )
                              ? SEVERITY_STYLE.MAJOR.badge
                              : SEVERITY_STYLE.MINOR.badge,
                          )}
                        >
                          {cat.items.length} finding
                          {cat.items.length > 1 ? "s" : ""}
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-4">
                        {cat.items.map((item) => {
                          const s = SEVERITY_STYLE[item.severity];
                          const Icon = s.icon;
                          return (
                            <li
                              key={item.id}
                              className="flex gap-4 rounded-lg border border-line bg-ink-2 p-4"
                            >
                              <Icon
                                className={cn("mt-0.5 size-4 shrink-0", s.className)}
                                aria-hidden
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-[14px] font-medium text-ivory">
                                    {item.label}
                                  </p>
                                  <span
                                    className={cn(
                                      "rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide",
                                      s.badge,
                                    )}
                                  >
                                    {label(item.severity)}
                                  </span>
                                </div>
                                {item.note && (
                                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                                    {item.note}
                                  </p>
                                )}
                                {item.photoUrls?.length ? (
                                  <div className="mt-3 flex gap-2">
                                    {item.photoUrls.map((url, pi) => (
                                      <div
                                        key={pi}
                                        className="relative h-20 w-28 overflow-hidden rounded-md border border-line"
                                      >
                                        <Image
                                          src={url}
                                          alt={`Evidence photo for ${item.label}`}
                                          fill
                                          sizes="112px"
                                          className="object-cover"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          )}
        </div>
      )}

      <p className="rounded-lg border border-line bg-ink-2 p-4 text-[12px] leading-relaxed text-muted-2">
        <strong className="text-muted">Scope.</strong> This report records the
        vehicle&rsquo;s condition at the time and place of inspection. It is a
        visual and diagnostic assessment, not a warranty, guarantee or
        mechanical certification, and it does not cover faults that are not
        detectable without dismantling. Evidence photographs are retained for
        three years.
      </p>
    </section>
  );
}
