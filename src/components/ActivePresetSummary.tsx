"use client";

import { PresetRecord } from "@/lib/briefloop";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ActivePresetSummaryProps {
  preset: PresetRecord | null;
  onClear: () => void;
}

export function ActivePresetSummary({ preset, onClear }: ActivePresetSummaryProps) {
  if (!preset) {
    return null;
  }

  return (
    <Card className="overflow-hidden rounded-[24px] border-accent/30 bg-[linear-gradient(180deg,rgba(245,158,11,0.12),rgba(245,158,11,0.04))] shadow-[0_18px_44px_rgba(245,158,11,0.08)]">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200">Preset aplicado</p>
          <p className="mt-2 text-base font-semibold text-text-primary">{preset.name}</p>
          <p className="mt-1 text-sm leading-6 text-text-secondary">{preset.description ?? "Base pré-preenchida para acelerar o fluxo."}</p>
        </div>
        <Button type="button" variant="secondary" onClick={onClear}>
          Remover preset
        </Button>
      </CardContent>
    </Card>
  );
}
