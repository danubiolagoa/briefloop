"use client";

import { Wand2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface ExampleCase {
  id: string;
  title: string;
  description: string;
  tags: string[];
  // Debrief fields
  campaign_name: string;
  channel: string;
  objective: string;
  audience: string;
  budget_range: string;
  reach?: string;
  clicks?: string;
  conversions?: string;
  roas?: string;
  format_tags: string[];
  success_tags: string[];
  failure_tags: string[];
  next_step_tags: string[];
  what_worked_notes: string;
  what_failed_notes: string;
  learnings: string;
  // Brief fields (optional)
  campaign_type?: string;
  tone?: string;
  references_text?: string;
  audience_tags?: string[];
  deliverable_tags?: string[];
  message_tags?: string[];
  guardrail_tags?: string[];
  // Brief narrative objective (separate from debrief objective)
  brief_objective?: string;
}

interface ExamplePickerProps {
  type: "debrief" | "brief";
  onSelect: (example: ExampleCase) => void;
  onClear: () => void;
}

export const debriefExamples: ExampleCase[] = [
  {
    id: "instagram-lancamento",
    title: "Lançamento no Instagram",
    description: "Campanha de lançamento de produto com creators e reels curtos",
    tags: ["Instagram", "Lançamento", "ROAS 3.4"],
    campaign_name: "Lançamento Urban Essentials",
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
    learnings: "Vale repetir o modelo com creators menores e concentrar a verba no formato que segura atenção já nos primeiros 3 segundos."
  },
  {
    id: "facebook-remarketing",
    title: "Remarketing no Facebook",
    description: "Campanha de retargeting para carrinhos abandonados",
    tags: ["Facebook", "Remarketing", "ROAS 4.2"],
    campaign_name: "Remarketing Q4 - Carrinho Abandonado",
    channel: "meta_ads",
    objective: "conversao",
    audience: "Usuários que adicionaram ao carrinho nos últimos 7 dias, 25-45 anos, interesse em e-commerce.",
    budget_range: "20k_50k",
    reach: "89000",
    clicks: "12400",
    conversions: "892",
    roas: "4.2",
    format_tags: ["Feed único", "Carrossel produtos", "Stories"],
    success_tags: ["Segmentação bem definida", "Criativo com urgência", "Oferta clara"],
    failure_tags: ["Excesso de frequência", "Banner genérico"],
    next_step_tags: ["Reduzir frequência", "Personalizar por categoria", "Testar novo ângulo"],
    what_worked_notes: "O criativo com contagem regressiva e desconto por tempo limitado gerou sense of urgency efficace.",
    what_failed_notes: "A frequência alta nas primeiras 48h gerou fadiga de visão nos usuários mais qualificados.",
    learnings: "Começar com público menor e mais qualificado. A/B test mais criativos antes de escalar."
  },
  {
    id: "google-search",
    title: "Search do Google",
    description: "Campanha de marca para capturar demanda orgânica",
    tags: ["Google", "Marca", "CTR 12%"],
    campaign_name: "Branded Search - Marca Própria",
    channel: "google_ads",
    objective: "awareness",
    audience: "Usuários pesquisando diretamente a marca ou categorias relacionadas.",
    budget_range: "ate5k",
    reach: "45000",
    clicks: "5400",
    conversions: "312",
    roas: "2.8",
    format_tags: ["Texto ampliado", "Anúncio dinâmico"],
    success_tags: ["Extensões completas", "Palavras da marca"],
    failure_tags: ["Qualificação de clique baixa"],
    next_step_tags: ["Adicionar negativos", "Revisar landing page"],
    what_worked_notes: "As extensões de snippet e telefone aumentaram a taxa de clique em 40% comparando com o básico.",
    what_failed_notes: "Muita pesquisa da marca própria com CPC alto, mas conversão baixa por causa da landing page lenta.",
    learnings: "O investimento na velocidade da landing page se paga mais do que aumentar bids em palavras da marca."
  },
  {
    id: "instagram-influenciador",
    title: "Campanha com Influenciador",
    description: "Parceria com micro influenciadores para alcance orgânico",
    tags: ["Instagram", "Influenciador", "Engaje 6%"],
    campaign_name: "Micro Influenciadores - Beauty",
    channel: "instagram",
    objective: "engajamento",
    audience: "Mulheres 18-35 interessadas em beleza e autocuidado, seguinham perfis de beleza locais.",
    budget_range: "5k_20k",
    reach: "156000",
    clicks: "3200",
    conversions: "89",
    roas: "1.8",
    format_tags: ["Stories", "Post feed", "Reels"],
    success_tags: ["Conteúdo autêntico", "Alcance orgânico alto", "Comentários positivos"],
    failure_tags: ["CTR baixo", "Conversão abaixo do esperado"],
    next_step_tags: ["Melhorar brief para creators", "TestarMacro influencers"],
    what_worked_notes: "O conteúdo gerado pelos micro influenciadores teve alcance orgânico 3x maior que posts patrocinados da marca.",
    what_failed_notes: "O número de cliques foi baixo porque não houve CTAs claros nos posts — a equipe estava focada em brand awareness.",
    learnings: "Mesclar influenciador com boosts patrocinados para maximizar reach e adicionar CTAs claros."
  },
  {
    id: "linkedin-b2b",
    title: "LinkedIn B2B",
    description: "Campanha de generation para SaaS B2B",
    tags: ["LinkedIn", "B2B", "CPL R$ 45"],
    campaign_name: "Lead Gen - Software RH",
    channel: "linkedin",
    objective: "conversao",
    audience: "CHROs, gestores de RH, empresas de 50-500 funcionários, interesse em tecnologia de RH.",
    budget_range: "20k_50k",
    reach: "28000",
    clicks: "2100",
    conversions: "127",
    roas: "3.1",
    format_tags: ["Mensagem animada", "Carrousel", "Conteúdo nativo"],
    success_tags: ["Segmentação por cargo", "Copy direta B2B"],
    failure_tags: ["Custo por clique alto", "Volume baixo"],
    next_step_tags: ["Testar diferentes formatos", "Ajustar copy"],
    what_worked_notes: "Os carrosséis com estatísticas de mercado geraram muito compartilhamento interno nas empresas.",
    what_failed_notes: "A landing page não estava otimizada para mobile, e 60% do tráfego vinha de mobile.",
    learnings: "Ter uma landing page mobile-first para campanhas de LinkedIn é critical."
  }
];

export const briefExamples: ExampleCase[] = [
  {
    id: "instagram-lancamento",
    title: "Lançamento para Instagram",
    description: "Brief para lançamento de produto com foco em desejo e prova social",
    tags: ["Instagram", "Lançamento", "Inspiracional"],
    campaign_name: "Lançamento nova coleção",
    channel: "instagram",
    objective: "lancamento",
    audience: "Mulheres 25-35 interessadas em moda contemporânea, autocuidado e marcas com linguagem visual forte.",
    budget_range: "",
    reach: "",
    clicks: "",
    conversions: "",
    roas: "",
    format_tags: ["Reels/short videos", "UGC creators"],
    success_tags: ["Desejo e aspiração", "Prova social"],
    failure_tags: ["Evitar muitos CTAs", "Evitar criativo genérico"],
    next_step_tags: [],
    audience_tags: ["Adultos 25-35 com intenção de compra"],
    deliverable_tags: ["Reels/short videos", "UGC creators", "Landing page"],
    message_tags: ["Desejo e aspiração", "Prova social"],
    guardrail_tags: ["Evitar muitos CTAs", "Evitar criativo com cara de anúncio genérico"],
    references_text: "Referência de linguagem: moda urbana premium com estética clean, movimento natural e sensação de acesso limitado.",
    campaign_type: "lancamento",
    tone: "inspiracional",
    brief_objective: "Fazer a audiência perceber a nova coleção como extensão natural da sua rotina e gerar desejo de compra sem parecer push de venda.",
    what_worked_notes: "",
    what_failed_notes: "",
    learnings: ""
  },
  {
    id: "facebook-conversao",
    title: "Conversão no Facebook",
    description: "Brief para campanha de remarketing com urgência",
    tags: ["Facebook", "Conversão", "Urgência"],
    campaign_name: "Remarketing carrinho abandonado",
    channel: "meta_ads",
    objective: "conversao",
    audience: "Usuários que abandonaram carrinho nos últimos 7 dias, 25-45 anos, interesse em compras online.",
    budget_range: "",
    reach: "",
    clicks: "",
    conversions: "",
    roas: "",
    format_tags: ["Feed único", "Carrossel"],
    success_tags: ["Urgência", "Desconto"],
    failure_tags: ["Evitar desespero", "Evitar falsidade"],
    next_step_tags: [],
    audience_tags: ["Usuários com intenção de compra"],
    deliverable_tags: ["Feed único", "Carrossel produtos", "Stories"],
    message_tags: ["Urgência", "Oferta por tempo limitado"],
    guardrail_tags: ["Evitar falsidade", "Não exagerar no desconto"],
    references_text: "Tom de urgência real, não manipulativa. Desconto real de 15% válido por 48h.",
    campaign_type: "performance",
    tone: "urgente",
    brief_objective: "Recuperar os usuários que abandonaram o carrinho com uma oferta clara e com senso de urgência real, convertendo-os em compras efetivas.",
    what_worked_notes: "",
    what_failed_notes: "",
    learnings: ""
  },
  {
    id: "google-branded",
    title: "Marca no Google",
    description: "Brief para proteger marca e capturar demanda própria",
    tags: ["Google", "Marca", "CTR"],
    campaign_name: "Branded Search",
    channel: "google_ads",
    objective: "awareness",
    audience: "Usuários pesquisando termos da marca diretamente.",
    budget_range: "",
    reach: "",
    clicks: "",
    conversions: "",
    roas: "",
    format_tags: ["Texto ampliado"],
    success_tags: ["Extensões completas"],
    failure_tags: ["Evitar competir com orgánico"],
    next_step_tags: [],
    audience_tags: ["Pesquisadores da marca"],
    deliverable_tags: ["Texto ampliado", "Anúncio dinâmico"],
    message_tags: ["Autoridade da marca", "Diferenciação"],
    guardrail_tags: ["Não fazer falsas claims"],
    references_text: "Tom autoritativo mas amigável. Foco em confiança e qualidade.",
    campaign_type: "branding",
    tone: "inspiracional",
    brief_objective: "Capturar demanda de搜索 orgânica da marca, protegendo o investimento em branding e garantindo que o primeiro contato do usuário com um anúncio seja positivo e relevante.",
    what_worked_notes: "",
    what_failed_notes: "",
    learnings: ""
  },
  {
    id: "instagram-awareness",
    title: "Awareness no Instagram",
    description: "Brief para campanha de reconhecimento de marca",
    tags: ["Instagram", "Awareness", "Engajamento"],
    campaign_name: "Brand Awareness - Q1",
    channel: "instagram",
    objective: "awareness",
    audience: "Mulheres e homens 18-34 interessados em lifestyle, fitness e bem-estar.",
    budget_range: "",
    reach: "",
    clicks: "",
    conversions: "",
    roas: "",
    format_tags: ["Reels", "Stories", "Posts feed"],
    success_tags: ["Conteúdo de valor", "Parcerias"],
    failure_tags: ["Evitar ser muito comercial"],
    next_step_tags: [],
    audience_tags: ["Jovens adultos 18-34"],
    deliverable_tags: ["Reels", "UGC creators", "Parcerias"],
    message_tags: ["Lifestyle", "Comunidade", "Autenticidade"],
    guardrail_tags: ["Evitar linguagem forçada", "Não parecer genérico"],
    references_text: "Tom autêntico e jovem, sem parecer forçadamente descontraído. Referências: Glossier, Aesop.",
    campaign_type: "branding",
    tone: "proximo",
    brief_objective: "Construir reconhecimento de marca entre jovens adultos 18-34 com interesse em lifestyle, criando uma conexão emocional autêntica que se traduza em preferência de marca.",
    what_worked_notes: "",
    what_failed_notes: "",
    learnings: ""
  },
  {
    id: "linkedin-leads",
    title: "Geração de Leads B2B",
    description: "Brief para campanha de generation em LinkedIn",
    tags: ["LinkedIn", "B2B", "Leads"],
    campaign_name: "Lead Gen - Software RH",
    channel: "linkedin",
    objective: "conversao",
    audience: "CHROs, gestores de RH, empresas de tecnologia, 50-500 funcionários.",
    budget_range: "",
    reach: "",
    clicks: "",
    conversions: "",
    roas: "",
    format_tags: ["Mensagem animada", "Carrossel"],
    success_tags: ["Dados relevantes", "Copy direta"],
    failure_tags: ["Evitar jargões vazios"],
    next_step_tags: [],
    audience_tags: ["Executivos e gestores"],
    deliverable_tags: ["Mensagem animada", "Carrossel", "Conteúdo nativo"],
    message_tags: ["ROI comprovado", "Caso de sucesso"],
    guardrail_tags: ["Não exagerar resultados"],
    references_text: "Tom profissional e orientado a resultados. Foco em métricas e casos de sucesso reais.",
    campaign_type: "performance",
    tone: "educativo",
    brief_objective: "Gerar leads qualificados de CHROs e gestores de RH interessados em tecnologia de RH, com custo por lead dentro do orçamento esperado.",
    what_worked_notes: "",
    what_failed_notes: "",
    learnings: ""
  }
];

export function ExamplePicker({ type, onSelect, onClear }: ExamplePickerProps) {
  const examples = type === "debrief" ? debriefExamples : briefExamples;

  function handleSelect(example: ExampleCase) {
    onSelect(example);
    toast.success(`Exemplo "${example.title}" carregado.`);
  }

  return (
    <section className="rounded-[24px] border border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-transparent p-5">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-400">Demonstração</p>
          <Badge variant="warning">Exemplos</Badge>
        </div>
        <h3 className="mt-2 text-xl font-semibold text-text-primary">Teste com exemplos prontos</h3>
        <p className="mt-1 text-sm text-text-secondary">
          Escolha um cenário para ver como o fluxo funciona antes de inserir dados reais.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {examples.map((example) => (
          <Card
            key={example.id}
            className="cursor-pointer overflow-hidden border-border bg-surface-raised transition-all hover:border-amber-500/50 hover:bg-surface-raised/80"
            onClick={() => handleSelect(example)}
          >
            <CardContent className="space-y-2 p-4">
              <p className="font-semibold text-text-primary">{example.title}</p>
              <p className="text-xs text-text-secondary line-clamp-2">{example.description}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {example.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] text-text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="button" variant="secondary" onClick={onClear} className="gap-2 text-xs">
          <Wand2 className="h-3 w-3" />
          Começar do zero
        </Button>
      </div>
    </section>
  );
}
