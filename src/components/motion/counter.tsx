"use client";

import * as React from "react";
import { useInView } from "framer-motion";
import gsap from "gsap";
import { useReducedMotion } from "./motion-provider";

export interface CounterProps {
  value: number;
  /** Applied to the tweened value on every frame. */
  format?: (n: number) => string;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

/**
 * GSAP-tweened number. When motion is reduced the final value renders
 * immediately — the information is never withheld, only the animation is.
 */
export function Counter({
  value,
  format = (n) => Math.round(n).toLocaleString("en-PK"),
  duration = 1.6,
  className,
  prefix = "",
  suffix = "",
}: CounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();
  const played = React.useRef(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      el.textContent = `${prefix}${format(value)}${suffix}`;
      return;
    }

    if (!inView || played.current) return;
    played.current = true;

    const obj = { n: 0 };
    const tween = gsap.to(obj, {
      n: value,
      duration,
      ease: "expo.out",
      onUpdate: () => {
        el.textContent = `${prefix}${format(obj.n)}${suffix}`;
      },
    });

    return () => {
      tween.kill();
    };
  }, [inView, reduced, value, duration, format, prefix, suffix]);

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {`${prefix}${format(reduced ? value : 0)}${suffix}`}
    </span>
  );
}
