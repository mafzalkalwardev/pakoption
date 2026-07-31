# PakOption — Product Requirements Document

**Version:** 1.0
**Owner:** Afzal Jani
**Last updated:** 2026-07-31
**Status:** Approved for build

---

## 1. Executive summary

**PakOption** is a vertical marketplace for cars in Pakistan that combines three things that today live in three different places:

1. **Classifieds** — anyone can list a car (the OLX / PakWheels model)
2. **Timed online auctions** — sellers can run a real auction with proxy bidding, reserve prices and anti-sniping soft close (the Copart / Cars & Bids / Bring a Trailer model)
3. **First-party inspection** — a 200+ point third-party inspection performed by PakOption technicians, attached to the listing as a trust signal

The core insight: **the reason used-car marketplaces in Pakistan convert badly is trust, not supply.** Buyers cannot verify condition, sellers cannot prove it, and price discovery is a WhatsApp negotiation. PakOption fixes all three by making a verified inspection report the unit of trust, and an auction the unit of price discovery.

### One-line positioning

> Pakistan's first inspection-backed car auction marketplace — every car verified, every price discovered in the open.

---

## 2. Problem statement

| Stakeholder | Pain today |
|---|---|
| **Private seller** | Doesn't know what the car is worth. Fields 40 lowball calls. Buyers assume the worst about condition. Sale takes 3–8 weeks. |
| **Private buyer** | Cannot trust odometer, accident history, or engine condition. Must physically inspect 6–10 cars. Fears "shadow" sellers and non-existent listings. |
| **Dealer** | No efficient channel to liquidate trade-ins at market price. Auction access is limited to in-person events in Karachi/Lahore. |
| **Bank / insurer (repo & salvage)** | No transparent, auditable disposal channel for repossessed or write-off vehicles. |

### Evidence
- PakWheels and OLX Pakistan both sell a paid 200+ point inspection as a **separate** product, booked *after* the listing — meaning most listings are still unverified. PakWheels reports a digital report in 45–60 minutes covering engine, transmission, body structure, suspension, electrical, documents and vehicle history.
- Neither platform runs a true consumer-facing timed auction with proxy bidding. Price discovery is manual.
- Bring a Trailer / Cars & Bids have proven the auction model works for consumer cars in a trust-mediated way: proxy bidding, reserve prices, soft close (a bid in the last 3 minutes extends the clock by 3 minutes), and a "reserve not met → best offer" fallback window.

**PakOption's wedge:** make inspection *native to the listing flow*, not an upsell, and put an auction engine on top of it.

---

## 3. Goals & non-goals

### Goals (v1)
- G1. A seller can list a car in under 6 minutes and choose Classified or Auction format.
- G2. A buyer can bid with confidence because every Certified listing carries a machine-readable inspection report.
- G3. Auctions are provably fair: proxy bidding, transparent bid history, anti-sniping.
- G4. Inspection is a standalone revenue line that can be booked without a listing.
- G5. The product feels premium and fast — this is the differentiator against OLX's utilitarian UI.

### Non-goals (v1)
- Not building escrow / payment settlement in v1 (deposit hold only — see §9 risk).
- Not building a native mobile app (PWA-quality responsive web first).
- Not handling vehicle transport/logistics.
- Not doing dealer inventory management (DMS).
- No Urdu localisation in v1 (structure the copy layer for it — see §11).

---

## 4. Target users & personas

### P1 — "Bilal", the private seller (primary)
32, Lahore, selling a 2019 Honda Civic to upgrade. Has been on OLX for 3 weeks. Wants: a fair price, fewer time-wasters, proof his car is clean.
**Success:** sells within 10 days at or above his reserve.

### P2 — "Sana", the cautious buyer (primary)
28, Islamabad, first car purchase, budget PKR 3.5M. Terrified of buying an accident car. Wants: verified condition, no haggling games, clear documents.
**Success:** buys a Certified car without a physical pre-inspection trip.

### P3 — "Kamran", the dealer (secondary)
Owns a 40-car lot in Karachi. Wants: fast liquidation of aged inventory, bulk listing, a dealer dashboard.
**Success:** moves 8 aged units/month through auction.

### P4 — "Ayesha", the inspection-only customer (secondary)
Buying privately off another platform, wants PakOption to inspect before she pays.
**Success:** books a doorstep inspection, gets a report in under 24h.

---

## 5. Core user journeys

### J1 — Sell (auction)
```
Landing → "Sell your car" → Wizard
  Step 1  Vehicle identity   (make, model, year, variant, registration city)
  Step 2  Condition & specs  (mileage, transmission, fuel, colour, owners)
  Step 3  Photos             (min 8, guided angles, drag-drop, auto-order)
  Step 4  History & docs     (accident disclosure, service book, auction sheet)
  Step 5  Format & price     (Classified vs Auction · reserve · duration)
  Step 6  Inspection         (book now / skip — Certified badge explained)
  Step 7  Review & publish
→ Moderation queue → Live
```

### J2 — Buy (auction)
```
Home / Search → Filters → Listing detail
  → Gallery + inspection report + bid panel
  → Place bid (max bid → proxy engine)
  → Outbid notification → re-bid
  → Soft close extension
  → Won → deposit → seller contact unlocked → handover checklist
```

### J3 — Inspect only
```
/inspection → choose package → pick city & slot → address → confirm
  → Technician assigned → report delivered → shareable report link
```

### J4 — Compare
```
Search results → select up to 4 → /compare
  → spec matrix, price delta, inspection score delta, running-cost estimate
```

---

## 6. Feature requirements

### 6.1 Auction engine (P0)

| ID | Requirement |
|---|---|
| A1 | **Proxy bidding.** Bidder submits a *maximum* bid. The engine bids the minimum increment needed to lead, up to that max. |
| A2 | **Bid increments.** Tiered: <500k → 5k · 500k–2M → 10k · 2M–5M → 25k · 5M–10M → 50k · >10M → 100k (PKR). |
| A3 | **Reserve price.** Optional, hidden. UI shows only `Reserve met` / `Reserve not met`. |
| A4 | **Soft close (anti-snipe).** Any bid inside the final 3 minutes extends the end time by 3 minutes. Unlimited extensions. |
| A5 | **Reserve-not-met fallback.** High bidder gets 24h to submit a best offer; seller gets 24h to accept/decline/counter. |
| A6 | **Bid retraction.** Not permitted. Bids are binding. Admin-only reversal with audit log. |
| A7 | **Transparent history.** Full public bid log: masked bidder handle, amount, timestamp, `auto` flag for proxy bids. |
| A8 | **Buyer's premium.** 2% of hammer price, min PKR 15,000, max PKR 200,000. Shown before bid confirm. |
| A9 | **Bidder verification.** Phone + CNIC verification required before first bid. Refundable deposit for lots > PKR 5M. |
| A10 | **Watchlist + outbid alerts.** Email + push; "ending soon" digest at T-1h. |

### 6.2 Inspection (P0)

| ID | Requirement |
|---|---|
| I1 | **200+ checkpoints** across 9 categories: Engine · Transmission & drivetrain · Body & structure · Suspension & steering · Brakes · Electrical & electronics · Interior · Exterior & glass · Documents & history. |
| I2 | **Scored report.** 0–10 per category, weighted overall score, letter grade A/B/C/D. |
| I3 | **Evidence.** Every flagged item carries at least one photo. |
| I4 | **Structured output.** Report stored as JSON, rendered as an interactive web report + downloadable PDF. |
| I5 | **Packages.** Basic (visual, PKR 3,500) · Standard (200-pt + scan, PKR 6,500) · Comprehensive (200-pt + scan + paint-depth + road test, PKR 9,500). |
| I6 | **Doorstep + centre.** Both booking modes, 6 launch cities. |
| I7 | **Certified badge.** Listings with a report ≤ 30 days old and grade ≥ B get the `PakOption Certified` badge. |
| I8 | **Shareable report.** Public URL, works without login, for use off-platform. |

### 6.3 Listings & classifieds (P0)
- Multi-step wizard with autosave and resume.
- Min 8 / max 30 photos, guided angle prompts, client-side compression.
- Mandatory accident & flood disclosure with a legal attestation checkbox.
- Auto price suggestion band from comparable sold lots.
- Moderation queue: automated checks (duplicate VIN, stock-photo detection, price outlier) + human review.

### 6.4 Search & discovery (P0)
- Faceted filters: make, model, year range, price range, mileage, city, transmission, fuel, body type, colour, listing type (auction/classified), Certified only, reserve status, seller type.
- Sort: ending soonest · newest · price ↑/↓ · mileage ↑ · inspection score ↓.
- Saved searches with alerts.
- Map view by registration city.
- Full-text search across title/variant/description.

### 6.5 Compare (P1)
- Up to 4 vehicles side by side.
- Spec matrix with differences highlighted.
- Inspection score comparison per category.
- 5-year running cost estimate (fuel at current PKR/L, insurance, token tax, expected maintenance).

### 6.6 Accounts & dashboard (P0)
- Email/password + Google OAuth + phone OTP.
- Roles: `BUYER` · `SELLER` · `DEALER` · `INSPECTOR` · `ADMIN`.
- Buyer dashboard: My bids · Watchlist · Won lots · Saved searches · Inspections.
- Seller dashboard: My listings · Live auction monitor · Offers · Payouts · Analytics (views, watchers, bid velocity).
- Dealer: bulk CSV listing upload, sub-users.

### 6.7 Trust & safety (P0)
- Phone + CNIC verification tiers, visible on profile.
- In-app messaging only until sale (no phone numbers in listing text — regex blocked).
- Fraud signals: velocity limits, duplicate-image hashing, shill-bidding detection (bidder–seller graph proximity).
- Public seller rating after completed sale.
- Report-listing flow.

### 6.8 Additional features researched from category leaders (P1/P2)
- **Vehicle history / VIN-chassis check** — mileage rollback flag, import/auction-sheet lookup for JDM imports (P1).
- **Financing calculator** — bank partner rates, monthly instalment on the current bid (P1).
- **Insurance quote widget** — inline quote on won lots (P2).
- **Price trends** — sold-price index per make/model/year, shown on listing (P1).
- **Video walkaround** — 60s seller video, autoplay muted in gallery (P1).
- **360° spin** — turntable capture at inspection centres (P2).
- **Auction sheet translation** for Japanese imports (P2).
- **Best offer** on classifieds and reserve-not-met auctions (P1).
- **Bulk/fleet auctions** for banks and leasing companies (P2).
- **Transport quote** partner integration (P2).

---

## 7. Information architecture

```
/                         Home — live auctions, categories, how it works, trust
/auctions                 Live + upcoming + ended auctions, faceted
/auctions/[slug]          Lot detail: gallery, specs, inspection, bid panel, history
/buy                      Classified marketplace, faceted search
/buy/[slug]               Classified detail with Make Offer
/sell                     Seller landing + value proposition
/sell/new                 7-step listing wizard
/inspection               Inspection service landing, packages, coverage
/inspection/book          Booking flow
/inspection/report/[id]   Public shareable report
/compare                  Side-by-side comparison
/dashboard                Role-aware dashboard
/dashboard/bids           My bids
/dashboard/listings       My listings
/dashboard/watchlist      Watchlist
/dashboard/inspections    My inspections
/how-it-works             Buyer & seller explainer
/pricing                  Fees & buyer's premium
/blog                     SEO content
/login  /register         Auth
/legal/terms  /legal/privacy  /legal/auction-rules
```

---

## 8. Success metrics

| Metric | Definition | v1 target (month 6) |
|---|---|---|
| **Sell-through rate** | Auctions ending above reserve ÷ auctions ended | ≥ 55% |
| **Inspection attach rate** | Listings with an inspection ÷ total listings | ≥ 35% |
| **Bids per auction** | Median distinct bidders per lot | ≥ 7 |
| **Time to list** | Median wizard start → publish | ≤ 6 min |
| **Listing → first bid** | Median hours | ≤ 8h |
| **GMV** | Sum of hammer prices | PKR 250M / month |
| **Take rate** | Revenue ÷ GMV | ≥ 3.2% |
| **Certified conversion lift** | Sell-through of Certified vs non-Certified | ≥ +20pp |
| **Report NPS** | Post-inspection survey | ≥ 55 |

---

## 9. Business model

| Line | Mechanic | Rate |
|---|---|---|
| Buyer's premium | On hammer price | 2% (min 15k, max 200k PKR) |
| Seller listing fee | Auction listing | PKR 2,500, waived if inspection booked |
| Success fee | On sold auctions | 1% of hammer, capped 100k |
| Inspection | Per inspection | 3,500 / 6,500 / 9,500 PKR |
| Featured placement | Classifieds boost | 1,500–6,000 PKR / 7 days |
| Dealer subscription | Tiered by listing volume | 15k–75k PKR / month |
| Lead gen | Financing & insurance partners | Per qualified lead |

---

## 10. Risks & mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| **Shill bidding** by sellers | High | Bidder–seller graph analysis, device/IP fingerprinting, CNIC-unique accounts, retroactive void + ban. |
| **Non-payment after winning** | High | Refundable deposit for high-value lots, escalating strike system, deposit forfeiture, ban. |
| **Inspection liability** — buyer disputes a missed fault | High | Explicit scope-of-inspection legal terms, "point-in-time visual & diagnostic assessment, not a warranty", photo evidence retention, insurance. |
| **Cold-start supply** | High | Seed with dealer partners in Lahore/Karachi; zero listing fee for first 500 lots; guaranteed inspection at cost. |
| **Cold-start demand** | High | SEO on `[make] [model] price in Pakistan`; auction content marketing; reserve-met auctions promoted. |
| **Payment settlement / escrow regulation** | Medium | v1 avoids holding funds: deposits via a licensed PSP, final settlement peer-to-peer at handover with a checklist. Escrow is a v2 licensed product. |
| **Odometer fraud** | Medium | Inspection cross-checks ECU vs cluster; history-check partner; mileage-anomaly flag. |
| **Copycat by PakWheels** | Medium | Speed + inspection-native flow + auction liquidity network effect. |

---

## 11. Constraints & assumptions

- **Currency:** PKR everywhere. Format with `en-PK` locale and lakh/crore-aware short forms (`PKR 42.5 L`).
- **Timezone:** `Asia/Karachi` (UTC+5) is authoritative for all auction end times. Store UTC, render local.
- **Launch cities:** Karachi, Lahore, Islamabad/Rawalpindi, Faisalabad, Multan, Peshawar.
- **Locale:** English v1. All user-facing strings routed through a copy layer so `ur-PK` can be added without refactor.
- **Connectivity:** assume 4G, sometimes poor. Aggressive image optimisation, skeleton states, optimistic UI on bid submit.
- **Accessibility:** WCAG 2.1 AA. Countdown timers must not be the only signal (text + colour + icon).
- **Motion:** all animation respects `prefers-reduced-motion`.

---

## 12. Release plan

| Phase | Scope | Exit criteria |
|---|---|---|
| **M0 — Foundation** | Design system, logo, docs, scaffold, schema, seed | `npm run build` green, all routes render |
| **M1 — Browse** | Home, auctions grid, listing detail, search, compare | A buyer can find and view any lot |
| **M2 — Transact** | Auth, bidding engine, watchlist, dashboard | A buyer can win a lot end-to-end |
| **M3 — Supply** | Sell wizard, moderation, seller dashboard | A seller can publish a live auction |
| **M4 — Trust** | Inspection booking, report renderer, Certified badge | An inspection can be booked and published |
| **M5 — Scale** | Realtime, notifications, payments, dealer tools | 100 concurrent bidders on one lot |

---

## 13. Open questions

1. Do we hold deposits ourselves or delegate entirely to the PSP? (legal input needed)
2. Buyer's premium — flat 2% or tiered down for high-value lots to attract PKR 15M+ inventory?
3. Do inspectors work as employees or a certified franchise network? Unit economics differ materially.
4. Is Urdu a launch requirement for Faisalabad/Multan penetration, or a fast-follow?

---

## Sources

- [PakWheels Car Inspection Service](https://www.pakwheels.com/products/pakwheels-inspection/)
- [What is PakWheels Car Inspection Service & How to Read Its Report?](https://www.pakwheels.com/blog/pakwheels-car-inspection-service/)
- [OLX Pakistan Car Inspection](https://www.olx.com.pk/motors/car-inspection/)
- [Cars and Bids vs. Bring a Trailer](https://getultimateauction.com/blog/cars-and-bids-vs-bring-a-trailer/)
- [Bring a Trailer Guide: How to Buy and Sell](https://www.roadrunnerautotransport.com/news/2718/bring-a-trailer-guide-how-to-buy-and-sell-cars-on-bring-a-trailer)
- [Bring a Trailer Adds 'Best Offer' When Reserve Isn't Met](https://www.aol.com/bring-trailer-adds-best-offer-194500020.html)
- [Soft close definition](https://www.lawinsider.com/dictionary/soft-close)
