"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "./motion-provider";

/**
 * Infinite horizontal scroller. Children are duplicated once and the track is
 * translated -50%, so the loop is seamless. Pure CSS — no rAF, no layout
 * thrash — and it pauses on hover so users can actually read a lot they spot.
 */
export function Marquee({
  children,
  speed = "normal",
  reverse = false,
  pauseOnHover = true,
  className,
}: {
  children: React.ReactNode;
  speed?: "normal" | "slow";
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className={cn("no-scrollbar overflow-x-auto", className)}>
        <div className="flex w-max gap-4">{children}</div>
      </div>
    );
  }

  return (
    <div className={cn("mask-edges group overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max gap-4",
          speed === "slow" ? "animate-marquee-slow" : "animate-marquee",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
      >
        <div className="flex shrink-0 gap-4">{children}</div>
        <div className="flex shrink-0 gap-4" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
