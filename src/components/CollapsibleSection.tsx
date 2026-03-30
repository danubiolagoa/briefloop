"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  description,
  defaultOpen = false,
  children
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-[24px] border border-border bg-surface shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-5 py-5 text-left"
      >
        <div>
          <h3 className="text-base font-semibold text-text-primary">{title}</h3>
          {description ? <p className="mt-1 text-sm leading-6 text-text-secondary">{description}</p> : null}
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-text-secondary transition-transform", open ? "rotate-180" : "")} />
      </button>
      {open ? <div className="border-t border-border px-5 py-5">{children}</div> : null}
    </section>
  );
}
