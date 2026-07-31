import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guides on buying, selling and inspecting cars in Pakistan — pricing, paperwork, imports and auction strategy.",
};

const POSTS = [
  {
    slug: "how-to-read-an-inspection-report",
    tag: "Buying",
    title: "How to read a 212-point inspection report without an engineering degree",
    excerpt:
      "Which categories actually predict cost, why an 'advisory' is not the same as a fault, and the three findings that should make you walk away.",
    readMins: 8,
    date: "24 July 2026",
  },
  {
    slug: "auction-sheet-grades-explained",
    tag: "Imports",
    title: "Japanese auction sheet grades, decoded for Pakistani buyers",
    excerpt:
      "What 4.5B actually means, how the interior and exterior letters differ from the overall number, and how often sheets are altered before they reach Karachi.",
    readMins: 11,
    date: "18 July 2026",
  },
  {
    slug: "proxy-bidding-strategy",
    tag: "Auctions",
    title: "Why bidding your true maximum early usually wins you the car for less",
    excerpt:
      "Proxy bidding is counter-intuitive: you pay one increment above the runner-up, not your own ceiling. Here's the arithmetic, with worked examples.",
    readMins: 6,
    date: "11 July 2026",
  },
  {
    slug: "transfer-paperwork-checklist",
    tag: "Paperwork",
    title: "The complete ownership transfer checklist, province by province",
    excerpt:
      "Every document, every fee, and the order to do them in — Punjab, Sindh, KPK and Islamabad, with the token tax traps that catch people out.",
    readMins: 14,
    date: "3 July 2026",
  },
  {
    slug: "what-a-car-is-really-worth",
    tag: "Pricing",
    title: "What your car is really worth, and why the classifieds price isn't it",
    excerpt:
      "Asking prices are aspirations. Sold prices are data. We looked at 8,900 completed sales to find where the gap is widest.",
    readMins: 9,
    date: "27 June 2026",
  },
  {
    slug: "spotting-a-repainted-panel",
    tag: "Buying",
    title: "Five ways to spot a repainted panel before the inspector arrives",
    excerpt:
      "Paint depth, overspray on rubber seals, panel gap variance, bolt-head witness marks and the torch test. None of it requires a tool.",
    readMins: 7,
    date: "19 June 2026",
  },
];

export default function BlogPage() {
  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Buying and selling cars in Pakistan, explained"
        description="Practical guides written from what we see in inspection reports and completed auctions — not press releases."
      />

      <div className="container-page py-14">
        <StaggerGroup className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {POSTS.map((post) => (
            <StaggerItem key={post.slug}>
              <article className="edge-light group flex h-full flex-col rounded-lg border border-line bg-surface p-6 transition-colors hover:border-line-strong">
                <div className="flex items-center gap-3">
                  <Badge variant="brand" size="sm">
                    {post.tag}
                  </Badge>
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-2">
                    <Clock className="size-3.5" aria-hidden />
                    {post.readMins} min read
                  </span>
                </div>

                <h2 className="mt-4 text-[16.5px] font-semibold leading-snug tracking-tight text-ivory">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="transition-colors group-hover:text-brand-300"
                  >
                    {post.title}
                  </Link>
                </h2>

                <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-muted">
                  {post.excerpt}
                </p>

                <p className="mt-5 flex items-center justify-between border-t border-line pt-4 text-[12.5px] text-muted-2">
                  <span>{post.date}</span>
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </p>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <p className="mt-12 rounded-lg border border-dashed border-line bg-ink-2 p-5 text-center text-[13px] text-muted-2">
          Article pages are not yet implemented — the blog index is wired up and
          ready for MDX. See <span className="font-mono">todo.md</span> M1.
        </p>
      </div>
    </>
  );
}
