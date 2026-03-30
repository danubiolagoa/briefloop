import * as React from "react";

import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex min-h-[44px] items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60",
          variant === "primary"
            ? "bg-accent text-slate-900 shadow-[0_14px_32px_rgba(245,158,11,0.22)] hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[0_18px_36px_rgba(245,158,11,0.28)]"
            : "border border-border bg-white/[0.02] text-text-secondary hover:-translate-y-0.5 hover:border-white/20 hover:bg-surface-raised hover:text-text-primary",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
