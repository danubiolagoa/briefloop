"use client";

import { Sparkles } from "lucide-react";

import { PresetRecord } from "@/lib/briefloop";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PresetPickerProps {
  title: string;
  description: string;
  presets: PresetRecord[];
  activePresetId: string | null;
  onApply: (preset: PresetRecord) => void;
}

export function PresetPicker({
  title,
  description,
  presets,
  activePresetId,
  onApply
}: PresetPickerProps) {
  return (
    <Card className="overflow-hidden rounded-[24px] border-border shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
      <CardHeader className="space-y-3 border-b border-border bg-[linear-gradient(180deg,rgba(245,158,11,0.1),rgba(30,41,59,0.16))] p-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
            <Sparkles className="h-4 w-4 text-accent" />
          </span>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-text-secondary">{description}</p>
      </CardHeader>
      <CardContent className="grid gap-3 p-6 md:grid-cols-2">
        {presets.map((preset) => {
          const active = preset.id === activePresetId;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApply(preset)}
              className={`w-full rounded-[22px] border px-5 py-5 text-left transition-all duration-200 ${
                active
                  ? "border-accent/60 bg-[linear-gradient(180deg,rgba(245,158,11,0.14),rgba(245,158,11,0.04))] shadow-[0_18px_40px_rgba(245,158,11,0.12)]"
                  : "border-border bg-white/[0.03] hover:-translate-y-0.5 hover:border-white/15 hover:bg-surface"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{preset.name}</p>
                  <p className="mt-1 max-w-xl text-sm leading-6 text-text-secondary">{preset.description ?? "Sem descrição."}</p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center justify-center rounded-2xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                    active ? "border-accent/50 text-amber-200" : "border-border text-text-secondary"
                  }`}
                >
                  {active ? "Ativo" : "Aplicar"}
                </span>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
