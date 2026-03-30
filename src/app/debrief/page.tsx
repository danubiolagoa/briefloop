import { DebreifForm } from "@/components/DebreifForm";
import { FormErrorBoundary } from "@/components/FormErrorBoundary";
import { getPresets } from "@/lib/presets";

export default async function DebriefPage() {
  const presets = await getPresets("debrief");

  return (
    <main>
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">BriefLoop / Debrief</p>
          <h1 className="max-w-3xl font-sans text-4xl font-semibold tracking-tight md:text-5xl">Registrar Campanha</h1>
          <p className="max-w-3xl text-sm leading-6 text-text-secondary">
            O registro agora foi redesenhado para parecer menos um formulário burocrático e mais uma mesa de operação: presets,
            marcação rápida e só o texto que realmente agrega contexto.
          </p>
        </section>
        <FormErrorBoundary title="Registrar Campanha">
          <DebreifForm presets={Array.isArray(presets) ? presets : []} />
        </FormErrorBoundary>
      </div>
    </main>
  );
}
