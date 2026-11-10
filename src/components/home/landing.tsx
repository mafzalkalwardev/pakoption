import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  Gavel,
  Scale,
  ShieldCheck,
} from "lucide-react";
import {
  AUCTION_DURATIONS,
  FEES,
  INSPECTION_CATEGORIES,
  INSPECTION_CITIES,
  INSPECTION_PACKAGES,
  LISTING_WIZARD_STEPS,
} from "@/lib/constants";
import {
  BUYERS_PREMIUM_MAX,
  BUYERS_PREMIUM_MIN,
  BUYERS_PREMIUM_RATE,
  INCREMENT_TABLE,
  SOFT_CLOSE_WINDOW_MS,
} from "@/lib/auction/engine";
import { formatPKR } from "@/lib/format";
import { getBuyHowTo, getDefinition, getFaqs } from "@/lib/seo";
import { cn } from "@/lib/utils";

const primaryLink =
  "inline-flex h-12 items-center justify-center gap-2 rounded-md bg-gradient-to-b from-brand-500 to-brand-600 px-5 text-[15px] font-semibold text-ink shadow-[0_1px_0_0_rgba(255,255,255,0.18)_inset] transition-colors hover:from-brand-400 hover:to-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink";

const secondaryLink =
  "inline-flex h-12 items-center justify-center gap-2 rounded-md border border-line-strong bg-transparent px-5 text-[15px] font-semibold text-ivory transition-colors hover:border-brand-700 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink";

const textLink =
  "text-brand-300 underline decoration-brand-700 underline-offset-4 hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-sm";

const SHOTS = [
  {
    src: "/media/auctions.webp",
    width: 1440,
    height: 900,
    alt: "PakOption auctions page with the filter rail, live and upcoming tabs, and listing cards that show a countdown and current bid.",
    caption: "Auctions board: filters, status tabs, and lot cards.",
  },
  {
    src: "/media/lot.webp",
    width: 1440,
    height: 900,
    alt: "PakOption auction lot page with the photo gallery, specification table, bid history, and the bid panel.",
    caption: "Lot page: gallery, specs, bid history, and the bid panel.",
  },
  {
    src: "/media/report.webp",
    width: 1440,
    height: 900,
    alt: "PakOption inspection report viewer with an overall score, letter grade, and per-category results.",
    caption: "Inspection report viewer used on the inspection page.",
  },
  {
    src: "/media/sell.webp",
    width: 1440,
    height: 900,
    alt: "PakOption sell wizard on the vehicle step, with make, model, and registration fields.",
    caption: "Sell wizard, first step of seven.",
  },
  {
    src: "/media/classifieds.webp",
    width: 1440,
    height: 900,
    alt: "PakOption classifieds page listing fixed-price cars with filters.",
    caption: "Classifieds board at /buy.",
  },
  {
    src: "/media/compare.webp",
    width: 1440,
    height: 900,
    alt: "PakOption compare page with cars side by side on specification, price, and inspection score.",
    caption: "Compare view, up to four cars.",
  },
] as const;

function incrementRows() {
  return INCREMENT_TABLE.map((tier, index) => {
    const previous = index === 0 ? 0 : INCREMENT_TABLE[index - 1]!.upTo;
    const label =
      tier.upTo === Number.POSITIVE_INFINITY
        ? `${formatPKR(previous)} and above`
        : index === 0
          ? `Under ${formatPKR(tier.upTo)}`
          : `${formatPKR(previous)} up to under ${formatPKR(tier.upTo)}`;
    return { label, increment: formatPKR(tier.increment) };
  });
}

export function LandingPage() {
  const definition = getDefinition();
  const howTo = getBuyHowTo();
  const faqs = getFaqs();
  const softCloseMinutes = SOFT_CLOSE_WINDOW_MS / 60000;

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="bg-grid bg-grid-fade pointer-events-none absolute inset-0"
          aria-hidden
        />
        <div className="container-page relative py-16 md:py-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-300">
            Car auctions and classifieds · Pakistan
          </p>
          <h1 className="mt-4 max-w-4xl text-balance text-[clamp(2.25rem,6vw,4.25rem)] font-bold leading-[1.05] tracking-[-0.04em] text-ivory">
            Inspection-backed car auctions for Pakistan
          </h1>
          <p className="mt-6 max-w-3xl text-pretty text-lg leading-relaxed text-muted">
            <strong className="font-semibold text-ivory">What is PakOption?</strong>{" "}
            {definition}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/auctions" prefetch={false} className={primaryLink}>
              <Gavel className="size-4" aria-hidden />
              Browse auctions
            </Link>
            <Link href="/sell/new" prefetch={false} className={secondaryLink}>
              List a car
            </Link>
            <Link
              href="/inspection/book"
              prefetch={false}
              className={secondaryLink}
            >
              <ShieldCheck className="size-4" aria-hidden />
              Book an inspection
            </Link>
          </div>
          <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            <Link href="/how-it-works" prefetch={false} className={textLink}>
              How the auction engine works
            </Link>
            <Link href="/pricing" prefetch={false} className={textLink}>
              Fees configured in the app
            </Link>
            <Link href="/buy" prefetch={false} className={textLink}>
              Classifieds
            </Link>
            <a href="#faq" className={textLink}>
              Questions
            </a>
          </p>
          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted">
            Made by{" "}
            <a
              href="https://induswebagency.com"
              className={textLink}
              rel="author"
            >
              INDUS Web Agency
            </a>
            . Until a database adapter is connected, the auction and classifieds
            pages render a built-in demo dataset so the interface can be
            reviewed. Those cars are not a live inventory.
          </p>
        </div>
      </section>

      <section
        className="container-page py-16 md:py-20"
        aria-labelledby="how-heading"
      >
        <h2
          id="how-heading"
          className="max-w-3xl text-balance text-[clamp(1.75rem,3vw,2.4rem)] font-bold tracking-[-0.03em] text-ivory"
        >
          How inspection-backed auctions work
        </h2>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-muted md:text-base">
          The auction rules live in{" "}
          <code className="font-mono text-[13px] text-ivory">
            src/lib/auction/engine.ts
          </code>
          . The same functions run on the server and inside the bid panel, so
          the preview matches the result the API returns.
        </p>
        <ol className="mt-10 grid gap-4 md:grid-cols-2">
          {howTo.steps.map((step, index) => (
            <li
              key={step.name}
              className="edge-light rounded-lg border border-line bg-surface p-6"
            >
              <p className="font-mono text-[12px] text-brand-300">
                Step {index + 1}
              </p>
              <h3 className="mt-2 text-[17px] font-semibold text-ivory">
                {step.name}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="border-y border-line bg-ink-2/50"
        aria-labelledby="shots-heading"
      >
        <div className="container-page py-16 md:py-20">
          <h2
            id="shots-heading"
            className="text-balance text-[clamp(1.75rem,3vw,2.4rem)] font-bold tracking-[-0.03em] text-ivory"
          >
            The interface
          </h2>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-muted md:text-base">
            Screenshots of the running app. Cards, prices, and scores in these
            pictures come from the demo dataset, not from completed sales.
          </p>
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {SHOTS.map((shot) => (
              <figure
                key={shot.src}
                className="overflow-hidden rounded-xl border border-line bg-surface"
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={shot.width}
                  height={shot.height}
                  loading="lazy"
                  sizes="(min-width: 1024px) 640px, 100vw"
                  className="h-auto w-full bg-ink"
                />
                <figcaption className="px-4 py-3 text-[13px] leading-relaxed text-muted">
                  {shot.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section
        className="container-page py-16 md:py-20"
        aria-labelledby="audiences-heading"
      >
        <h2
          id="audiences-heading"
          className="text-balance text-[clamp(1.75rem,3vw,2.4rem)] font-bold tracking-[-0.03em] text-ivory"
        >
          What buyers and sellers can do
        </h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <article className="edge-light rounded-xl border border-line bg-surface p-7">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full border border-brand-700 bg-brand-900 text-brand-300">
                <Scale className="size-5" aria-hidden />
              </span>
              <h3 className="text-xl font-semibold text-ivory">For buyers</h3>
            </div>
            <ul className="mt-5 space-y-3 text-[14.5px] leading-relaxed text-muted">
              <li>
                Filter auctions by make, model, city, body type, fuel,
                transmission, year, mileage, price, certified status, and
                no-reserve lots.
              </li>
              <li>
                Open a lot for the gallery, specification table, countdown,
                public bid history, and inspection report.
              </li>
              <li>
                Enter a maximum in the bid panel. It previews the increment,
                proxy result, and buyer&rsquo;s premium before confirm.
              </li>
              <li>
                Browse fixed-price classifieds and send an offer from the
                listing.
              </li>
              <li>Compare up to four cars on specification, price, and inspection score.</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <Link href="/auctions" prefetch={false} className={textLink}>
                Auctions
              </Link>
              <Link href="/buy" prefetch={false} className={textLink}>
                Classifieds
              </Link>
              <Link href="/compare" prefetch={false} className={textLink}>
                Compare
              </Link>
            </div>
          </article>

          <article className="edge-light rounded-xl border border-line bg-surface p-7">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full border border-brand-700 bg-brand-900 text-brand-300">
                <ClipboardCheck className="size-5" aria-hidden />
              </span>
              <h3 className="text-xl font-semibold text-ivory">For sellers</h3>
            </div>
            <ul className="mt-5 space-y-3 text-[14.5px] leading-relaxed text-muted">
              <li>
                The wizard steps are {LISTING_WIZARD_STEPS.join(", ")}.
              </li>
              <li>
                Choose a classified or an auction. Auction length can be{" "}
                {AUCTION_DURATIONS.map((d) => `${d.days} days`).join(", ")}.
              </li>
              <li>
                A reserve is optional and hidden. Bidders only see whether it
                is met.
              </li>
              <li>
                The photo step needs at least 8 images to continue. They stay
                in the browser; file storage is not connected.
              </li>
              <li>
                Booking an inspection on the inspection step sets the{" "}
                {formatPKR(FEES.auctionListingFee)} auction listing fee to zero
                on review.
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <Link href="/sell" prefetch={false} className={textLink}>
                Sell overview
              </Link>
              <Link href="/sell/new" prefetch={false} className={textLink}>
                Start the wizard
              </Link>
              <Link href="/pricing" prefetch={false} className={textLink}>
                Fee table
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section
        className="border-y border-line bg-ink-2/50"
        aria-labelledby="rules-heading"
      >
        <div className="container-page py-16 md:py-20">
          <h2
            id="rules-heading"
            className="text-balance text-[clamp(1.75rem,3vw,2.4rem)] font-bold tracking-[-0.03em] text-ivory"
          >
            Rules the software enforces
          </h2>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-muted md:text-base">
            These figures are the constants in the auction engine and the fee
            configuration, not observed market results.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-line">
              <table className="w-full text-left text-sm">
                <caption className="bg-surface px-5 py-4 text-left text-[15px] font-semibold text-ivory">
                  Bid increments
                </caption>
                <thead className="bg-ink">
                  <tr className="text-[11px] uppercase tracking-[0.12em] text-muted">
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Current price
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Increment
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-surface">
                  {incrementRows().map((row) => (
                    <tr key={row.label}>
                      <td className="px-5 py-3 text-muted">{row.label}</td>
                      <td className="px-5 py-3 font-mono text-ivory">
                        {row.increment}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-line bg-surface p-6">
              <h3 className="text-[15px] font-semibold text-ivory">
                Premium, reserve, soft close
              </h3>
              <ul className="mt-4 space-y-3 text-[14px] leading-relaxed text-muted">
                <li>
                  Buyer&rsquo;s premium is {BUYERS_PREMIUM_RATE * 100}% of the
                  hammer, at least {formatPKR(BUYERS_PREMIUM_MIN)} and at most{" "}
                  {formatPKR(BUYERS_PREMIUM_MAX)}.
                </li>
                <li>
                  Soft close window: {softCloseMinutes} minutes, reset from the
                  bid, with no extension cap.
                </li>
                <li>
                  Success fee: {FEES.successFeeRate * 100}%, capped at{" "}
                  {formatPKR(FEES.successFeeCap)}.
                </li>
                <li>
                  Featured placement:{" "}
                  {FEES.featuredPrices
                    .map((f) => `${formatPKR(f.price)} for ${f.days} days`)
                    .join(", ")}
                  .
                </li>
              </ul>
            </div>
          </div>

          <h3 className="mt-12 text-xl font-semibold text-ivory">
            Inspection packages
          </h3>
          <p className="mt-3 max-w-3xl text-[14.5px] leading-relaxed text-muted">
            Nine categories:{" "}
            {INSPECTION_CATEGORIES.map((c) => c.name).join(", ")}. Booking
            cities in the form: {INSPECTION_CITIES.join(", ")}.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {INSPECTION_PACKAGES.map((pack) => (
              <article
                key={pack.id}
                className={cn(
                  "rounded-xl border bg-surface p-5",
                  pack.popular ? "border-brand-700" : "border-line",
                )}
              >
                <h4 className="text-[16px] font-semibold text-ivory">
                  {pack.name}
                </h4>
                <p className="mt-2 font-mono text-lg text-gold">
                  {formatPKR(pack.price)}
                </p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                  {pack.checkpoints} checkpoints · {pack.duration}. {pack.blurb}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted">
            <Link href="/inspection" prefetch={false} className={textLink}>
              Inspection service
            </Link>
            <span aria-hidden> · </span>
            <Link href="/inspection/book" prefetch={false} className={textLink}>
              Booking flow
            </Link>
          </p>
        </div>
      </section>

      <section
        id="faq"
        className="container-page scroll-mt-24 py-16 md:py-20"
        aria-labelledby="faq-heading"
      >
        <h2
          id="faq-heading"
          className="text-balance text-[clamp(1.75rem,3vw,2.4rem)] font-bold tracking-[-0.03em] text-ivory"
        >
          Questions
        </h2>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-muted">
          Answers below are the same sentences published in the FAQPage
          structured data.
        </p>
        <div className="mt-8 divide-y divide-line rounded-xl border border-line bg-surface">
          {faqs.map((item) => (
            <article key={item.question} className="px-5 py-5 md:px-7">
              <h3 className="text-[16px] font-semibold text-ivory">
                {item.question}
              </h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page pb-8" aria-labelledby="next-heading">
        <div className="rounded-2xl border border-line-strong bg-surface px-7 py-12 md:px-12">
          <h2
            id="next-heading"
            className="text-balance text-[clamp(1.75rem,3vw,2.5rem)] font-bold tracking-[-0.03em] text-ivory"
          >
            Open the app
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
            The auction board, the sell wizard, and inspection booking are the
            next pages. Nothing on this page is a testimonial or a traffic
            count.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/auctions" prefetch={false} className={primaryLink}>
              Browse auctions
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link href="/sell/new" prefetch={false} className={secondaryLink}>
              List a car
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
