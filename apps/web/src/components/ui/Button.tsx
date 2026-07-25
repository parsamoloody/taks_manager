import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "~/lib/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  isLoading?: boolean;
}

const VARIANTS = {
  primary:
    "bg-white text-slate-950 shadow-[0_10px_28px_-14px_rgba(255,255,255,0.75)] hover:-translate-y-0.5 hover:bg-sky-50",
  secondary:
    "border border-white/15 bg-white/[0.07] text-white hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.12]",
  ghost: "text-slate-300 hover:bg-white/[0.08] hover:text-white",
  danger:
    "bg-rose-500/90 text-white shadow-[0_10px_28px_-14px_rgba(244,63,94,0.75)] hover:-translate-y-0.5 hover:bg-rose-500",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      isLoading,
      className,
      children,
      disabled,
      type = "button",
      ...rest
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transform-none",
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {isLoading && (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
        />
      )}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
