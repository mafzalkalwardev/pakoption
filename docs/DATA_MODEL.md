# PakOption — Data Model

**Version:** 1.0 · Canonical source: `prisma/schema.prisma`

> If you change a model, update **all four** together: `prisma/schema.prisma`,
> `src/types/index.ts`, `src/lib/db/seed-data.ts`, and this document.

---

## Entity relationship overview

```
User ─┬─< Listing ─┬─ Auction ─< Bid
      │            ├─< ListingImage
      │            ├─ Inspection ─< InspectionCategory ─< InspectionItem
      │            └─< Watchlist >─ User
      ├─< Bid
      ├─< Offer
      ├─< SavedSearch
      ├─< Order (as buyer / seller)
      ├─< Message  ─ Conversation
      └─ Profile (1:1)
```

---

## Enums

| Enum | Values |
|---|---|
| `Role` | `BUYER` `SELLER` `DEALER` `INSPECTOR` `ADMIN` |
| `VerificationTier` | `NONE` `EMAIL` `PHONE` `CNIC` `DEALER_VERIFIED` |
| `ListingType` | `AUCTION` `CLASSIFIED` |
| `ListingStatus` | `DRAFT` `PENDING_REVIEW` `LIVE` `PAUSED` `SOLD` `EXPIRED` `REJECTED` |
| `AuctionStatus` | `SCHEDULED` `LIVE` `SOLD` `RESERVE_NOT_MET` `ENDED_NO_BIDS` `CANCELLED` |
| `BidStatus` | `LEADING` `OUTBID` `WON` `LOST` `VOIDED` |
| `Transmission` | `MANUAL` `AUTOMATIC` `CVT` `DCT` `AMT` |
| `FuelType` | `PETROL` `DIESEL` `HYBRID` `ELECTRIC` `CNG` `LPG` |
| `BodyType` | `HATCHBACK` `SEDAN` `SUV` `CROSSOVER` `MPV` `PICKUP` `COUPE` `CONVERTIBLE` `WAGON` `VAN` |
| `Assembly` | `LOCAL` `IMPORTED` |
| `InspectionPackage` | `BASIC` `STANDARD` `COMPREHENSIVE` |
| `InspectionStatus` | `REQUESTED` `SCHEDULED` `IN_PROGRESS` `COMPLETED` `CANCELLED` |
| `InspectionGrade` | `A` `B` `C` `D` |
| `ItemSeverity` | `OK` `ADVISORY` `MINOR` `MAJOR` `CRITICAL` |
| `OfferStatus` | `PENDING` `ACCEPTED` `DECLINED` `COUNTERED` `EXPIRED` |
| `OrderStatus` | `PENDING_DEPOSIT` `DEPOSIT_PAID` `AWAITING_HANDOVER` `COMPLETED` `CANCELLED` `DISPUTED` |

---

## Core models

### `User`
| Field | Type | Notes |
|---|---|---|
| `id` | `String @id @default(cuid())` | |
| `email` | `String @unique` | |
| `passwordHash` | `String?` | Null for OAuth-only accounts |
| `name` | `String` | |
| `handle` | `String @unique` | Public masked identity in bid logs, e.g. `bidder_4f9a` |
| `phone` | `String?` | E.164, `+92…` |
| `phoneVerifiedAt` | `DateTime?` | |
| `cnicHash` | `String?` | SHA-256. Full CNIC never stored or returned. |
| `cnicLast4` | `String?` | Display only |
| `role` | `Role @default(BUYER)` | |
| `tier` | `VerificationTier @default(NONE)` | Gates bidding |
| `avatarUrl` | `String?` | |
| `city` | `String?` | |
| `rating` | `Float @default(0)` | 0–5, post-sale reviews |
| `salesCount` | `Int @default(0)` | |
| `strikes` | `Int @default(0)` | 3 ⇒ suspension |
| `createdAt` `updatedAt` | `DateTime` | |

**Rule:** a user must be at least `PHONE` tier to bid, and `CNIC` tier to bid on lots above PKR 5,000,000.

---

### `Listing`
The vehicle. One `Listing` has at most one `Auction`.

| Field | Type | Notes |
|---|---|---|
| `id` | `String @id` | |
| `slug` | `String @unique` | `honda-civic-rs-turbo-2019-lhr-4f9a` |
| `sellerId` | `String` | → `User` |
| `type` | `ListingType` | |
| `status` | `ListingStatus @default(DRAFT)` | |
| `title` | `String` | Auto-composed, seller-editable |
| `description` | `String @db.Text` | |
| **Identity** | | |
| `make` `model` `variant` | `String` | |
| `year` | `Int` | |
| `registrationCity` | `String` | |
| `registrationYear` | `Int?` | |
| `chassisNumber` | `String?` | Partially masked publicly |
| **Condition** | | |
| `mileageKm` | `Int` | |
| `transmission` | `Transmission` | |
| `fuelType` | `FuelType` | |
| `bodyType` | `BodyType` | |
| `assembly` | `Assembly` | |
| `engineCc` | `Int` | |
| `colour` | `String` | |
| `ownersCount` | `Int @default(1)` | |
| **Disclosure** | | |
| `hasAccidentHistory` | `Boolean @default(false)` | |
| `accidentNotes` | `String?` | Required if above is true |
| `hasFloodDamage` | `Boolean @default(false)` | |
| `serviceHistoryAvailable` | `Boolean @default(false)` | |
| `auctionSheetGrade` | `String?` | For JDM imports, e.g. `4.5B` |
| **Pricing (classified)** | | |
| `askingPrice` | `Int?` | PKR, integer — never float for money |
| `isNegotiable` | `Boolean @default(true)` | |
| **Meta** | | |
| `viewCount` `watchCount` | `Int @default(0)` | |
| `isFeatured` | `Boolean @default(false)` | |
| `publishedAt` | `DateTime?` | |
| `createdAt` `updatedAt` | `DateTime` | |

**Indexes:** `[status, type, publishedAt]`, `[make, model, year]`, `[registrationCity]`, `[slug]`

**Money rule:** all currency is stored as **integer PKR**. No decimals, no floats. Ever.

---

### `Auction`
| Field | Type | Notes |
|---|---|---|
| `id` | `String @id` | |
| `listingId` | `String @unique` | 1:1 with `Listing` |
| `status` | `AuctionStatus @default(SCHEDULED)` | |
| `startingPrice` | `Int` | Opening bid |
| `reservePrice` | `Int?` | **Hidden.** Never serialised to the client — only a derived `reserveMet` boolean. |
| `currentPrice` | `Int` | The visible high bid |
| `leaderId` | `String?` | → `User` |
| `leaderMaxBid` | `Int?` | **Server-only.** The proxy ceiling. Never exposed. |
| `bidCount` | `Int @default(0)` | |
| `bidderCount` | `Int @default(0)` | Distinct bidders |
| `startsAt` | `DateTime` | |
| `endsAt` | `DateTime` | Mutated by soft close |
| `originalEndsAt` | `DateTime` | Immutable, for "extended by Xm" UI |
| `extensionCount` | `Int @default(0)` | |
| `soldPrice` | `Int?` | Hammer price on close |
| `buyersPremium` | `Int?` | Computed on close |

**Indexes:** `[status, endsAt]` — drives the close-auctions cron and "ending soon" sort.

**Serialisation contract:** `reservePrice` and `leaderMaxBid` are stripped in the repository layer before any value crosses to a client component. The public shape exposes `reserveStatus: 'NO_RESERVE' | 'MET' | 'NOT_MET'` only.

---

### `Bid`
Append-only. Rows are never updated except `status`.

| Field | Type | Notes |
|---|---|---|
| `id` | `String @id` | |
| `auctionId` | `String` | |
| `bidderId` | `String` | |
| `amount` | `Int` | The **visible** bid placed |
| `maxAmount` | `Int` | **Server-only.** The proxy ceiling. |
| `isAutoBid` | `Boolean @default(false)` | True when the engine generated it |
| `status` | `BidStatus @default(LEADING)` | |
| `placedAt` | `DateTime @default(now())` | Tie-break key |

**Indexes:** `[auctionId, placedAt DESC]`, `[bidderId, placedAt DESC]`

**Concurrency:** bid writes run inside a transaction that takes `SELECT … FOR UPDATE` on the parent `Auction` row. This serialises simultaneous bids at the database, so the pure engine's deterministic output is the only possible outcome.

---

### `Inspection`
| Field | Type | Notes |
|---|---|---|
| `id` | `String @id` | |
| `reference` | `String @unique` | `PO-INS-2026-04812`, shown to customers |
| `listingId` | `String?` | Null for standalone inspections |
| `customerId` | `String` | |
| `inspectorId` | `String?` | |
| `package` | `InspectionPackage` | |
| `status` | `InspectionStatus` | |
| `city` | `String` | |
| `isDoorstep` | `Boolean` | |
| `address` | `String?` | |
| `scheduledAt` | `DateTime?` | |
| `completedAt` | `DateTime?` | |
| `overallScore` | `Float?` | 0–10, weighted |
| `grade` | `InspectionGrade?` | |
| `checkpointsTotal` | `Int?` | ≥ 200 for Standard/Comprehensive |
| `checkpointsPassed` | `Int?` | |
| `summary` | `String?` | Plain-language verdict |
| `price` | `Int` | PKR |
| `publicToken` | `String @unique` | Powers `/inspection/report/[token]` without login |

### `InspectionCategory`
9 per inspection: Engine · Transmission & Drivetrain · Body & Structure · Suspension & Steering · Brakes · Electrical & Electronics · Interior · Exterior & Glass · Documents & History.

| Field | Type |
|---|---|
| `id` `inspectionId` `name` `slug` | `String` |
| `score` | `Float` — 0–10 |
| `weight` | `Float` — contribution to overall |
| `itemsTotal` `itemsPassed` | `Int` |

### `InspectionItem`
| Field | Type | Notes |
|---|---|---|
| `id` `categoryId` `label` | `String` | |
| `severity` | `ItemSeverity` | |
| `note` | `String?` | |
| `photoUrls` | `String[]` | **Required** when severity ≥ `MINOR` |

**Grade mapping:** A ≥ 8.5 · B ≥ 7.0 · C ≥ 5.0 · D < 5.0
**Certified badge:** grade ≥ B **and** `completedAt` within 30 days.

---

## Supporting models

| Model | Purpose | Key fields |
|---|---|---|
| `ListingImage` | Ordered gallery | `listingId` `url` `blurhash` `order` `isPrimary` `angle` |
| `Watchlist` | User ⇄ Listing, composite PK | `userId` `listingId` `createdAt` |
| `SavedSearch` | Alert on new matches | `userId` `name` `queryJson` `alertFrequency` |
| `Offer` | Best-offer on classifieds & reserve-not-met | `listingId` `buyerId` `amount` `status` `expiresAt` `message` |
| `Order` | Post-sale record | `listingId` `buyerId` `sellerId` `hammerPrice` `buyersPremium` `total` `status` `depositPaidAt` |
| `Conversation` / `Message` | In-app messaging | `listingId` `participantIds` · `body` `senderId` `readAt` |
| `Notification` | Outbid, ending soon, offer received | `userId` `type` `payloadJson` `readAt` |
| `AuditLog` | Admin actions, bid reversals | `actorId` `action` `entity` `entityId` `beforeJson` `afterJson` |

---

## Derived / computed values (never stored)

| Value | Computed by |
|---|---|
| `nextMinimumBid` | `engine.getMinimumBid(currentPrice, bidCount)` |
| `increment` | `engine.getIncrement(currentPrice)` |
| `reserveStatus` | `engine.getReserveStatus(currentPrice, reservePrice)` |
| `phase` | `engine.getAuctionPhase(startsAt, endsAt, now)` |
| `buyersPremium` | `engine.computeBuyersPremium(hammer)` — 2%, min 15k, max 200k |
| `isCertified` | grade ≥ B ∧ completed within 30 days |
| `timeRemaining` | `endsAt − now`, rendered client-side via rAF |

---

## Retention & privacy

| Data | Policy |
|---|---|
| CNIC | Hash + last 4 only. Full value never persisted. |
| Bid history | Retained indefinitely, bidder identity masked to `handle` publicly |
| Inspection photos | 3 years (liability window) |
| Messages | 2 years after conversation close |
| Deleted accounts | PII scrubbed, bids anonymised to `deleted_user`, financial records retained per statute |
