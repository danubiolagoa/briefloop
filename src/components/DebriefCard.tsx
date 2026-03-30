"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface DebriefItem {
  id: string;
  source?: "server" | "local";
  created_at: string;
  campaign_name: string;
  channel: string;
  objective: string;
  metrics: Record<string, number> | null;
  generated_summary: string | null;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

export function DebriefCard({ item }: { item: DebriefItem }) {
  const [expanded, setExpanded] = useState(false);

  const summaryText = item.generated_summary ?? "Sem resumo gerado.";
  const truncated = useMemo(() => {
    if (summaryText.length <= 150) {
      return summaryText;
    }
    return `${summaryText.slice(0, 150)}...`;
  }, [summaryText]);

  const metrics = item.metrics ?? {};
  const metricLabels = [
    metrics.reach ? `Alcance ${metrics.reach}` : null,
    metrics.clicks ? `Cliques ${metrics.clicks}` : null,
    metrics.conversions ? `Conversões ${metrics.conversions}` : null,
    metrics.roas ? `ROAS ${metrics.roas}` : null
  ].filter(Boolean) as string[];

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">{item.campaign_name}</CardTitle>
          <p className="text-xs text-text-secondary">{formatDate(item.created_at)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{item.channel}</Badge>
          <Badge>{item.objective}</Badge>
          {item.source === "local" ? <Badge>demo local</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {metricLabels.length ? <p className="text-xs text-text-secondary">{metricLabels.join(" · ")}</p> : null}
        <p className="whitespace-pre-wrap text-sm text-text-secondary">{expanded ? summaryText : truncated}</p>
        {summaryText.length > 150 ? (
          <button
            type="button"
            className="text-xs text-accent hover:underline"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? "Ver menos" : "Ver mais"}
          </button>
        ) : null}
        <Link
          href={`/brief?channel=${encodeURIComponent(item.channel)}&objective=${encodeURIComponent(item.objective)}&debriefId=${encodeURIComponent(item.id)}&source=${item.source ?? "server"}`}
          className="inline-flex w-full items-center justify-center rounded-xl border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-raised sm:w-auto"
        >
          Usar como base para brief
        </Link>
      </CardContent>
    </Card>
  );
}
