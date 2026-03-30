# Todo de Implementacao

Resumo rapido:

- Estado atual: MVP funcional em modo demonstracao
- Preview estavel mais recente: `http://localhost:3023`
- Foco atual: fechar o ciclo visual completo `debrief -> biblioteca -> brief`

## Progresso Atual

- [x] MVP navegavel em `/`, `/debrief`, `/brief` e `/biblioteca`
- [x] Fluxo debrief funcional em modo demonstracao
- [x] Fluxo brief funcional em modo demonstracao
- [x] Preview estavel validado na porta `3023`
- [x] Primeira rodada de testes tecnicos executada e documentada
- [x] Checklist executivo de testes com status e percentual registrado
- [ ] Validar ciclo visual completo no navegador
- [ ] Gerar debrief pela UI e confirmar persistencia local na biblioteca
- [x] Permitir usar debrief salvo como base explicita para novo brief pela UI
- [x] Ajustar contador da biblioteca para somar registros locais e servidor
- [ ] Registrar segunda rodada de testes com foco no fluxo visual completo

## Produto e UX

- [x] Criar base do fluxo debrief
- [x] Criar base do fluxo brief
- [x] Criar biblioteca de campanhas
- [x] Adicionar presets globais
- [x] Permitir salvar preenchimento atual como preset
- [x] Adicionar mock pre-preenchido nos formularios
- [x] Permitir limpar formulario e iniciar do zero
- [ ] Exibir biblioteca dedicada de presets com filtros
- [ ] Permitir duplicar preset existente
- [ ] Permitir arquivar presets desatualizados

## Backend

- [x] Criar tabela `debriefings`
- [x] Criar tabela `briefs`
- [x] Criar tabela `presets`
- [x] Ajustar rotas para aceitar entradas guiadas
- [x] Persistir presets globais no Supabase
- [x] Criar modo demonstracao sem dependencia de API de IA
- [x] Permitir contexto explicito de debrief no endpoint de brief
- [x] Persistir debrief demo localmente no navegador
- [ ] Validar payload com schema explicito
- [x] Criar fallback local para rate limit sem KV

## Qualidade

- [x] Typecheck do projeto
- [x] Build validado em ambiente sem problema de SWC local
- [x] Smoke test das paginas principais
- [x] Primeira rodada de testes de API registrada
- [ ] Testes unitarios de composicao de payload
- [ ] Testes de interface para aplicar preset
- [ ] Testes de erro para APIs

## Documentacao

- [x] Roadmap do projeto
- [x] Todo tecnico e funcional
- [x] Matriz de testes
- [x] Catalogo de funcoes
- [ ] Guia de deploy em producao com variaveis completas
