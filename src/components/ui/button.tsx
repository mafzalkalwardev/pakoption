import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md",
    "font-medium tracking-tight select-none",
    "transition-[background,box-shadow,transform,color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
    "disabled:pointer-events-none disabled:opacity-45",
    "active:translate-y-px",
    "[&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-brand-500 to-brand-600 text-ink font-semibold shadow-[0_1px_0_0_rgba(255,255,255,0.18)_inset,0_8px_24px_-8px_rgba(18,183,106,0.55)] hover:from-brand-400 hover:to-brand-500 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_12px_32px_-8px_rgba(18,183,106,0.7)]",
        gold: "bg-gradient-to-b from-gold-soft to-gold text-ink font-semibold shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_8px_24px_-8px_rgba(245,179,1,0.5)] hover:brightness-110",
        secondary:
          "bg-surface-2 text-ivory border border-line hover:bg-[#12362a] hover:border-line-strong",
        outline:
          "border border-line-strong bg-transparent text-ivory hover:bg-surface hover:border-brand-700",
        ghost: "bg-transparent text-muted hover:bg-surface-2 hover:text-ivory",
        danger:
          "bg-danger text-white font-semibold hover:brightness-110 shadow-[0_8px_24px_-8px_rgba(229,72,77,0.6)]",
        link: "text-brand-400 underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-9 px-3.5 text-[13px] [&_svg]:size-4",
        md: "h-11 px-5 text-sm [&_svg]:size-4",
        lg: "h-13 px-7 text-[15px] [&_svg]:size-5",
        xl: "h-15 px-9 text-base [&_svg]:size-5",
        icon: "h-11 w-11 [&_svg]:size-5",
        "icon-sm": "h-9 w-9 [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading, children, disabled, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            <span className="sr-only">Loading</span>
            <span aria-hidden className="opacity-70">
              {children}
            </span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
