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

create table if not exists presets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  kind text not null check (kind in ('debrief', 'brief')),
  name text not null,
  description text,
  channel text,
  objective text,
  payload jsonb not null default '{}',
  is_seeded boolean not null default false
);

create index if not exists idx_debriefings_channel on debriefings(channel);
create index if not exists idx_debriefings_objective on debriefings(objective);
create index if not exists idx_debriefings_created on debriefings(created_at desc);
create index if not exists idx_presets_kind on presets(kind);

insert into debriefings
(campaign_name, channel, objective, audience, budget_range, metrics, what_worked, what_failed, learnings, generated_summary, tags)
values
(
  'Lançamento Linha Verão — Marca X',
  'instagram',
  'lancamento',
  'Mulheres 25-35, classes B/C, interesse em moda e lifestyle',
  'R$5k–R$20k',
  '{"reach":420000,"clicks":8200,"conversions":310,"roas":3.8}',
  'Reels curtos com transição rápida e creators nichados performaram melhor.',
  'Stories com venda direta e posts estáticos tiveram baixo retorno.',
  'Priorizar storytelling em vídeo, micro influenciadores e CTA sutil.',
  'Campanha com alcance forte e ROAS acima da média, puxada por Reels e creators nichados.',
  ARRAY['instagram','lancamento','reels','influenciadores','moda']
),
(
  'Black Friday — E-commerce Eletrônicos',
  'google_ads',
  'conversao',
  'Homens e mulheres 28-45 com alta intenção de compra',
  'Acima de R$50k',
  '{"reach":980000,"clicks":42000,"conversions":1840,"roas":5.2}',
  'Search de alta intenção e landing pages sem distração elevaram conversão.',
  'Display consumiu verba com conversão baixa e início tardio reduziu potencial.',
  'Começar aquecimento antes e concentrar verba em Search.',
  'ROAS 5,2 acima da meta; Search foi o motor da campanha.',
  ARRAY['google_ads','conversao','black_friday','search','ecommerce']
),
(
  'Campanha de Retenção — App de Finanças',
  'email',
  'retencao',
  'Usuários inativos há mais de 30 dias',
  'Até R$5k',
  '{"reach":12000,"clicks":2100,"conversions":680,"roas":0}',
  'Sequência de 3 emails com personalização real aumentou reativação.',
  'Horário cedo e múltiplos CTAs reduziram o clique.',
  'Enviar à noite com CTA único e linguagem empática.',
  'Reativação acima da média do setor graças à personalização contextual.',
  ARRAY['email','retencao','reativacao','personalizacao','fintech']
),
(
  'Branding Institucional — Construtora Regional',
  'linkedin',
  'awareness',
  'Decisores B2B: gestores, engenheiros e arquitetos',
  'R$5k–R$20k',
  '{"reach":85000,"clicks":1200,"conversions":45,"roas":0}',
  'Thought leadership com voz do CEO e conteúdo de bastidores teve maior alcance.',
  'Posts promocionais diretos e frequência alta derrubaram qualidade.',
  'Publicar menos e melhor, com autoridade e visão de mercado.',
  'Autenticidade e liderança de pensamento superaram comunicação promocional.',
  ARRAY['linkedin','awareness','branding','b2b','thought_leadership']
),
(
  'Lançamento de Produto — Suplemento Esportivo',
  'tiktok',
  'lancamento',
  'Jovens 18-28 com foco em academia e performance',
  'R$5k–R$20k',
  '{"reach":1200000,"clicks":15000,"conversions":420,"roas":2.1}',
  'UGC com atletas reais, duetos e linguagem de comunidade geraram engajamento.',
  'Conteúdo super produzido teve rejeição e ROAS abaixo da meta de curto prazo.',
  'Ajustar expectativa para awareness e reforçar autenticidade.',
  'Alto alcance com aprendizado claro: TikTok exige autenticidade e construção de comunidade.',
  ARRAY['tiktok','lancamento','ugc','awareness','suplementos']
);

insert into presets
(kind, name, description, channel, objective, payload, is_seeded)
values
(
  'debrief',
  'Debrief Instagram de lançamento',
  'Modelo para campanhas com foco em lançamento e ativos de vídeo curto.',
  'instagram',
  'lancamento',
  '{
    "channel":"instagram",
    "objective":"lancamento",
    "budget_range":"5k_20k",
    "format_tags":["Reels curtos","Creators"],
    "success_tags":["Hook forte nos 3 primeiros segundos","Criativo autêntico"],
    "failure_tags":["CTA confuso"],
    "next_step_tags":["Reforçar vídeo curto","Usar creators nichados"]
  }',
  true
),
(
  'debrief',
  'Debrief Search de performance',
  'Modelo para campanhas orientadas a conversão em Google Ads.',
  'google_ads',
  'conversao',
  '{
    "channel":"google_ads",
    "objective":"conversao",
    "budget_range":"acima50k",
    "format_tags":["Search","Landing page dedicada"],
    "success_tags":["Segmentação muito aderente","Página de destino converteu bem"],
    "failure_tags":["Budget mal distribuído","Timing ruim"],
    "next_step_tags":["Mover verba para o melhor formato","Começar campanha antes"]
  }',
  true
),
(
  'brief',
  'Brief lançamento para Instagram',
  'Ponto de partida para campanhas visuais com apelo de descoberta e desejo.',
  'instagram',
  'Lançamento',
  '{
    "campaign_type":"lancamento",
    "channel":"instagram",
    "tone":"inspiracional",
    "audience_tags":["Adultos 25-35 com intenção de compra"],
    "deliverable_tags":["Reels/short videos","UGC creators"],
    "message_tags":["Desejo e aspiração","Prova social"],
    "guardrail_tags":["Evitar muitos CTAs"]
  }',
  true
),
(
  'brief',
  'Brief retenção por email',
  'Modelo para reativar base inativa com clareza e tom humano.',
  'email',
  'Retenção',
  '{
    "campaign_type":"retencao",
    "channel":"email",
    "tone":"proximo",
    "audience_tags":["Base inativa para reativação"],
    "deliverable_tags":["Email sequence"],
    "message_tags":["Proximidade e humanidade","Autoridade e confiança"],
    "guardrail_tags":["Evitar muitos CTAs","Evitar excesso de texto"]
  }',
  true
);
