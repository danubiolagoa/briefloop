import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "warning" | "success";

interface BadgeProps extends React.ComponentProps<"span"> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-border bg-surface-raised text-text-secondary",
  warning: "border-amber-500/50 bg-amber-500/10 text-amber-400",
  success: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
