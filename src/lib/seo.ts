import type { Metadata } from "next";
import {
  AUCTION_DURATIONS,
  FEES,
  INSPECTION_CATEGORIES,
  INSPECTION_CITIES,
  INSPECTION_PACKAGES,
  LISTING_WIZARD_STEPS,
  SITE,
} from "@/lib/constants";
import {
  BUYERS_PREMIUM_MAX,
  BUYERS_PREMIUM_MIN,
  BUYERS_PREMIUM_RATE,
  CNIC_REQUIRED_ABOVE,
  INCREMENT_TABLE,
  SOFT_CLOSE_WINDOW_MS,
} from "@/lib/auction/engine";
import { formatPKR } from "@/lib/format";

/** Production origin used when NEXT_PUBLIC_SITE_URL is unset. */
export const DEFAULT_SITE_URL = "https://pakoption.induswebagency.com";

export const PUBLISHER = {
  name: "INDUS Web Agency",
  url: "https://induswebagency.com",
} as const;

/**
 * Origin with no trailing slash.
 * NEXT_PUBLIC_SITE_URL is inlined at build time. Set it before `next build`.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;
  return raw.replace(/\/+$/, "");
}

/** Absolute page URL with a trailing slash, matching `trailingSlash: true`. */
export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path || path === "/") return `${base}/`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const [pathname, query] = normalized.split("?");
  const withSlash = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return query ? `${base}${withSlash}?${query}` : `${base}${withSlash}`;
}

/** Routes that are private, tokenised, or app-only. Kept in robots.txt. */
export const DISALLOWED_PATHS = [
  "/dashboard",
  "/dashboard/",
  "/api/",
  "/inspection/report/",
  "/login",
  "/register",
  "/admin",
] as const;

export const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Bingbot",
  "Applebot",
  "Applebot-Extended",
  "Amazonbot",
  "CCBot",
  "meta-externalagent",
  "FacebookBot",
  "cohere-ai",
  "Bytespider",
  "DuckAssistBot",
] as const;

export function withCanonical(path: string, meta: Metadata): Metadata {
  const url = absoluteUrl(path);
  const openGraph =
    meta.openGraph && typeof meta.openGraph === "object" ? meta.openGraph : {};
  return {
    ...meta,
    alternates: { ...(meta.alternates ?? {}), canonical: url },
    openGraph: { ...openGraph, url },
  };
}

const DEFINITION =
  "PakOption is a car auction and classifieds marketplace for Pakistan, made by INDUS Web Agency. Sellers list a vehicle as a timed auction or a fixed-price classified. Buyers filter those listings, read an inspection report when one is attached, and place a maximum bid that the auction engine resolves.";

export const HOME_TITLE =
  "PakOption — Inspection-backed car auctions in Pakistan";

export const HOME_DESCRIPTION = SITE.description;

export type FaqItem = { question: string; answer: string };

export function getFaqs(): FaqItem[] {
  const packages = INSPECTION_PACKAGES.map(
    (p) => `${p.name} is ${p.checkpoints} checkpoints at ${formatPKR(p.price)}`,
  ).join("; ");
  const cities = INSPECTION_CITIES.join(", ");
  const durations = AUCTION_DURATIONS.map((d) => `${d.days} days`).join(", ");
  const categories = INSPECTION_CATEGORIES.map((c) => c.name).join(", ");

  return [
    {
      question: "What is PakOption?",
      answer: DEFINITION,
    },
    {
      question: "How does an inspection-backed auction work on PakOption?",
      answer:
        "A seller lists the car as an auction and can attach an inspection. The report scores nine categories and shows a letter grade. On the lot page a bidder reads that report, the specification table, and the public bid history, then submits a maximum. The auction engine applies proxy bidding, the increment table, a hidden reserve, and a three-minute soft close.",
    },
    {
      question: "How does proxy bidding work?",
      answer:
        "You submit the most you are willing to pay. The engine bids only the minimum increment needed to lead, up to that maximum. The price is one increment above the second-highest maximum, not your own maximum, unless your maximum is what it takes to lead.",
    },
    {
      question: "What is the soft close?",
      answer: `A bid placed with fewer than ${SOFT_CLOSE_WINDOW_MS / 60000} minutes left moves the end time to ${SOFT_CLOSE_WINDOW_MS / 60000} minutes after that bid. Each later bid inside the window does the same. There is no cap on extensions.`,
    },
    {
      question: "Can bidders see the reserve price?",
      answer:
        "No. The reserve number stays on the server. The lot shows one of three statuses: no reserve, reserve met, or reserve not met.",
    },
    {
      question: "What happens if the reserve is not met?",
      answer:
        "The auction rules page and the sell wizard both say the highest bidder then has 24 hours to submit a best offer, and the seller has 24 hours to accept, decline, or counter.",
    },
    {
      question: "What do the inspection packages include?",
      answer: `The app defines three packages: ${packages}. A report covers ${categories}. The booking flow lists ${cities}, and the visitor chooses a doorstep visit or a service centre.`,
    },
    {
      question: "When does a listing show the Certified badge?",
      answer:
        "The listing is marked Certified when an inspection is attached, the grade is A or B, and the report is less than 30 days old. A grade of C or D still produces a report and does not get the badge.",
    },
    {
      question: "What fees does the app calculate?",
      answer: `Buyer's premium is ${BUYERS_PREMIUM_RATE * 100}% of the hammer price, at least ${formatPKR(BUYERS_PREMIUM_MIN)} and at most ${formatPKR(BUYERS_PREMIUM_MAX)}. The auction listing fee is ${formatPKR(FEES.auctionListingFee)}, and the review step sets it to zero if you book an inspection. The success fee is ${FEES.successFeeRate * 100}% capped at ${formatPKR(FEES.successFeeCap)}. Featured placement is optional. The pricing page renders these figures from the same configuration.`,
    },
    {
      question: "How do I list a car?",
      answer: `Open the sell wizard. The steps are ${LISTING_WIZARD_STEPS.join(", ")}. Auction length can be ${durations}. The photo step asks for at least 8 images and keeps them in the browser; object storage is not connected in this build.`,
    },
    {
      question: "Do I need an account to browse?",
      answer: `No. Auctions, classifieds, compare, inspection pages, and a shared report link open without signing in. The bid panel states that amounts above ${formatPKR(CNIC_REQUIRED_ABOVE)} call for CNIC verification and lower amounts call for phone verification. Sign-in is not connected to an auth provider until one is configured.`,
    },
    {
      question: "Does PakOption need a database?",
      answer:
        "Not to serve the site. The pages read a built-in demo dataset. The repository includes a Prisma schema and a seed script for Postgres, but the page data layer does not query that database. The bid route runs the auction engine and does not store the bid.",
    },
  ];
}

export type HowToStep = { name: string; text: string; path: string };

export function getBuyHowTo(): { name: string; description: string; steps: HowToStep[] } {
  return {
    name: "How to buy a car at auction on PakOption",
    description:
      "Browse a timed auction, read the inspection report on the lot, and submit a maximum bid. The auction engine resolves proxy bids, the hidden reserve, and the soft close.",
    steps: [
      {
        name: "Open the auction board",
        text: "Go to Auctions. Filter by make, model, city, body type, fuel, transmission, year, mileage, price, certified status, or no-reserve lots, then sort and page through the results.",
        path: "/auctions",
      },
      {
        name: "Read the lot",
        text: "Open a lot for the photo gallery, specification table, public bid history, countdown, and inspection report when one is attached. The reserve price is not on the page.",
        path: "/auctions",
      },
      {
        name: "Set a maximum bid",
        text: "In the bid panel, enter your maximum. The panel runs the same auction engine as the server and shows the minimum bid, the increment, and the buyer's premium before you confirm.",
        path: "/auctions",
      },
      {
        name: "Let proxy bidding and soft close run",
        text: `The engine bids the least it needs to keep you ahead, up to your maximum. A bid inside the last ${SOFT_CLOSE_WINDOW_MS / 60000} minutes moves the end time to ${SOFT_CLOSE_WINDOW_MS / 60000} minutes from that bid.`,
        path: "/how-it-works",
      },
      {
        name: "Read the reserve status and the premium",
        text: `The panel shows reserve met, reserve not met, or no reserve. Buyer's premium is ${BUYERS_PREMIUM_RATE * 100}% of the hammer, at least ${formatPKR(BUYERS_PREMIUM_MIN)} and at most ${formatPKR(BUYERS_PREMIUM_MAX)}, and the panel adds it to the total.`,
        path: "/pricing",
      },
    ],
  };
}

export function getDefinition(): string {
  return DEFINITION;
}

function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function siteJsonLd(): string {
  const url = getSiteUrl();
  const orgId = `${url}/#organization`;
  const siteId = `${url}/#website`;
  const appId = `${url}/#app`;
  const businessId = `${url}/#business`;

  return jsonLdScript({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: PUBLISHER.name,
        url: PUBLISHER.url,
        brand: {
          "@type": "Brand",
          name: SITE.name,
        },
      },
      {
        "@type": "WebSite",
        "@id": siteId,
        name: SITE.name,
        url: `${url}/`,
        description: SITE.description,
        inLanguage: "en",
        publisher: { "@id": orgId },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${url}/auctions/?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebApplication",
        "@id": appId,
        name: SITE.name,
        url: `${url}/`,
        description: SITE.description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        browserRequirements: "Requires a modern browser.",
        inLanguage: "en",
        isAccessibleForFree: true,
        provider: { "@id": orgId },
        offers: {
          "@type": "Offer",
          url: `${url}/pricing`,
          availability: "https://schema.org/InStock",
          description:
            "Browsing is open without an account. Auction, success, and inspection fees are the amounts configured in the app and listed on the pricing page.",
        },
      },
      {
        "@type": "OnlineBusiness",
        "@id": businessId,
        name: SITE.name,
        url: `${url}/`,
        description: SITE.description,
        areaServed: {
          "@type": "Country",
          name: "Pakistan",
        },
        parentOrganization: { "@id": orgId },
      },
    ],
  });
}

export function homeJsonLd(): string {
  const url = getSiteUrl();
  const faqs = getFaqs();
  const howTo = getBuyHowTo();

  return jsonLdScript({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": `${url}/#faq`,
        url: `${url}/`,
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
      {
        "@type": "HowTo",
        "@id": `${url}/#howto-buy`,
        name: howTo.name,
        description: howTo.description,
        inLanguage: "en",
        step: howTo.steps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.name,
          text: step.text,
          url: absoluteUrl(step.path),
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${url}/`,
          },
        ],
      },
    ],
  });
}

export function llmsTxt(): string {
  const url = getSiteUrl();
  const faqs = getFaqs();
  return [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    "PakOption is made by INDUS Web Agency (https://induswebagency.com).",
    `Canonical site: ${url}/`,
    "",
    "## What it is",
    "",
    getDefinition(),
    "",
    "Listings are stored in PostgreSQL. An optional demo seed can fill an empty database with sample cars. The site does not publish user counts, ratings, or sale totals.",
    "",
    "## Public pages",
    "",
    `- [Home](${absoluteUrl("/")}): What PakOption is, how auctions work, buyer and seller features, FAQ.`,
    `- [Auctions](${absoluteUrl("/auctions")}): Timed auctions with filters, sort, and pagination.`,
    `- [Classifieds](${absoluteUrl("/buy")}): Fixed-price listings and make-offer.`,
    `- [Compare](${absoluteUrl("/compare")}): Up to four cars, specification, price, and inspection score.`,
    `- [Sell](${absoluteUrl("/sell")}): Seller overview. Listing wizard is ${absoluteUrl("/sell/new")}.`,
    `- [Inspection](${absoluteUrl("/inspection")}): Packages, categories, and cities. Booking is ${absoluteUrl("/inspection/book")}.`,
    `- [How it works](${absoluteUrl("/how-it-works")}): Proxy bidding, reserve, soft close, fees.`,
    `- [Pricing](${absoluteUrl("/pricing")}): Listing fee, success fee, buyer's premium, inspection packages.`,
    `- [Auction rules](${absoluteUrl("/legal/auction-rules")}): Rules text shipped with the app.`,
    `- [Full notes for models](${url}/llms-full.txt): Mechanics, fees, routes, and what is not wired up.`,
    "",
    "## Auction mechanics, as implemented",
    "",
    `- Proxy bidding. The bidder submits a maximum. The engine bids the minimum increment required to lead. The hammer is one increment above the second-highest maximum, not the winner's own maximum, unless that maximum is required to lead.`,
    `- Soft close. A bid inside the final ${SOFT_CLOSE_WINDOW_MS / 60000} minutes sets the end time to ${SOFT_CLOSE_WINDOW_MS / 60000} minutes after that bid. Extensions are unlimited.`,
    `- Hidden reserve. Clients receive reserve status only: NO_RESERVE, MET, or NOT_MET.`,
    `- Buyer's premium. ${BUYERS_PREMIUM_RATE * 100}% of the hammer, floor ${formatPKR(BUYERS_PREMIUM_MIN)}, cap ${formatPKR(BUYERS_PREMIUM_MAX)}.`,
    `- Increments (PKR), applied when the current price is below the threshold: ${INCREMENT_TABLE.map((tier) =>
      tier.upTo === Number.POSITIVE_INFINITY
        ? `at or above the previous threshold → ${tier.increment}`
        : `below ${tier.upTo} → ${tier.increment}`,
    ).join("; ")}.`,
    "",
    "## FAQ",
    "",
    ...faqs.flatMap((item) => [`### ${item.question}`, "", item.answer, ""]),
    "",
  ].join("\n");
}

export function llmsFullTxt(): string {
  const url = getSiteUrl();
  const packages = INSPECTION_PACKAGES.map(
    (p) =>
      `- ${p.name}: ${formatPKR(p.price)}, ${p.checkpoints} checkpoints, ${p.duration}. ${p.blurb}`,
  );
  const categories = INSPECTION_CATEGORIES.map(
    (c) => `- ${c.name} (${c.items} items in the category list): ${c.detail}`,
  );
  const featured = FEES.featuredPrices
    .map((f) => `${f.days} days for ${formatPKR(f.price)}`)
    .join("; ");

  return [
    llmsTxt(),
    "## Seller wizard",
    "",
    `Steps, in order: ${LISTING_WIZARD_STEPS.join(", ")}.`,
    "The photo step requires at least 8 images to continue and stores them in the browser. Upload to object storage is not connected.",
    `Auction durations offered: ${AUCTION_DURATIONS.map((d) => `${d.days} days (${d.note})`).join("; ")}.`,
    "Choosing an inspection in the wizard sets the auction listing fee shown on the review step to zero.",
    "",
    "## Inspection",
    "",
    ...packages,
    "",
    "Categories:",
    ...categories,
    "",
    `Booking cities: ${INSPECTION_CITIES.join(", ")}.`,
    "The booking flow steps are Package, Location, Schedule, and Confirm. Location offers doorstep or a service centre.",
    "Certified means an attached report with grade A or B dated within 30 days. The check lives in the listing projection and on the lot pages.",
    "",
    "## Fees configured in the app",
    "",
    `- Auction listing fee: ${formatPKR(FEES.auctionListingFee)} (zero on the review step when an inspection is booked).`,
    `- Success fee: ${FEES.successFeeRate * 100}%, cap ${formatPKR(FEES.successFeeCap)}.`,
    `- Buyer's premium: ${BUYERS_PREMIUM_RATE * 100}%, floor ${formatPKR(BUYERS_PREMIUM_MIN)}, cap ${formatPKR(BUYERS_PREMIUM_MAX)}.`,
    `- Featured placement: ${featured}.`,
    `- Inspection prices: see packages above.`,
    "",
    "## What the running app actually persists",
    "",
    "- Page data comes from src/lib/db/seed-data.ts through src/lib/db/repository.ts.",
    "- USING_DATABASE is set from DATABASE_URL, but no Prisma adapter is imported by the repository. Setting DATABASE_URL does not switch reads to Postgres.",
    "- prisma/schema.prisma and prisma/seed.ts are present so a Postgres database can be loaded later.",
    "- POST /api/bids validates the body, runs the pure engine, and returns the result without writing it.",
    "- Auth pages exist. A session provider is not wired.",
    "- Photo upload in the sell wizard is a client-side preview.",
    "- Shared inspection reports live at /inspection/report/{token} and are marked noindex.",
    "",
    "## Routes crawlers should skip",
    "",
    ...DISALLOWED_PATHS.map((path) => `- ${url}${path}`),
    "",
    "## Search",
    "",
    `Auction and classified filters accept a q parameter. Example: ${absoluteUrl("/auctions?q=Civic")}`,
    "",
  ].join("\n");
}
