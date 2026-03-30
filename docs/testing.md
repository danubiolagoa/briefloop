# Plano de Testes

Resumo rapido:

- Status da rodada atual: parcialmente aprovada
- Preview estavel usado na ultima validacao: `http://localhost:3023`
- Modo testado: MVP demonstrativo sem API real de IA

## Atualizacao tecnica - 2026-03-28

Esta atualizacao registra correcoes implementadas e validadas por compilacao, ainda pendentes de confirmacao visual manual no navegador.

### Correcoes concluidas em codigo

- Fluxo `debrief -> biblioteca -> brief` fechado em codigo
- `/brief` agora aceita contexto inicial vindo tanto de item local quanto de item do servidor
- Contador da biblioteca ajustado para refletir os registros exibidos
- Validacao de payload reforcada nas rotas `generate-debrief` e `generate-brief`

### Evidencias tecnicas executadas apos as correcoes

- `npm run typecheck` -> aprovado em `2026-03-28`
- `npm run build` -> aprovado em `2026-03-28`

### Itens com status atualizado

| Item | Status atual | Observacao |
|---|---|---|
| Contador da biblioteca considerando registros locais | Corrigido em codigo | Falta validacao visual manual |
| Uso de debrief salvo como base explicita no `/brief` via navegador | Corrigido em codigo | Falta validacao visual manual |
| Persistencia local visivel na biblioteca via navegador | Pendente | Depende de rodada manual no navegador |
| Validacao de contratos das APIs | Parcialmente aprovado | Regras de entrada reforcadas e build ok |

### O que ainda depende de verificacao manual

- Gerar debrief demo pela UI
- Confirmar aparicao do item na `/biblioteca`
- Confirmar total exibido na biblioteca apos o salvamento local
- Clicar em `Usar como base para brief`
- Confirmar exibicao do bloco `Debrief selecionado` em `/brief`
- Gerar um brief com esse contexto selecionado
- Revisar contraste e comportamento final dos `select` nativos

---

## Rodada 1 - 2026-03-27

### Checklist executivo

| Item | Status |
|---|---|
| Build de producao | Aprovado |
| TypeScript (`npx tsc --noEmit`) | Aprovado |
| Home (`/`) | Aprovado |
| Debrief (`/debrief`) | Aprovado |
| Brief (`/brief`) | Aprovado |
| Biblioteca (`/biblioteca`) | Aprovado |
| API `generate-debrief` | Aprovado |
| API `generate-brief` | Aprovado |
| CSS do preview estavel | Aprovado |
| Persistencia local visivel na biblioteca via navegador | Nao aprovado |
| Uso de debrief salvo como base explicita no `/brief` via navegador | Nao aprovado |
| Contador da biblioteca considerando registros locais | Nao aprovado |

### Indicadores da rodada

- Total de itens avaliados: `12`
- Itens aprovados: `9`
- Itens nao aprovados: `3`
- Percentual de aprovacao: `75%`
- Percentual de erros/pendencias: `25%`

### Resultado geral

- Build de producao: aprovado
- TypeScript (`npx tsc --noEmit`): aprovado
- Smoke test das paginas principais: aprovado
- Fluxo de geracao de debrief em modo demonstracao: aprovado
- Fluxo de geracao de brief com debrief selecionado como contexto: aprovado
- Preview estavel validado: aprovado (`http://localhost:3023`)

### Evidencias executadas

- `GET /` -> `200`
- `GET /debrief` -> `200`
- `GET /brief` -> `200`
- `GET /biblioteca` -> `200`
- `POST /api/generate-debrief` com payload valido -> `200`
  - retorno confirmado com `mode: "demo"`
  - retorno confirmado com `debrief_id: null` e resposta util para MVP
- `POST /api/generate-brief` com `selected_debriefs` no payload -> `200`
  - retorno confirmado com `mode: "demo"`
  - `sources` retornou o debrief explicitamente selecionado
- CSS do preview estavel em `3023`: validado por carregamento do asset com `200`

### Escopo validado nesta rodada

- O app sobe e compila em producao sem erro
- O fluxo `/debrief` gera resposta util mesmo sem API de IA configurada
- O fluxo `/brief` aceita contexto de debrief e devolve saida demonstrativa
- A navegacao principal entre home, debrief, brief e biblioteca responde corretamente
- O modo MVP opera sem API de IA ativa e sem falhar nas rotas principais

### Pendencias da rodada 1

- Validar em navegador o ciclo completo de persistencia local:
  - gerar debrief demo na UI
  - confirmar aparicao na `/biblioteca`
  - clicar em `Usar como base para brief`
  - confirmar exibicao do debrief selecionado na tela de `/brief`
- Validar visualmente o contraste final dos `select` nativos no navegador alvo do usuario
- Confirmar visualmente o contador de campanhas da biblioteca com registros locais do modo demonstracao

### Ambiente usado na rodada

- Build local com `next build`
- Preview local estavel: `http://localhost:3023`
- Modo da aplicacao testado: MVP demonstrativo sem API real de IA

---

## Funcionais

- Gerar debrief sem preset
- Gerar debrief com preset aplicado
- Salvar preset de debrief
- Gerar brief sem preset
- Gerar brief com preset aplicado
- Salvar preset de brief
- Abrir `/biblioteca` com e sem registros
- Entrar em `/brief` a partir da biblioteca com campos pre-preenchidos

## Desempenho

- Medir tempo de resposta das rotas `generate-debrief` e `generate-brief`
- Medir impacto do carregamento de presets nas paginas `/debrief` e `/brief`
- Verificar se o formulario continua utilizavel enquanto dados de apoio carregam
- Avaliar quantidade de queries no server component

## Seguranca

- Confirmar que `ANTHROPIC_API_KEY` nunca chega ao cliente
- Confirmar que `SUPABASE_SERVICE_ROLE_KEY` so e usada server-side
- Verificar mensagens de erro sem exposicao de stack
- Validar risco do uso de presets globais sem autenticacao
- Revisar limites de request e abuso nas rotas IA

## Qualidade de codigo

- `npm run typecheck`
- `npm run build`
- Smoke test das paginas principais
- Revisao de duplicacoes entre formularios
- Revisao de contratos compartilhados entre frontend e backend
