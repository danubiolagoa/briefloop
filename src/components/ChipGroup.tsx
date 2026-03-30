"use client";

import { cn } from "@/lib/utils";

interface ChipGroupProps {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  columns?: "two" | "three";
}

export function ChipGroup({ options, selected, onToggle, columns = "two" }: ChipGroupProps) {
  return (
    <div className={cn("grid gap-2", columns === "three" ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2")}>
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={cn(
              "group chip-spring rounded-2xl border px-4 py-3 text-left text-sm leading-6 transition-all duration-200",
              active
                ? "border-accent/60 bg-[linear-gradient(180deg,rgba(245,158,11,0.14),rgba(245,158,11,0.04))] text-text-primary shadow-[0_12px_28px_rgba(245,158,11,0.12)]"
                : "border-border bg-white/[0.03] text-text-secondary hover:border-white/15 hover:bg-surface hover:text-text-primary"
            )}
          >
            <span className="flex items-start justify-between gap-3">
              <span>{option}</span>
              <span
                className={cn(
                  "mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full transition-all duration-300",
                  active ? "bg-accent scale-110 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-white/10 group-hover:bg-white/20"
                )}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}
