"use client";

import Link from "next/link";
import { Library } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { DebriefCard, DebriefItem } from "@/components/DebriefCard";
import { Card, CardContent } from "@/components/ui/card";
import { getDemoDebriefs } from "@/lib/demo-debriefs";

interface BibliotecaClientProps {
  initialCampaigns: DebriefItem[];
  channel: string;
  objective: string;
}

export function BibliotecaClient({ initialCampaigns, channel, objective }: BibliotecaClientProps) {
  const [localCampaigns, setLocalCampaigns] = useState<DebriefItem[]>([]);

  useEffect(() => {
    const localItems = getDemoDebriefs().map((item) => ({
      id: item.id,
      source: "local" as const,
      created_at: item.created_at,
      campaign_name: item.campaign_name,
      channel: item.channel,
      objective: item.objective,
      metrics: item.metrics,
      generated_summary: item.generated_summary
    }));

    setLocalCampaigns(localItems);
  }, []);

  const campaigns = useMemo(() => {
    const combined = [...localCampaigns, ...initialCampaigns];

    return combined.filter((item) => {
      if (channel && item.channel !== channel) {
        return false;
      }

      if (objective && item.objective !== objective) {
        return false;
      }

      return true;
    });
  }, [channel, initialCampaigns, localCampaigns, objective]);

  return (
    <section className="space-y-4">
      <p className="text-text-secondary">{campaigns.length} campanhas registradas</p>

      {campaigns.length ? (
        campaigns.map((item) => <DebriefCard key={`${item.source ?? "server"}-${item.id}`} item={item} />)
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <Library className="h-8 w-8 text-text-secondary" />
            <p className="text-text-secondary">Nenhuma campanha registrada ainda.</p>
            <Link
              href="/debrief"
              className="inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-accent-hover"
            >
              Registrar primeira campanha
            </Link>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
