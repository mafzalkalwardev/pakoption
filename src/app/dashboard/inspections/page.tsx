import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Plus, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/inspection/score-ring";
import { getSampleInspection } from "@/lib/db/repository";
import { formatDatePK, formatPKR, label } from "@/lib/format";

export const metadata: Metadata = { title: "My inspections" };
export const dynamic = "force-dynamic";

export default async function InspectionsPage() {
  const inspection = await getSampleInspection();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ivory">
            My inspections
          </h1>
          <p className="mt-1.5 text-[14px] text-muted">
            Every report has a public link you can share with a seller or a
            buyer, no login required.
          </p>
        </div>
        <Button asChild>
          <Link href="/inspection/book">
            <Plus />
            Book an inspection
          </Link>
        </Button>
      </div>

      {inspection ? (
        <div className="mt-6 space-y-4">
          <article className="edge-light rounded-lg border border-line bg-surface p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <ScoreRing
                score={inspection.overallScore}
                grade={inspection.grade}
                size={104}
                showLabel={false}
                className="shrink-0"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="brand" size="sm">Completed</Badge>
                  <Badge variant="gold" size="sm">
                    Grade {inspection.grade}
                  </Badge>
                </div>
                <p className="mt-2 font-mono text-[14px] text-ivory">
                  {inspection.reference}
                </p>
                <p className="mt-1.5 text-[13px] text-muted">
                  {label(inspection.packageId)} ·{" "}
                  <span className="tnum">{inspection.checkpointsTotal}</span>{" "}
                  checkpoints · {inspection.city}
                  {inspection.isDoorstep ? " (doorstep)" : ""}
                </p>
                {inspection.completedAt && (
                  <p className="mt-1 text-[12.5px] text-muted-2">
                    Completed {formatDatePK(inspection.completedAt)} ·{" "}
                    {formatPKR(inspection.price)}
                  </p>
                )}
              </div>

              <Button variant="outline" size="sm" asChild className="shrink-0">
                <Link href={`/inspection/report/${inspection.publicToken}`}>
                  View report
                  <ExternalLink />
                </Link>
              </Button>
            </div>
          </article>
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-line bg-ink-2 p-14 text-center">
          <ShieldCheck className="mx-auto size-8 text-muted-2" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold text-ivory">
            No inspections yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-muted">
            Book one before you buy — privately or on-platform, it doesn&rsquo;t
            matter.
          </p>
          <Button className="mt-5" asChild>
            <Link href="/inspection/book">Book an inspection</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
