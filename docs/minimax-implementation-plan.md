# Plano de Implementação — Integração da API MiniMax e Cronograma Final

## Resumo

Vamos preparar a substituição do modo mockado por integração real com a API MiniMax para geração de `debrief` e `brief`, mantendo o app plenamente funcional mesmo se a IA falhar. A data assumida para entrega final é **30/03/2026 às 14:00 (horário do Brasil)**, com meta interna de app pronto até **30/03/2026 às 10:00** para revisão, teste final e deploy consistente.

Observação importante: este arquivo registra o marco operacional do projeto:

- **Hard deadline:** `30/03/2026 14:00 BRT`
- **Target de conclusão funcional:** `30/03/2026 10:00 BRT`

## Implementação

### 1. Integração MiniMax

- Substituir o mock nas rotas `generate-debrief` e `generate-brief` por um client HTTP para MiniMax.
- Configurar uso de `MiniMax-M2.7` ou `MiniMax-M2.7-highspeed`, com modelo definido por env var.
- Centralizar chamada da API em um helper server-side para evitar duplicação entre as duas rotas.
- Preservar o comportamento atual de fallback: se MiniMax falhar ou estiver indisponível, retornar resposta em `modo demo` em vez de quebrar o app.

### 2. Configuração e segurança

- Adicionar variáveis de ambiente para:
  - `MINIMAX_API_KEY`
  - `MINIMAX_MODEL`
  - `MINIMAX_BASE_URL` se necessário
- Garantir que a chave fique exclusivamente no servidor.
- Atualizar `.env.local.example` e `README.md` com instruções do MiniMax.
- Expor ao frontend apenas um campo de `mode` (`live` ou `demo`) na resposta, sem vazar detalhes da chave ou do provedor.

### 3. Controle de uso e custo

- Implementar limite global do app de **50 requisições a cada 5 horas**.
- Implementar limite por IP para evitar abuso:
  - `debrief`: `5 requisições / 5h / IP`
  - `brief`: `3 requisições / 5h / IP`
- Se o rate limit for atingido:
  - retornar mensagem amigável
  - opcionalmente cair em `modo demo` em vez de bloquear totalmente, conforme escolha final de produto
- Registrar no backend o modo usado (`live` ou `demo`) para facilitar depuração e revisão antes do deploy.

### 4. Compatibilidade com o MVP atual

- Manter persistência local de debriefs demo como fallback.
- Se MiniMax estiver ativo mas Supabase server-side não estiver disponível, o app ainda deve:
  - gerar texto com IA
  - mostrar resultado
  - e não quebrar a UI
- Se MiniMax não estiver ativo, o app continua exatamente no modo demonstrativo atual.

## Testes e aceite

### Testes funcionais

- `POST /api/generate-debrief` com MiniMax ativo retorna `200`, `mode: "live"` e texto útil.
- `POST /api/generate-brief` com MiniMax ativo retorna `200`, `mode: "live"` e usa contexto selecionado.
- Quando a chave MiniMax estiver ausente ou inválida, as rotas retornam `mode: "demo"` sem erro fatal.
- Biblioteca, presets e fluxo `/debrief -> /brief` continuam funcionando com e sem IA real.

### Testes de limitação

- Confirmar limite por IP em 5 horas.
- Confirmar limite global em 5 horas.
- Validar mensagem amigável ao atingir o teto.
- Confirmar que o app não excede a política planejada de uso.

### Testes de entrega

- `npx tsc --noEmit`
- `npm run build`
- smoke test de `/`, `/debrief`, `/brief`, `/biblioteca`
- teste real no preview final com uma geração live de debrief e uma de brief
- revisão final e deploy até a meta interna de `30/03/2026 10:00 BRT`

## Cronograma sugerido

### Amanhã

- Integrar client MiniMax
- Ajustar env vars
- Ligar `generate-debrief` ao MiniMax
- Validar fallback para `modo demo`

### Depois de amanhã

- Ligar `generate-brief` ao MiniMax
- Implementar rate limit global + por IP
- Revisar `README.md` e documentação operacional
- Executar rodada completa de testes

### Janela final

- Até `30/03/2026 10:00 BRT`: app funcional e estável
- Das `10:00` às `14:00 BRT`: revisão curta, último teste, deploy e conferência final

## Assumptions e defaults

- Deadline interpretado como **30/03/2026 às 14:00 BRT**.
- Meta interna fixada em **4 horas antes**, às **10:00 BRT**.
- Modelo padrão planejado: `MiniMax-M2.7`, com opção de trocar para `MiniMax-M2.7-highspeed` por env var.
- Política inicial de uso adotada: **50 requisições / 5h** para o app, com limites menores por IP.
- O modo demo atual será mantido como fallback obrigatório para garantir robustez do MVP.
