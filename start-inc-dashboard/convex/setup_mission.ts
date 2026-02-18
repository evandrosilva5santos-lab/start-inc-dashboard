import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seed = mutation({
    args: {},
    handler: async (ctx) => {
        // 1. Identificar Agentes Chave
        const vision = await ctx.db.query("agents").filter(q => q.eq(q.field("name"), "Vision")).first();
        const jarvis = await ctx.db.query("agents").filter(q => q.eq(q.field("name"), "Jarvis")).first();
        const katy = await ctx.db.query("agents").filter(q => q.eq(q.field("name"), "Katy | Head de Projetos")).first();

        if (!vision || !jarvis || !katy) {
            return "❌ Erro: Vision, Jarvis ou Katy não encontrados no banco.";
        }

        // 2. Criar Tarefas Iniciais (Se não existirem)

        // TAREFA 1: Vision - Validação Estratégica
        const taskVision = await ctx.db.insert("tasks", {
            title: "Validar Operacionalidade do Centro de Controle",
            description: "Analise os logs recentes de atividade e confirme se o fluxo de Heartbeat está ativo para todos os agentes. Defina a primeira Diretiva Global para o Q1.",
            status: "in_progress",
            priority: "critical",
            assigneeIds: [vision._id],
            tags: ["strategy", "system-check"],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        // TAREFA 2: Jarvis - Auditoria de Pelotão
        const taskJarvis = await ctx.db.insert("tasks", {
            title: "Auditoria de Conectividade dos Agentes",
            description: "Verifique se Shuri, Pepper, Friday e os demais estão respondendo aos pings de Heartbeat. Reporte qualquer agente mudo ou desconectado.",
            status: "in_progress",
            priority: "high",
            assigneeIds: [jarvis._id],
            tags: ["operations", "audit"],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        // TAREFA 3: Katy - Estrutura de Projetos
        const taskKaty = await ctx.db.insert("tasks", {
            title: "Configurar Quadro Kanban Mestre",
            description: "Organize as tarefas iniciais no ClickUp (simulado) e garanta que cada agente tenha pelo menos uma tarefa de backlog configurada.",
            status: "in_progress",
            priority: "high",
            assigneeIds: [katy._id],
            tags: ["management", "setup"],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        // 3. Notificar Agentes (Criar Mensagens Iniciais)
        await ctx.db.insert("messages", {
            taskId: taskVision,
            fromAgentId: jarvis._id, // Jarvis avisa Vision
            content: "Senhor, os sistemas de suporte à vida (Heartbeats) foram ativados. Aguardando suas ordens para a tropa.",
            timestamp: Date.now(),
        });

        return `✅ Missão Inicial Lançada! Tarefas atribuídas a Vision (${taskVision}), Jarvis (${taskJarvis}) e Katy (${taskKaty}).`;
    },
});
