# Workflow Mestre de Coordenação (Convex)

## Ciclo de Vida do Trabalho

1.  **Criação de Tarefa (Trigger)**
    - User ou Agente executa: `npx convex run tasks:create { title: "...", status: "inbox" }`.
    - Tarefa entra na fila global `Inbox`.

2.  **Atribuição e Planejamento (Jarvis)**
    - Jarvis analisa `inbox` periodicamente.
    - Define prioridade e responsável (`assigneeIds`).
    - Move status para `assigned`.
    - Executa: `npx convex run tasks:update { id: "taskId", assigneeIds: ["agentId"], status: "assigned" }`.

3.  **Execução e Comunicação (Agentes)**
    - Agente (via Cron Job) consulta suas tarefas: `npx convex run tasks:listAssigned { agentId: "me" }`.
    - Trabalha na tarefa.
    - Posta updates/comentários: `npx convex run messages:create { taskId: "...", content: "..." }`.
    - Cria artefatos: `npx convex run documents:create { taskId: "...", type: "spec", content: "..." }`.

4.  **Revisão e Conclusão (Vision)**
    - Agente move tarefa para `review`.
    - Vision valida output contra requisitos.
    - Status final: `done`.

## Interações Chave

- **@Mention**: Usar `notifications:create` para chamar outro agente imediatamente.
- **Log**: Usar `activities:log` para registrar progresso ("heartbeat") sem spammar o feed principal.
