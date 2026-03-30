export type ChannelValue =
  | "instagram"
  | "google_ads"
  | "tiktok"
  | "meta_ads"
  | "email"
  | "linkedin"
  | "youtube"
  | "outro";

export type ObjectiveValue =
  | "awareness"
  | "engajamento"
  | "conversao"
  | "retencao"
  | "lancamento";

export type BudgetRangeValue = "ate5k" | "5k_20k" | "20k_50k" | "acima50k";
export type CampaignTypeValue = "lancamento" | "sazonal" | "branding" | "performance" | "retencao" | "outro";
export type ToneValue = "inspiracional" | "educativo" | "urgente" | "divertido" | "luxo" | "proximo";
export type PresetKind = "debrief" | "brief";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export interface DebriefPresetPayload {
  campaign_name?: string;
  channel?: ChannelValue;
  objective?: ObjectiveValue;
  audience?: string;
  budget_range?: BudgetRangeValue;
  format_tags?: string[];
  success_tags?: string[];
  failure_tags?: string[];
  next_step_tags?: string[];
  what_worked_notes?: string;
  what_failed_notes?: string;
  learnings?: string;
}

export interface BriefPresetPayload {
  campaign_type?: CampaignTypeValue;
  channel?: ChannelValue;
  audience?: string;
  objective?: string;
  tone?: ToneValue;
  references_text?: string;
  audience_tags?: string[];
  deliverable_tags?: string[];
  message_tags?: string[];
  guardrail_tags?: string[];
}

export interface PresetRecord {
  id: string;
  created_at: string;
  kind: PresetKind;
  name: string;
  description: string | null;
  channel: ChannelValue | null;
  objective: string | null;
  payload: DebriefPresetPayload | BriefPresetPayload;
  is_seeded: boolean;
}

export interface BriefContextSource {
  id: string;
  campaign_name: string;
  channel: string;
  objective: string;
  what_worked: string;
  what_failed: string;
  generated_summary: string | null;
}

export const channelOptions: SelectOption<ChannelValue>[] = [
  { value: "instagram", label: "Instagram" },
  { value: "google_ads", label: "Google Ads" },
  { value: "tiktok", label: "TikTok" },
  { value: "meta_ads", label: "Meta Ads" },
  { value: "email", label: "E-mail Marketing" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "outro", label: "Outro" }
];

export const objectiveOptions: SelectOption<ObjectiveValue>[] = [
  { value: "awareness", label: "Awareness" },
  { value: "engajamento", label: "Engajamento" },
  { value: "conversao", label: "Conversão" },
  { value: "retencao", label: "Retenção" },
  { value: "lancamento", label: "Lançamento" }
];

export const budgetRangeOptions: SelectOption<BudgetRangeValue>[] = [
  { value: "ate5k", label: "Até R$5k" },
  { value: "5k_20k", label: "R$5k - R$20k" },
  { value: "20k_50k", label: "R$20k - R$50k" },
  { value: "acima50k", label: "Acima de R$50k" }
];

export const campaignTypeOptions: SelectOption<CampaignTypeValue>[] = [
  { value: "lancamento", label: "Lançamento de Produto" },
  { value: "sazonal", label: "Campanha Sazonal" },
  { value: "branding", label: "Branding/Awareness" },
  { value: "performance", label: "Performance/Conversão" },
  { value: "retencao", label: "Retenção/Fidelização" },
  { value: "outro", label: "Outro" }
];

export const toneOptions: SelectOption<ToneValue>[] = [
  { value: "inspiracional", label: "Inspiracional" },
  { value: "educativo", label: "Educativo" },
  { value: "urgente", label: "Urgente/Direto" },
  { value: "divertido", label: "Divertido" },
  { value: "luxo", label: "Luxo/Premium" },
  { value: "proximo", label: "Próximo/Humano" }
];

export const debriefFormatOptions = [
  "Reels curtos",
  "Stories com link",
  "Carrossel",
  "UGC",
  "Search",
  "Remarketing",
  "Creators",
  "Landing page dedicada"
];

export const debriefSuccessOptions = [
  "Hook forte nos 3 primeiros segundos",
  "Segmentação muito aderente",
  "Criativo autêntico",
  "Oferta clara",
  "CTA simples",
  "Timing de publicação acertado",
  "Página de destino converteu bem",
  "Personalização funcionou"
];

export const debriefFailureOptions = [
  "Criativo genérico",
  "CTA confuso",
  "Canal inadequado para conversão",
  "Público amplo demais",
  "Timing ruim",
  "Formato com baixa retenção",
  "Landing page fraca",
  "Budget mal distribuído"
];

export const debriefNextStepOptions = [
  "Reforçar vídeo curto",
  "Testar nova oferta",
  "Refinar segmentação",
  "Mover verba para o melhor formato",
  "Melhorar landing page",
  "Começar campanha antes",
  "Usar creators nichados",
  "Simplificar CTA"
];

export const briefAudienceOptions = [
  "Jovens 18-24 em descoberta de marca",
  "Adultos 25-35 com intenção de compra",
  "Gestores B2B decisores",
  "Base inativa para reativação",
  "Consumidor recorrente para fidelização"
];

export const briefMessageOptions = [
  "Desejo e aspiração",
  "Urgência promocional",
  "Autoridade e confiança",
  "Proximidade e humanidade",
  "Prova social",
  "Educação do mercado"
];

export const briefDeliverableOptions = [
  "Reels/short videos",
  "Carrossel",
  "Search ads",
  "Email sequence",
  "Landing page",
  "UGC creators",
  "Thought leadership posts",
  "Retargeting ads"
];

export const briefGuardrailOptions = [
  "Evitar linguagem promocional agressiva",
  "Evitar criativo com cara de anúncio genérico",
  "Evitar muitos CTAs",
  "Evitar excesso de texto",
  "Evitar produção polida demais",
  "Evitar abrir campanha tarde"
];

function cleanList(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}

export function composeNarrativeSection(selected: string[], freeText: string, fallback: string) {
  const items = cleanList(selected);
  const details = freeText.trim();

  if (!items.length && !details) {
    return fallback;
  }

  const listText = items.length ? `Pontos marcados: ${items.join("; ")}.` : "";
  return [listText, details].filter(Boolean).join(" ");
}

export function composeBriefSection(selected: string[], freeText: string, fallback: string) {
  const items = cleanList(selected);
  const details = freeText.trim();

  if (!items.length && !details) {
    return fallback;
  }

  const listText = items.length ? items.join("; ") : "";
  return [listText, details].filter(Boolean).join(". ");
}

export function isDebriefPresetPayload(payload: DebriefPresetPayload | BriefPresetPayload): payload is DebriefPresetPayload {
  return "budget_range" in payload || "format_tags" in payload || "success_tags" in payload;
}
