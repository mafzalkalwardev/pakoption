<div align="center">
  <img src="public/logo.svg" alt="PakOption" width="280" />
  <h3>Every car verified. Every price in the open.</h3>
  <p>Pakistan's inspection-backed car auction and classifieds marketplace.</p>
</div>

---

## What this is

PakOption is three products in one platform:

1. **Classifieds** — peer-to-peer car listings (the OLX / PakWheels model)
2. **Timed auctions** — proxy bidding, hidden reserve, three-minute anti-snipe soft close (the Cars & Bids / Bring a Trailer model)
3. **Inspection services** — a first-party 212-point vehicle inspection, sold standalone *and* built into the listing flow

**The thesis:** used-car marketplaces in Pakistan fail on *trust*, not supply. PakWheels and OLX both sell a 200+ point inspection — but as a separate product booked *after* listing, so most listings stay unverified. Making the inspection native to the listing flow is the wedge; the auction engine on top of it solves price discovery.

---

## Quickstart

```bash
npm install
npm run dev          # http://localhost:3000
```

Or run the whole setup with one command:

```powershell
.\scripts\setup.ps1        # Windows
bash scripts/setup.sh      # macOS / Linux
```

**No database required.** With `DATABASE_URL` unset, the app runs on a deterministic in-memory seed dataset — 36 listings, live auctions with running countdowns, full inspection reports. This is deliberate: it means the first Vercel deploy works with zero configuration.

### Requirements
Node 20+ (Next.js 15 / React 19).

---

## Ship it

```powershell
.\scripts\deploy.ps1        # Windows
bash scripts/deploy.sh      # macOS / Linux
```

The script checks your tooling, initialises git, creates the GitHub repo via `gh repo create`, pushes, and runs `vercel --prod`.

**Prerequisites:** [GitHub CLI](https://cli.github.com) (`gh auth login`) and [Vercel CLI](https://vercel.com/cli) (`vercel login`).

Options:

```powershell
.\scripts\deploy.ps1 -RepoName pakoption -Private
.\scripts\deploy.ps1 -SkipVercel
```

```bash
REPO_NAME=pakoption VISIBILITY=--private bash scripts/deploy.sh
```

Prefer clicking? Push to GitHub yourself and import at [vercel.com/new](https://vercel.com/new) — Next.js is auto-detected and no env vars are required for the demo build.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router, React 19) | RSC, server actions, native Vercel deploy |
| Styling | Tailwind CSS v4 | CSS-first `@theme`, no config file, faster cold builds |
| Components | shadcn/Radix pattern, source-owned | Full control, Radix accessibility |
| Motion | Framer Motion + GSAP/ScrollTrigger | Framer for enter/exit/layout; GSAP for pinned scroll timelines and counters |
| Data | Prisma 6 + PostgreSQL (Supabase) | Relational integrity is non-negotiable for bid ordering |
| Validation | Zod | One schema for form, server action and route handler |

---

## Routes

| Route | What it does |
|---|---|
| `/` | GSAP scroll hero, live ticker, featured lots, inspection showcase |
| `/auctions` | Faceted grid — live / upcoming / results |
| `/auctions/[slug]` | Gallery, specs, inspection report, bid panel, bid history |
| `/buy` · `/buy/[slug]` | Classifieds with offers and a financing calculator |
| `/sell` · `/sell/new` | Seller landing and the 7-step listing wizard |
| `/inspection` | Packages, 9 categories, coverage, sample report, FAQ |
| `/inspection/book` | 4-step booking flow |
| `/inspection/report/[token]` | Public shareable report, no login |
| `/compare` | Up to 4 cars side by side with 5-year running costs |
| `/dashboard/*` | Bids, listings, watchlist, inspections, searches, messages, settings |
| `/how-it-works` · `/pricing` | Proxy bidding explained, full fee table |
| `/login` · `/register` · `/legal/*` · `/blog` | Auth, legal, content |
| `/api/*` | Auctions, bids, stats, suggest, cron |

---

## Architecture, in three rules

**1. One data boundary.** `src/lib/db/repository.ts` is the only file that touches the data source. Pages never import Prisma. That's what makes the seed ⇄ Prisma swap a config change rather than a refactor.

**2. The auction engine is pure.** `src/lib/auction/engine.ts` has zero I/O — increments, proxy resolution, soft close, reserve status, buyer's premium. It runs server-side as the source of truth *and* client-side for optimistic UI, and it's testable without a database.

**3. Server-only fields never cross the wire.** `Auction.reservePrice` and `leaderMaxBid` are stripped at the repository boundary. Clients get a derived `reserveStatus` of `NO_RESERVE | MET | NOT_MET`, never the number.

Money is always **integer PKR**. No floats, ever.

Full detail: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Auction mechanics

- **Proxy bidding** — you submit a maximum; the engine bids the minimum needed to keep you leading. You pay one increment above the second-highest maximum, *not* your own maximum.
- **Soft close** — a bid inside the final 3 minutes pushes the finish out by 3 minutes, unlimited times. Sniping gains nothing.
- **Hidden reserve** — bidders see `Reserve met` / `Reserve not met`, never the figure.
- **Reserve not met** — the high bidder gets 24h to make a best offer; the seller gets 24h to respond.
- **Buyer's premium** — 2% of hammer, floor PKR 15,000, cap PKR 200,000.

Increments (PKR): `<500k → 5k` · `500k–2M → 10k` · `2M–5M → 25k` · `5M–10M → 50k` · `≥10M → 100k`

---

## Documentation

| Document | Contents |
|---|---|
| [`docs/PRD.md`](docs/PRD.md) | Problem, personas, journeys, numbered requirements, metrics, business model, risks |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Principles, stack rationale, topology, data flows, caching, security, performance budget |
| [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) | Every model, field by field, with indexes and retention policy |
| [`docs/API.md`](docs/API.md) | Server actions with exact server sequences, route handlers, cron, realtime, rate limits |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | Tokens, type scale, component specs, motion patterns, a11y checklist |
| [`memory.md`](memory.md) | Durable project context — decisions made and why, for whoever picks this up cold |
| [`todo.md`](todo.md) | Live checklist with honest status on every quality gate |

---

## What's real vs. what's stubbed

**Real and working**
- The full auction engine — proxy resolution, increments, soft close, reserve status, buyer's premium
- Every page and route listed above, rendering real seeded data
- Live countdowns driven by a single shared rAF ticker
- Optimistic bidding that runs the same engine the server will run
- Full inspection reports with per-category scores and photographic evidence
- Faceted search, sorting, pagination, comparison, the sell wizard and the booking flow
- Complete Prisma schema (14 models) and a seed script that mirrors the demo data

**Stubbed — needs a service to be provisioned**
- **Auth** — pages and validation exist; Auth.js needs `AUTH_SECRET` and a provider
- **Persistence** — bid writes run the engine but don't write; set `DATABASE_URL` and wrap the write path in the documented transaction
- **Image upload** — client-side preview only; needs Supabase Storage signed URLs
- **Realtime** — architected around Supabase Realtime, subscription not yet wired
- **Notifications, payments, admin moderation** — see `todo.md` M5

**Not yet run**
> `npm run build` has **not been executed**. This project was authored without a working build sandbox, so the first local `npm run build` is the real first compile. Expect a small number of import or type nits. `scripts/setup.ps1` runs typecheck and build and will surface them.

---

## Scripts

```bash
npm run dev          # dev server
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run db:migrate   # prisma migrate dev
npm run db:seed      # load the seed dataset into Postgres
npm run db:studio    # prisma studio
```

---

## Notes

Vehicle photography is served from Unsplash for the demo — replace with real inventory imagery before launch. The legal documents under `/legal` are drafted templates and have **not** been reviewed by a lawyer in Pakistan; have counsel review them before relying on them commercially.

---

<div align="center">
  <sub>Built with Next.js 15 · Tailwind v4 · Framer Motion · GSAP · Prisma</sub>
</div>
