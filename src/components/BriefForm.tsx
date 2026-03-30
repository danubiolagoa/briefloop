"use client";

import { Eraser, Loader2, Save, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ActivePresetSummary } from "@/components/ActivePresetSummary";
import { ChipGroup } from "@/components/ChipGroup";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { ExamplePicker, ExampleCase } from "@/components/ExamplePicker";
import { PresetPicker } from "@/components/PresetPicker";
import { RateLimitBanner } from "@/components/RateLimitBanner";
import { ResultCard } from "@/components/ResultCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  briefAudienceOptions,
  briefDeliverableOptions,
  briefGuardrailOptions,
  briefMessageOptions,
  BriefContextSource,
  BriefPresetPayload,
  campaignTypeOptions,
  channelOptions,
  PresetRecord,
  toneOptions
} from "@/lib/briefloop";
import { getDemoDebriefById } from "@/lib/demo-debriefs";

interface SourceItem {
  id: string;
  campaign_name: string;
  channel: string;
  objective: string;
}

interface BriefResponse {
  brief: string;
  sources: SourceItem[];
  mode?: "live" | "demo";
}

interface BriefFormProps {
  presets: PresetRecord[];
  initialChannel?: string;
  initialObjective?: string;
  initialDebriefId?: string;
  initialDebriefSource?: string;
  initialSelectedDebrief?: BriefContextSource | null;
}

const initialState = {
  campaign_type: "lancamento",
  channel: "instagram",
  audience: "",
  objective: "",
  tone: "inspiracional",
  references_text: "",
  audience_tags: [] as string[],
  deliverable_tags: [] as string[],
  message_tags: [] as string[],
  guardrail_tags: [] as string[],
  preset_name: "",
  preset_description: ""
};

const mockState = {
  campaign_type: "lancamento",
  channel: "instagram",
  audience: "Mulheres 25-35 interessadas em moda contemporânea, autocuidado e marcas com linguagem visual forte.",
  objective: "Fazer a audiência perceber a nova coleção como uma extensão aspiracional da rotina e gerar tráfego qualificado para a página de lançamento.",
  tone: "inspiracional",
  references_text: "Referência de linguagem: moda urbana premium com estética clean, movimento natural e sensação de acesso limitado.",
  audience_tags: ["Adultos 25-35 com intenção de compra"],
  deliverable_tags: ["Reels/short videos", "UGC creators", "Landing page"],
  message_tags: ["Desejo e aspiração", "Prova social"],
  guardrail_tags: ["Evitar muitos CTAs", "Evitar criativo com cara de anúncio genérico"],
  preset_name: "",
  preset_description: ""
};

function toggleSelection(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function BriefForm({
  presets,
  initialChannel = "instagram",
  initialObjective = "",
  initialDebriefId,
  initialDebriefSource,
  initialSelectedDebrief = null
}: BriefFormProps) {
  const [campaignType, setCampaignType] = useState(initialState.campaign_type);
  const [channel, setChannel] = useState(initialChannel || initialState.channel);
  const [audience, setAudience] = useState("");
  const [objective, setObjective] = useState(initialObjective || "");
  const [tone, setTone] = useState(initialState.tone);
  const [referencesText, setReferencesText] = useState("");
  const [audienceTags, setAudienceTags] = useState<string[]>([]);
  const [deliverableTags, setDeliverableTags] = useState<string[]>([]);
  const [messageTags, setMessageTags] = useState<string[]>([]);
  const [guardrailTags, setGuardrailTags] = useState<string[]>([]);
  const [presetName, setPresetName] = useState("");
  const [presetDescription, setPresetDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingPreset, setSavingPreset] = useState(false);
  const [result, setResult] = useState<BriefResponse | null>(null);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<PresetRecord | null>(null);
  const [selectedDebrief, setSelectedDebrief] = useState<BriefContextSource | null>(initialSelectedDebrief);

  useEffect(() => {
    if (initialSelectedDebrief || initialDebriefSource !== "local" || !initialDebriefId) {
      return;
    }

    const record = getDemoDebriefById(initialDebriefId);
    if (!record) {
      return;
    }

    setSelectedDebrief({
      id: record.id,
      campaign_name: record.campaign_name,
      channel: record.channel,
      objective: record.objective,
      what_worked: record.what_worked,
      what_failed: record.what_failed,
      generated_summary: record.generated_summary
    });
  }, [initialDebriefId, initialDebriefSource, initialSelectedDebrief]);

  function applyPreset(preset: PresetRecord) {
    const payload = preset.payload as BriefPresetPayload;

    setActivePreset(preset);
    setCampaignType(payload.campaign_type ?? campaignType);
    setChannel(payload.channel ?? channel);
    setAudience(payload.audience ?? audience);
    setObjective(payload.objective ?? objective);
    setTone(payload.tone ?? tone);
    setReferencesText(payload.references_text ?? referencesText);
    setAudienceTags(payload.audience_tags ?? audienceTags);
    setDeliverableTags(payload.deliverable_tags ?? deliverableTags);
    setMessageTags(payload.message_tags ?? messageTags);
    setGuardrailTags(payload.guardrail_tags ?? guardrailTags);
  }

  function clearPreset() {
    setActivePreset(null);
  }

  function loadExample(example: ExampleCase) {
    setActivePreset(null);
    setRateLimitMessage(null);
    setCampaignType(example.campaign_type || initialState.campaign_type);
    setChannel(example.channel || initialState.channel);
    setAudience(example.audience || "");
    setObjective(example.brief_objective || "");
    setTone(example.tone || initialState.tone);
    setReferencesText(example.references_text || "");
    setAudienceTags(example.audience_tags || []);
    setDeliverableTags(example.deliverable_tags || []);
    setMessageTags(example.message_tags || []);
    setGuardrailTags(example.guardrail_tags || []);
    setPresetName("");
    setPresetDescription("");
  }

  function clearCurrentForm() {
    setActivePreset(null);
    setRateLimitMessage(null);
    setCampaignType(initialState.campaign_type);
    setChannel(initialState.channel);
    setAudience(initialState.audience);
    setObjective(initialState.objective);
    setTone(initialState.tone);
    setReferencesText(initialState.references_text);
    setAudienceTags(initialState.audience_tags);
    setDeliverableTags(initialState.deliverable_tags);
    setMessageTags(initialState.message_tags);
    setGuardrailTags(initialState.guardrail_tags);
    setPresetName(initialState.preset_name);
    setPresetDescription(initialState.preset_description);
  }

  async function handleSavePreset() {
    if (!presetName.trim()) {
      toast.error("Dê um nome para o preset antes de salvar.");
      return;
    }

    setSavingPreset(true);

    try {
      const response = await fetch("/api/presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "brief",
          name: presetName,
          description: presetDescription,
          channel,
          objective,
          payload: {
            campaign_type: campaignType,
            channel,
            audience,
            objective,
            tone,
            references_text: referencesText,
            audience_tags: audienceTags,
            deliverable_tags: deliverableTags,
            message_tags: messageTags,
            guardrail_tags: guardrailTags
          }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "Não foi possível salvar o preset.");
      }

      toast.success("Preset salvo com sucesso.");
      setPresetName("");
      setPresetDescription("");
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
      const response = await fetch("/api/generate-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_type: campaignType,
          channel,
          audience,
          objective,
          tone,
          references_text: referencesText,
          audience_tags: audienceTags,
          deliverable_tags: deliverableTags,
          message_tags: messageTags,
          guardrail_tags: guardrailTags,
          selected_debriefs: selectedDebrief ? [selectedDebrief] : []
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data?.message ?? "Não foi possível gerar o brief agora.";
        if (response.status === 429) {
          setRateLimitMessage(message);
        }
        throw new Error(message);
      }

      setResult(data);
      toast.success(data.mode === "live" ? "Brief gerado com IA real." : "Brief gerado em modo demonstração.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado ao gerar brief.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setCampaignType(initialState.campaign_type);
    setChannel(initialState.channel);
    setAudience("");
    setObjective("");
    setTone(initialState.tone);
    setReferencesText("");
    setAudienceTags([]);
    setDeliverableTags([]);
    setMessageTags([]);
    setGuardrailTags([]);
    setPresetName("");
    setPresetDescription("");
    setResult(null);
    setRateLimitMessage(null);
    setActivePreset(null);
  }


  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        {rateLimitMessage ? <RateLimitBanner message={rateLimitMessage} /> : null}

        {result ? (
          <div className="space-y-4">
            <ResultCard
              title="Brief gerado"
              channel={channel}
              content={result.brief}
              copyLabel="Copiar brief"
              resetLabel="Criar outro brief"
              onReset={handleReset}
              mode={result.mode}
            />
            {result.sources.length ? (
              <Card className="overflow-hidden rounded-[24px] border-border shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                <CardContent className="space-y-4 p-5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Histórico consultado</p>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                      Baseado em {result.sources.length} campanha(s) anterior(es) encontradas na biblioteca.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {result.sources.map((source) => (
                      <div key={source.id} className="rounded-[22px] border border-border bg-white/[0.03] p-4">
                        <p className="text-sm font-semibold text-text-primary">{source.campaign_name}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge>{source.channel}</Badge>
                          <Badge>{source.objective}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : (
          <>
            <section className="overflow-hidden rounded-[28px] border border-border bg-[linear-gradient(135deg,rgba(245,158,11,0.16),rgba(15,23,42,0.25)_40%,rgba(15,23,42,0.95))]">
              <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_0.9fr] lg:p-8">
                <div className="space-y-4">
                  <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200">
                    Planejamento Guiado
                  </span>
                  <div className="space-y-3">
                    <h2 className="max-w-xl font-sans text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl">
                      Monte um brief forte sem depender de um campo em branco.
                    </h2>
                    <p className="max-w-2xl text-sm leading-6 text-slate-300">
                      O novo fluxo usa presets, sinais rápidos e texto essencial. A interface foi refinada para parecer menos burocrática e mais próxima de um raciocínio estratégico.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Etapa 1</p>
                    <p className="mt-2 text-lg font-semibold text-white">Base</p>
                    <p className="mt-2 text-sm text-slate-300">Tipo de campanha, canal e tom definidos com clareza logo no início.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Etapa 2</p>
                    <p className="mt-2 text-lg font-semibold text-white">Direção</p>
                    <p className="mt-2 text-sm text-slate-300">Você marca público, mensagem, entregáveis e guardrails sem se alongar.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Etapa 3</p>
                    <p className="mt-2 text-lg font-semibold text-white">Refino</p>
                    <p className="mt-2 text-sm text-slate-300">Só depois entram objetivo detalhado e referências adicionais.</p>
                  </div>
                </div>
              </div>
            </section>

            <PresetPicker
              title="Comece por um preset"
              description="Escolha um modelo de brief compartilhado para acelerar o raciocínio e editar só o que realmente muda nesta campanha."
              presets={presets}
              activePresetId={activePreset?.id ?? null}
              onApply={applyPreset}
            />

            <ActivePresetSummary preset={activePreset} onClear={clearPreset} />

            {selectedDebrief ? (
              <section className="rounded-[24px] border border-accent/25 bg-[linear-gradient(180deg,rgba(245,158,11,0.1),rgba(245,158,11,0.03))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200">Debrief selecionado</p>
                <h3 className="mt-2 text-lg font-semibold text-text-primary">{selectedDebrief.campaign_name}</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  Este brief vai usar esse debrief como contexto prioritário, além de qualquer histórico adicional encontrado.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge>{selectedDebrief.channel}</Badge>
                  <Badge>{selectedDebrief.objective}</Badge>
                  <Badge>{initialDebriefSource === "local" ? "demo local" : "biblioteca"}</Badge>
                </div>
              </section>
            ) : null}

            <ExamplePicker type="brief" onSelect={loadExample} onClear={clearCurrentForm} />

            <form className="space-y-5" onSubmit={handleSubmit}>
              <section className="rounded-[24px] border border-border bg-surface p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                <div className="mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Bloco 1</p>
                  <h3 className="mt-2 text-2xl font-semibold text-text-primary">Base da campanha</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                    Defina o enquadramento para a IA entender o território da campanha antes de entrar nas nuances do brief.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="campaign_type">Tipo de campanha</label>
                    <Select id="campaign_type" value={campaignType} onChange={(event) => setCampaignType(event.target.value)}>
                      {campaignTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="channel">Canal principal</label>
                    <Select id="channel" value={channel} onChange={(event) => setChannel(event.target.value)}>
                      {channelOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="tone">Tom de voz</label>
                  <Select id="tone" value={tone} onChange={(event) => setTone(event.target.value)}>
                    {toneOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </section>

              <section className="rounded-[24px] border border-border bg-surface p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                <div className="mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Bloco 2</p>
                  <h3 className="mt-2 text-2xl font-semibold text-text-primary">Direções que moldam o brief</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                    Use escolhas rápidas para dar densidade estratégica ao pedido sem exigir um texto longo logo de saída.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="block text-xs font-medium text-text-secondary mb-2">Públicos (marque os mais relevantes)</span>
                    <ChipGroup options={briefAudienceOptions} selected={audienceTags} onToggle={(value) => setAudienceTags((current) => toggleSelection(current, value))} />
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-text-secondary mb-2">Mensagens (marque o tom)</span>
                    <ChipGroup options={briefMessageOptions} selected={messageTags} onToggle={(value) => setMessageTags((current) => toggleSelection(current, value))} />
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-text-secondary mb-2">Formatos pretendidos</span>
                    <ChipGroup options={briefDeliverableOptions} selected={deliverableTags} onToggle={(value) => setDeliverableTags((current) => toggleSelection(current, value))} />
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-text-secondary mb-2">O que evitar</span>
                    <ChipGroup options={briefGuardrailOptions} selected={guardrailTags} onToggle={(value) => setGuardrailTags((current) => toggleSelection(current, value))} />
                  </div>
                </div>
              </section>

              <section className="rounded-[24px] border border-border bg-surface p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                <div className="mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Bloco 3</p>
                  <h3 className="mt-2 text-2xl font-semibold text-text-primary">Texto essencial</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                    Agora sim entram as partes que pedem repertório humano: quem é o público, o que precisa acontecer e qual direção criativa apoiar.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="audience">Público-alvo</label>
                    <Textarea
                      id="audience"
                      required
                      rows={3}
                      placeholder="Ex: mulheres 25-35 com intenção de compra e interesse em lifestyle."
                      value={audience}
                      onChange={(event) => setAudience(event.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="objective">Objetivo principal</label>
                    <Textarea
                      id="objective"
                      required
                      rows={3}
                      placeholder="O que você quer que o público sinta, pense ou faça?"
                      value={objective}
                      onChange={(event) => setObjective(event.target.value)}
                    />
                  </div>
                </div>
              </section>

              <CollapsibleSection
                title="4. Referências adicionais"
                description="Abra só se precisar contextualizar inspiração, benchmark ou direção criativa."
              >
                <div>
                  <label htmlFor="references">Referências ou inspirações</label>
                  <Textarea
                    id="references"
                    rows={3}
                    placeholder="Benchmarks, campanhas parecidas, linguagem visual, concorrentes, etc."
                    value={referencesText}
                    onChange={(event) => setReferencesText(event.target.value)}
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="5. Salvar como preset"
                description="Guarde este tipo de brief para o time reaproveitar depois."
              >
                <div className="grid gap-4">
                  <div>
                    <label htmlFor="preset_name">Nome do preset</label>
                    <Input
                      id="preset_name"
                      placeholder="Ex: Brief de lançamento para Instagram"
                      value={presetName}
                      onChange={(event) => setPresetName(event.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="preset_description">Descrição</label>
                    <Textarea
                      id="preset_description"
                      rows={2}
                      placeholder="Quando esse preset funciona melhor?"
                      value={presetDescription}
                      onChange={(event) => setPresetDescription(event.target.value)}
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
                {loading ? "Buscando histórico e gerando brief..." : "Gerar Brief com IA"}
              </Button>
            </form>
          </>
        )}
      </div>

      {!result ? (
        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-[24px] border border-border bg-surface p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Dicas</p>
            <ul className="mt-3 space-y-2 text-sm text-text-secondary">
              <li>• Aplique um preset para acelerar o preenchimento</li>
              <li>• Marque chips antes de escrever textos longos</li>
              <li>•Referências adicionais são opcionais</li>
            </ul>
          </section>
        </aside>
      ) : null}
    </div>
  );
}
