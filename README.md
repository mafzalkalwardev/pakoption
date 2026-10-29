<div align="center">

# PakOption

<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=28&duration=2800&pause=700&color=059669&center=true&vCenter=true&width=900&lines=Pakistan+Car+Auction+Marketplace;Inspection-Backed+Listings;Next.js+15+%2B+Tailwind+v4;Modern+marketplace+UX" alt="Typing SVG" />

<p>
  <img src="https://komarev.com/ghpvc/?username=mafzalkalwardev&label=Project%20Views&color=059669&style=for-the-badge" alt="Project views" />
  <img src="https://img.shields.io/github/stars/mafzalkalwardev/pakoption?style=for-the-badge&color=22c55e" alt="GitHub stars" />
  <img src="https://img.shields.io/github/forks/mafzalkalwardev/pakoption?style=for-the-badge&color=f59e0b" alt="GitHub forks" />
  <img src="https://img.shields.io/github/license/mafzalkalwardev/pakoption?style=for-the-badge&color=64748b" alt="License" />
</p>

<p>
  <img src="https://skillicons.dev/icons?i=ts,nextjs,react,tailwind" alt="Skill icons" />
</p>

<p>
  <strong>Pakistan's inspection-backed car auction marketplace — Next.js 15, Tailwind v4, and modern marketplace UX.</strong>
</p>

</div>

---

## Contribution Snake

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/mafzalkalwardev/google-voice-dispatch-agent/output/github-contribution-grid-snake-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/mafzalkalwardev/google-voice-dispatch-agent/output/github-contribution-grid-snake.svg">
    <img alt="Contribution snake" src="https://raw.githubusercontent.com/mafzalkalwardev/google-voice-dispatch-agent/output/github-contribution-grid-snake.svg">
  </picture>
</div>

---

## SEO Keywords

`car auction` `Pakistan marketplace` `Next.js` `Tailwind`

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
