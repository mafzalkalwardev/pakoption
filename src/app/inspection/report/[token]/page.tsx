import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Printer } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ReportViewer } from "@/components/inspection/report-viewer";
import { Button } from "@/components/ui/button";
import { getInspectionByToken } from "@/lib/db/repository";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const inspection = await getInspectionByToken(token);
  if (!inspection) return { title: "Report not found" };

  return {
    title: `Inspection report ${inspection.reference}`,
    description: inspection.summary.slice(0, 155),
    robots: { index: false, follow: false },
  };
}

export default async function PublicReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const inspection = await getInspectionByToken(token);
  if (!inspection) notFound();

  return (
    <div className="container-page max-w-4xl py-10 md:py-14">
      {/* header — this page is shared off-platform, so it re-establishes context */}
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-8">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer />
            Print
          </Button>
          <Button size="sm" asChild>
            <Link href="/inspection/book">
              Book your own
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </header>

      <h1 className="sr-only">
        PakOption inspection report {inspection.reference}
      </h1>

      <ReportViewer inspection={inspection} />

      <footer className="mt-14 rounded-xl border border-line bg-ink-2 p-6 text-center">
        <p className="text-[14px] text-ivory">
          This report was produced by PakOption.
        </p>
        <p className="mx-auto mt-2 max-w-lg text-[13px] leading-relaxed text-muted">
          Buying a car privately? Book an independent{" "}
          <span className="tnum">{inspection.checkpointsTotal}</span>-point
          inspection at the seller&rsquo;s address and get a report like this one
          in about an hour.
        </p>
        <Button className="mt-5" asChild>
          <Link href="/inspection">See inspection packages</Link>
        </Button>
      </footer>
    </div>
  );
}
