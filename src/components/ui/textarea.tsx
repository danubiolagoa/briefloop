import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[108px] w-full rounded-2xl border border-border bg-white/[0.03] px-4 py-3 text-sm leading-6 text-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] placeholder:text-text-secondary transition-all duration-200 hover:border-white/15 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
