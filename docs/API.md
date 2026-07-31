# PakOption — API Specification

**Version:** 1.0
**Base:** `https://pakoption.vercel.app`
**Auth:** session cookie (Auth.js) for browser callers; `Authorization: Bearer` for cron.

> Preference order: **server action → route handler**. Route handlers exist for
> cross-origin/mobile consumers and for cron. Anything a form can do, a server
> action does.

---

## Conventions

**Money** — every amount is an integer in PKR. No decimals.
**Time** — ISO 8601 UTC. Clients render in `Asia/Karachi`.
**Errors**
```json
{ "error": { "code": "BID_TOO_LOW", "message": "Minimum bid is PKR 6,275,000", "field": "maxAmount" } }
```

| Code | HTTP | Meaning |
|---|---|---|
| `UNAUTHENTICATED` | 401 | No session |
| `NOT_VERIFIED` | 403 | Below required verification tier |
| `FORBIDDEN` | 403 | Not the owner / wrong role |
| `NOT_FOUND` | 404 | |
| `AUCTION_NOT_LIVE` | 409 | Scheduled or ended |
| `BID_TOO_LOW` | 422 | Below `nextMinimumBid` |
| `SELF_BID` | 422 | Seller bidding on own lot |
| `RATE_LIMITED` | 429 | |
| `VALIDATION_ERROR` | 422 | Zod failure, `details[]` included |

**Never returned to any client:** `Auction.reservePrice`, `Auction.leaderMaxBid`, `Bid.maxAmount` (except to the bid's own owner), `User.cnicHash`.

---

## Server actions

### `placeBid(input)`
`src/app/auctions/[slug]/actions.ts`

```ts
input: { listingId: string; maxAmount: number }

returns:
  | { ok: true; outcome: 'LEADING';  currentPrice: number; yourMax: number; endsAt: string; extended: boolean }
  | { ok: true; outcome: 'OUTBID';   currentPrice: number; leaderIsYou: false; message: string }
  | { ok: false; error: ApiError }
```

**Server sequence**
1. `auth()` → require session
2. Require `tier ≥ PHONE`; `tier ≥ CNIC` if `currentPrice > 5_000_000`
3. Reject if `session.user.id === listing.sellerId` → `SELF_BID`
4. Rate limit: 10 bids / minute / user
5. `BEGIN` → `SELECT … FROM "Auction" WHERE id = $1 FOR UPDATE`
6. Assert `status = LIVE` and `now < endsAt` → else `AUCTION_NOT_LIVE`
7. `engine.resolveBid(state, { bidderId, maxAmount })` — pure
8. If `endsAt − now < 180s` → `endsAt += 180s`, `extensionCount++`
9. Insert bid row(s); update auction aggregate; mark prior leader `OUTBID`
10. `COMMIT`
11. Broadcast `auction:{id}` → `{ currentPrice, bidCount, endsAt, leaderHandle }`
12. Enqueue outbid notification
13. `revalidatePath('/auctions/[slug]')`

**Idempotency:** a duplicate `(bidderId, auctionId, maxAmount)` within 3 seconds is a no-op returning the current state — protects against double-submit.

---

### Other actions

| Action | File | Input | Notes |
|---|---|---|---|
| `toggleWatchlist` | `actions/watchlist.ts` | `{ listingId }` | Returns `{ watching, watchCount }` |
| `createListing` | `sell/new/actions.ts` | Full wizard payload | → `PENDING_REVIEW`, returns `slug` |
| `saveListingDraft` | `sell/new/actions.ts` | Partial payload | Autosave, upsert by `draftId` |
| `submitOffer` | `actions/offers.ts` | `{ listingId, amount, message? }` | Classifieds + reserve-not-met |
| `respondToOffer` | `actions/offers.ts` | `{ offerId, action, counterAmount? }` | Seller only |
| `bookInspection` | `inspection/book/actions.ts` | `{ package, city, isDoorstep, address?, scheduledAt, listingId? }` | Returns `reference` |
| `saveSearch` | `actions/search.ts` | `{ name, query, alertFrequency }` | |
| `sendMessage` | `actions/messages.ts` | `{ conversationId, body }` | Phone/email regex stripped |

---

## Route handlers

### `GET /api/auctions`
| Param | Type | Default |
|---|---|---|
| `status` | `live \| upcoming \| ended` | `live` |
| `make` `model` `city` `bodyType` `fuel` `transmission` | string (repeatable) | — |
| `yearMin` `yearMax` `priceMin` `priceMax` `mileageMax` | int | — |
| `certified` `noReserve` | boolean | — |
| `sort` | `ending \| newest \| price_asc \| price_desc \| mileage \| score` | `ending` |
| `page` `perPage` | int | `1`, `24` |

```json
{
  "data": [{
    "id": "cl_…", "slug": "honda-civic-rs-turbo-2019-lhr-4f9a",
    "title": "2019 Honda Civic RS Turbo",
    "make": "Honda", "model": "Civic", "year": 2019,
    "mileageKm": 48000, "city": "Lahore",
    "image": "https://…", "blurhash": "L6…",
    "auction": {
      "status": "LIVE", "currentPrice": 6250000, "bidCount": 23,
      "bidderCount": 9, "endsAt": "2026-08-02T14:00:00Z",
      "reserveStatus": "MET", "nextMinimumBid": 6300000, "increment": 50000,
      "extensionCount": 0
    },
    "isCertified": true, "inspectionScore": 8.4, "inspectionGrade": "A"
  }],
  "meta": { "page": 1, "perPage": 24, "total": 312, "totalPages": 13 }
}
```
Cache: `s-maxage=30, stale-while-revalidate=120`

---

### `GET /api/auctions/[slug]`
Full lot: listing, images, seller (public fields), auction state, inspection summary, last 50 bids.
Live lots: `no-store`. Ended lots: `s-maxage=3600`.

### `POST /api/bids`
JSON mirror of `placeBid`. Same validation, same errors. Body `{ listingId, maxAmount }`.

### `GET /api/bids?auctionId=…`
Public bid log — `{ handle, amount, isAutoBid, placedAt }`. `maxAmount` omitted.

### `GET /api/listings` / `GET /api/listings/[slug]`
Classifieds equivalent of the auction endpoints.

### `POST /api/inspections` · `GET /api/inspections/[reference]`
Booking + status. Report body only when `status = COMPLETED`.

### `GET /api/inspections/report/[token]`
Public, unauthenticated, shareable. Full category and item tree with evidence photos.

### `GET /api/search/suggest?q=`
Typeahead: makes, models, cities, live lot titles. Edge runtime, `s-maxage=300`.

### `GET /api/stats`
Homepage counters: `{ liveAuctions, carsSold, inspectionsCompleted, registeredBidders, gmvThisMonth }`. `s-maxage=300`.

---

## Cron

### `GET /api/cron/close-auctions` — `*/1 * * * *`
`Authorization: Bearer ${CRON_SECRET}`

```sql
SELECT * FROM "Auction"
WHERE status = 'LIVE' AND "endsAt" <= now()
FOR UPDATE SKIP LOCKED;
```

| Condition | Result |
|---|---|
| Bids ∧ (no reserve ∨ reserve met) | `SOLD` · create `Order` · notify both parties |
| Bids ∧ reserve not met | `RESERVE_NOT_MET` · open 24h best-offer window for high bidder |
| No bids | `ENDED_NO_BIDS` · offer free relist |

Response: `{ processed, sold, reserveNotMet, noBids, durationMs }`

### `GET /api/cron/ending-soon` — `0 * * * *`
Notifies watchers of lots ending within 60 minutes.

### `GET /api/cron/search-alerts` — `0 */6 * * *`
Matches new listings against `SavedSearch` and dispatches digests.

---

## Realtime

Channel `auction:{auctionId}` (Supabase Realtime).

| Event | Payload |
|---|---|
| `bid` | `{ currentPrice, bidCount, bidderCount, leaderHandle, placedAt }` |
| `extended` | `{ endsAt, extensionCount }` |
| `closed` | `{ status, soldPrice? }` |

Clients reconcile against the RSC-rendered initial state; on reconnect they refetch `/api/auctions/[slug]` rather than replaying missed events.

---

## Rate limits

| Endpoint | Limit |
|---|---|
| `placeBid` / `POST /api/bids` | 10 / min / user |
| `createListing` | 5 / hour / user |
| `sendMessage` | 30 / min / user |
| `POST /api/inspections` | 10 / hour / user |
| Public GET endpoints | 120 / min / IP |
