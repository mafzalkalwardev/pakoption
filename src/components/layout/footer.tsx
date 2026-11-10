import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { FOOTER_SECTIONS, INSPECTION_CITIES, SITE } from "@/lib/constants";
import { PUBLISHER } from "@/lib/seo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-line bg-ink-2">
      <div className="bg-grid bg-grid-fade pointer-events-none absolute inset-0 opacity-60" />

      <div className="container-page relative py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          {/* brand column */}
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {SITE.description}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Made by{" "}
              <a
                href={PUBLISHER.url}
                className="text-ivory underline underline-offset-2 hover:text-brand-300"
              >
                {PUBLISHER.name}
              </a>
              .
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              Inspection booking lists {INSPECTION_CITIES.join(", ")}.
            </p>
          </div>

          {/* link columns */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ivory">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-ivory"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* cities */}
        <div className="mt-12 border-t border-line pt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            Inspection coverage
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {INSPECTION_CITIES.map((city) => (
              <Link
                key={city}
                href={`/auctions?city=${encodeURIComponent(city)}`}
                className="rounded-full border border-line bg-surface px-3 py-1 text-[12.5px] text-muted transition-colors hover:border-brand-700 hover:text-ivory"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>

        {/* legal */}
        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-8 text-[12.5px] text-muted-2 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {SITE.name}. Made by {PUBLISHER.name}.
          </p>
          <p className="max-w-2xl leading-relaxed">
            Inspection reports describe the vehicle&rsquo;s condition at a point
            in time and are not a warranty or guarantee. Bids are binding.
            Read the{" "}
            <Link
              href="/legal/auction-rules"
              className="text-muted underline underline-offset-2 hover:text-ivory"
            >
              auction rules
            </Link>{" "}
            before bidding.
          </p>
        </div>
      </div>
    </footer>
  );
}
