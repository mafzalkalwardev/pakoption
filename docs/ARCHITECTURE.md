# PakOption — System Architecture

**Version:** 1.0 · **Last updated:** 2026-07-31

---

## 1. Architectural principles

1. **Server-first.** React Server Components by default. `"use client"` only where interaction genuinely requires it (bid panel, countdowns, wizard, filters, animations).
2. **One data boundary.** All reads/writes go through `src/lib/db/repository.ts`. No page imports Prisma directly. Swapping the seed adapter for the Prisma adapter is a one-line change.
3. **The auction engine is pure.** `src/lib/auction/engine.ts` contains zero I/O — increments, proxy resolution, soft-close, reserve status. Fully unit-testable, reusable on client (optimistic UI) and server (source of truth).
4. **Degrade, don't crash.** No `DATABASE_URL`? The app runs on the deterministic seed dataset. This makes the Vercel preview deploy work on the first push with zero configuration.
5. **Motion is a layer, not a dependency.** Every animated component renders correctly with JS disabled and with `prefers-reduced-motion: reduce`.

---

## 2. Technology stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router, React 19) | RSC, streaming, server actions, first-class Vercel deploy |
| Language | **TypeScript 5** (`strict`) | Contract safety across the data boundary |
| Styling | **Tailwind CSS v4** | CSS-first `@theme` config, no `tailwind.config.js`, faster builds |
| Components | **shadcn/ui** pattern (Radix + CVA) | Owned source, not a black-box dependency; full a11y from Radix |
| Motion (declarative) | **Framer Motion** (`motion` v11) | Layout animations, enter/exit, gestures, `useInView` |
| Motion (timeline) | **GSAP 3 + ScrollTrigger** | Scroll-pinned hero sequence, counters, marquee, complex timelines |
| Icons | **lucide-react** | Consistent 24px grid, tree-shakeable |
| ORM | **Prisma 6** | Type-safe schema, migrations, works with Supabase pooler |
| Database | **PostgreSQL** (Supabase) | Relational integrity for bids; row-level security; realtime channel |
| Auth | **Auth.js v5** (NextAuth) | Credentials + Google + OTP, JWT sessions, edge-compatible |
| Storage | **Supabase Storage** | Vehicle photos, inspection evidence, report PDFs |
| Realtime | **Supabase Realtime** (Postgres CDC) | Live bid broadcast without running our own socket server |
| Validation | **Zod** | One schema for form + server action + API route |
| Dates | **date-fns** + `Asia/Karachi` | Countdown math, relative times |
| Charts | **Recharts** | Price trend, bid velocity, inspection radar |
| Deploy | **Vercel** | Edge network, preview deploys, cron |

### Why not X
- **Socket.io** — needs a stateful server; Supabase Realtime rides on Postgres logical replication and costs nothing extra on Vercel.
- **Redux/Zustand** — server state lives on the server; the little client state we have (filters, compare tray) fits in URL params + `useState`.
- **Tailwind v3** — v4's `@theme` removes an entire config file and cuts cold build time roughly in half.

---

## 3. High-level topology

```
                          ┌──────────────────────────┐
     Browser ────────────▶│   Vercel Edge Network    │
   (RSC payload,          │   • static + ISR cache   │
    JS islands)           │   • image optimisation   │
                          └────────────┬─────────────┘
                                       │
                          ┌────────────▼─────────────┐
                          │  Next.js 15 (Node)       │
                          │  ┌────────────────────┐  │
                          │  │ RSC pages          │  │
                          │  │ Server actions     │  │
                          │  │ Route handlers     │  │
                          │  └─────────┬──────────┘  │
                          │            │              │
                          │  ┌─────────▼──────────┐  │
                          │  │ repository.ts      │  │  ← single data boundary
                          │  └──┬──────────────┬──┘  │
                          └─────│──────────────│─────┘
                                │              │
                    ┌───────────▼───┐   ┌──────▼─────────┐
                    │ seed adapter  │   │ prisma adapter │
                    │ (in-memory)   │   │                │
                    └───────────────┘   └──────┬─────────┘
                                               │
                        ┌──────────────────────▼──────────────────────┐
                        │ Supabase                                     │
                        │  Postgres · Auth · Storage · Realtime         │
                        └──────────────────────────────────────────────┘
                                               ▲
                        Vercel Cron ───────────┘
                        • close-auctions  (every minute)
                        • ending-soon digest (hourly)
                        • search alerts   (every 6h)
```

---

## 4. Directory structure

```
PakOption/
├── docs/                          PRD, architecture, data model, API, design system
├── memory.md                      Durable project context for future sessions
├── todo.md                        Live execution checklist
├── prisma/
│   ├── schema.prisma              Canonical data model
│   └── seed.ts                    Deterministic seed → also powers the no-DB mode
├── public/
│   ├── logo.svg  logo-mark.svg  logo-mono.svg  favicon.svg  og.svg
├── scripts/
│   ├── setup.ps1 / setup.sh       install + generate + build
│   └── deploy.ps1 / deploy.sh     git init → GitHub repo → Vercel deploy
└── src/
    ├── app/
    │   ├── layout.tsx             Root shell, fonts, metadata, providers
    │   ├── globals.css            Tailwind v4 @theme, tokens, keyframes
    │   ├── page.tsx               Home
    │   ├── auctions/              Grid + [slug] detail
    │   ├── buy/                   Classifieds
    │   ├── sell/                  Landing + /new wizard
    │   ├── inspection/            Landing + /book + /report/[id]
    │   ├── compare/               Comparison matrix
    │   ├── dashboard/             Role-aware, nested routes
    │   ├── (auth)/login|register  Auth group
    │   ├── how-it-works, pricing, blog, legal/
    │   └── api/
    │       ├── auctions/route.ts
    │       ├── bids/route.ts
    │       ├── inspections/route.ts
    │       └── cron/close-auctions/route.ts
    ├── components/
    │   ├── ui/                    shadcn primitives (owned source)
    │   ├── layout/                navbar, footer, mobile-nav, command-menu
    │   ├── motion/                reveal, magnetic, marquee, counter, cursor
    │   ├── home/                  hero, ticker, categories, how-it-works, trust, cta
    │   ├── auction/               card, grid, countdown, bid-panel, bid-history, gallery
    │   ├── inspection/            score-ring, category-bars, report-viewer, booking
    │   ├── search/                filter-rail, sort-bar, active-chips, empty-state
    │   ├── sell/                  wizard shell + 7 step components
    │   └── compare/               tray, matrix
    ├── lib/
    │   ├── auction/engine.ts      Pure bidding logic  ← unit-tested
    │   ├── db/repository.ts       Data boundary
    │   ├── db/seed-data.ts        Deterministic dataset
    │   ├── db/prisma.ts           Lazy singleton
    │   ├── format.ts              PKR, mileage, dates, relative time
    │   ├── constants.ts           Cities, makes, body types, fuel, nav
    │   ├── validations.ts         Zod schemas
    │   └── utils.ts               cn()
    └── types/index.ts             Domain types (source of truth for the seed adapter)
```

---

## 5. Data flow

### 5.1 Read path — auction listing page
```
GET /auctions/civic-2019-rs-turbo
  → app/auctions/[slug]/page.tsx           (RSC, server)
     → repository.getListingBySlug(slug)
        → seed adapter | prisma adapter
     → engine.getAuctionState(listing)      (pure: status, next increment, reserve)
  → streams HTML shell + <Suspense> for bid history
  → hydrates 3 islands only:
       <Countdown/>      client, rAF ticker
       <BidPanel/>       client, server action + optimistic
       <Gallery/>        client, framer-motion lightbox
```

### 5.2 Write path — placing a bid
```
<BidPanel/> submit
  → optimistic UI: engine.simulateBid() runs client-side, shows result instantly
  → server action placeBid({ listingId, maxAmount })
       1. authenticate + assert verified bidder
       2. SELECT ... FOR UPDATE on the auction row      (serialise concurrent bids)
       3. engine.resolveBid(currentState, newMaxBid)    (pure)
            → determines new leader, new current price, proxy counter-bids
       4. apply soft close: if endsAt - now < 180s → endsAt += 180s
       5. INSERT bid rows (the real bid + any proxy counter-bid)
       6. UPDATE auction { currentPrice, leaderId, bidCount, endsAt }
       7. COMMIT
       8. broadcast on Supabase Realtime channel `auction:{id}`
       9. enqueue outbid notification for the previous leader
  → revalidatePath('/auctions/[slug]')
  → all other viewers receive the realtime event and patch their local state
```

**Concurrency guarantee:** step 2's row lock means two bids arriving in the same millisecond are serialised by Postgres. The engine is deterministic, so the outcome is identical regardless of arrival interleaving at the app layer.

### 5.3 Auction close
```
Vercel Cron  */1 * * * *  → GET /api/cron/close-auctions   (Bearer CRON_SECRET)
  → SELECT auctions WHERE status='LIVE' AND endsAt <= now() FOR UPDATE SKIP LOCKED
  → for each:
       reserve met?  → status=SOLD,  create Order, notify buyer+seller
       no reserve?   → status=SOLD (any bid wins)
       reserve miss? → status=RESERVE_NOT_MET, open 24h best-offer window
       zero bids?    → status=ENDED_NO_BIDS, offer free relist
```

---

## 6. The auction engine

`src/lib/auction/engine.ts` — pure functions, no imports beyond types.

```ts
getIncrement(currentPrice: number): number
getMinimumBid(currentPrice: number, bidCount: number): number
resolveBid(state: AuctionState, incoming: IncomingBid): BidResolution
applySoftClose(endsAt: Date, now: Date): Date
getReserveStatus(currentPrice, reservePrice?): 'NO_RESERVE' | 'MET' | 'NOT_MET'
getAuctionPhase(startsAt, endsAt, now): 'UPCOMING' | 'LIVE' | 'ENDING_SOON' | 'ENDED'
computeBuyersPremium(hammer: number): number
```

### Proxy resolution algorithm
```
Given: leader L with max ML, incoming bidder B with max MB, current price P

if MB <= P                       → REJECTED (below minimum)
if no leader                     → B leads at max(P, startingPrice)
if MB > ML                       → B leads at min(MB, ML + increment(ML))
if MB <= ML                      → L retains lead at min(ML, MB + increment(MB))
                                   B is recorded as outbid immediately
if MB == ML                      → earlier bid wins (L retains), tie broken by timestamp
```
This mirrors the eBay/BaT model: **you pay one increment above the second-highest max, not your own max.**

### Increment table (PKR)
| Current price | Increment |
|---|---|
| < 500,000 | 5,000 |
| 500,000 – 1,999,999 | 10,000 |
| 2,000,000 – 4,999,999 | 25,000 |
| 5,000,000 – 9,999,999 | 50,000 |
| ≥ 10,000,000 | 100,000 |

---

## 7. Rendering & caching strategy

| Route | Strategy | Revalidate |
|---|---|---|
| `/` | ISR | 60s |
| `/auctions` | ISR + client-side filtering | 30s |
| `/auctions/[slug]` — live | Dynamic (`force-dynamic`) | — realtime patched |
| `/auctions/[slug]` — ended | ISR | 3600s |
| `/buy`, `/buy/[slug]` | ISR | 300s |
| `/inspection`, `/pricing`, `/how-it-works` | Static | — |
| `/inspection/report/[id]` | ISR | 86400s |
| `/dashboard/*` | Dynamic, `no-store` | — |
| `/blog/[slug]` | Static + `generateStaticParams` | — |

Images: `next/image` with `remotePatterns` for Supabase Storage + Unsplash (seed). AVIF → WebP fallback chain. `sizes` set on every grid image so the CDN serves the right variant.

---

## 8. Animation architecture

Three tiers, chosen per use case:

| Tier | Tool | Used for |
|---|---|---|
| **CSS** | Tailwind keyframes in `globals.css` | Shimmer, pulse, gradient drift, marquee — anything infinite and cheap |
| **Framer Motion** | `motion` v11 | Enter/exit, layout shifts, `AnimatePresence` modals, hover springs, staggered reveals via `useInView` |
| **GSAP + ScrollTrigger** | timeline control | Hero scroll sequence, pinned sections, number counters, parallax layers, SVG path draw |

### Rules
1. Animate `transform` and `opacity` only. Never `width`, `height`, `top`, `left`.
2. `will-change` is applied on hover intent, removed on animation complete.
3. Every GSAP context is created inside `useGSAP`/`useLayoutEffect` and reverted on unmount — no leaked ScrollTriggers on route change.
4. A single `<MotionProvider>` reads `prefers-reduced-motion` and sets a context flag; components skip to final state when reduced.
5. Above-the-fold content is never gated behind an animation — the hero headline is in the HTML, motion only enhances it.

---

## 9. Security

| Concern | Control |
|---|---|
| Auth | Auth.js v5, JWT in httpOnly SameSite=Lax cookie, 30-day rolling |
| Authorisation | Server-side role check in every server action; RLS policies as defence in depth |
| Bid integrity | Row-level `FOR UPDATE` lock; amounts recomputed server-side, never trusted from client |
| Input | Zod parse at every trust boundary (form → action → DB) |
| XSS | No `dangerouslySetInnerHTML` except sanitised blog MDX |
| CSRF | Server actions carry Next.js origin check; API routes verify `Origin` |
| Rate limiting | Per-user + per-IP token bucket on bid, message, and listing endpoints |
| Secrets | Vercel env vars; `.env` gitignored; `.env.example` committed |
| PII | CNIC stored hashed + last-4; full value never returned to the client |
| Cron | `Authorization: Bearer ${CRON_SECRET}` verified before any mutation |
| Uploads | Signed URLs, 10MB cap, MIME sniffing, EXIF stripped |

---

## 10. Performance budget

| Metric | Target |
|---|---|
| LCP (home, 4G) | < 2.0s |
| INP | < 200ms |
| CLS | < 0.05 |
| First-load JS (home) | < 165 kB gzip |
| Route JS delta | < 40 kB |
| Lighthouse Perf / A11y / SEO | ≥ 92 / ≥ 95 / 100 |

Techniques: RSC-first, `next/dynamic` for GSAP-heavy sections, `next/font` self-hosted with `display: swap`, blurhash placeholders, route prefetch on viewport intent, tree-shaken lucide imports.

---

## 11. Observability

- **Vercel Analytics + Speed Insights** — Core Web Vitals per route.
- **Structured logs** — one JSON line per server action: `{ action, userId, listingId, durationMs, outcome }`.
- **Business events** — `bid_placed`, `auction_closed`, `inspection_booked`, `listing_published` to the analytics sink.
- **Alerts** — bid write failure rate > 1% over 5 min; cron job miss; auction closed late by > 60s.

---

## 12. Testing strategy

| Level | Tool | Coverage target |
|---|---|---|
| Unit — auction engine | Vitest | 100% of `engine.ts` branches |
| Unit — formatters, validators | Vitest | 90% |
| Component | Testing Library | Bid panel, countdown, wizard steps |
| Integration | Vitest + test DB | Bid concurrency, close job |
| E2E | Playwright | Bid-to-win, list-to-publish, book-inspection |
| Visual | Playwright screenshots | Home, auction card, report |
| A11y | axe-core in Playwright | Zero serious/critical violations |

**Critical test:** 50 concurrent proxy bids on one lot must produce exactly one leader and a monotonically increasing price with no gaps or duplicates.

---

## 13. Environment variables

| Var | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | No¹ | Postgres pooled connection (Supabase `:6543`) |
| `DIRECT_URL` | No¹ | Direct connection for migrations (`:5432`) |
| `NEXT_PUBLIC_SUPABASE_URL` | No¹ | Client for storage + realtime |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No¹ | Client key |
| `SUPABASE_SERVICE_ROLE_KEY` | No¹ | Server-side storage writes |
| `AUTH_SECRET` | Yes | JWT signing |
| `AUTH_URL` | Prod | Canonical origin |
| `GOOGLE_CLIENT_ID` / `_SECRET` | No | Google OAuth |
| `CRON_SECRET` | Prod | Cron endpoint auth |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical URLs, OG tags |

¹ Absent ⇒ the seed adapter is used automatically and the app is fully functional in demo mode.

---

## 14. Deployment pipeline

```
git push origin main
  → Vercel build
      npm ci
      prisma generate            (no-op if DATABASE_URL unset)
      next build
  → deploy to preview (PR) or production (main)
  → post-deploy: prisma migrate deploy   (production only, gated)
```

Rollback: Vercel instant rollback to previous deployment. Migrations are expand-then-contract so the previous build stays compatible for one release.

---

## 15. Scaling path

| Load | Change |
|---|---|
| 100 concurrent bidders / lot | Current design handles it — Postgres row lock, Realtime fan-out |
| 1,000 concurrent | Move bid writes behind a per-lot queue (Redis stream, single consumer per lot) |
| 10,000 concurrent | Dedicated auction service; Postgres becomes the durable log, Redis holds live state |
| Multi-region | Read replicas for browse; writes stay in the primary region (auction ordering must be total) |
