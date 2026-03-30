"use client";

import { Eraser, Loader2, Save, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ActivePresetSummary } from "@/components/ActivePresetSummary";
import { ChipGroup } from "@/components/ChipGroup";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { ExamplePicker, ExampleCase, debriefExamples } from "@/components/ExamplePicker";
import { PresetPicker } from "@/components/PresetPicker";
import { RateLimitBanner } from "@/components/RateLimitBanner";
import { ResultCard } from "@/components/ResultCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  budgetRangeOptions,
  channelOptions,
  DebriefPresetPayload,
  debriefFailureOptions,
  debriefFormatOptions,
  debriefNextStepOptions,
  debriefSuccessOptions,
  objectiveOptions,
  PresetRecord
} from "@/lib/briefloop";
import { saveDemoDebrief } from "@/lib/demo-debriefs";

interface DebriefResponse {
  summary: string;
  debrief_id: string | null;
  mode?: "live" | "demo";
}

interface DebreifFormProps {
  presets: PresetRecord[];
}

const initialState = {
  campaign_name: "",
  channel: "instagram",
  objective: "awareness",
  audience: "",
  budget_range: "ate5k",
  reach: "",
  clicks: "",
  conversions: "",
  roas: "",
  format_tags: [] as string[],
  success_tags: [] as string[],
  failure_tags: [] as string[],
  next_step_tags: [] as string[],
  what_worked_notes: "",
  what_failed_notes: "",
  learnings: "",
  preset_name: "",
  preset_description: ""
};

const mockState = {
  campaign_name: "Lançamento cápsula urban essentials",
  channel: "instagram",
  objective: "lancamento",
  audience: "Mulheres 24-34 com interesse em moda, lifestyle e consumo digital recorrente.",
  budget_range: "5k_20k",
  reach: "284000",
  clicks: "6900",
  conversions: "241",
  roas: "3.4",
  format_tags: ["Reels curtos", "Creators", "Carrossel"],
  success_tags: ["Hook forte nos 3 primeiros segundos", "Criativo autêntico", "Timing de publicação acertado"],
  failure_tags: ["CTA confuso", "Budget mal distribuído"],
  next_step_tags: ["Reforçar vídeo curto", "Mover verba para o melhor formato", "Simplificar CTA"],
  what_worked_notes: "Creators com estética mais espontânea e narrativa de rotina performaram melhor do que peças muito produzidas.",
  what_failed_notes: "Os posts mais promocionais ficaram com cara de anúncio e derrubaram a taxa de retenção logo no início.",
  learnings: "Vale repetir o modelo com creators menores e concentrar a verba no formato que segura atenção já nos primeiros 3 segundos.",
  preset_name: "",
  preset_description: ""
};

function toggleSelection(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function DebreifForm({ presets }: DebreifFormProps) {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [savingPreset, setSavingPreset] = useState(false);
  const [result, setResult] = useState<DebriefResponse | null>(null);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<PresetRecord | null>(null);

  function applyPreset(preset: PresetRecord) {
    const payload = preset.payload as DebriefPresetPayload;

    setActivePreset(preset);
    setFormData((current) => ({
      ...current,
      campaign_name: payload.campaign_name ?? current.campaign_name,
      channel: payload.channel ?? current.channel,
      objective: payload.objective ?? current.objective,
      audience: payload.audience ?? current.audience,
      budget_range: payload.budget_range ?? current.budget_range,
      format_tags: payload.format_tags ?? current.format_tags,
      success_tags: payload.success_tags ?? current.success_tags,
      failure_tags: payload.failure_tags ?? current.failure_tags,
      next_step_tags: payload.next_step_tags ?? current.next_step_tags,
      what_worked_notes: payload.what_worked_notes ?? current.what_worked_notes,
      what_failed_notes: payload.what_failed_notes ?? current.what_failed_notes,
      learnings: payload.learnings ?? current.learnings
    }));
  }

  function clearPreset() {
    setActivePreset(null);
  }

  function loadExample(example: ExampleCase) {
    setActivePreset(null);
    setRateLimitMessage(null);
    setFormData({
      campaign_name: example.campaign_name,
      channel: example.channel,
      objective: example.objective,
      audience: example.audience,
      budget_range: example.budget_range,
      reach: example.reach || "",
      clicks: example.clicks || "",
      conversions: example.conversions || "",
      roas: example.roas || "",
      format_tags: example.format_tags,
      success_tags: example.success_tags,
      failure_tags: example.failure_tags,
      next_step_tags: example.next_step_tags,
      what_worked_notes: example.what_worked_notes,
      what_failed_notes: example.what_failed_notes,
      learnings: example.learnings,
      preset_name: "",
      preset_description: ""
    });
  }

  function clearCurrentForm() {
    setActivePreset(null);
    setRateLimitMessage(null);
    setFormData(initialState);
  }

  async function handleSavePreset() {
    if (!formData.preset_name.trim()) {
      toast.error("Dê um nome para o preset antes de salvar.");
      return;
    }

    setSavingPreset(true);

    try {
      const response = await fetch("/api/presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "debrief",
          name: formData.preset_name,
          description: formData.preset_description,
          channel: formData.channel,
          objective: formData.objective,
          payload: {
            channel: formData.channel,
            objective: formData.objective,
            audience: formData.audience,
            budget_range: formData.budget_range,
            format_tags: formData.format_tags,
            success_tags: formData.success_tags,
            failure_tags: formData.failure_tags,
            next_step_tags: formData.next_step_tags,
            what_worked_notes: formData.what_worked_notes,
            what_failed_notes: formData.what_failed_notes,
            learnings: formData.learnings
          }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "Não foi possível salvar o preset.");
      }

      toast.success("Preset salvo com sucesso.");
      setFormData((current) => ({ ...current, preset_name: "", preset_description: "" }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar preset.");
    } finally {
      setSavingPreset(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setRateLimitMessage(null);

    try {
      const metrics = {
        reach: formData.reach ? Number(formData.reach) : undefined,
        clicks: formData.clicks ? Number(formData.clicks) : undefined,
        conversions: formData.conversions ? Number(formData.conversions) : undefined,
        roas: formData.roas ? Number(formData.roas) : undefined
      };

      const response = await fetch("/api/generate-debrief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_name: formData.campaign_name,
          channel: formData.channel,
          objective: formData.objective,
          audience: formData.audience,
          budget_range: formData.budget_range,
          metrics,
          format_tags: formData.format_tags,
          success_tags: formData.success_tags,
          failure_tags: formData.failure_tags,
          next_step_tags: formData.next_step_tags,
          what_worked_notes: formData.what_worked_notes,
          what_failed_notes: formData.what_failed_notes,
          learnings: formData.learnings
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data?.message ?? "Não foi possível gerar o debriefing agora.";
        if (response.status === 429) {
          setRateLimitMessage(message);
        }
        throw new Error(message);
      }

      setResult(data);
      if (data.mode === "demo" || !data.debrief_id) {
        saveDemoDebrief({
          id:
            data.debrief_id ??
            `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          created_at: new Date().toISOString(),
          campaign_name: formData.campaign_name,
          channel: formData.channel,
          objective: formData.objective,
          audience: formData.audience || null,
          budget_range: formData.budget_range || null,
          metrics: {
            ...(formData.reach ? { reach: Number(formData.reach) } : {}),
            ...(formData.clicks ? { clicks: Number(formData.clicks) } : {}),
            ...(formData.conversions ? { conversions: Number(formData.conversions) } : {}),
            ...(formData.roas ? { roas: Number(formData.roas) } : {})
          },
          what_worked:
            [formData.format_tags.join("; "), formData.success_tags.join("; "), formData.what_worked_notes]
              .filter(Boolean)
              .join(". ") || "Não informado",
          what_failed:
            [formData.failure_tags.join("; "), formData.what_failed_notes].filter(Boolean).join(". ") || "Não informado",
          learnings:
            [formData.next_step_tags.join("; "), formData.learnings].filter(Boolean).join(". ") || null,
          generated_summary: data.summary
        });
      }
      toast.success(data.mode === "live" ? "Debriefing gerado com IA real." : "Debriefing gerado em modo demonstração.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado ao gerar debriefing.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setFormData(initialState);
    setResult(null);
    setRateLimitMessage(null);
    setActivePreset(null);
  }


  if (result) {
    return (
      <ResultCard
        title={formData.campaign_name}
        channel={formData.channel}
        content={result.summary}
        copyLabel="Copiar debriefing"
        resetLabel="Registrar outra campanha"
        onReset={resetAll}
        secondaryHref="/biblioteca"
        secondaryLabel="Ver na biblioteca"
        mode={result.mode}
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
      {rateLimitMessage ? <RateLimitBanner message={rateLimitMessage} /> : null}

        <section className="overflow-hidden rounded-[28px] border border-border bg-[linear-gradient(135deg,rgba(245,158,11,0.16),rgba(15,23,42,0.25)_40%,rgba(15,23,42,0.95))]">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_0.9fr] lg:p-8">
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200">
                Registrar Campanha
              </span>
              <div className="space-y-3">
                <h2 className="max-w-xl font-sans text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl">
                  Faça o debrief sem abrir uma planilha mental inteira.
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-slate-300">
                  A lógica agora é mais parecida com a referência da Human: blocos claros, linguagem mais direta e escolhas rápidas
                  antes do texto livre. Você marca o que aconteceu e só completa o que realmente precisa de contexto humano.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Etapa 1</p>
                <p className="mt-2 text-lg font-semibold text-white">Contexto</p>
                <p className="mt-2 text-sm text-slate-300">Nome, canal, objetivo e budget sem excesso de campo visível.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Etapa 2</p>
                <p className="mt-2 text-lg font-semibold text-white">Marcação rápida</p>
                <p className="mt-2 text-sm text-slate-300">Você marca padrões de sucesso, falha e próximos passos.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Etapa 3</p>
                <p className="mt-2 text-lg font-semibold text-white">Refino</p>
                <p className="mt-2 text-sm text-slate-300">O texto livre vira complemento, não mais o centro da tarefa.</p>
              </div>
            </div>
          </div>
        </section>

        <PresetPicker
          title="Biblioteca de presets"
          description="Escolha um modelo compartilhado para entrar no fluxo já com o mapa mental pronto."
          presets={presets}
          activePresetId={activePreset?.id ?? null}
          onApply={applyPreset}
        />

        <ActivePresetSummary preset={activePreset} onClear={clearPreset} />

        <ExamplePicker type="debrief" onSelect={loadExample} onClear={clearCurrentForm} />

        <form className="space-y-5" onSubmit={handleSubmit}>
        <section className="rounded-[24px] border border-border bg-surface p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Bloco 1</p>
            <h3 className="mt-2 text-2xl font-semibold text-text-primary">Contexto rápido</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Primeiro o essencial. O formulário abre só as decisões que ajudam a IA e o time a reconhecer a campanha com clareza.
            </p>
          </div>

          <div className="grid gap-4">
            <div>
              <label htmlFor="campaign_name">Nome da campanha</label>
              <Input
                id="campaign_name"
                required
                placeholder="Ex: Lançamento coleção inverno"
                value={formData.campaign_name}
                onChange={(event) => setFormData((current) => ({ ...current, campaign_name: event.target.value }))}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="channel">Canal principal</label>
                <Select id="channel" value={formData.channel} onChange={(event) => setFormData((current) => ({ ...current, channel: event.target.value }))}>
                  {channelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label htmlFor="objective">Objetivo</label>
                <Select id="objective" value={formData.objective} onChange={(event) => setFormData((current) => ({ ...current, objective: event.target.value }))}>
                  {objectiveOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="audience">Público-alvo</label>
                <Textarea
                  id="audience"
                  rows={2}
                  placeholder="Quem era a audiência principal?"
                  value={formData.audience}
                  onChange={(event) => setFormData((current) => ({ ...current, audience: event.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="budget_range">Faixa de budget</label>
                <Select
                  id="budget_range"
                  value={formData.budget_range}
                  onChange={(event) => setFormData((current) => ({ ...current, budget_range: event.target.value }))}
                >
                  {budgetRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-border bg-surface p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Bloco 2</p>
            <h3 className="mt-2 text-2xl font-semibold text-text-primary">Marque o que rolou</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Esta é a parte mais importante da nova experiência. Em vez de explicar tudo em texto corrido, você vai montando o quadro da campanha por seleção.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <span className="block text-xs font-medium text-text-secondary mb-2">Marque os formatos usados</span>
              <ChipGroup
                options={debriefFormatOptions}
                selected={formData.format_tags}
                onToggle={(value) => setFormData((current) => ({ ...current, format_tags: toggleSelection(current.format_tags, value) }))}
              />
            </div>

            <div>
              <span className="block text-xs font-medium text-text-secondary mb-2">Marque o que funcionou</span>
              <ChipGroup
                options={debriefSuccessOptions}
                selected={formData.success_tags}
                onToggle={(value) => setFormData((current) => ({ ...current, success_tags: toggleSelection(current.success_tags, value) }))}
              />
            </div>

            <div>
              <span className="block text-xs font-medium text-text-secondary mb-2">Marque o que atrapalhou</span>
              <ChipGroup
                options={debriefFailureOptions}
                selected={formData.failure_tags}
                onToggle={(value) => setFormData((current) => ({ ...current, failure_tags: toggleSelection(current.failure_tags, value) }))}
              />
            </div>

            <div>
              <span className="block text-xs font-medium text-text-secondary mb-2">Marque os próximos passos</span>
              <ChipGroup
                options={debriefNextStepOptions}
                selected={formData.next_step_tags}
                onToggle={(value) => setFormData((current) => ({ ...current, next_step_tags: toggleSelection(current.next_step_tags, value) }))}
              />
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-border bg-surface p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Bloco 3</p>
            <h3 className="mt-2 text-2xl font-semibold text-text-primary">Complete só o que faltou</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Agora o texto livre entra como acabamento. A ideia é reduzir atrito e manter o debrief útil mesmo quando o time está cansado.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="what_worked_notes">Detalhes do que funcionou</label>
              <Textarea
                id="what_worked_notes"
                rows={3}
                placeholder="Ex: melhor horário, ajuste de criativo, segmentação, tipo de oferta..."
                value={formData.what_worked_notes}
                onChange={(event) => setFormData((current) => ({ ...current, what_worked_notes: event.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="what_failed_notes">Detalhes do que não funcionou</label>
              <Textarea
                id="what_failed_notes"
                rows={3}
                placeholder="Ex: desperdício de budget, formato fraco, público mal calibrado..."
                value={formData.what_failed_notes}
                onChange={(event) => setFormData((current) => ({ ...current, what_failed_notes: event.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="learnings">Aprendizados adicionais</label>
              <Textarea
                id="learnings"
                rows={2}
                placeholder="Se quiser, complemente os próximos passos com um insight final."
                value={formData.learnings}
                onChange={(event) => setFormData((current) => ({ ...current, learnings: event.target.value }))}
              />
            </div>
          </div>
        </section>

        <CollapsibleSection
          title="4. Dados avançados"
          description="Esses campos ajudam, mas não precisam travar o seu fluxo."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="reach">Alcance total</label>
              <Input id="reach" type="number" min={0} value={formData.reach} onChange={(event) => setFormData((current) => ({ ...current, reach: event.target.value }))} />
            </div>
            <div>
              <label htmlFor="clicks">Cliques</label>
              <Input id="clicks" type="number" min={0} value={formData.clicks} onChange={(event) => setFormData((current) => ({ ...current, clicks: event.target.value }))} />
            </div>
            <div>
              <label htmlFor="conversions">Conversões</label>
              <Input id="conversions" type="number" min={0} value={formData.conversions} onChange={(event) => setFormData((current) => ({ ...current, conversions: event.target.value }))} />
            </div>
            <div>
              <label htmlFor="roas">ROAS</label>
              <Input id="roas" type="number" min={0} step="0.1" value={formData.roas} onChange={(event) => setFormData((current) => ({ ...current, roas: event.target.value }))} />
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="5. Salvar como preset"
          description="Transforme esse padrão de campanha em um modelo reutilizável para o time."
        >
          <div className="grid gap-4">
            <div>
              <label htmlFor="preset_name">Nome do preset</label>
              <Input
                id="preset_name"
                placeholder="Ex: Debrief Instagram de lançamento"
                value={formData.preset_name}
                onChange={(event) => setFormData((current) => ({ ...current, preset_name: event.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="preset_description">Descrição</label>
              <Textarea
                id="preset_description"
                rows={2}
                placeholder="Explique quando esse preset faz sentido."
                value={formData.preset_description}
                onChange={(event) => setFormData((current) => ({ ...current, preset_description: event.target.value }))}
              />
            </div>
            <div>
              <Button type="button" variant="secondary" onClick={handleSavePreset} disabled={savingPreset} className="gap-2">
                {savingPreset ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {savingPreset ? "Salvando preset..." : "Salvar preenchimento como preset"}
              </Button>
            </div>
          </div>
        </CollapsibleSection>

        <Button type="submit" disabled={loading} className="w-full gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Analisando campanha..." : "Gerar Debriefing com IA"}
        </Button>
      </form>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <section className="rounded-[24px] border border-border bg-surface p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Painel de apoio</p>
          <h3 className="mt-3 text-xl font-semibold text-text-primary">Preenchimento sem fadiga</h3>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            O objetivo deste layout é reduzir esforço cognitivo: menos campos abertos, mais decisões rápidas e um caminho visual mais evidente.
          </p>

        </section>

        <section className="rounded-[24px] border border-border bg-surface p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Dicas</p>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary">
            <li>• Marque os chips antes de escrever textos longos</li>
            <li>• Quanto mais sinais, melhor o debriefing</li>
            <li>• Dados avançados são opcionais</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}
