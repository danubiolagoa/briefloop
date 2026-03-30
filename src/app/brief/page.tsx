import { BriefForm } from "@/components/BriefForm";
import { FormErrorBoundary } from "@/components/FormErrorBoundary";
import { BriefContextSource } from "@/lib/briefloop";
import { getPresets } from "@/lib/presets";
import { supabaseServerRequest } from "@/lib/supabase-server";

interface BriefPageProps {
  searchParams?: {
    channel?: string;
    objective?: string;
    debriefId?: string;
    source?: string;
  };
}

export default async function BriefPage({ searchParams }: BriefPageProps) {
  const presets = await getPresets("brief");
  let initialSelectedDebrief: BriefContextSource | null = null;

  if (searchParams?.debriefId && searchParams?.source === "server") {
    try {
      const debrief = await supabaseServerRequest(
        `debriefings?select=id,campaign_name,channel,objective,what_worked,what_failed,generated_summary&id=eq.${encodeURIComponent(searchParams.debriefId)}&limit=1`
      );

      const item = Array.isArray(debrief) ? debrief[0] : null;
      if (item) {
        initialSelectedDebrief = item;
      }
    } catch {
      initialSelectedDebrief = null;
    }
  }

  return (
    <main>
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.85fr] lg:items-end">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200">
              Criar Brief
            </span>
            <div className="space-y-3">
              <h1 className="max-w-3xl font-sans text-5xl font-semibold leading-[0.98] tracking-tight md:text-6xl">
                Transforme intenção estratégica em um brief mais claro.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-text-secondary md:text-base">
                O fluxo foi refinado para reduzir atrito: você parte de presets, marca direções rápidas e só escreve o que realmente precisa de nuance humana.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[24px] border border-border bg-white/[0.03] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Base pronta</p>
              <p className="mt-2 text-lg font-semibold text-text-primary">Presets reutilizáveis</p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">Escolha um ponto de partida em vez de abrir um campo em branco.</p>
            </div>
            <div className="rounded-[24px] border border-border bg-white/[0.03] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Decisão rápida</p>
              <p className="mt-2 text-lg font-semibold text-text-primary">Chips e blocos guiados</p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">A estrutura ajuda o time a pensar melhor sem alongar o preenchimento.</p>
            </div>
            <div className="rounded-[24px] border border-border bg-white/[0.03] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Resultado</p>
              <p className="mt-2 text-lg font-semibold text-text-primary">Brief mais acionável</p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">A IA recebe contexto melhor organizado e devolve algo mais utilizável.</p>
            </div>
          </div>
        </section>
        <FormErrorBoundary title="Criar Brief">
          <BriefForm
            presets={Array.isArray(presets) ? presets : []}
            initialChannel={searchParams?.channel}
            initialObjective={searchParams?.objective}
            initialDebriefId={searchParams?.debriefId}
            initialDebriefSource={searchParams?.source}
            initialSelectedDebrief={initialSelectedDebrief}
          />
        </FormErrorBoundary>
      </div>
    </main>
  );
}
