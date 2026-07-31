# PakOption — TODO

**Legend:** `[x]` done · `[~]` partial · `[ ]` not started
**Last updated:** 2026-07-31

---

## M0 — Foundation

- [x] Product requirements document (`docs/PRD.md`)
- [x] System architecture (`docs/ARCHITECTURE.md`)
- [x] Data model reference (`docs/DATA_MODEL.md`)
- [x] API specification (`docs/API.md`)
- [x] Design system spec (`docs/DESIGN_SYSTEM.md`)
- [x] Deployment guide (`docs/DEPLOYMENT.md`)
- [x] Project memory (`memory.md`)
- [x] This checklist (`todo.md`)
- [x] Logo — full lockup, mark, monochrome, favicon, OG image
- [x] Brand tokens in `globals.css` (Tailwind v4 `@theme`)
- [x] `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`
- [x] `.gitignore`, `.env.example`, `README.md`, `LICENSE`
- [x] Prisma schema — 14 models
- [x] Deterministic seed dataset (`src/lib/db/seed-data.ts`)
- [x] Repository data boundary with seed ⇄ Prisma adapters

---

## M1 — Browse

- [x] Root layout, fonts, metadata, providers
- [x] Navbar — sticky, scroll-aware, mega menu, command palette trigger
- [x] Footer
- [x] Mobile navigation drawer
- [x] Home — GSAP scroll hero
- [x] Home — live auction ticker (marquee)
- [x] Home — featured auctions grid
- [x] Home — category / body-type grid
- [x] Home — how it works (3 steps, scroll-pinned)
- [x] Home — inspection trust section with animated score ring
- [x] Home — stats counters (GSAP)
- [x] Home — testimonials
- [x] Home — final CTA
- [x] Auction card component (countdown, watch, reserve state, certified badge)
- [x] `/auctions` grid with filter rail + sort bar
- [x] `/auctions/[slug]` lot detail
- [x] Gallery with lightbox + keyboard nav
- [x] Spec table
- [x] Inspection report viewer (score ring, category bars, flagged items)
- [x] Bid history table
- [x] `/buy` classifieds grid
- [x] `/buy/[slug]` classified detail with Make Offer
- [x] `/compare` matrix, up to 4 vehicles
- [ ] Map view by registration city — **deferred to M5**
- [ ] Blog index + MDX post rendering — **stub only**

---

## M2 — Transact

- [x] Pure auction engine (`src/lib/auction/engine.ts`)
- [x] Increment table + minimum-bid calculation
- [x] Proxy bid resolution
- [x] Soft-close extension
- [x] Reserve status
- [x] Buyer's premium calculation
- [x] Bid panel — max bid input, quick increments, premium preview, confirm
- [x] Countdown component — rAF, ending-soon state, `prefers-reduced-motion` safe
- [x] Optimistic bid UI
- [x] `/login`, `/register` pages
- [x] Watchlist toggle (client state + server action shape)
- [x] `/dashboard` — role-aware overview
- [x] `/dashboard/bids`, `/listings`, `/watchlist`, `/inspections`
- [ ] Auth.js v5 wiring to a real session store — **needs `AUTH_SECRET` + provider config**
- [ ] Phone OTP provider — **needs SMS gateway account**
- [ ] Bid deposit hold via PSP — **v1 scope decision open**
- [ ] Supabase Realtime channel subscription — **stubbed, needs project**
- [ ] Outbid email/push notifications — **needs Resend + web-push keys**

---

## M3 — Supply

- [x] `/sell` seller landing
- [x] 7-step listing wizard shell with progress + autosave shape
- [x] Step 1 — vehicle identity
- [x] Step 2 — condition & specs
- [x] Step 3 — photos (drag-drop, guided angles)
- [x] Step 4 — history & disclosure
- [x] Step 5 — format, reserve, duration
- [x] Step 6 — inspection upsell
- [x] Step 7 — review & publish
- [x] Zod validation schemas for every step
- [ ] Real image upload to Supabase Storage — **client-side preview only today**
- [ ] Moderation queue + admin console — **M5**
- [ ] Dealer bulk CSV upload — **M5**

---

## M4 — Trust

- [x] `/inspection` service landing with package cards
- [x] 9 inspection categories × 200+ checkpoint structure
- [x] Animated score ring + per-category bars
- [x] `/inspection/book` booking flow (package → city → slot → address → confirm)
- [x] `/inspection/report/[id]` public shareable report
- [x] Certified badge logic (report ≤ 30 days, grade ≥ B)
- [ ] PDF report generation — **M5**
- [ ] Inspector mobile capture app — **out of v1 scope**

---

## M5 — Scale (not started)

- [ ] Vercel Cron `close-auctions` wired to a live DB
- [ ] Supabase Realtime fan-out under load
- [ ] Notification service (email + web push)
- [ ] Payments / deposits
- [ ] Admin moderation console
- [ ] Shill-bidding detection
- [ ] Dealer subscriptions + sub-users
- [ ] Financing calculator with live partner rates
- [ ] Insurance quote widget
- [ ] VIN / chassis history check integration
- [ ] Price trend index per make/model/year
- [ ] Urdu (`ur-PK`) localisation
- [ ] Map view
- [ ] 360° turntable capture

---

## Quality gates

- [x] TypeScript `strict` across the codebase
- [x] `prefers-reduced-motion` honoured in every animated component
- [x] Semantic HTML + ARIA on interactive components
- [x] Tabular figures on all countdowns and prices
- [ ] **`npm run build` — NOT YET RUN.** The build sandbox was unavailable during authoring. This is the first thing to do.
- [ ] `npm run lint` clean
- [ ] Vitest suite for `engine.ts` (100% branch target)
- [ ] Playwright E2E: bid-to-win, list-to-publish, book-inspection
- [ ] axe-core: zero serious/critical violations
- [ ] Lighthouse ≥ 92 / 95 / 100

---

## Ship

- [x] `scripts/setup.ps1` + `scripts/setup.sh`
- [x] `scripts/deploy.ps1` + `scripts/deploy.sh`
- [x] `vercel.json` with cron schedule
- [ ] **Create GitHub repo + push** — run `scripts/deploy.ps1`
- [ ] **Deploy to Vercel** — same script
- [ ] Provision Supabase project, set env vars, `prisma migrate deploy`
- [ ] Custom domain + DNS

---

## Immediate next actions

```powershell
cd D:\PakOption
.\scripts\setup.ps1      # npm install, prisma generate, next build
.\scripts\deploy.ps1     # git init, create GitHub repo, push, vercel deploy
```

1. Run `setup.ps1` and fix any compile errors it surfaces (first real compile).
2. Run `deploy.ps1` to create the repo and ship a preview.
3. Provision Supabase, fill `.env`, run `npx prisma migrate dev --name init`.
4. Flip `USE_DB` on by setting `DATABASE_URL` — the repository swaps adapters automatically.
