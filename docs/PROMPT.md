# BriefLoop — Build Prompt para Claude Code

> Este documento contém o prompt completo utilizado para gerar o projeto via Claude Code.  
> Para replicar ou estender o projeto, cole o conteúdo da seção "Prompt" diretamente no Claude Code.

---

## Contexto de Uso

**Ferramenta:** Claude Code (terminal)  
**Abordagem:** Vibe Coding — geração guiada por prompt detalhado  
**Stack alvo:** Next.js 14 + Supabase + Anthropic API + Vercel  

---

## Prompt

```
Você é um engenheiro sênior full-stack. Vou descrever uma aplicação completa 
para construir. Leia tudo antes de começar. Siga todas as instruções com precisão.
Confirme cada etapa antes de prosseguir para a próxima.

═══════════════════════════════════════════════════════
VISÃO GERAL DO PROJETO
═══════════════════════════════════════════════════════

Nome: BriefLoop
Tagline: A memória criativa da sua agência.

Descrição: Aplicação web que conecta o debriefing pós-campanha com a geração 
de briefs criativos pré-campanha. A IA usa o histórico real de campanhas da 
agência como contexto para gerar novos briefs mais inteligentes.

Sem autenticação. Interface aberta, acessível por qualquer pessoa com o link.

═══════════════════════════════════════════════════════
STACK OBRIGATÓRIA
═══════════════════════════════════════════════════════

- Next.js 14 com App Router e TypeScript estrito
- Tailwind CSS v3
- shadcn/ui (init com: style=default, baseColor=slate, cssVariables=true)
- Anthropic SDK (@anthropic-ai/sdk) — modelo: claude-haiku-3-20240307
- Supabase (@supabase/supabase-js v2)
- Vercel KV (@vercel/kv) para rate limiting
- sonner para toasts
- lucide-react para ícones

IMPORTANTE: A API key da Anthropic NUNCA deve aparecer no código cliente.
Todas as chamadas à IA devem passar por Route Handlers do Next.js 
(Edge Runtime) que atuam como proxy seguro.

═══════════════════════════════════════════════════════
DESIGN SYSTEM
═══════════════════════════════════════════════════════

Tema: dark, editorial, sóbrio com acentos quentes.

Cores (CSS variables no globals.css):
  --background:     #0F172A  (slate-900)
  --surface:        #1E293B  (slate-800)
  --surface-raised: #334155  (slate-700)
  --border:         #334155
  --text-primary:   #F8FAFC  (slate-50)
  --text-secondary: #94A3B8  (slate-400)
  --accent:         #F59E0B  (amber-500)
  --accent-hover:   #D97706  (amber-600)
  --success:        #10B981  (emerald-500)
  --danger:         #EF4444  (red-500)

Tipografia (Google Fonts — adicionar no layout.tsx via next/font):
  Display: "Instrument Serif" — usado em headings h1 e h2
  Corpo: "DM Sans" — usado em todo o restante

Componentes base:
  - Todos os cards usam bg-surface, border border-border, rounded-xl
  - Botão primário: bg-accent text-slate-900 font-semibold hover:bg-accent-hover
  - Botão secundário: border border-border text-text-secondary hover:bg-surface-raised
  - Inputs: bg-surface-raised border-border text-text-primary placeholder:text-text-secondary
  - Labels: text-text-secondary text-sm font-medium mb-1
  - Foco: ring-2 ring-accent ring-offset-2 ring-offset-background

Spacing e layout:
  - Max width do conteúdo: max-w-2xl mx-auto
  - Padding de página: px-4 py-8 md:py-16
  - Gap entre seções: space-y-8

═══════════════════════════════════════════════════════
ESTRUTURA DE ARQUIVOS
═══════════════════════════════════════════════════════

Crie exatamente esta estrutura:

briefloop/
├── docs/
│   └── PROMPT.md
├── supabase/
│   └── seed.sql
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                        ← Home
│   │   ├── globals.css
│   │   ├── debrief/
│   │   │   └── page.tsx                    ← Formulário debriefing
│   │   ├── brief/
│   │   │   └── page.tsx                    ← Gerador de brief
│   │   ├── biblioteca/
│   │   │   └── page.tsx                    ← Histórico
│   │   └── api/
│   │       ├── generate-debrief/
│   │       │   └── route.ts                ← Edge Function
│   │       └── generate-brief/
│   │           └── route.ts                ← Edge Function
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── DebreifForm.tsx
│   │   ├── BriefForm.tsx
│   │   ├── ResultCard.tsx
│   │   ├── DebriefCard.tsx
│   │   └── RateLimitBanner.tsx
│   └── lib/
│       ├── supabase.ts
│       ├── supabase-server.ts
│       └── utils.ts
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
└── package.json

═══════════════════════════════════════════════════════
SCHEMA DO BANCO DE DADOS (SUPABASE)
═══════════════════════════════════════════════════════

Crie o arquivo supabase/seed.sql com o seguinte conteúdo completo:

-- Criação das tabelas
create table if not exists debriefings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  campaign_name text not null,
  channel text not null,
  objective text not null,
  audience text,
  budget_range text,
  metrics jsonb default '{}',
  what_worked text not null,
  what_failed text not null,
  learnings text,
  generated_summary text,
  tags text[] default '{}'
);

create table if not exists briefs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  campaign_type text not null,
  channel text not null,
  audience text not null,
  objective text not null,
  tone text,
  references_text text,
  context_debrief_ids uuid[] default '{}',
  generated_brief text not null
);

create index if not exists idx_debriefings_channel 
  on debriefings(channel);
create index if not exists idx_debriefings_objective 
  on debriefings(objective);
create index if not exists idx_debriefings_created 
  on debriefings(created_at desc);

-- Seed: 5 debriefings de exemplo realistas
insert into debriefings 
  (campaign_name, channel, objective, audience, budget_range, 
   metrics, what_worked, what_failed, learnings, generated_summary, tags)
values
(
  'Lançamento Linha Verão — Marca X',
  'instagram',
  'Lançamento',
  'Mulheres 25-35, classes B/C, interesse em moda e lifestyle',
  'R$5k–R$20k',
  '{"reach": 420000, "clicks": 8200, "conversions": 310, "roas": 3.8}',
  'Reels curtos (até 15s) com transição rápida tiveram CTR 2,3x maior que posts estáticos. Influenciadores micro com audiência nichada em moda sustentável performaram melhor que perfis grandes generalistas. Horário 18h–20h foi consistentemente o de maior engajamento.',
  'Stories com link direto para produto tiveram taxa de clique abaixo do esperado — a narrativa era muito direta, sem construção de desejo. Budget alocado em posts patrocinados estáticos foi praticamente desperdiçado.',
  'Para próximas campanhas de lançamento: priorizar Reels com storytelling emocional nos primeiros 3 segundos. Reduzir verba em posts estáticos e realocar para Reels e parcerias micro. Testar CTA mais sutil no Stories.',
  'Campanha de lançamento com resultado acima da média em alcance e ROAS. O principal aprendizado foi a superioridade do formato Reels curtos e a importância da escolha criteriosa de influenciadores nichados. Stories precisam de mais narrativa e menos venda direta.',
  ARRAY['instagram', 'lancamento', 'reels', 'influenciadores', 'moda']
),
(
  'Black Friday — E-commerce Eletrônicos',
  'google_ads',
  'Conversão',
  'Homens e mulheres 28-45, intenção de compra alta, pesquisa ativa por produto',
  'Acima de R$50k',
  '{"reach": 980000, "clicks": 42000, "conversions": 1840, "roas": 5.2}',
  'Campanhas de Search com correspondência exata para termos de alta intenção (ex: "comprar [produto] mais barato") tiveram ROAS 5,2. Landing pages específicas por categoria, sem menu de navegação, reduziram bounce rate em 31%. Extensões de preço no Google Ads aumentaram CTR em 18%.',
  'Campanhas de Display tiveram custo altíssimo e conversão negligenciável — não faz sentido para e-commerce em período promocional competitivo. Iniciamos os anúncios tarde (D-3) e perdemos o pico de pesquisa do período D-7 a D-5.',
  'Em próxima Black Friday: iniciar campanhas de aquecimento (remarketing + awareness) 10 dias antes. Concentrar 80% do budget em Search de alta intenção. Zerar Display. Criar landing pages dedicadas por categoria de produto.',
  'Black Friday com ROAS 5,2 — acima da meta de 4,0. Search de alta intenção foi o motor da campanha. Display consumiu budget sem retorno. A principal lição operacional é começar mais cedo com campanha de aquecimento.',
  ARRAY['google_ads', 'conversao', 'black_friday', 'search', 'ecommerce']
),
(
  'Campanha de Retenção — App de Finanças',
  'email',
  'Retenção',
  'Usuários ativos há mais de 3 meses que não acessam o app há 30+ dias',
  'Até R$5k',
  '{"reach": 12000, "clicks": 2100, "conversions": 680, "roas": 0}',
  'Sequência de 3 emails com intervalo de 2 dias teve taxa de reativação 2,4x maior que email único. Assunto personalizado com nome do usuário e dado específico da conta dele (ex: "Seu saldo te espera, João") teve abertura de 38% vs 14% do genérico. Tom empático e sem pressão funcionou muito melhor que urgência artificial.',
  'Emails enviados às 9h da manhã performaram muito abaixo dos enviados às 19h. Imagens pesadas causaram problema de renderização em clientes mobile — 40% da base. CTA com múltiplas opções ("ver extrato", "fazer transferência", "ver ofertas") gerou paralisia — taxa de clique foi menor que email com CTA único.',
  'Para campanhas de retenção por email: enviar sempre entre 18h–21h. Um único CTA claro. Personalização com dado real da conta é diferencial enorme. Sequência de 3 emails supera email único consistentemente. Testar AMP for Email para interatividade.',
  'Campanha de reativação de usuários dormentes com taxa de reativação de 5,7% — acima da média do setor (3-4%). Personalização real e tom empático foram os fatores decisivos. Aprendizados de horário e CTA único são aplicáveis a todas as futuras campanhas de email.',
  ARRAY['email', 'retencao', 'reativacao', 'personalizacao', 'fintech']
),
(
  'Branding Institucional — Construtora Regional',
  'linkedin',
  'Awareness',
  'Gestores e diretores de empresas, engenheiros, arquitetos — decisores B2B',
  'R$5k–R$20k',
  '{"reach": 85000, "clicks": 1200, "conversions": 45, "roas": 0}',
  'Artigos longos assinados pelo CEO com perspectiva genuína sobre o mercado imobiliário tiveram alcance orgânico 3x maior que posts institucionais. Vídeos de obra com bastidores (processo construtivo, equipe) geraram alto engajamento qualitativo — comentários de potenciais parceiros. Formato carrossel com dados de mercado foi o mais compartilhado.',
  'Posts puramente promocionais ("Conheça nosso novo empreendimento") tiveram alcance mínimo e zero engajamento qualificado. Frequência de 5 posts por semana causou queda na qualidade — melhor seria 3 posts muito bem elaborados.',
  'LinkedIn para B2B funciona com thought leadership, não promoção. Próximas campanhas: 2-3 posts por semana, CEO como voz principal, mistura de dados de mercado + bastidores + opinião. Evitar qualquer linguagem de anúncio.',
  'Campanha de branding B2B no LinkedIn com foco em thought leadership. O principal aprendizado é que autenticidade e perspectiva genuína superam qualquer formato promocional nessa plataforma. A voz do CEO como autor principal foi o diferencial de alcance.',
  ARRAY['linkedin', 'awareness', 'branding', 'b2b', 'thought_leadership']
),
(
  'Lançamento de Produto — Suplemento Esportivo',
  'tiktok',
  'Lançamento',
  'Jovens 18-28, praticantes de academia, interesse em performance e estética',
  'R$5k–R$20k',
  '{"reach": 1200000, "clicks": 15000, "conversions": 420, "roas": 2.1}',
  'Vídeos no formato "antes e depois" de atletas reais (não modelos) tiveram 4x mais compartilhamentos. Som original com tendência da plataforma aumentou alcance orgânico substancialmente. Dueto e stitch com criadores da comunidade fitness geraram engajamento autêntico. Melhor horário: 20h–23h.',
  'ROAS de 2,1 ficou abaixo da meta de 3,0 — o TikTok ainda está construindo audiência para a marca, não é canal de conversão direta ainda. Vídeos muito produzidos (iluminação de estúdio, corte profissional) pareceram falsos para a audiência do TikTok e tiveram baixo desempenho.',
  'TikTok é canal de construção de marca para esse público, não de conversão imediata — ajustar expectativa de ROAS. Autenticidade supera produção: vídeos "crus" com atletas reais performam melhor. Investir em comunidade e UGC. Próxima campanha: meta de awareness/engajamento, não ROAS.',
  'Lançamento com alcance expressivo de 1,2M no TikTok, mas ROAS abaixo da meta. O aprendizado central é calibrar expectativa para o canal: TikTok constrói marca e comunidade, converte com latência maior. Autenticidade é inegociável nessa plataforma.',
  ARRAY['tiktok', 'lancamento', 'ugc', 'awareness', 'suplementos']
);

═══════════════════════════════════════════════════════
IMPLEMENTAÇÃO — PÁGINA A PÁGINA
═══════════════════════════════════════════════════════

── src/app/layout.tsx ──────────────────────────────────

- Importar Instrument Serif e DM Sans via next/font/google
- Aplicar DM Sans como fonte base no body
- Incluir <Toaster /> do sonner
- Background: bg-background (var --background)
- Incluir <Header /> e <Footer /> wrappando {children}

── src/app/page.tsx (Home) ─────────────────────────────

Layout centralizado, padding generoso.

Conteúdo:
1. Logo "BriefLoop" em Instrument Serif, tamanho grande, cor accent
2. Tagline: "A memória criativa da sua agência." em text-secondary
3. Subtítulo menor: "Registre o que funcionou. Gere briefs melhores."
4. Dois cards lado a lado (grid 2 cols no md, 1 col no mobile):
   
   Card 1 — "Registrar Campanha"
   - Ícone: BookOpen (lucide)
   - Título: "Registrar Campanha"
   - Descrição: "Documente os resultados e aprendizados de uma campanha encerrada."
   - Link para: /debrief
   - Hover: border-accent, leve scale-[1.02] transition

   Card 2 — "Criar Brief"
   - Ícone: Sparkles (lucide)  
   - Título: "Criar Brief Inteligente"
   - Descrição: "Gere um brief criativo baseado no histórico real da sua agência."
   - Link para: /brief
   - Hover: border-accent, leve scale-[1.02] transition

5. Link discreto abaixo dos cards: "Ver histórico de campanhas →" → /biblioteca

── src/app/debrief/page.tsx ────────────────────────────

Título da página: "Registrar Campanha" (Instrument Serif, h1)
Subtítulo: "Documente os aprendizados enquanto estão frescos."

Formulário (componente DebreifForm):

Campos na ordem:
1. Nome da campanha — input text, required
2. Canal principal — select:
   options: instagram | google_ads | tiktok | meta_ads | 
            email | linkedin | youtube | outro
   labels:  Instagram | Google Ads | TikTok | Meta Ads | 
            E-mail Marketing | LinkedIn | YouTube | Outro
3. Objetivo — select:
   options: awareness | engajamento | conversao | retencao | lancamento
   labels:  Awareness | Engajamento | Conversão | Retenção | Lançamento
4. Público-alvo — textarea, opcional, 2 rows
5. Faixa de budget — select:
   options: ate5k | 5k_20k | 20k_50k | acima50k
   labels:  Até R$5k | R$5k – R$20k | R$20k – R$50k | Acima de R$50k
6. Métricas (grid 2x2, todos opcionais, tipo number):
   - Alcance total
   - Cliques
   - Conversões
   - ROAS
7. O que funcionou — textarea required, 4 rows
   placeholder: "Seja específico: formatos, horários, copies, criativos..."
8. O que não funcionou — textarea required, 4 rows
   placeholder: "O que você faria diferente? O que desperdiçou budget?"
9. Aprendizados e próximos passos — textarea opcional, 3 rows

Botão submit: "Gerar Debriefing com IA"
- Mostra spinner + "Analisando campanha..." durante o loading
- Desabilitado durante loading

Após submissão bem-sucedida:
- Esconde o formulário
- Exibe componente ResultCard com o debriefing gerado
- ResultCard deve ter:
  - Header: nome da campanha + badge do canal
  - O texto gerado pela IA formatado (preservar quebras de linha)
  - Botão "Copiar debriefing" (usa navigator.clipboard)
  - Botão "Registrar outra campanha" (limpa e volta ao form)
  - Botão "Ver na biblioteca" → /biblioteca

── src/app/brief/page.tsx ──────────────────────────────

Título: "Criar Brief Inteligente" (Instrument Serif, h1)
Subtítulo: "Gere um brief baseado no histórico da sua agência."

Formulário (componente BriefForm):

Campos:
1. Tipo de campanha — select:
   options: lancamento | sazonal | branding | performance | retencao | outro
   labels:  Lançamento de Produto | Campanha Sazonal | Branding/Awareness | 
            Performance/Conversão | Retenção/Fidelização | Outro
2. Canal principal — mesmo select do /debrief
3. Público-alvo — textarea required, 3 rows
4. Objetivo principal — textarea required, 3 rows
   placeholder: "O que você quer que o público sinta, pense ou faça?"
5. Tom de voz — select:
   options: inspiracional | educativo | urgente | divertido | luxo | proximo
   labels:  Inspiracional | Educativo | Urgente/Direto | Divertido | 
            Luxo/Premium | Próximo/Humano
6. Referências ou inspirações — textarea opcional, 2 rows

Botão submit: "Gerar Brief com IA"
- Loading: spinner + "Buscando histórico e gerando brief..."

Após submissão:
- Exibe ResultCard com o brief gerado
- Se houver debriefings usados como contexto, exibir seção abaixo do brief:
  "Baseado em [N] campanha(s) anterior(es):"
  - Lista com cards compactos de cada debriefing usado
    (nome, canal badge, objetivo badge)
- Botões: "Copiar brief" e "Criar outro brief"

── src/app/biblioteca/page.tsx ─────────────────────────

Título: "Histórico de Campanhas" (Instrument Serif, h1)
Subtítulo: "N campanhas registradas"

Filtros no topo (inline, lado a lado):
- Select de canal (com opção "Todos os canais")
- Select de objetivo (com opção "Todos os objetivos")

Lista de DebriefCard's:
Cada card exibe:
- Header: nome da campanha + data formatada (ex: "15 de março de 2025")
- Badges: canal e objetivo
- Métricas em linha se existirem (Alcance · Cliques · Conversões · ROAS)
- Resumo gerado pela IA (colapsável — mostrar primeiros 150 chars com "Ver mais")
- Botão "Usar como base para brief" → /brief?channel=[channel]&objective=[objective]

Se não houver debriefings: empty state com ícone e CTA para /debrief

Carregar dados do Supabase no servidor (Server Component).
Filtros funcionam via searchParams na URL.

── src/components/Header.tsx ───────────────────────────

- Logo "BriefLoop" em Instrument Serif linkando para /
- Nav links: "Registrar" → /debrief | "Criar Brief" → /brief | "Biblioteca" → /biblioteca
- Highlight no link da rota atual (usePathname)
- Sticky no topo, bg-background/80 com backdrop-blur-sm
- Border bottom: border-border

── src/components/Footer.tsx ───────────────────────────

- Texto centralizado, discreto, text-text-secondary text-sm
- "BriefLoop — construído com Claude Code para o Desafio Human Academy · 2026"

═══════════════════════════════════════════════════════
API ROUTES (EDGE FUNCTIONS)
═══════════════════════════════════════════════════════

Ambas as routes devem usar: export const runtime = 'edge'

── src/app/api/generate-debrief/route.ts ───────────────

export async function POST(req: Request)

1. Rate limiting:
   - Extrair IP do header x-forwarded-for
   - Chave no KV: `rl:debrief:${ip}`
   - Incrementar contador, expiry de 3600s
   - Se contador > RATE_LIMIT_MAX: retornar 429 com json:
     { error: "Limite atingido", message: "Você atingiu o limite de X gerações por hora. Tente novamente mais tarde." }

2. Parse do body com zod ou validação manual:
   Campos obrigatórios: campaign_name, channel, objective, what_worked, what_failed
   Campos opcionais: audience, budget_range, metrics, learnings

3. Chamar Claude:
   - model: "claude-haiku-3-20240307"
   - max_tokens: 1024
   - system: "Você é um estrategista de marketing sênior com 15 anos de experiência em agências. Escreve em português brasileiro. Seja direto, específico e evite genericidades."
   - user prompt:
     ```
     Com base nos dados desta campanha, gere um debriefing profissional e narrativo 
     estruturado em 4 seções:

     **1. Resumo Executivo**
     2-3 frases que capturam a essência do que aconteceu e o resultado principal.

     **2. O que funcionou e por quê**
     Análise dos elementos bem-sucedidos. Explique os mecanismos, não apenas liste.

     **3. O que não funcionou — hipóteses**
     Análise honesta das falhas com hipóteses do porquê. Sem suavizar.

     **4. Recomendações para campanhas futuras**
     Exatamente 3 recomendações acionáveis e específicas, numeradas.

     ---
     DADOS DA CAMPANHA:
     Nome: ${campaign_name}
     Canal: ${channel}
     Objetivo: ${objective}
     Público-alvo: ${audience || 'Não informado'}
     Budget: ${budget_range || 'Não informado'}
     Métricas: ${JSON.stringify(metrics)}
     O que funcionou: ${what_worked}
     O que não funcionou: ${what_failed}
     Aprendizados: ${learnings || 'Não informado'}
     ```

4. Salvar no Supabase usando service role key (não anon key):
   INSERT INTO debriefings com todos os campos + generated_summary

5. Retornar: { summary: string, debrief_id: string }

── src/app/api/generate-brief/route.ts ─────────────────

export async function POST(req: Request)

1. Mesmo rate limiting (chave separada: `rl:brief:${ip}`)

2. Parse: campaign_type, channel, audience, objective, tone, references_text

3. Buscar debriefings relevantes no Supabase:
   SELECT * FROM debriefings 
   WHERE channel = $channel OR objective = $objective
   ORDER BY created_at DESC
   LIMIT 3

4. Montar contexto histórico:
   Se não houver debriefings: contexto = "Nenhuma campanha anterior registrada ainda."
   Se houver: formatar cada debriefing como bloco de texto estruturado

5. Chamar Claude:
   - max_tokens: 2048
   - system: mesmo system prompt
   - user prompt:
     ```
     Gere um brief criativo completo e acionável para a campanha descrita abaixo.
     Use o histórico de campanhas anteriores da agência como contexto.

     ═══ HISTÓRICO DE CAMPANHAS ANTERIORES ═══
     ${contexto_historico}

     ═══ NOVA CAMPANHA ═══
     Tipo: ${campaign_type}
     Canal: ${channel}
     Público-alvo: ${audience}
     Objetivo: ${objective}
     Tom de voz: ${tone}
     Referências: ${references_text || 'Nenhuma'}

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
     3-4 métricas prioritárias com benchmarks esperados.
     ```

6. Salvar na tabela briefs com context_debrief_ids

7. Retornar: 
   { 
     brief: string, 
     sources: Array<{ id, campaign_name, channel, objective }> 
   }

═══════════════════════════════════════════════════════
VARIÁVEIS DE AMBIENTE
═══════════════════════════════════════════════════════

Crie .env.local.example com:

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Vercel KV (Rate Limiting)
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...

# Config
RATE_LIMIT_MAX=10

═══════════════════════════════════════════════════════
REQUISITOS FINAIS
═══════════════════════════════════════════════════════

□ Nenhum dado sensível (API keys) exposto no client bundle
□ Todos os formulários com loading state e botão desabilitado durante submit
□ Toast de sucesso após cada geração
□ Toast de erro com mensagem amigável em qualquer falha de API
□ Mensagem amigável de rate limit (sem jargão técnico)
□ Empty state visual na /biblioteca quando não há campanhas
□ Totalmente responsivo (mobile-first)
□ /biblioteca funciona como Server Component com filtros por searchParams
□ Seed data carregado — app não aparece vazio na avaliação
□ next.config.ts com domínios de imagem configurados se necessário
□ README.md na raiz documentando como rodar localmente

═══════════════════════════════════════════════════════
ORDEM DE IMPLEMENTAÇÃO
═══════════════════════════════════════════════════════

Execute nesta ordem e confirme cada etapa:

1. Setup inicial: next, tailwind, shadcn, dependências, variáveis de ambiente
2. Design system: globals.css com CSS variables, fontes, componentes base
3. Layout, Header e Footer
4. Home page (/)
5. Lib: supabase.ts, supabase-server.ts
6. Edge Function: /api/generate-debrief
7. Página /debrief com DebreifForm e ResultCard
8. Edge Function: /api/generate-brief  
9. Página /brief com BriefForm e ResultCard
10. Página /biblioteca com filtros
11. supabase/seed.sql com os 5 debriefings de exemplo
12. .env.local.example
13. Revisão final: checar todos os requisitos do checklist acima

Comece pelo passo 1. Confirme quando concluído antes de prosseguir.
```

---

*Prompt elaborado para o Desafio Human Academy — Março 2026*
