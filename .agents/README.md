# Agentes Locais de Segurança

Esta pasta reúne agentes em formato Markdown para uso como prompts operacionais em auditorias de segurança do projeto.

## Agentes criados

- `supabase-access-auditor.md`
  - revisa regras de acesso, RLS, exposição de tabelas e uso de chaves no Supabase
- `pentester.md`
  - executa uma revisão de pentest focada em superfícies HTTP, abuso lógico e falhas exploráveis
- `code-exposure-auditor.md`
  - revisa o código em busca de dados indevidos expostos, segredos, vazamentos e vulnerabilidades de implementação
- `security-orchestrator.md`
  - agente unificado para rodar uma auditoria consolidada e coordenar os demais
- `final-security-sweep.md`
  - tarefa obrigatória que aciona todos os agentes quando o usuário pedir uma varredura final

## Uso sugerido

Use o agente unificado quando quiser uma revisão completa.
Use os agentes especializados quando quiser profundidade em uma camada específica.
Use `final-security-sweep.md` quando quiser uma verificação final obrigatória antes de entrega ou deploy.

## Formato de resposta esperado

Todos os agentes devem responder com:

1. achados priorizados por severidade
2. evidências objetivas
3. impacto
4. recomendação de correção
5. pendências ou pontos que exigem validação manual

## Regra operacional

As revisões devem ser **não destrutivas por padrão**. Qualquer teste intrusivo, exploração ativa, brute force, fuzzing agressivo ou alteração de ambiente deve ser explicitamente autorizado antes de execução.
