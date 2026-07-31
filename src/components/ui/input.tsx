import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-11 w-full rounded-md border border-line bg-ink-2 px-3.5 py-2 text-sm text-ivory",
      "placeholder:text-muted-2",
      "transition-colors duration-200",
      "hover:border-line-strong",
      "focus-visible:outline-none focus-visible:border-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500/25",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/25",
      "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ivory",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-28 w-full rounded-md border border-line bg-ink-2 px-3.5 py-2.5 text-sm leading-relaxed text-ivory",
      "placeholder:text-muted-2 resize-y",
      "transition-colors duration-200 hover:border-line-strong",
      "focus-visible:outline-none focus-visible:border-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500/25",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-[invalid=true]:border-danger",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "block text-[13px] font-medium text-ivory mb-1.5",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
      className,
    )}
    {...props}
  />
));
Label.displayName = "Label";

export function FieldHint({
  children,
  error,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & { error?: boolean }) {
  return (
    <p
      className={cn(
        "mt-1.5 text-xs leading-relaxed",
        error ? "text-danger-soft" : "text-muted-2",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

/** Input with a leading unit prefix — used for every PKR field. */
export const CurrencyInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <div className="relative">
    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-2">
      PKR
    </span>
    <input
      ref={ref}
      inputMode="numeric"
      className={cn(
        "flex h-12 w-full rounded-md border border-line bg-ink-2 pl-13 pr-3.5 text-base font-semibold text-ivory tnum",
        "placeholder:font-normal placeholder:text-muted-2",
        "transition-colors duration-200 hover:border-line-strong",
        "focus-visible:outline-none focus-visible:border-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500/25",
        "aria-[invalid=true]:border-danger",
        className,
      )}
      {...props}
    />
  </div>
));
CurrencyInput.displayName = "CurrencyInput";
