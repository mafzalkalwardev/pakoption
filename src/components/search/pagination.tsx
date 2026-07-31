import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { withParam, type SearchParams } from "@/lib/query";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  searchParams,
  basePath,
}: {
  page: number;
  totalPages: number;
  searchParams: SearchParams;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  const href = (p: number) => `${basePath}${withParam(searchParams, "page", String(p))}`;

  return (
    <nav
      className="mt-12 flex items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      <Link
        href={href(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn(
          "grid size-9 place-items-center rounded-md border border-line text-muted transition-colors hover:border-line-strong hover:text-ivory",
          page === 1 && "pointer-events-none opacity-40",
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </Link>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-2 text-muted-2">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "grid size-9 place-items-center rounded-md border font-mono text-[13px] transition-colors tnum",
              p === page
                ? "border-brand-500 bg-brand-900 text-brand-300"
                : "border-line text-muted hover:border-line-strong hover:text-ivory",
            )}
          >
            {p}
          </Link>
        ),
      )}

      <Link
        href={href(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={cn(
          "grid size-9 place-items-center rounded-md border border-line text-muted transition-colors hover:border-line-strong hover:text-ivory",
          page === totalPages && "pointer-events-none opacity-40",
        )}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}
