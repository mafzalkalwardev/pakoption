import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border-b border-line bg-ink-2/50",
        className,
      )}
    >
      <div
        className="bg-grid bg-grid-fade pointer-events-none absolute inset-0"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-brand-500/10 blur-[110px]"
        aria-hidden
      />
      <div className="container-page relative py-12 md:py-16">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            {eyebrow && (
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-400">
                {eyebrow}
              </p>
            )}
            <h1 className="text-balance text-[clamp(1.875rem,4vw,3rem)] font-bold leading-[1.1] tracking-[-0.035em] text-ivory">
              {title}
            </h1>
            {description && (
              <p className="mt-4 text-pretty text-[15px] leading-relaxed text-muted md:text-base">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: { href?: string; label: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-muted-2">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="size-3.5" aria-hidden />}
            {item.href ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-ivory"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-muted" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
