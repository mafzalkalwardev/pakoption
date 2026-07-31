/**
 * PakOption auction engine.
 *
 * The most important file in the repository.
 *
 * Every function here is PURE — no I/O, no imports beyond types, no Date.now()
 * unless `now` is passed in. That is deliberate:
 *
 *  1. It runs on the server as the source of truth inside a DB transaction.
 *  2. It runs on the client to produce optimistic UI that always agrees with
 *     what the server is about to say.
 *  3. It is exhaustively unit-testable without a database.
 *
 * Mechanics are modelled on Bring a Trailer / eBay proxy bidding:
 * you pay one increment above the second-highest maximum, not your own maximum.
 */

import type { AuctionPhase, ReserveStatus } from "@/types";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

/** A bid inside this window extends the auction by the same amount. */
export const SOFT_CLOSE_WINDOW_MS = 3 * 60 * 1000;

/** Threshold at which the UI switches to urgent styling. */
export const ENDING_SOON_MS = 60 * 60 * 1000;

/** Buyer's premium: 2% of hammer, floored and capped. */
export const BUYERS_PREMIUM_RATE = 0.02;
export const BUYERS_PREMIUM_MIN = 15_000;
export const BUYERS_PREMIUM_MAX = 200_000;

/** Above this hammer value a bidder must be CNIC-verified. */
export const CNIC_REQUIRED_ABOVE = 5_000_000;

/** Tiered bid increments, in PKR. Ordered ascending by threshold. */
export const INCREMENT_TABLE: ReadonlyArray<{
  upTo: number;
  increment: number;
}> = [
  { upTo: 500_000, increment: 5_000 },
  { upTo: 2_000_000, increment: 10_000 },
  { upTo: 5_000_000, increment: 25_000 },
  { upTo: 10_000_000, increment: 50_000 },
  { upTo: Number.POSITIVE_INFINITY, increment: 100_000 },
];

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface AuctionState {
  startingPrice: number;
  currentPrice: number;
  bidCount: number;
  /** Server-only. The current leader's proxy ceiling. */
  leaderId?: string;
  leaderMaxBid?: number;
  reservePrice?: number;
  startsAt: Date;
  endsAt: Date;
}

export interface IncomingBid {
  bidderId: string;
  /** The bidder's maximum — the proxy ceiling, not necessarily what they pay. */
  maxAmount: number;
  placedAt: Date;
}

export type BidRejectionReason =
  | "AUCTION_NOT_LIVE"
  | "BID_TOO_LOW"
  | "SELF_BID"
  | "NOT_AN_INCREMENT";

export interface GeneratedBid {
  bidderId: string;
  amount: number;
  maxAmount: number;
  isAutoBid: boolean;
}

export type BidResolution =
  | {
      accepted: false;
      reason: BidRejectionReason;
      message: string;
      minimumBid: number;
    }
  | {
      accepted: true;
      /** True when the incoming bidder now holds the lead. */
      isLeading: boolean;
      /** The new visible high bid. */
      currentPrice: number;
      /** Who leads after resolution. */
      leaderId: string;
      /** The leader's (possibly unchanged) proxy ceiling. */
      leaderMaxBid: number;
      /**
       * Rows to insert, in order. Always contains the incoming bid; contains a
       * second auto-bid row when the previous leader's proxy defended the lot.
       */
      bidsToRecord: GeneratedBid[];
      /** Bid count after this resolution. */
      bidCount: number;
    };

/* -------------------------------------------------------------------------- */
/* Increments                                                                 */
/* -------------------------------------------------------------------------- */

/** The bid increment applicable at a given price point. */
export function getIncrement(currentPrice: number): number {
  for (const tier of INCREMENT_TABLE) {
    if (currentPrice < tier.upTo) return tier.increment;
  }
  // Unreachable — the table ends at Infinity — but keeps the compiler happy.
  return INCREMENT_TABLE[INCREMENT_TABLE.length - 1]!.increment;
}

/**
 * The lowest maximum a new bidder may submit.
 *
 * On a lot with no bids yet, the starting price itself is a valid bid.
 * Afterwards it is the current price plus one increment.
 */
export function getMinimumBid(
  currentPrice: number,
  bidCount: number,
  startingPrice?: number,
): number {
  if (bidCount === 0) return startingPrice ?? currentPrice;
  return currentPrice + getIncrement(currentPrice);
}

/** Rounds a value up to the nearest valid increment step. */
export function roundToIncrement(amount: number, currentPrice: number): number {
  const step = getIncrement(currentPrice);
  return Math.ceil(amount / step) * step;
}

/** Quick-bid suggestions rendered as chips in the bid panel. */
export function getQuickBids(
  currentPrice: number,
  bidCount: number,
  startingPrice?: number,
): number[] {
  const min = getMinimumBid(currentPrice, bidCount, startingPrice);
  const step = getIncrement(min);
  return [min, min + step, min + step * 4, min + step * 9];
}

/* -------------------------------------------------------------------------- */
/* Proxy bid resolution                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Resolve an incoming maximum bid against current auction state.
 *
 * Cases:
 *   no leader          → bidder leads at the starting price (or current price)
 *   max > leaderMax    → bidder leads at min(max, leaderMax + increment)
 *   max <= leaderMax   → leader's proxy defends at min(leaderMax, max + increment)
 *   max == leaderMax   → earlier bid wins; the leader retains at their max
 */
export function resolveBid(
  state: AuctionState,
  incoming: IncomingBid,
): BidResolution {
  const { currentPrice, bidCount, leaderId, leaderMaxBid, startingPrice } =
    state;

  if (incoming.bidderId === leaderId) {
    // Raising your own maximum: allowed, price does not move.
    const newMax = Math.max(incoming.maxAmount, leaderMaxBid ?? 0);
    if (incoming.maxAmount <= (leaderMaxBid ?? 0)) {
      return {
        accepted: false,
        reason: "BID_TOO_LOW",
        message: "Your new maximum must be higher than your current maximum.",
        minimumBid: (leaderMaxBid ?? 0) + getIncrement(currentPrice),
      };
    }
    return {
      accepted: true,
      isLeading: true,
      currentPrice,
      leaderId: incoming.bidderId,
      leaderMaxBid: newMax,
      bidsToRecord: [
        {
          bidderId: incoming.bidderId,
          amount: currentPrice,
          maxAmount: newMax,
          isAutoBid: false,
        },
      ],
      bidCount: bidCount + 1,
    };
  }

  const minimumBid = getMinimumBid(currentPrice, bidCount, startingPrice);

  if (incoming.maxAmount < minimumBid) {
    return {
      accepted: false,
      reason: "BID_TOO_LOW",
      message: `The minimum bid is PKR ${minimumBid.toLocaleString("en-PK")}.`,
      minimumBid,
    };
  }

  // First bid on the lot.
  if (!leaderId || leaderMaxBid === undefined) {
    return {
      accepted: true,
      isLeading: true,
      currentPrice: minimumBid,
      leaderId: incoming.bidderId,
      leaderMaxBid: incoming.maxAmount,
      bidsToRecord: [
        {
          bidderId: incoming.bidderId,
          amount: minimumBid,
          maxAmount: incoming.maxAmount,
          isAutoBid: false,
        },
      ],
      bidCount: bidCount + 1,
    };
  }

  // The challenger beats the incumbent's ceiling.
  if (incoming.maxAmount > leaderMaxBid) {
    const priceIfCapped = leaderMaxBid + getIncrement(leaderMaxBid);
    const newPrice = Math.min(incoming.maxAmount, priceIfCapped);

    return {
      accepted: true,
      isLeading: true,
      currentPrice: newPrice,
      leaderId: incoming.bidderId,
      leaderMaxBid: incoming.maxAmount,
      bidsToRecord: [
        {
          bidderId: incoming.bidderId,
          amount: newPrice,
          maxAmount: incoming.maxAmount,
          isAutoBid: false,
        },
      ],
      bidCount: bidCount + 1,
    };
  }

  // The incumbent's proxy defends. The challenger is outbid instantly.
  const defendedPrice = Math.min(
    leaderMaxBid,
    incoming.maxAmount + getIncrement(incoming.maxAmount),
  );

  return {
    accepted: true,
    isLeading: false,
    currentPrice: defendedPrice,
    leaderId,
    leaderMaxBid,
    bidsToRecord: [
      {
        bidderId: incoming.bidderId,
        amount: incoming.maxAmount,
        maxAmount: incoming.maxAmount,
        isAutoBid: false,
      },
      {
        bidderId: leaderId,
        amount: defendedPrice,
        maxAmount: leaderMaxBid,
        isAutoBid: true,
      },
    ],
    bidCount: bidCount + 2,
  };
}

/* -------------------------------------------------------------------------- */
/* Soft close                                                                 */
/* -------------------------------------------------------------------------- */

/** True when a bid placed at `now` should extend the auction. */
export function shouldExtend(endsAt: Date, now: Date): boolean {
  const remaining = endsAt.getTime() - now.getTime();
  return remaining > 0 && remaining < SOFT_CLOSE_WINDOW_MS;
}

/**
 * Anti-sniping. A bid inside the final 3 minutes pushes the close out to
 * 3 minutes from now — not 3 minutes from the old close — so the window is
 * always a full fresh 3 minutes. Unlimited extensions.
 */
export function applySoftClose(endsAt: Date, now: Date): Date {
  if (!shouldExtend(endsAt, now)) return endsAt;
  return new Date(now.getTime() + SOFT_CLOSE_WINDOW_MS);
}

/* -------------------------------------------------------------------------- */
/* Derived state                                                              */
/* -------------------------------------------------------------------------- */

export function getReserveStatus(
  currentPrice: number,
  reservePrice?: number,
  bidCount = 0,
): ReserveStatus {
  if (reservePrice === undefined || reservePrice === null) return "NO_RESERVE";
  if (bidCount === 0) return "NOT_MET";
  return currentPrice >= reservePrice ? "MET" : "NOT_MET";
}

export function getAuctionPhase(
  startsAt: Date,
  endsAt: Date,
  now: Date,
): AuctionPhase {
  const t = now.getTime();
  if (t < startsAt.getTime()) return "UPCOMING";
  if (t >= endsAt.getTime()) return "ENDED";
  if (endsAt.getTime() - t <= ENDING_SOON_MS) return "ENDING_SOON";
  return "LIVE";
}

/** 2% of hammer, floor PKR 15,000, cap PKR 200,000. */
export function computeBuyersPremium(hammerPrice: number): number {
  const raw = Math.round(hammerPrice * BUYERS_PREMIUM_RATE);
  return Math.min(Math.max(raw, BUYERS_PREMIUM_MIN), BUYERS_PREMIUM_MAX);
}

export function computeTotalPayable(hammerPrice: number): number {
  return hammerPrice + computeBuyersPremium(hammerPrice);
}

/** Verification tier required to bid at a given price point. */
export function requiredTierForBid(amount: number): "PHONE" | "CNIC" {
  return amount > CNIC_REQUIRED_ABOVE ? "CNIC" : "PHONE";
}

/* -------------------------------------------------------------------------- */
/* Countdown                                                                  */
/* -------------------------------------------------------------------------- */

export interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isOver: boolean;
  isUrgent: boolean;
  /** Inside the soft-close window — the UI shows an "extending" hint. */
  isExtendable: boolean;
}

export function getTimeParts(endsAt: Date, now: Date): TimeParts {
  const totalMs = Math.max(0, endsAt.getTime() - now.getTime());
  const totalSeconds = Math.floor(totalMs / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    totalMs,
    isOver: totalMs <= 0,
    isUrgent: totalMs > 0 && totalMs <= ENDING_SOON_MS,
    isExtendable: totalMs > 0 && totalMs <= SOFT_CLOSE_WINDOW_MS,
  };
}

/** `2d 14h 38m` when far out, `14:38:12` under a day, `38:12` under an hour. */
export function formatTimeParts(p: TimeParts): string {
  if (p.isOver) return "Ended";
  const pad = (n: number) => String(n).padStart(2, "0");
  if (p.days > 0) return `${p.days}d ${p.hours}h ${p.minutes}m`;
  if (p.hours > 0) return `${pad(p.hours)}:${pad(p.minutes)}:${pad(p.seconds)}`;
  return `${pad(p.minutes)}:${pad(p.seconds)}`;
}

/* -------------------------------------------------------------------------- */
/* Simulation helper — powers optimistic client UI                            */
/* -------------------------------------------------------------------------- */

/**
 * Runs the same resolution the server will run, so the bid panel can show the
 * outcome before the round trip completes. If the server later disagrees
 * (because someone else bid in the same instant) the realtime patch corrects it.
 */
export function simulateBid(
  state: AuctionState,
  bidderId: string,
  maxAmount: number,
  now: Date = new Date(),
): BidResolution {
  return resolveBid(state, { bidderId, maxAmount, placedAt: now });
}
