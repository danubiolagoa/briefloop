# Tarefa Obrigatória: Varredura Final no Código da Aplicação

## Gatilho

Sempre que o usuário solicitar qualquer uma das expressões abaixo, esta tarefa deve ser executada:

- `varredura final`
- `varredura final no código`
- `auditoria final`
- `revisão final de segurança`
- `security sweep`

## Regra obrigatória

Ao receber esse pedido, a revisão deve **acionar todos os agentes de segurança** deste projeto, sem exceção:

1. `supabase-access-auditor`
2. `pentester`
3. `code-exposure-auditor`
4. `security-orchestrator`

## Ordem de execução recomendada

### 1. Supabase

Rodar o `supabase-access-auditor` para revisar:

- RLS
- policies
- exposição de tabelas
- uso de `anon key`
- uso de `service role`
- riscos de acesso indevido

### 2. Pentest

Rodar o `pentester` para revisar:

- rotas expostas
- abuso lógico
- bypass de limites
- enumeração
- exploração não destrutiva

### 3. Exposição de dados e código

Rodar o `code-exposure-auditor` para revisar:

- segredos
- respostas excessivas
- localStorage e dados persistidos
- vazamento de contexto
- vulnerabilidades no código

### 4. Consolidação final

Rodar o `security-orchestrator` para consolidar:

- achados críticos
- achados altos
- achados médios
- achados baixos
- controles aprovados
- pendências
- ordem recomendada de correção

## Formato obrigatório da resposta final

A resposta da varredura final deve sair em quatro blocos:

### 1. Achados

- listar findings por severidade
- sempre com evidência concreta

### 2. Itens aprovados

- controles e áreas sem achados relevantes

### 3. Pendências

- o que ainda depende de validação manual, ambiente externo ou credenciais

### 4. Veredito final

- `aprovado para entrega`
- `aprovado com ressalvas`
- `não aprovado para entrega`

## Regra de severidade para o veredito

- Se houver qualquer achado crítico: `não aprovado para entrega`
- Se houver achado alto sem mitigação: `não aprovado para entrega`
- Se houver apenas médios e baixos: `aprovado com ressalvas`
- Se não houver achados relevantes: `aprovado para entrega`

## Restrições

- a varredura deve ser não destrutiva por padrão
- não alterar código nem banco automaticamente
- não executar fuzzing agressivo ou testes intrusivos sem autorização explícita
