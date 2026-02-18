# Matriz de Prioridade: Sistema de Coordenação Multi-Agente (Opção Completa)

Este documento define a estratégia operacional para a execução autônoma do enxame de agentes OpenClaw.

## 1. Estrutura de Comando (The 6 Tables)
O sistema opera em 6 mesas de dados no Convex.

| Mesa | Função | Status Técnico |
| :--- | :--- | :--- |
| **Agents** | Identidade e Estado (13 Agentes) | ✅ Implementado |
| **Tasks** | Unidade de Trabalho (Assignees, Status) | ✅ Implementado |
| **Messages** | Comunicação e Contexto (Reply-to) | ✅ Implementado |
| **Documents** | Artefatos Gerados (Specs, Code) | ✅ Implementado |
| **Activities** | Log de Auditoria (Quem fez o quê) | ✅ Implementado |
| **Notifications** | Sistema de Alerta (@mentions) | ✅ Implementado |

## 2. Cronograma de Ativação (Heartbeat) - Ciclo de 15 Minutos
Os agentes despertam em janelas específicas para otimizar fluxo de dados e evitar conflitos (Race Conditions).

| Minuto | Agente | Função | Prioridade |
| :--- | :--- | :--- | :--- |
| **:00** | 🌶️ **Pepper** | Email & Comms | 🟡 Suporte |
| **:02** | 🧠 **Shuri** | Product & Market Radar | 🔴 Estratégica (Blocker) |
| **:04** | 💻 **Friday** | Dev Engineer | 🟢 Execução |
| **:06** | 🎭 **Loki** | Copy & Creative | 🟢 Execução |
| **:07** | 🎨 **Wanda** | UI/UX & Sentimento | 🟢 Execução |
| **:08** | 👁️ **Vision** | Análise & Síntese | 🔴 Estratégica |
| **:10** | 🛡️ **Fury** | Leads & Strategy | 🟡 Suporte |
| **:12** | 🚀 **Quill** | Growth & Outreach | 🟡 Suporte |

**Jobs Especiais (Jarvis):**
- 06:00 AM: Security Audit (🛡️ Alta Prioridade)
- 08:00 AM: Daily Briefing (☀️ Alta Prioridade)

## 3. Matriz de Prioridade de Tarefas
Como o sistema decide o que fazer primeiro.

| Nível | Descrição | Exemplo | Responsável |
| :--- | :--- | :--- | :--- |
| **P1 (Critical)** | Segurança, Bugs, Bloqueios de Negócio | "Fix API vulnerability", "Server down" | Jarvis / Friday |
| **P2 (Strategic)** | Roadmap, Specs de Produto, Análise de Mercado | "Define Q3 Roadmap", "Competitor Analysis" | Shuri / Vision |
| **P3 (Execution)** | Desenvolvimento de Features, Design, Copy | "Build Login Page", "Write Email Campaign" | Friday / Wanda / Loki |
| **P4 (Routine)** | Manutenção, Daily Checks, Atualizações Menores | "Update dependencies", "Weekly Report" | Todos |

## 4. Fluxo de Trabalho (Workflow)
O ciclo de vida de uma ideia no sistema completo.

1.  **Input**: Ideia/Demanda chega (Inbox).
2.  **Triagem (Jarvis - P1/P2)**: Define Prioridade e atribui a Shuri/Vision.
3.  **Spec (Shuri/Vision)**: Cria documento de especificação (Document).
4.  **Execução (Friday/Wanda/Loki)**: Cria código/design/copy baseado na Spec.
5.  **Review (Vision)**: Valida resultado contra a Spec.
6.  **Deploy**: Publicação e notificação de conclusão.
