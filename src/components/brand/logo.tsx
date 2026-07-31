import { cn } from "@/lib/utils";

/**
 * The PakOption mark: a 270° gauge arc (speed, price discovery) whose needle
 * terminates in a gold gavel head (the hammer price). Inline SVG rather than
 * an <img> so it can inherit colour and animate.
 */
export function LogoMark({
  className,
  animated = false,
}: {
  className?: string;
  animated?: boolean;
}) {
  const uid = animated ? "anim" : "static";
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("size-9", className)}
      role="img"
      aria-label="PakOption"
      fill="none"
    >
      <defs>
        <linearGradient
          id={`po-arc-${uid}`}
          x1="8"
          y1="40"
          x2="40"
          y2="8"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#0B6B45" />
          <stop offset="45%" stopColor="#12B76A" />
          <stop offset="100%" stopColor="#5FE8AC" />
        </linearGradient>
        <linearGradient
          id={`po-gold-${uid}`}
          x1="25"
          y1="21"
          x2="37"
          y2="13"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#F5B301" />
          <stop offset="100%" stopColor="#FFD666" />
        </linearGradient>
      </defs>

      <path
        d="M10.57 37.43 A19 19 0 1 1 37.43 37.43"
        stroke={`url(#po-arc-${uid})`}
        strokeWidth="4"
        strokeLinecap="round"
        className={
          animated
            ? "[stroke-dasharray:90] [stroke-dashoffset:90] motion-safe:animate-[draw_1.4s_cubic-bezier(0.16,1,0.3,1)_forwards]"
            : undefined
        }
      />

      <g stroke="#12B76A" strokeWidth="2" strokeLinecap="round" opacity=".45">
        <path d="M13.4 34.6 15.5 32.5" />
        <path d="M24 5.6 24 8.6" />
        <path d="M34.6 34.6 32.5 32.5" />
      </g>

      <path
        d="M24 27 L29.5 19"
        stroke="#F4F7F5"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <rect
        x="25"
        y="14"
        width="12"
        height="6"
        rx="3"
        fill={`url(#po-gold-${uid})`}
        transform="rotate(34.5 31 17)"
      />
      <circle cx="24" cy="27" r="3.6" fill="#F4F7F5" />
      <circle cx="24" cy="27" r="1.5" fill="#04140E" />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  showWordmark = true,
}: {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={cn("size-9", markClassName)} />
      {showWordmark && (
        <span className="text-[19px] font-bold tracking-[-0.035em] text-ivory">
          Pak<span className="text-brand-400">Option</span>
        </span>
      )}
    </span>
  );
}
