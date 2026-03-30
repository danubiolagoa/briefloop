# Relatório Consolidado de Segurança — debrief-human MVP

**Data:** 28/03/2026
**Versão:** 1.0
**Classificação:** interno

---

## 1. Resumo Executivo

**Veredito: NÃO APROVADO PARA ENTREGA**

O sistema apresenta **3 vulnerabilidades críticas** e **4 de alta severidade** que, mesmo considerando o contexto de MVP demo sem autenticação implementada (decisão de produtoknown), representam risco inaceitável para qualquer exposição externa.

**Áreas de maior risco:**
1. **Controles de acesso ausentes** — RLS desabilitado em todas as tabelas + IDOR em debriefings
2. **Vazamento de dados** — Exposição de respostas brutas de APIs externas (MiniMax, Supabase) em mensagens de erro
3. **Abuso de recursos** — Bypass de rate limiting por IP spoofing; presets sem qualquer limite

**Contexto aceite:** A decisão de não implementar autenticação é reconhecida como decisão de produto. Entretanto, esta decisão não mitiga as vulnerabilidades de acesso a dados de outros usuários (IDOR) nem o vazamento de respostas de APIs em erros.

---

## 2. Achados Priorizados

### 2.1 Críticos

| # | Achado | Evidência | Impacto | Recomendação |
|---|--------|-----------|---------|--------------|
| C1 | **Ausência total de RLS** | `debriefings`, `briefs`, `presets` sem políticas habilitadas | Qualquer usuário pode ler/escrever dados de qualquer outro usuário | Habilitar RLS em todas as tabelas imediatamente; se Supabase anon key é usada client-side, criar políticas restritivas |
| C2 | **Tabela presets acessível sem autenticação** | `POST /api/presets` sem validação | Estocagem de dados arbitrários por qualquer atacante; potencial para phishing/XSS via presets contaminados | Adicionar validação de autenticação ou, no mínimo, rate limiting severo + sanitização de input |
| C3 | **Vazamento de resposta bruta da API MiniMax em erros** | `response.text()` exposto diretamente ao client | Credenciais/internal responses podem ser vazadas em mensagens de erro | Interceptar erros da API, sanitizar mensagens antes de enviar ao client; nunca expor raw responses |

---

### 2.2 Altos

| # | Achado | Evidência | Impacto | Recomendação |
|---|--------|-----------|---------|--------------|
| A1 | **Bypass de rate limiting via X-Forwarded-For spoofing** | Header `X-Forwarded-For` não validado | Atacantes podem evadir rate limits usando IPs rotativos/fake | Validar X-Forwarded-For contra IP real do cliente; implementar rate limiting no nível de API Gateway (não aplicação) |
| A2 | **IDOR — histórico de debriefings acessado sem autorização** | Filtro `channel`/`objective` sem `user_id` | Usuário pode ver debriefings de outros usuários no mesmo channel/objective | Adicionar filtro obrigatório por `user_id` em todas as queries de debriefing |
| A3 | **Sem autenticação em nenhuma rota da API** | Nenhuma rota valida sessão | Todo o sistema é navegável sem credenciais (contexto MVP aceite, mas risco real) | Implementar autenticação mínima (mesmo JWT via Supabase Auth) antes de exposição externa |
| A4 | **Vazamento de resposta bruta do Supabase em erros** | Erros do Supabase propagados direto ao client | Estrutura de banco, nomes de tabelas, queries expostas | Wrap errors em respostas genéricas; logue detalhes internamente apenas |

---

### 2.3 Médios

| # | Achado | Evidência | Impacto | Recomendação |
|---|--------|-----------|---------|--------------|
| M1 | **NEXT_PUBLIC_SUPABASE_ANON_KEY exposta ao client** | Variável de ambiente pública | Usuários podem fazer chamadas diretas ao Supabase com privilégios anon | Minimizar privilégios da anon key; usar RLS para restringir |
| M2 | **Injeção de operador na query Supabase** | `channel.eq.` interpolado de user input | Manipulação de filtros de query por atacante | Usar parâmetros nomeados do Supabase; nunca interpolar strings em queries |
| M3 | **Prompt injection residual nas rotas de geração** | User input misturado a prompts do sistema | Outputs podem ser manipulados via input malicioso | Isolar user input em campos estruturados; usar escaping/renderização de templates |
| M4 | **Persistência de dados estratégicos em localStorage** | Dados sensíveis armazenados client-side | localStorage é acessível via XSS; dados persistem entre sessões | Avaliar necessidade real; criptografar ou mover para sessionStorage/variáveis de estado |
| M5 | **Enumeração de IDs de Debrief via URL** | `/api/debriefings/{id}` exposto e iterável | Atacante pode enumerar e acessar debriefings de outros | Combinar com validação de propriedade do recurso |
| M6 | **GET /api/presets sem rate limiting** | Apenas rotas de geração têm limite | Presets podem ser usados para flood/abuso | Adicionar rate limiting em todas as rotas públicas |
| M7 | **Rate limiting por IP pode ser contornado** | IP spoofing via X-Forwarded-For | Bypass do único mecanismo de controle de abuso | Ver A1 |

---

### 2.4 Baixos

| # | Achado | Evidência | Impacto | Recomendação |
|---|--------|-----------|---------|--------------|
| B1 | **generated_summary e payload em plaintext** | Dados sensíveis não criptografados em repouso | Exposição em caso de acesso não autorizado ao DB | Avaliar criptografia para dados sensíveis |
| B2 | **Falta validação de is_seeded contra user-input** | Campo pode ser manipulado pelo cliente | Lógica de negócio pode ser contornada | Validar server-side; não confiar em dados do client |
| B3 | **Rate limit só existe em rotas de geração** | Rotas de presets sem limite | Abuso seletivo de rotas não limitadas | Ver M6 |
| B4 | **Payload arbitrário no preset permite estocagem de dados maliciosos** | Presets aceitam conteúdo livre | Vetor para XSS, phishing stored | Validar/sanitizar conteúdo de presets |
| B5 | **Mensagem de erro interna exposta ao cliente** | Stack traces ou detalhes internos em respostas | Informação leakage para atacante | Respostas de erro genéricas; logs detalhados no server |
| B6 | **Prompt injection residual** | Ver M3 (duplicado para consistência) | Ver M3 | Ver M3 |
| B7 | **Exposição de configuração de rate limit em respostas 429** | Headers/body revelam limites | Atacante aprende rate limit para otimizar bypass | Remover detalhes de configuração das respostas |
| B8 | **Log de erros com objetos completos** | Objetos de erro grandes logados sem filtro | Logs podem conter PII/dados sensíveis | Filtrar campos sensíveis antes de logar |

---

## 3. Controles Aprovados

Os seguintes mecanismos estão **parcialmente adequados** e não requerem ação imediata (reconhecendo o contexto MVP):

| Controle | Status | Observação |
|----------|--------|------------|
| Rate limiting em rotas de geração | ✅ Implementado | Funcional; bypass via IP spoofing é problema de infraestrutura, não de código |
| Autenticação Supabase (como serviço) | ✅ Configurado | Auth do Supabase existe; não está sendo usado nas rotas API |
| Estrutura de projeto e organização de código | ✅ Adequada | Separação clara de rotas, handlers, tipos |

---

## 4. Pendências — Requer Validação Manual

| Item | Dependência | Ação Necessária |
|------|-------------|-----------------|
| Avaliar impacto real do prompt injection | Acesso ao modelo MiniMax | Testar payloads de injection com o modelo em produção |
| Validar severidade do vazamento de API responses | Reprodução de erros | Trigger condições de erro manualmente para confirmar exposição |
| Testar IDOR em ambiente com múltiplos usuários | Credenciais de teste | Criar dois usuários e tentar cross-access |
| Confirmar bypass de rate limiting | Postman/curl + header spoofing | Validar que X-Forwarded-For spoofing realmente funciona |
| Avaliar risco de localStorage em produção | Análise de contexto | Determinar quais dados sensíveis estão sendo armazenados |

---

## 5. Veredito

### NÃO APROVADO PARA ENTREGA

**Justificativa:**

Três vulnerabilidades críticas foram identificadas, sendo que **C1 (ausência de RLS) e C2 (presets sem auth)** são suficientes para rejeitar qualquer entrega, mesmo em contexto MVP:

1. **Ausência de RLS** significa que qualquer pessoa com a URL do projeto Supabase pode acessar, modificar ou deletar todos os debriefings, briefs e presets de todos os usuários. Isso viola o requisito mínimo de confidencialidade e integridade de dados.

2. **Vazamento de resposta MiniMax** expõe internal API responses que podem conter informações de configuração, credenciais de serviços internos ou dados de outros usuários processados pelo modelo.

3. **IDOR em debriefings** permite que um usuário legítimo veja os debriefings de outros usuários — mesmo aceitando que o sistema não tem autenticação, este é um bug de autorização que deveria existir.

**Decisão de produto reconhecida, mas não suficiente:** A ausência intencional de autenticação é uma decisão de produto válida para um MVP demo interno. Porém, esta decisão não elimina a responsabilidade sobre os dados dos usuários. Recomenda-se:

- **Antes de qualquer exposição externa (incluindo demonstração a clientes):** Corrigir C1, C2, A2, A4
- **Antes de produção:** Corrigir C3, A1, A3; implementar autenticação
- **MVP demo interno:** Pode prosseguir com controles internos (VPN, acesso restrito) mas o risco permanece

---

## 6. Plano de Remediação Prioritária

| Prioridade | Achados | Esforço Estimado |
|------------|---------|------------------|
| **P0 (Crítico)** | C1, C2 | 2-4h |
| **P1 (Alto)** | A2, A4 | 1-2h |
| **P2 (Médio)** | M1-M7 | 4-8h |
| **P3 (Baixo)** | B1-B8 | 2-4h |

**Total estimado para P0+P1:** 3-6h de desenvolvimento.

---

*Relatório gerado pelo Security Orchestrator em 28/03/2026*
