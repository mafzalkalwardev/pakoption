"use client";

import * as React from "react";
import { Clock, Zap } from "lucide-react";
import { getTimeParts, formatTimeParts, type TimeParts } from "@/lib/auction/engine";
import { cn } from "@/lib/utils";

/**
 * A single shared ticker drives every countdown on the page.
 *
 * A grid of 24 auction cards each running its own setInterval is 24 timers and
 * 24 independent re-render cascades per second. One rAF loop with a 1Hz gate
 * broadcasting to subscribers is one.
 */
const subscribers = new Set<(now: number) => void>();
let rafId: number | null = null;
let lastTick = 0;

function loop(t: number) {
  if (t - lastTick >= 1000) {
    lastTick = t;
    const now = Date.now();
    subscribers.forEach((fn) => fn(now));
  }
  rafId = requestAnimationFrame(loop);
}

function subscribe(fn: (now: number) => void) {
  subscribers.add(fn);
  if (rafId === null && typeof window !== "undefined") {
    rafId = requestAnimationFrame(loop);
  }
  return () => {
    subscribers.delete(fn);
    if (subscribers.size === 0 && rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
}

export function useCountdown(endsAt: string | Date): TimeParts {
  const end = React.useMemo(
    () => (typeof endsAt === "string" ? new Date(endsAt) : endsAt),
    [endsAt],
  );

  // Server time and client time will differ by the network round trip, so the
  // rendered string can't match exactly. Every element that prints a countdown
  // carries suppressHydrationWarning; seeding from Date.now() means the first
  // paint shows a real value rather than flashing "Ended".
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    setNow(Date.now());
    return subscribe(setNow);
  }, []);

  return React.useMemo(() => getTimeParts(end, new Date(now)), [end, now]);
}

/* -------------------------------------------------------------------------- */

export function Countdown({
  endsAt,
  className,
  showIcon = true,
  size = "md",
}: {
  endsAt: string | Date;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const p = useCountdown(endsAt);

  const sizes = {
    sm: "text-[13px]",
    md: "text-[15px]",
    lg: "text-xl",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono font-semibold tnum",
        sizes[size],
        p.isOver
          ? "text-muted-2"
          : p.isUrgent
            ? "text-danger"
            : "text-ivory",
        className,
      )}
    >
      {showIcon &&
        (p.isExtendable ? (
          <Zap className="size-3.5 shrink-0" aria-hidden />
        ) : (
          <Clock className="size-3.5 shrink-0" aria-hidden />
        ))}
      <time
        data-countdown
        dateTime={new Date(endsAt).toISOString()}
        suppressHydrationWarning
      >
        {formatTimeParts(p)}
      </time>
      <span className="sr-only">
        {p.isOver
          ? "Auction has ended"
          : `Time remaining: ${formatTimeParts(p)}`}
      </span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */

/** Large segmented display used on the lot detail page. */
export function CountdownBlocks({
  endsAt,
  className,
}: {
  endsAt: string | Date;
  className?: string;
}) {
  const p = useCountdown(endsAt);
  const pad = (n: number) => String(n).padStart(2, "0");

  const blocks = p.days > 0
    ? ([
        [pad(p.days), "days"],
        [pad(p.hours), "hrs"],
        [pad(p.minutes), "min"],
        [pad(p.seconds), "sec"],
      ] as const)
    : ([
        [pad(p.hours), "hrs"],
        [pad(p.minutes), "min"],
        [pad(p.seconds), "sec"],
      ] as const);

  if (p.isOver) {
    return (
      <div className={cn("text-lg font-semibold text-muted-2", className)}>
        Auction ended
      </div>
    );
  }

  return (
    <div className={cn("flex items-stretch gap-2", className)}>
      {blocks.map(([value, unit]) => (
        <div
          key={unit}
          className={cn(
            "flex min-w-14 flex-col items-center rounded-md border px-2.5 py-2",
            p.isUrgent
              ? "border-danger/40 bg-danger/8"
              : "border-line bg-ink-2",
          )}
        >
          <span
            data-countdown
            suppressHydrationWarning
            className={cn(
              "font-mono text-xl font-semibold leading-none tnum",
              p.isUrgent ? "text-danger" : "text-ivory",
            )}
          >
            {value}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-widest text-muted-2">
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Status pill. Note that urgency is conveyed by icon + text + colour, never by
 * colour alone — a red badge reading "Live" would fail WCAG 1.4.1.
 */
export function AuctionStatusPill({
  endsAt,
  startsAt,
  className,
}: {
  endsAt: string | Date;
  startsAt?: string | Date;
  className?: string;
}) {
  const p = useCountdown(endsAt);
  const notStarted =
    startsAt !== undefined && new Date(startsAt).getTime() > Date.now();

  if (notStarted) {
    return (
      <span
        className={cn(
          "inline-flex h-6 items-center gap-1.5 rounded-full border border-line bg-surface-2/90 px-2.5 text-[11px] font-medium text-muted backdrop-blur-sm",
          className,
        )}
      >
        <Clock className="size-3" aria-hidden />
        Upcoming
      </span>
    );
  }

  if (p.isOver) {
    return (
      <span
        className={cn(
          "inline-flex h-6 items-center gap-1.5 rounded-full border border-line bg-surface-2/90 px-2.5 text-[11px] font-medium text-muted-2 backdrop-blur-sm",
          className,
        )}
      >
        Ended
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold backdrop-blur-sm",
        p.isUrgent
          ? "border-danger/50 bg-danger/15 text-danger-soft"
          : "border-brand-500/50 bg-brand-500/15 text-brand-300",
        className,
      )}
    >
      <span className="live-dot" data-urgent={p.isUrgent} aria-hidden />
      {p.isExtendable ? "Extending" : p.isUrgent ? "Ending soon" : "Live"}
    </span>
  );
}
