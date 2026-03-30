import { BriefContextSource, composeBriefSection } from "@/lib/briefloop";
import { MiniMaxClient, OpenRouterClient } from "@/lib/minimax";
import {
  assertCampaignType,
  assertChannel,
  assertTone,
  getOptionalString,
  getRequiredString,
  getStringArray,
  RequestValidationError
} from "@/lib/request-validation";
import { checkRateLimitWithGlobal, isSupabaseConfigured } from "@/lib/rate-limiter";
import { supabaseServerRequest } from "@/lib/supabase-server";

export const runtime = "edge";

function createDemoBrief(input: {
  campaign_type: string;
  channel: string;
  audience: string;
  objective: string;
  tone: string;
  references_text: string;
  deliverableContext: string;
  messageContext: string;
  guardrailContext: string;
}) {
  return `**1. Visão Geral**
Esta é uma geração em modo demonstração para uma campanha de ${input.campaign_type} no canal ${input.channel}. O foco estratégico é ${input.objective.toLowerCase()} para ${input.audience.toLowerCase()}.

**2. Objetivo de Comunicação**
Queremos que o público reconheça valor, sinta clareza na proposta e avance para a próxima ação com menos fricção.

**3. Tom de Voz e Personalidade**
O tom deve seguir uma linha ${input.tone}, equilibrando objetividade com desejo e confiança.

**4. Mensagem Principal**
Grande ideia: transformar a campanha em uma proposta fácil de entender e desejável de agir.
Mensagens de suporte:
- Mostrar valor concreto rapidamente.
- Reforçar credibilidade e contexto.
- Conduzir para uma ação simples.

**5. Diretrizes Criativas**
Formatos sugeridos: ${input.deliverableContext}.
Direção de mensagem: ${input.messageContext}.
Referências adicionais: ${input.references_text || "Nenhuma"}.

**6. ⚠️ O que EVITAR**
${input.guardrailContext}.

**7. ✅ O que REPLICAR**
Usar estrutura enxuta, proposta clara, abertura forte e consistência entre criativo, mensagem e CTA.

**8. KPIs Sugeridos**
- CTR
- Taxa de conversão
- CPC ou CPM conforme canal
- Qualidade do tráfego e engajamento com a peça`;
}

export async function POST(request: Request) {
  try {
    const rateLimitResult = await checkRateLimitWithGlobal(request, "brief");

    if (!rateLimitResult.allowed) {
      const message =
        rateLimitResult.bucketResult.limit === -1
          ? "Limite de rate limit atingido. Tente novamente mais tarde."
          : `Você atingiu o limite de ${rateLimitResult.bucketResult.limit} gerações de brief por 5 horas. Tente novamente mais tarde.`;

      return Response.json({ error: "Limite atingido", message }, { status: 429 });
    }

    const body = await request.json();

    const campaign_type = getRequiredString(body.campaign_type, "Tipo de campanha", 40);
    const channel = getRequiredString(body.channel, "Canal", 40);
    const audience_tags = getStringArray(body.audience_tags, 8, 160);
    const deliverable_tags = getStringArray(body.deliverable_tags, 8, 160);
    const message_tags = getStringArray(body.message_tags, 8, 160);
    const guardrail_tags = getStringArray(body.guardrail_tags, 8, 160);
    const audience = composeBriefSection(audience_tags, getOptionalString(body.audience, 1500) ?? "", "");
    const objective = composeBriefSection(message_tags, getOptionalString(body.objective, 1500) ?? "", "");
    const tone = getRequiredString(body.tone, "Tom de voz", 40);
    const references_text = getOptionalString(body.references_text, 1500) ?? "";

    assertCampaignType(campaign_type);
    assertChannel(channel);
    assertTone(tone);

    const deliverableContext = composeBriefSection(deliverable_tags, "", "Nenhum");
    const messageContext = composeBriefSection(message_tags, "", "Nenhuma");
    const guardrailContext = composeBriefSection(guardrail_tags, "", "Nenhuma");
    const selectedDebriefs = Array.isArray(body.selected_debriefs)
      ? body.selected_debriefs.filter(
          (item: unknown): item is BriefContextSource =>
            typeof item === "object" &&
            item !== null &&
            typeof (item as BriefContextSource).id === "string" &&
            typeof (item as BriefContextSource).campaign_name === "string" &&
            typeof (item as BriefContextSource).channel === "string" &&
            typeof (item as BriefContextSource).objective === "string" &&
            typeof (item as BriefContextSource).what_worked === "string" &&
            typeof (item as BriefContextSource).what_failed === "string"
        )
          .map((item: BriefContextSource) => ({
            ...item,
            id: item.id.trim().slice(0, 120),
            campaign_name: item.campaign_name.trim().slice(0, 120),
            channel: item.channel.trim().slice(0, 40),
            objective: item.objective.trim().slice(0, 80),
            what_worked: item.what_worked.trim().slice(0, 1500),
            what_failed: item.what_failed.trim().slice(0, 1500),
            generated_summary: typeof item.generated_summary === "string" ? item.generated_summary.trim().slice(0, 4000) : null
          }))
          .filter(
            (item: BriefContextSource) => item.id && item.campaign_name && item.channel && item.objective && item.what_worked && item.what_failed
          )
      : [];

    if (!campaign_type || !channel || !audience || !objective || !tone) {
      return Response.json(
        {
          error: "Dados inválidos",
          message: "Preencha os campos obrigatórios para gerar o brief."
        },
        { status: 400 }
      );
    }

    const debriefings = isSupabaseConfigured()
      ? ((await supabaseServerRequest(
          "debriefings?select=id,campaign_name,channel,objective,what_worked,what_failed,generated_summary" +
            `&or=(channel.eq.${encodeURIComponent(channel)},objective.eq.${encodeURIComponent(objective)})&order=created_at.desc&limit=3`
        )) ?? [])
      : [];

    const sourceItems = [
      ...selectedDebriefs,
      ...(debriefings as Array<{
        id: string;
        campaign_name: string;
        channel: string;
        objective: string;
        what_worked: string;
        what_failed: string;
        generated_summary: string | null;
      }>)
    ].filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index) as Array<{
      id: string;
      campaign_name: string;
      channel: string;
      objective: string;
      what_worked: string;
      what_failed: string;
      generated_summary: string | null;
    }>;
    const context = sourceItems.length
      ? sourceItems
          .map(
            (item, index) => `Campanha ${index + 1}
Nome: ${item.campaign_name}
Canal: ${item.channel}
Objetivo: ${item.objective}
Resumo: ${item.generated_summary || "Sem resumo"}
O que funcionou: ${item.what_worked}
O que falhou: ${item.what_failed}`
          )
          .join("\n\n")
      : "Nenhuma campanha anterior registrada ainda.";

    const minimaxClient = MiniMaxClient.create();
    const openrouterClient = OpenRouterClient.create();

    let brief: string;
    let mode: "live" | "demo";
    let triedOpenRouter = false;

    const briefPrompt = `Gere um brief criativo completo e acionável para a campanha descrita abaixo.
Use o histórico de campanhas anteriores da agência como contexto.

═══ HISTÓRICO DE CAMPANHAS ANTERIORES ═══
${context}

═══ NOVA CAMPANHA ═══
Tipo: ${campaign_type}
Canal: ${channel}
Público-alvo: ${audience}
Objetivo: ${objective}
Tom de voz: ${tone}
Referências: ${references_text || "Nenhuma"}
Formatos desejados: ${deliverableContext}
Pistas de mensagem: ${messageContext}
Restrições e cuidados: ${guardrailContext}

═══ ESTRUTURA DO BRIEF ═══
Gere o brief com exatamente estas seções:

**1. Visão Geral**
Contexto, momento de mercado e o que esta campanha representa.

**2. Objetivo de Comunicação**
O que queremos que o público sinta, pense ou faça. Seja preciso.

**3. Tom de Voz e Personalidade**
Como a marca deve soar nesta campanha. Exemplos de linguagem.

**4. Mensagem Principal**
A grande ideia em uma frase. Mensagens de suporte (máximo 3).

**5. Diretrizes Criativas**
Formatos recomendados, referências visuais, estrutura de conteúdo.

**6. ⚠️ O que EVITAR**
Baseado no histórico: o que já foi testado e não funcionou neste contexto.

**7. ✅ O que REPLICAR**
Baseado no histórico: táticas e abordagens comprovadas para este canal/objetivo.

**8. KPIs Sugeridos**
3-4 métricas prioritárias com benchmarks esperados.`;

    try {
      if (minimaxClient) {
        brief = await minimaxClient.generate(briefPrompt, 2048);
        mode = "live";
      } else if (openrouterClient) {
        triedOpenRouter = true;
        brief = await openrouterClient.generate(briefPrompt, 2048);
        mode = "live";
      } else {
        brief = createDemoBrief({
          campaign_type,
          channel,
          audience,
          objective,
          tone,
          references_text,
          deliverableContext,
          messageContext,
          guardrailContext
        });
        mode = "demo";
      }
    } catch {
      if (!triedOpenRouter && openrouterClient) {
        try {
          brief = await openrouterClient.generate(briefPrompt, 2048);
          mode = "live";
        } catch {
          brief = createDemoBrief({
            campaign_type,
            channel,
            audience,
            objective,
            tone,
            references_text,
            deliverableContext,
            messageContext,
            guardrailContext
          });
          mode = "demo";
        }
      } else {
        brief = createDemoBrief({
          campaign_type,
          channel,
          audience,
          objective,
          tone,
          references_text,
          deliverableContext,
          messageContext,
          guardrailContext
        });
        mode = "demo";
      }
    }

    const context_debrief_ids = sourceItems.map((item) => item.id);

    if (isSupabaseConfigured()) {
      await supabaseServerRequest("briefs", {
        method: "POST",
        headers: {
          Prefer: "return=minimal"
        },
        body: JSON.stringify({
          campaign_type,
          channel,
          audience,
          objective,
          tone,
          references_text,
          context_debrief_ids,
          generated_brief: brief
        })
      });
    }

    return Response.json({
      brief,
      mode,
      sources: sourceItems.map((item) => ({
        id: item.id,
        campaign_name: item.campaign_name,
        channel: item.channel,
        objective: item.objective
      }))
    });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return Response.json(
        {
          error: "Dados inválidos",
          message: error.message
        },
        { status: 400 }
      );
    }

    console.error(error instanceof Error ? error.message : String(error));
    return Response.json(
      {
        error: "Falha ao gerar brief",
        message: "Não conseguimos gerar o brief agora. Tente novamente em instantes."
      },
      { status: 500 }
    );
  }
}
