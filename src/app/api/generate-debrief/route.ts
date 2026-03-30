import { composeNarrativeSection } from "@/lib/briefloop";
import { MiniMaxClient, OpenRouterClient } from "@/lib/minimax";
import {
  assertBudgetRange,
  assertChannel,
  assertObjective,
  getOptionalFiniteNumber,
  getOptionalString,
  getRequiredString,
  getStringArray,
  RequestValidationError
} from "@/lib/request-validation";
import { checkRateLimitWithGlobal, isSupabaseConfigured } from "@/lib/rate-limiter";
import { supabaseServerRequest } from "@/lib/supabase-server";

export const runtime = "edge";

function createDemoDebrief(input: {
  campaign_name: string;
  channel: string;
  objective: string;
  audience: string | null;
  budget_range: string | null;
  metrics: { reach: number | null; clicks: number | null; conversions: number | null; roas: number | null };
  what_worked: string;
  what_failed: string;
  learnings: string;
}) {
  const metricHighlights = [
    input.metrics.reach ? `alcance de ${input.metrics.reach}` : null,
    input.metrics.clicks ? `${input.metrics.clicks} cliques` : null,
    input.metrics.conversions ? `${input.metrics.conversions} conversões` : null,
    input.metrics.roas ? `ROAS ${input.metrics.roas}` : null
  ]
    .filter(Boolean)
    .join(", ");

  return `**1. Resumo Executivo**
A campanha ${input.campaign_name} em ${input.channel} foi registrada em modo demonstração, com foco em ${input.objective}. ${
    metricHighlights ? `Os sinais capturados indicam ${metricHighlights}.` : "Mesmo sem métricas completas, já existe contexto suficiente para uma leitura estratégica inicial."
  }

**2. O que funcionou e por quê**
${input.what_worked}. Esses elementos sugerem aderência entre formato, mensagem e atenção da audiência${input.audience ? ` (${input.audience})` : ""}, especialmente quando a execução pareceu mais natural e objetiva.

**3. O que não funcionou - hipóteses**
${input.what_failed}. A hipótese principal é desalinhamento entre proposta criativa, clareza de CTA e distribuição de investimento${input.budget_range ? ` dentro da faixa ${input.budget_range}` : ""}.

**4. Recomendações para campanhas futuras**
1. Repetir os elementos de maior aderência e consolidar o formato que sustentou melhor atenção e resposta.
2. Simplificar CTA, mensagem e estrutura da peça para reduzir fricção na leitura da oferta.
3. Testar a próxima rodada com base nos aprendizados já mapeados: ${input.learnings}.`;
}

export async function POST(request: Request) {
  try {
    const rateLimitResult = await checkRateLimitWithGlobal(request, "debrief");

    if (!rateLimitResult.allowed) {
      const message =
        rateLimitResult.bucketResult.limit === -1
          ? "Limite de rate limit atingido. Tente novamente mais tarde."
          : `Você atingiu o limite de ${rateLimitResult.bucketResult.limit} gerações de debrief por 5 horas. Tente novamente mais tarde.`;

      return Response.json({ error: "Limite atingido", message }, { status: 429 });
    }

    const body = await request.json();
    const campaign_name = getRequiredString(body.campaign_name, "Nome da campanha", 120);
    const channel = getRequiredString(body.channel, "Canal", 40);
    const objective = getRequiredString(body.objective, "Objetivo", 40);
    const success_tags = getStringArray(body.success_tags, 8, 120);
    const failure_tags = getStringArray(body.failure_tags, 8, 120);
    const next_step_tags = getStringArray(body.next_step_tags, 8, 120);
    const format_tags = getStringArray(body.format_tags, 8, 120);

    assertChannel(channel);
    assertObjective(objective);

    const what_worked = composeNarrativeSection(
      [...format_tags, ...success_tags],
      getOptionalString(body.what_worked, 1500) ?? getOptionalString(body.what_worked_notes, 1500) ?? "",
      ""
    );
    const what_failed = composeNarrativeSection(
      failure_tags,
      getOptionalString(body.what_failed, 1500) ?? getOptionalString(body.what_failed_notes, 1500) ?? "",
      ""
    );

    if (!campaign_name || !channel || !objective || !what_worked || !what_failed) {
      return Response.json(
        {
          error: "Dados inválidos",
          message: "Preencha os campos obrigatórios para gerar o debriefing."
        },
        { status: 400 }
      );
    }

    const audience = getOptionalString(body.audience, 500);
    const budget_range = getOptionalString(body.budget_range, 30);
    assertBudgetRange(budget_range);
    const learnings = composeNarrativeSection(
      next_step_tags,
      getOptionalString(body.learnings, 1500) ?? "",
      "Não informado"
    );
    const incomingMetrics = typeof body.metrics === "object" && body.metrics ? body.metrics : {};

    const metrics = {
      reach: getOptionalFiniteNumber((incomingMetrics as Record<string, unknown>).reach, "Reach"),
      clicks: getOptionalFiniteNumber((incomingMetrics as Record<string, unknown>).clicks, "Cliques"),
      conversions: getOptionalFiniteNumber((incomingMetrics as Record<string, unknown>).conversions, "Conversões"),
      roas: getOptionalFiniteNumber((incomingMetrics as Record<string, unknown>).roas, "ROAS")
    };

    const minimaxClient = MiniMaxClient.create();
    const openrouterClient = OpenRouterClient.create();

    let summary: string;
    let mode: "live" | "demo";

    // Tenta MiniMax primeiro, depois OpenRouter como fallback
    let triedOpenRouter = false;

    try {
      if (minimaxClient) {
        summary = await minimaxClient.generate(
          `Com base nos dados desta campanha, gere um debriefing profissional e narrativo estruturado em 4 seções:

**1. Resumo Executivo**
2-3 frases que capturam a essência do que aconteceu e o resultado principal.

**2. O que funcionou e por quê**
Análise dos elementos bem-sucedidos. Explique os mecanismos, não apenas liste.

**3. O que não funcionou - hipóteses**
Análise honesta das falhas com hipóteses do porquê. Sem suavizar.

**4. Recomendações para campanhas futuras**
Exatamente 3 recomendações acionáveis e específicas, numeradas.

---
DADOS DA CAMPANHA:
Nome: ${campaign_name}
Canal: ${channel}
Objetivo: ${objective}
Público-alvo: ${audience || "Não informado"}
Budget: ${budget_range || "Não informado"}
Métricas: ${JSON.stringify(metrics)}
O que funcionou: ${what_worked}
O que não funcionou: ${what_failed}
Aprendizados: ${learnings}`,
          1024
        );
        mode = "live";
      } else if (openrouterClient) {
        triedOpenRouter = true;
        summary = await openrouterClient.generate(
          `Com base nos dados desta campanha, gere um debriefing profissional e narrativo estruturado em 4 seções:

**1. Resumo Executivo**
2-3 frases que capturam a essência do que aconteceu e o resultado principal.

**2. O que funcionou e por quê**
Análise dos elementos bem-sucedidos. Explique os mecanismos, não apenas liste.

**3. O que não funcionou - hipóteses**
Análise honesta das falhas com hipóteses do porquê. Sem suavizar.

**4. Recomendações para campanhas futuras**
Exatamente 3 recomendações acionáveis e específicas, numeradas.

---
DADOS DA CAMPANHA:
Nome: ${campaign_name}
Canal: ${channel}
Objetivo: ${objective}
Público-alvo: ${audience || "Não informado"}
Budget: ${budget_range || "Não informado"}
Métricas: ${JSON.stringify(metrics)}
O que funcionou: ${what_worked}
O que não funcionou: ${what_failed}
Aprendizados: ${learnings}`,
          1024
        );
        mode = "live";
      } else {
        summary = createDemoDebrief({
          campaign_name,
          channel,
          objective,
          audience,
          budget_range,
          metrics,
          what_worked,
          what_failed,
          learnings
        });
        mode = "demo";
      }
    } catch {
      // Se MiniMax falhou, tentar OpenRouter
      if (!triedOpenRouter && openrouterClient) {
        try {
          summary = await openrouterClient.generate(
            `Com base nos dados desta campanha, gere um debriefing profissional e narrativo estruturado em 4 seções:

**1. Resumo Executivo**
2-3 frases que capturam a essência do que aconteceu e o resultado principal.

**2. O que funcionou e por quê**
Análise dos elementos bem-sucedidos. Explique os mecanismos, não apenas liste.

**3. O que não funcionou - hipóteses**
Análise honesta das falhas com hipóteses do porquê. Sem suavizar.

**4. Recomendações para campanhas futuras**
Exatamente 3 recomendações acionáveis e específicas, numeradas.

---
DADOS DA CAMPANHA:
Nome: ${campaign_name}
Canal: ${channel}
Objetivo: ${objective}
Público-alvo: ${audience || "Não informado"}
Budget: ${budget_range || "Não informado"}
Métricas: ${JSON.stringify(metrics)}
O que funcionou: ${what_worked}
O que não funcionou: ${what_failed}
Aprendizados: ${learnings}`,
            1024
          );
          mode = "live";
        } catch {
          summary = createDemoDebrief({
            campaign_name,
            channel,
            objective,
            audience,
            budget_range,
            metrics,
            what_worked,
            what_failed,
            learnings
          });
          mode = "demo";
        }
      } else {
        summary = createDemoDebrief({
          campaign_name,
          channel,
          objective,
          audience,
          budget_range,
          metrics,
          what_worked,
          what_failed,
          learnings
        });
        mode = "demo";
      }
    }

    let debrief_id: string | null = null;

    if (isSupabaseConfigured()) {
      const data = await supabaseServerRequest("debriefings?select=id", {
        method: "POST",
        headers: {
          Prefer: "return=representation"
        },
        body: JSON.stringify({
          campaign_name,
          channel,
          objective,
          audience,
          budget_range,
          metrics,
          what_worked,
          what_failed,
          learnings: learnings === "Não informado" ? null : learnings,
          generated_summary: summary
        })
      });

      debrief_id = data?.[0]?.id ?? null;
    }

    return Response.json({ summary, debrief_id, mode });
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
        error: "Falha ao gerar debriefing",
        message: "Não conseguimos gerar o debriefing agora. Tente novamente em instantes."
      },
      { status: 500 }
    );
  }
}
