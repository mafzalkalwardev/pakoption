"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gauge, Heart, MapPin, ShieldCheck, Users } from "lucide-react";
import { AuctionStatusPill, Countdown } from "./countdown";
import { Badge } from "@/components/ui/badge";
import { useReducedMotion } from "@/components/motion/motion-provider";
import { formatMileage, formatPKR, label } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ListingCard as ListingCardType } from "@/types";

export function ListingCard({
  listing,
  priority = false,
  className,
}: {
  listing: ListingCardType;
  priority?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [watching, setWatching] = React.useState(false);

  const isAuction = listing.type === "AUCTION";
  const href = `${isAuction ? "/auctions" : "/buy"}/${listing.slug}`;
  const price = listing.auction?.currentPrice ?? listing.askingPrice ?? 0;
  const ended = listing.auction?.status
    ? ["SOLD", "RESERVE_NOT_MET", "ENDED_NO_BIDS"].includes(
        listing.auction.status,
      )
    : false;

  const card = (
    <article className="edge-light flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-card transition-[border-color,box-shadow] duration-300 group-hover:border-line-strong group-hover:shadow-lift">
        {/* ---------- Media ---------- */}
        <div className="relative aspect-video overflow-hidden bg-ink-2">
          <Link href={href} className="block h-full w-full">
            <Image
              src={listing.image}
              alt={listing.imageAlt}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={cn(
                "object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                !reduced && "group-hover:scale-[1.06]",
                ended && "opacity-65",
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/5 to-ink/45" />
          </Link>

          {/* top row */}
          <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            {listing.auction ? (
              <AuctionStatusPill
                endsAt={listing.auction.endsAt}
                startsAt={listing.auction.startsAt}
              />
            ) : (
              <Badge variant="outline" size="sm" className="backdrop-blur-sm">
                Classified
              </Badge>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setWatching((w) => !w);
              }}
              aria-pressed={watching}
              aria-label={watching ? "Remove from watchlist" : "Add to watchlist"}
              className="pointer-events-auto grid size-8 place-items-center rounded-full border border-line bg-ink/70 text-muted backdrop-blur-sm transition-colors hover:border-danger/50 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <Heart
                className={cn(
                  "size-4 transition-transform duration-200",
                  watching && "fill-danger text-danger scale-110",
                )}
              />
            </button>
          </div>

          {/* bottom row */}
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {listing.isCertified && (
                <Badge variant="gold" size="sm" className="backdrop-blur-sm">
                  <ShieldCheck aria-hidden />
                  Certified
                </Badge>
              )}
              {listing.auction?.reserveStatus === "NO_RESERVE" && (
                <Badge variant="gold" size="sm" className="backdrop-blur-sm">
                  No reserve
                </Badge>
              )}
              {listing.isFeatured && !listing.isCertified && (
                <Badge variant="brand" size="sm" className="backdrop-blur-sm">
                  Featured
                </Badge>
              )}
            </div>

            {listing.inspectionScore !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-full border border-line bg-ink/70 px-2 py-0.5 text-[11px] font-semibold text-brand-300 backdrop-blur-sm">
                <Gauge className="size-3" aria-hidden />
                <span className="tnum">{listing.inspectionScore.toFixed(1)}</span>
                <span className="text-muted-2">/10</span>
              </span>
            )}
          </div>
        </div>

        {/* ---------- Body ---------- */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-ivory">
            <Link
              href={href}
              className="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {listing.title}
            </Link>
          </h3>

          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-muted">
            <span>{formatMileage(listing.mileageKm)}</span>
            <span className="text-muted-2">·</span>
            <span>{label(listing.transmission)}</span>
            <span className="text-muted-2">·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" aria-hidden />
              {listing.registrationCity}
            </span>
          </p>

          <div className="mt-auto pt-4">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <span className="block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                  {isAuction
                    ? ended
                      ? listing.auction?.status === "SOLD"
                        ? "Sold for"
                        : "Final bid"
                      : listing.auction?.bidCount
                        ? "Current bid"
                        : "Starting bid"
                    : "Asking price"}
                </span>
                <span
                  data-price
                  className="mt-0.5 block truncate font-mono text-lg font-semibold tracking-tight text-gold tnum"
                >
                  {formatPKR(price)}
                </span>
              </div>

              <div className="shrink-0 text-right">
                {listing.auction && !ended ? (
                  <>
                    <span className="block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                      Ends in
                    </span>
                    <Countdown
                      endsAt={listing.auction.endsAt}
                      size="sm"
                      showIcon={false}
                      className="mt-0.5"
                    />
                  </>
                ) : listing.type === "CLASSIFIED" ? (
                  <span className="inline-flex items-center gap-1 text-[12px] text-muted">
                    <Users className="size-3.5" aria-hidden />
                    {listing.watchCount} watching
                  </span>
                ) : null}
              </div>
            </div>

            {listing.auction && (
              <p className="mt-2.5 flex items-center gap-2 border-t border-line pt-2.5 text-[11.5px] text-muted">
                <span className="tnum">{listing.auction.bidCount} bids</span>
                <span className="text-muted-2">·</span>
                <span
                  className={cn(
                    listing.auction.reserveStatus === "MET" && "text-brand-400",
                    listing.auction.reserveStatus === "NO_RESERVE" && "text-gold",
                  )}
                >
                  {label(listing.auction.reserveStatus)}
                </span>
                {listing.auction.extensionCount > 0 && (
                  <>
                    <span className="text-muted-2">·</span>
                    <span className="text-danger-soft">Extended</span>
                  </>
                )}
              </p>
            )}
          </div>
        </div>
    </article>
  );

  // A union of "div" and motion.div can't be used as a JSX component, so the
  // reduced-motion branch returns a plain element rather than a zero-duration
  // animated one.
  if (reduced) {
    return <div className={cn("group h-full", className)}>{card}</div>;
  }

  return (
    <motion.div
      className={cn("group h-full", className)}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
    >
      {card}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */

/** Compact horizontal card used in the home page ticker. */
export function TickerCard({ listing }: { listing: ListingCardType }) {
  const href = `${listing.type === "AUCTION" ? "/auctions" : "/buy"}/${listing.slug}`;
  const price = listing.auction?.currentPrice ?? listing.askingPrice ?? 0;

  return (
    <Link
      href={href}
      className="flex w-72 shrink-0 items-center gap-3 rounded-lg border border-line bg-surface p-2.5 transition-colors hover:border-brand-700 hover:bg-surface-2"
    >
      <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-ink-2">
        <Image
          src={listing.image}
          alt=""
          fill
          sizes="56px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-ivory">
          {listing.title}
        </p>
        <p className="mt-0.5 flex items-center gap-2 text-[12px]">
          <span data-price className="font-mono font-semibold text-gold tnum">
            {formatPKR(price)}
          </span>
          {listing.auction && (
            <Countdown
              endsAt={listing.auction.endsAt}
              size="sm"
              showIcon={false}
              className="text-[11px] text-muted"
            />
          )}
        </p>
      </div>
    </Link>
  );
}
