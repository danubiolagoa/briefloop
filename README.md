# BriefLoop

> *Agências repetem erros porque o conhecimento de campanhas passadas nunca alimenta as próximas. BriefLoop fecha esse ciclo.*

---

## 📌 O Problema

Times de marketing vivem dois momentos críticos que hoje acontecem de forma completamente desconectada:

1. **Pós-campanha:** os resultados chegam, todo mundo está cansado, e o aprendizado vai para uma planilha que ninguém vai abrir de novo — ou simplesmente se perde.
2. **Pré-campanha:** começa-se um novo brief do zero, sem nenhuma memória do que funcionou ou falhou em campanhas similares anteriores.

O resultado: os mesmos erros se repetem, as mesmas dúvidas surgem nas reuniões, e o atendimento passa horas tentando lembrar "como foi aquela campanha de lançamento do ano passado".

**Onde se perde tempo hoje:**
- Montar debriefings manualmente após cada campanha (quando se monta)
- Iniciar briefs criativos sem contexto histórico
- Reuniões de alinhamento para compensar a falta de documentação estruturada
- Conhecimento institucional que vai embora quando um colaborador sai

---

## 💡 A Solução

**BriefLoop** é uma ferramenta web simples que conecta esses dois momentos por meio de uma experiência guiada de registro e geração de documentos. A IA usa **OpenRouter** (modelos gratuitos como DeepSeek, Mistral, Qwen) para gerar debriefings e briefs reais com contexto histórico.

Ela funciona em dois fluxos complementares:

### 🔁 Fluxo 1 — Registrar Campanha (Debriefing)
Após uma campanha, o usuário preenche um formulário estruturado com dados objetivos (canal, métricas, budget) e subjetivos (o que funcionou, o que falhou, aprendizados). O sistema gera um **debriefing narrativo estruturado** via IA real, indicando se foi gerado por IA (`badge verde`) ou modo demonstração (`badge amarela`).

### 🔁 Fluxo 2 — Criar Brief Inteligente
Ao iniciar uma nova campanha, o usuário informa o tipo, canal e público-alvo. O sistema **busca automaticamente debriefings anteriores similares** e usa esse contexto para montar um brief criativo via IA real.

---

## 👤 Quem usa e quando

**Usuário principal:** Atendimento, Social Media, Gerente de Projetos ou Diretor de Criação.

**Momento de abertura da ferramenta:**
- Logo após o relatório de resultados de uma campanha chegar → para registrar o debriefing enquanto está fresco
- No início de uma reunião de kickoff de nova campanha → para gerar o brief já com contexto histórico

**Como muda o processo atual:**
| Antes | Com BriefLoop |
|---|---|
| Debriefing em planilha, se feito | Debriefing guiado e gerado em modo demonstrativo |
| Brief criado do zero toda vez | Brief montado com contexto de campanhas passadas |
| Conhecimento na cabeça das pessoas | Conhecimento institucional persistente |
| Reuniões de alinhamento longas | Ponto de partida já estruturado |

---

## 🏗️ Arquitetura Técnica

> Desenvolvido com **Codex (GPT 5.4)** para estruturação inicial e **Claude Code (MiniMax 2.7)** para conclusão e refinamento.

```
briefloop/
├── docs/
│   └── README.md              ← este arquivo
├── src/
│   ├── app/
│   │   ├── page.tsx            ← Home (dois caminhos)
│   │   ├── debrief/
│   │   │   └── page.tsx        ← Formulário de debriefing
│   │   ├── brief/
│   │   │   └── page.tsx        ← Gerador de brief
│   │   └── biblioteca/
│   │       └── page.tsx        ← Histórico de debriefings
│   ├── components/
│   │   ├── ui/                 ← shadcn/ui components
│   │   ├── DebreifForm.tsx
│   │   ├── BriefForm.tsx
│   │   ├── BriefResult.tsx
│   │   ├── DebreifCard.tsx
│   │   └── RateLimitBanner.tsx
│   ├── lib/
│   │   ├── supabase.ts         ← cliente Supabase
│   │   ├── minimax.ts         ← Cliente MiniMax + OpenRouter
│   │   └── utils.ts
│   └── api/
│       ├── generate-debrief/
│       │   └── route.ts        ← Edge Function: gera debriefing (MiniMax → OpenRouter)
│       └── generate-brief/
│           └── route.ts        ← Edge Function: gera brief (MiniMax → OpenRouter)
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

### Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router) + React |
| Estilo | Tailwind CSS + shadcn/ui |
| IA | OpenRouter (modelos gratuitos) + MiniMax como fallback |
| Banco de dados | Supabase (PostgreSQL) |
| Deploy | Vercel |
| Rate limiting | Vercel KV (Upstash Redis) — 10 req/IP/hora |

### Observação sobre IA
A aplicação tenta usar IA real na seguinte ordem:
1. **MiniMax** (se `MINIMAX_API_KEY` configurada) — sujeita a rate limits
2. **OpenRouter** (se `OPENROUTER_API_KEY` configurada) — modelos gratuitos recomendados: `google/gemini-2.0-flash-thinking-exp`, `mistral/mistral-nemo`, `deepseek/deepseek-chat-v3`
3. **Modo demo** — conteúdo estruturado local se ambas falharem

Todas as chamadas são feitas via Edge Functions server-side — nenhuma API key é exposta ao cliente.

### Schema Supabase

```sql
-- Tabela de debriefings
create table debriefings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  campaign_name text not null,
  channel text not null,           -- instagram, google_ads, tiktok, email, etc.
  objective text not null,         -- awareness, conversão, engajamento, etc.
  audience text,
  budget_range text,               -- faixa, não valor exato
  metrics jsonb,                   -- { reach, clicks, conversions, ctr, roas }
  what_worked text not null,
  what_failed text not null,
  learnings text,
  generated_summary text,          -- texto gerado pela IA
  tags text[]                      -- para busca semântica futura
);

-- Tabela de briefs gerados
create table briefs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  campaign_type text not null,
  channel text not null,
  audience text not null,
  objective text not null,
  context_debrief_ids uuid[],      -- debriefings que informaram este brief
  generated_brief text not null
);
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js 18+
- Conta Supabase (free tier)
- Conta Vercel (para deploy) ou Upstash Redis (para rate limiting local)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/briefloop.git
cd briefloop

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.local.example .env.local
```

### Variáveis de Ambiente

```env
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Rate limiting (Vercel KV / Upstash)
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...

# Limite de requisições por IP por hora
RATE_LIMIT_MAX=10
```

### Rodando

```bash
npm run dev
# Acesse http://localhost:3000
```

### Deploy na Vercel

```bash
# Via CLI
npm i -g vercel
vercel --prod

# Ou conecte o repositório GitHub diretamente na dashboard da Vercel
# e configure as variáveis de ambiente nas configurações do projeto
```

---

## 🗺️ Documentação Viva

O projeto agora mantém documentação operacional complementar em:

- [roadmap.md](docs/roadmap.md)
- [todo.md](docs/todo.md)
- [testing.md](docs/testing.md)
- [functions.md](docs/functions.md)

Esses arquivos registram fases do projeto, backlog, qualidade, segurança, desempenho e catálogo de funções.

Resumo de leitura recomendado:

- `docs/todo.md` -> progresso e pendencias
- `docs/testing.md` -> testes executados, aprovacoes e erros
- `docs/functions.md` -> mapa funcional da aplicacao
- `docs/minimax-implementation-plan.md` -> plano de integracao futura com MiniMax

### Varredura final de segurança

Antes da entrega ou de um deploy final, use o comando operacional:

- `varredura final`

Esse gatilho aciona a tarefa `.agents/final-security-sweep.md`, que consolida os agentes:

- `supabase-access-auditor`
- `pentester`
- `code-exposure-auditor`
- `security-orchestrator`

O resultado esperado da varredura final deve trazer:

- achados por severidade
- itens aprovados
- pendências
- veredito final de entrega

---

## 🧱 Dificuldades Reais de Implementação

Durante a construção do projeto houve um ponto de integração importante:

- O MCP do Supabase demorou a estabilizar por conflito entre autenticação OAuth, cache de sessão do cliente MCP e carregamento de bearer token no runtime local.
- A configuração final funcional ficou apontando para o `project_ref` correto e o banco foi inicializado com as tabelas do app e dados de seed.
- Esse tipo de dificuldade operacional faz parte do histórico do projeto e deve continuar documentado aqui no `README.md`.

---

## 🤖 Build Prompt para Claude Code

> Este é o prompt completo que foi usado para gerar o projeto via Claude Code (Vibe Coding). Cole-o diretamente no Claude Code para replicar ou estender o projeto.

---

```
Você é um engenheiro sênior full-stack. Vou te descrever uma aplicação completa para construir. Siga todas as instruções com precisão.

## Nome do Projeto
BriefLoop — ferramenta de memória institucional para agências de marketing

## Objetivo
Criar uma aplicação web que conecta o debriefing pós-campanha com a geração de briefs criativos pré-campanha, usando IA para gerar os documentos e histórico real de campanhas como contexto.

## Stack obrigatória
- Next.js 14 com App Router e TypeScript
- Tailwind CSS + shadcn/ui (use `npx shadcn@latest init` com estilo "default", baseColor "slate", cssVariables true)
- Anthropic Claude API (modelo: claude-haiku-3) chamado apenas via Edge Functions (NUNCA no cliente)
- Supabase como banco de dados (cliente @supabase/supabase-js)
- Vercel KV para rate limiting (pacote @vercel/kv)
- Deploy target: Vercel

## Design e UX
- Interface clean, profissional, editorial. Tom sóbrio com acentos em âmbar/laranja (#F59E0B) sobre fundo slate escuro (#0F172A) com cards em (#1E293B).
- Fonte de display: "Instrument Serif" (Google Fonts). Fonte de corpo: "DM Sans".
- Sem autenticação. Nenhuma tela de login. A aplicação é aberta.
- Responsiva para mobile e desktop.
- Cada página deve ter feedback visual claro de loading enquanto a IA processa (skeleton ou spinner com mensagem contextual).
- Toasts de sucesso/erro em todas as ações.

## Estrutura de Páginas

### / (Home)
- Header com logo "BriefLoop" e tagline: "A memória criativa da sua agência."
- Dois cards grandes e clicáveis:
  1. "Registrar Campanha" → /debrief (ícone: arquivo/pasta)
  2. "Criar Brief" → /brief (ícone: lápis/raio)
- Link discreto para /biblioteca no rodapé: "Ver histórico de campanhas"

### /debrief (Registrar Campanha)
Formulário com os seguintes campos:
- Nome da campanha (text, required)
- Canal principal (select: Instagram, Google Ads, TikTok, Meta Ads, Email Marketing, LinkedIn, YouTube, Outro)
- Objetivo (select: Awareness, Engajamento, Conversão, Retenção, Lançamento)
- Público-alvo (textarea, opcional)
- Faixa de budget (select: Até R$5k, R$5k–R$20k, R$20k–R$50k, Acima de R$50k)
- Métricas principais (4 inputs numéricos opcionais: Alcance, Cliques, Conversões, ROAS)
- O que funcionou (textarea, required, placeholder: "Seja específico: formatos, horários, copies, criativos...")
- O que não funcionou (textarea, required)
- Aprendizados e próximos passos (textarea, opcional)

Ao submeter:
1. Chama POST /api/generate-debrief com os dados do formulário
2. A Edge Function chama Claude para gerar um resumo narrativo estruturado do debriefing
3. Salva tudo (dados + resumo gerado) na tabela `debriefings` do Supabase
4. Exibe o debriefing gerado em um card estilizado com opção de copiar o texto
5. Botão "Registrar nova campanha" e botão "Ver na biblioteca"

### /brief (Criar Brief Inteligente)
Formulário com:
- Tipo de campanha (select: Lançamento de produto, Campanha sazonal, Branding/Awareness, Performance/Conversão, Retenção/Fidelização, Outro)
- Canal principal (mesmo select do /debrief)
- Público-alvo (textarea, required)
- Objetivo principal (textarea, required)
- Referências ou inspirações (textarea, opcional)
- Tom de voz desejado (select: Inspiracional, Educativo, Urgente, Divertido, Luxo/Premium, Próximo/Humano)

Ao submeter:
1. Chama POST /api/generate-brief com os dados
2. A Edge Function busca no Supabase os 3 debriefings mais relevantes (mesmo canal E/OU mesmo objetivo)
3. Monta um prompt para Claude com: dados do novo brief + contexto dos debriefings encontrados
4. Claude gera o brief criativo estruturado
5. Salva na tabela `briefs` com referência aos debriefing IDs usados
6. Exibe o brief em um card estilizado com:
   - O brief gerado completo
   - Seção "Baseado em X campanhas anteriores" mostrando os debriefings que informaram o brief
   - Alertas de "O que evitar" e "O que replicar" extraídos do histórico
7. Botão de copiar e botão "Criar outro brief"

### /biblioteca (Histórico de Campanhas)
- Lista paginada (10 por página) de todos os debriefings salvos
- Cada card exibe: nome da campanha, canal, objetivo, data, e o resumo gerado (colapsável)
- Filtro por canal e por objetivo (dropdowns no topo)
- Botão "Usar como base para novo brief" em cada card → redireciona para /brief pré-preenchendo canal e objetivo

## API Routes (Edge Functions)

### POST /api/generate-debrief
- Recebe: dados do formulário de debriefing
- Rate limit: 10 req/IP/hora via Vercel KV. Se exceder, retorna 429 com mensagem clara.
- Prompt para Claude:
  ```
  Você é um estrategista de marketing sênior. Com base nos dados desta campanha, 
  gere um debriefing profissional e narrativo estruturado em 4 seções:
  1. Resumo Executivo (2-3 frases)
  2. O que funcionou e por quê (análise, não lista)
  3. O que não funcionou e hipóteses (análise honesta)
  4. Recomendações para campanhas futuras (3 itens acionáveis)
  
  Dados da campanha: [dados do formulário em JSON]
  
  Responda em português. Seja direto, específico e útil. Evite genericidades.
  ```
- Retorna: { summary: string, debrief_id: uuid }

### POST /api/generate-brief
- Recebe: dados do formulário de brief
- Rate limit: mesmo padrão
- Busca no Supabase: SELECT * FROM debriefings WHERE channel = $channel OR objective = $objective ORDER BY created_at DESC LIMIT 3
- Prompt para Claude:
  ```
  Você é um diretor de criação de uma agência de publicidade. 
  Gere um brief criativo completo e acionável para a campanha descrita abaixo.
  
  CONTEXTO HISTÓRICO (campanhas anteriores da agência):
  [debriefings encontrados formatados]
  
  NOVA CAMPANHA:
  [dados do formulário]
  
  O brief deve conter:
  1. Visão geral e contexto
  2. Objetivo de comunicação (o que queremos que o público sinta/faça)
  3. Tom de voz e personalidade
  4. Mensagem principal e mensagens de suporte
  5. Diretrizes criativas (formatos sugeridos, referências de estilo)
  6. O que EVITAR (baseado no histórico)
  7. O que REPLICAR (baseado no que funcionou antes)
  8. KPIs sugeridos
  
  Responda em português. Seja específico, criativo e baseado nos dados históricos fornecidos.
  ```
- Retorna: { brief: string, sources: debrief[] }

## Schema SQL Supabase
Execute no SQL Editor do Supabase:

```sql
create table debriefings (
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

create table briefs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  campaign_type text not null,
  channel text not null,
  audience text not null,
  objective text not null,
  tone text,
  context_debrief_ids uuid[] default '{}',
  generated_brief text not null
);

-- Index para buscas por canal e objetivo
create index idx_debriefings_channel on debriefings(channel);
create index idx_debriefings_objective on debriefings(objective);
```

## Seed Data
Inclua 5 debriefings de exemplo no banco para que a aplicação não apareça vazia no momento da avaliação. Crie um arquivo `supabase/seed.sql` com INSERTs realistas de campanhas fictícias variadas (diferentes canais e objetivos).

## Variáveis de Ambiente Necessárias
Crie um arquivo `.env.local.example` com:
```
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
KV_REST_API_URL=
KV_REST_API_TOKEN=
RATE_LIMIT_MAX=10
```

## package.json — dependências principais
```json
{
  "dependencies": {
    "next": "14.2.x",
    "react": "^18",
    "react-dom": "^18",
    "@anthropic-ai/sdk": "^0.27.0",
    "@supabase/supabase-js": "^2.43.0",
    "@vercel/kv": "^2.0.0",
    "lucide-react": "^0.395.0",
    "sonner": "^1.5.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0"
  }
}
```

## Outros requisitos
- Adicione um banner discreto no rodapé: "BriefLoop — construído com Claude Code para o Desafio Human Academy"
- O projeto deve funcionar completamente com os dados de seed mesmo sem nenhum debriefing cadastrado pelo usuário
- Tratamento de erro amigável em todas as chamadas de API (sem mensagens técnicas expostas ao usuário)
- Loading states em todos os botões de submit
- O rate limit deve mostrar uma mensagem amigável: "Você atingiu o limite de X gerações por hora. Tente novamente mais tarde."
- Código limpo, componentes bem separados, sem comentários desnecessários

Comece pela estrutura de pastas e arquivos base, depois implemente página por página, e por fim as Edge Functions. Confirme cada etapa antes de prosseguir.
```

---

## 🧠 Raciocínio por Trás das Escolhas

**Por que esse problema?**
A maioria das ferramentas de marketing olha para frente — planejamento, calendário, publicação. O BriefLoop olha para trás para construir melhor o que vem a seguir. É uma lacuna real: conhecimento institucional que se perde.

**Por que sem autenticação?**
A dor que o app resolve é de processo, não de privacidade. Tornar a ferramenta acessível por link é um recurso, não uma limitação — facilita o uso em reuniões, compartilhamento com cliente, acesso rápido do celular.

**Por que usar conteúdo mockado neste momento?**
Porque esta entrega está posicionada como MVP. A prioridade foi validar fluxo, UX, estrutura de dados e proposta de produto sem depender de uma API externa de IA ativa durante a demonstração.

**Por que Next.js e não Vite + React puro?**
As Edge Functions do Next.js/Vercel resolvem o problema de proxy seguro para a API key de forma elegante e sem infraestrutura adicional.

---

## 📋 Checklist de Entrega

- [x] Aplicação no ar (deploy Vercel)
- [x] Repositório público no GitHub
- [x] README com raciocínio além do técnico
- [x] Build prompt documentado
- [x] Dados de seed para demonstração imediata
- [x] Rate limiting implementado
- [x] Interface sem autenticação
- [x] Integração com OpenRouter (API real funcionando)
- [x] Animações e identidade visual (LoopLogo)
- [x] Interface responsiva para mobile
- [x] Favicon SVG com símbolo de infinito

---

*Projeto desenvolvido para o Desafio Human Academy — Março 2026*

---

## 🛠️ Ferramentas de IA Utilizadas

### Codex com GPT 5.4 (Fase Inicial)
O projeto foi iniciado usando **Codex** (CLI do GitHub Copilot) com o modelo **GPT 5.4**, responsável por:
- Estruturação inicial da arquitetura
- Setup do Next.js 14 com App Router
- Implementação do schema SQL do Supabase
- Criação das Edge Functions e fluxos de API

### Claude Code com MiniMax 2.7 (Conclusão)
A fase final de desenvolvimento e refinamento foi conduzida com **Claude Code** utilizando o modelo **MiniMax 2.7**, responsável por:
- Implementação do cliente OpenRouter com fallback
- Correção de bugs e validação de fluxos
- Design da interface e animações (LoopLogo, animações CSS)
- Documentação técnica e operacional
- Varredura de segurança e testes de integração

---

## 🔧 Dificuldades e Decisões Técnicas

### Escolha da API de IA

O desafio propunha uso de IA para geração de debriefings e briefs. Identificamos três caminhos:

1. **Anthropic (Claude)** — plano original, mas não havia crédito disponível
2. **MiniMax** — Configurada inicialmente, mas apresentava `rate limit exceeded(RPM)` constante, impossibilitando uso real em produção
3. **OpenRouter** — Solução adotada: funciona como proxy unificado para múltiplos modelos (DeepSeek, Mistral, Qwen, etc.), vários com tiers gratuitos. Chave configurada em `OPENROUTER_API_KEY` no `.env.local`

### Integração MiniMax vs OpenRouter

A API MiniMax tem formato proprietário diferente do OpenAI:
- Endpoint: `https://api.minimax.io/v1/text/chatcompletion_pro`
- Autenticação via `Bearer token` no header
- Parâmetros específicos: `bot_setting`, `reply_constraints`, `sender_name/sender_type` em cada mensagem
- Resposta em `choices[0].text` (não `choices[0].message.content`)

O cliente em `src/lib/minimax.ts` implementa ambos. O fluxo é:
1. Tenta MiniMax (se configurada)
2. Se falhar → tenta OpenRouter (se configurado)
3. Se ambos falharem → modo demo (mock)

### Configuração do MCP Supabase

O MCP (Model Context Protocol) do Supabase perdeu conexão diversas vezes durante o desenvolvimento, principalmente por:
- Conflito entre autenticação OAuth e cache de sessão do cliente MCP
- Bearer token expirando durante sessões longas

A solução prática foi usar queries diretas via interface web do Supabase para verificar RLS e dados.

### Regra de Negócio do Desafio

O diferencial do BriefLoop é o **ciclo fechado**: não é só um gerador de textos — é uma ferramenta que:
1. **Registra** campanhas com dados reais (debriefing)
2. **Consulta** esse histórico automaticamente ao gerar novos briefs
3. **Recomenda** o que evitar e o que replicar baseado em falhas e acertos anteriores

Esse ciclo que alimenta a relevância dos briefs gerados.

---

## 📚 Referências

- `docs/PROMPT.md` — Build prompt original usado para gerar o projeto
- `docs/minimax-implementation-plan.md` — Plano de integração com MiniMax (referência, não implementado por rate limits)
- `docs/roadmap.md` — Roadmap de funcionalidades futuras
- `docs/todo.md` — Backlog de pendências
- `docs/testing.md` — Relatório de testes executados

---

## 🔑 Variáveis de Ambiente

```env
# OpenRouter (fallback quando MiniMax falhar)
OPENROUTER_API_KEY=sk-or-v1-...

# MiniMax (rate limited em uso real)
MINIMAX_API_KEY=sk-cp-...
MINIMAX_MODEL=MiniMax-M2.7
MINIMAX_BASE_URL=https://api.minimax.io

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xtqvzfzmktggitqllsye.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 🎨 Notas sobre a Interface

A interface foi redesenhada com:
- **LoopLogo**: ícone SVG animado de loop infinito representando o ciclo campanhas→briefs→campanhas
- **Animações CSS**: fade-slide-up, scale-in, shimmer, bounce-in, spring hover
- **Mobile-first**: menu hamburger no header, layout responsivo em todas as páginas
- **Feedback visual**: skeleton de loading, badges de modo (live/demo), animação de copiar
