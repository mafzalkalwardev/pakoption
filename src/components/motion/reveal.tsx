"use client";

import * as React from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { useReducedMotion } from "./motion-provider";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "none";

const OFFSET: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 32 },
  down: { x: 0, y: -32 },
  left: { x: 32, y: 0 },
  right: { x: -32, y: 0 },
  none: { x: 0, y: 0 },
};

export interface RevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  duration?: number;
  /** Play once (default) so scrolling back up doesn't replay everything. */
  once?: boolean;
  /** Fraction of the element that must be visible before it plays. */
  amount?: number;
  id?: string;
}

/**
 * The workhorse entry animation: fade plus a 32px translate, triggered when
 * 20% of the element enters the viewport.
 *
 * When motion is reduced this renders a plain <div> with no transform at all —
 * not a zero-duration animation, which still costs a composite layer.
 */
export function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.52,
  once = true,
  amount = 0.2,
  id,
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount });
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className={className} id={id}>
        {children}
      </div>
    );
  }

  const off = OFFSET[direction];

  return (
    <motion.div
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, x: off.x, y: off.y }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : undefined}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Stagger                                                                    */
/* -------------------------------------------------------------------------- */

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export function StaggerGroup({
  children,
  className,
  amount = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  amount?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Text reveal — line-by-line mask wipe                                       */
/* -------------------------------------------------------------------------- */

export function TextReveal({
  lines,
  className,
  lineClassName,
  delay = 0,
}: {
  lines: React.ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();

  return (
    <div ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          {reduced ? (
            <span className={cn("block", lineClassName)}>{line}</span>
          ) : (
            <motion.span
              className={cn("block", lineClassName)}
              initial={{ y: "110%" }}
              animate={inView ? { y: "0%" } : undefined}
              transition={{
                duration: 0.8,
                delay: delay + i * 0.09,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {line}
            </motion.span>
          )}
        </span>
      ))}
    </div>
  );
}
