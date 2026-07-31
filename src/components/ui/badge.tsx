import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-medium leading-none whitespace-nowrap [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-line bg-surface-2 text-muted",
        brand: "border-brand-700 bg-brand-900/70 text-brand-300",
        gold: "border-gold/40 bg-gold/10 text-gold-soft",
        danger: "border-danger/45 bg-danger/10 text-danger-soft",
        live: "border-brand-500/50 bg-brand-500/12 text-brand-300",
        outline: "border-line-strong bg-transparent text-muted",
        solid: "border-transparent bg-brand-500 text-ink font-semibold",
      },
      size: {
        sm: "h-5 px-2 text-[10.5px] tracking-wide [&_svg]:size-3",
        md: "h-6 px-2.5 text-[11.5px] [&_svg]:size-3.5",
        lg: "h-7 px-3 text-xs [&_svg]:size-3.5",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { badgeVariants };
