"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { useReducedMotion } from "@/components/motion/motion-provider";
import { cn } from "@/lib/utils";
import type { InspectionGrade } from "@/types";

const GRADE_COLOUR: Record<InspectionGrade, string> = {
  A: "#2DD48A",
  B: "#12B76A",
  C: "#F5B301",
  D: "#E5484D",
};

const GRADE_LABEL: Record<InspectionGrade, string> = {
  A: "Excellent",
  B: "Good",
  C: "Fair",
  D: "Poor",
};

/**
 * Circular gauge for the overall inspection score.
 *
 * Animates `stroke-dashoffset` (a compositor-friendly property) on scroll into
 * view. With reduced motion the arc renders at its final length immediately.
 */
export function ScoreRing({
  score,
  grade,
  size = 140,
  strokeWidth = 9,
  showLabel = true,
  className,
}: {
  score: number;
  grade: InspectionGrade;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // 300° sweep so the ring reads as a gauge, not a pie chart.
  const arcFraction = 300 / 360;
  const arcLength = circumference * arcFraction;
  const filled = arcLength * (Math.min(10, Math.max(0, score)) / 10);
  const colour = GRADE_COLOUR[grade];

  const shouldFill = reduced || inView;

  return (
    <div
      ref={ref}
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Inspection score ${score.toFixed(1)} out of 10, grade ${grade} — ${GRADE_LABEL[grade]}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-[150deg]"
        aria-hidden
      >
        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#17392B"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
        />
        {/* value */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colour}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset: shouldFill ? arcLength - filled : arcLength }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }
          }
          style={{ filter: `drop-shadow(0 0 8px ${colour}55)` }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-mono font-semibold leading-none tracking-tight tnum"
          style={{ color: colour, fontSize: size * 0.26 }}
        >
          {score.toFixed(1)}
        </span>
        <span
          className="mt-1 font-medium text-muted-2"
          style={{ fontSize: size * 0.085 }}
        >
          / 10
        </span>
        {showLabel && (
          <span
            className="mt-1.5 rounded-full border px-2 py-0.5 font-semibold leading-none"
            style={{
              fontSize: size * 0.078,
              color: colour,
              borderColor: `${colour}55`,
              backgroundColor: `${colour}14`,
            }}
          >
            Grade {grade}
          </span>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function CategoryBar({
  name,
  score,
  itemsPassed,
  itemsTotal,
  delay = 0,
}: {
  name: string;
  score: number;
  itemsPassed: number;
  itemsTotal: number;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const colour =
    score >= 8.5
      ? "#2DD48A"
      : score >= 7
        ? "#12B76A"
        : score >= 5
          ? "#F5B301"
          : "#E5484D";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13.5px] font-medium text-ivory">{name}</span>
        <span className="flex items-baseline gap-2 text-[12px] text-muted-2">
          <span className="tnum">
            {itemsPassed}/{itemsTotal}
          </span>
          <span
            className="font-mono text-[13.5px] font-semibold tnum"
            style={{ color: colour }}
          >
            {score.toFixed(1)}
          </span>
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full border border-line bg-ink-2">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: colour }}
          initial={{ width: reduced ? `${score * 10}%` : 0 }}
          whileInView={{ width: `${score * 10}%` }}
          viewport={{ once: true, amount: 0.5 }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }
          }
        />
      </div>
    </div>
  );
}
