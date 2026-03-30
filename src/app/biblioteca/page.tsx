import { BibliotecaClient } from "@/components/BibliotecaClient";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { supabaseServerRequest } from "@/lib/supabase-server";

interface BibliotecaPageProps {
  searchParams?: {
    channel?: string;
    objective?: string;
  };
}

const channelFilters = ["instagram", "google_ads", "tiktok", "meta_ads", "email", "linkedin", "youtube", "outro"];
const objectiveFilters = ["awareness", "engajamento", "conversao", "retencao", "lancamento"];

export default async function BibliotecaPage({ searchParams }: BibliotecaPageProps) {
  const channel = searchParams?.channel ?? "";
  const objective = searchParams?.objective ?? "";
  let campaigns: {
    id: string;
    created_at: string;
    campaign_name: string;
    channel: string;
    objective: string;
    metrics: Record<string, number> | null;
    generated_summary: string | null;
  }[] = [];

  try {
    const filters = [
      "select=id,created_at,campaign_name,channel,objective,metrics,generated_summary",
      "order=created_at.desc"
    ];

    if (channel) {
      filters.push(`channel=eq.${encodeURIComponent(channel)}`);
    }

    if (objective) {
      filters.push(`objective=eq.${encodeURIComponent(objective)}`);
    }

    const data = await supabaseServerRequest(`debriefings?${filters.join("&")}`);
    campaigns = data ?? [];
  } catch {
    campaigns = [];
  }

  return (
    <main>
      <div className="mx-auto max-w-2xl space-y-8">
        <section className="space-y-2">
          <h1 className="text-4xl">Histórico de Campanhas</h1>
        </section>

        <form className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row" method="GET">
          <div className="w-full">
            <label htmlFor="channel">Canal</label>
            <Select id="channel" name="channel" defaultValue={channel}>
              <option value="">Todos os canais</option>
              {channelFilters.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </Select>
          </div>
          <div className="w-full">
            <label htmlFor="objective">Objetivo</label>
            <Select id="objective" name="objective" defaultValue={objective}>
              <option value="">Todos os objetivos</option>
              {objectiveFilters.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full sm:w-auto">Filtrar</Button>
          </div>
        </form>

        <BibliotecaClient initialCampaigns={campaigns.map((item) => ({ ...item, source: "server" as const }))} channel={channel} objective={objective} />
      </div>
    </main>
  );
}
