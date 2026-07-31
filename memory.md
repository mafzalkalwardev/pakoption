# PakOption — Project Memory

> Durable context for anyone (human or agent) picking this project up cold.
> Read this first. Then `docs/PRD.md`, then `docs/ARCHITECTURE.md`, then `todo.md`.

**Last updated:** 2026-07-31

---

## 1. What this is

**PakOption** is an inspection-backed car auction and classifieds marketplace for Pakistan.

Three products in one platform:
1. **Classifieds** — peer-to-peer car listings (the OLX/PakWheels model)
2. **Timed auctions** — proxy bidding, hidden reserve, anti-snipe soft close (the Cars & Bids / Bring a Trailer model)
3. **Inspection services** — first-party 200+ point vehicle inspection, sold standalone *and* woven into the listing flow

**The thesis:** used-car marketplaces in Pakistan fail on *trust*, not supply. Making a verified inspection report native to every listing — rather than a post-hoc upsell, which is how PakWheels and OLX sell it — is the wedge. The auction engine on top of that solves price discovery.

**Positioning line:** *Pakistan's first inspection-backed car auction marketplace — every car verified, every price discovered in the open.*

---

## 2. Decisions already made (do not re-litigate without reason)

| Decision | Rationale |
|---|---|
| **Next.js 15 App Router + React 19** | RSC, server actions, native Vercel deploy |
| **Tailwind CSS v4** (`@theme`, no config file) | Halves cold build time, removes a config surface |
| **shadcn/ui pattern, source-owned** | We copy the components in rather than depend on a package — full control, Radix a11y |
| **Framer Motion *and* GSAP, not one or the other** | Framer for declarative enter/exit/layout; GSAP+ScrollTrigger for pinned scroll timelines and counters. They do different jobs. |
| **Prisma + Supabase Postgres** | Relational integrity is non-negotiable for bid ordering |
| **Supabase Realtime, not Socket.io** | No stateful server needed on Vercel; rides Postgres CDC |
| **Seed adapter fallback** | With no `DATABASE_URL` the app runs on a deterministic in-memory dataset. This is why the very first Vercel deploy works with zero config. Do not remove this. |
| **Auction engine is pure** | `src/lib/auction/engine.ts` has no I/O. Reused client-side for optimistic UI and server-side as source of truth. |
| **PKR + `Asia/Karachi` everywhere** | Store UTC, render Karachi. Format with lakh/crore short forms. |
| **English v1, copy layer ready for Urdu** | Strings routed through a copy layer so `ur-PK` is additive, not a refactor |

### Auction mechanics locked in
- **Proxy bidding** — bidder submits a max; system bids the minimum needed to lead. You pay one increment above the second-highest max, not your own max.
- **Soft close** — a bid inside the final 3 minutes extends the clock by 3 minutes, unlimited times.
- **Reserve** hidden; UI shows only `Reserve met` / `Reserve not met`.
- **Reserve not met** → 24h best-offer window for the high bidder, then 24h for the seller to respond.
- **Bids are binding.** No retraction. Admin reversal only, with audit log.
- **Buyer's premium** 2% of hammer, min PKR 15,000, max PKR 200,000.
- **Increments (PKR):** <500k → 5k · 500k–2M → 10k · 2M–5M → 25k · 5M–10M → 50k · ≥10M → 100k

---

## 3. Brand

| Token | Value | Use |
|---|---|---|
| Ink (bg) | `#04140E` | Page background, dark surfaces |
| Surface | `#0A2119` | Cards, elevated panels |
| Brand 500 | `#12B76A` | Primary actions, live indicators |
| Brand 400 | `#2DD48A` | Hover, gradient stop |
| Brand 700 | `#0B6B45` | Pressed, deep gradient stop |
| Gold | `#F5B301` | Bids, currency, "Certified" accents |
| Danger | `#E5484D` | Ending soon, outbid, errors |
| Ivory | `#F4F7F5` | Primary text on dark |
| Muted | `#8FA69A` | Secondary text |

- **Typeface:** Geist Sans (UI) · Geist Mono (prices, countdowns, VINs — tabular figures are essential so countdown digits don't jitter).
- **Logo:** an open speedometer arc (270°, gradient) enclosing a gavel head. Speed + auction, one mark. Crescent notch nods to Pakistan without being literal.
- **Voice:** confident, plain, specific. Never "revolutionary" or "seamless". Say the number.

---

## 4. Where things live

```
docs/          PRD, ARCHITECTURE, DATA_MODEL, API, DESIGN_SYSTEM, DEPLOYMENT
memory.md      this file
todo.md        live execution checklist
prisma/        schema.prisma (canonical model) + seed.ts
public/        logo.svg, logo-mark.svg, logo-mono.svg, favicon.svg, og.svg
scripts/       setup + deploy scripts (PowerShell and bash)
src/lib/auction/engine.ts     ← the most important file in the repo
src/lib/db/repository.ts      ← the ONLY data boundary. Pages never touch Prisma.
src/lib/db/seed-data.ts       ← deterministic dataset powering no-DB mode
```

**If you change the data model:** update `prisma/schema.prisma`, `src/types/index.ts`, `src/lib/db/seed-data.ts`, and `docs/DATA_MODEL.md` together. They must not drift.

---

## 5. Constraints discovered during the build

- **The Linux sandbox was unavailable** (host out of disk space) during the initial build session, so `npm install`, `npm run build` and `git push` were **never executed**. Every file was authored directly. Treat the first local `npm run build` as the real first compile — expect to fix a small number of import or type nits.
- **No GitHub MCP connector was authorised**, so the repo was not created automatically. `scripts/deploy.ps1` / `scripts/deploy.sh` do this in one command using the GitHub CLI.
- Node 20+ required (Next 15 / React 19).

---

## 6. Known gaps / deliberate v1 omissions

- No escrow or payment settlement — deposits via PSP only, final settlement peer-to-peer at handover. Escrow is a licensed v2 product.
- No native mobile app. Responsive web only.
- No Urdu localisation yet.
- No transport/logistics integration.
- Realtime bid broadcast is wired architecturally but the Supabase channel subscription is a stub until a project is provisioned.
- Auth.js is scaffolded; OTP provider needs an SMS gateway (Twilio or a local aggregator like Telenor/Jazz).

---

## 7. Open questions (need a human decision)

1. Do we hold bid deposits ourselves, or delegate entirely to the PSP? — legal input needed.
2. Flat 2% buyer's premium, or tiered down above PKR 15M to attract high-value inventory?
3. Inspectors: employees or certified franchise network? Unit economics differ materially.
4. Is Urdu a launch blocker for Faisalabad/Multan, or a fast-follow?

---

## 8. Working preferences

- The user (Afzal Jani) wants **concise, direct** output. No padding, no re-explaining what was just shown.
- Prefers being handed working artefacts over explanations of artefacts.
- Wants the full stack built and deployed, not a prototype.

---

## 9. Competitive reference points

| Platform | What to borrow | What to avoid |
|---|---|---|
| **Bring a Trailer** | Comment-thread as social proof, soft close, best-offer fallback, editorial listing quality | Curation bottleneck; too slow for volume |
| **Cars & Bids** | Clean modern UI, mandatory seller disclosure, 7-day auctions | Narrow inventory band |
| **Copart** | Salvage/bank liquidation flow, condition grading vocabulary | Brutal UX, pro-only feel |
| **PakWheels** | 200+ point inspection depth, local trust brand, city coverage | Inspection is a separate upsell; dated UI; no auction |
| **OLX Pakistan** | Frictionless listing, huge reach | Zero verification, spam, no price discovery |
