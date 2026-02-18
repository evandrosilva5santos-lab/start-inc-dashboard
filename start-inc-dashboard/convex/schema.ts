
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Tabela de Agentes: Quem está online e o que estão fazendo
    // Tabela de Agentes: Quem está online e o que estão fazendo
    agents: defineTable({
        // Campos Core (Solicitados)
        name: v.string(), // "Shuri"
        role: v.string(), // "Product Analyst"
        status: v.string(), // "idle" | "active" | "blocked" | "working" | "sleeping"
        currentTaskId: v.optional(v.id("tasks")),
        sessionKey: v.optional(v.string()), // "agent:product-analyst:main"

        // Campos Legados / Identidade (Preservados)
        id: v.string(), // ID externo (ex: vision, jarvis)
        lastHeartbeat: v.number(),
        emoji: v.optional(v.string()),
        level: v.optional(v.string()),
        autonomy: v.optional(v.string()),
        department: v.optional(v.string()),

        // Identidade Profunda (OpenClaw Compliance)
        creature: v.optional(v.string()),
        vibe: v.optional(v.string()),
        soul: v.optional(v.string()),
        identity: v.optional(v.string()),
        motto: v.optional(v.string()),
        model: v.optional(v.string()),
        workspacePath: v.optional(v.string()),

        // Estrutura de Personalidade
        personality: v.optional(v.object({
            characteristics: v.array(v.string()),
            speechStyle: v.optional(v.string()),
            psychology: v.optional(v.string()),
            tastes: v.optional(v.array(v.string())),
            secret: v.optional(v.string()),
        })),

        // Background e Referências
        background: v.optional(v.object({
            region: v.string(),
            references: v.array(v.string()),
            books: v.array(v.string()),
            expertise: v.array(v.string()),
        })),

        // Essência Organizacional
        essence: v.optional(v.object({
            mission: v.string(),
            vision: v.string(),
            values: v.array(v.string()),
        })),

        capabilities: v.optional(v.array(v.string())),
        reportingTo: v.optional(v.string()),

        // Dossiê 3.0 — Hierarquia Militar
        rank: v.optional(v.string()), // "marechal" | "capitao" | "major" | "tenente" | "sargento" | "soldado"

        // Dossiê 3.0 — Modelo Spotify
        chapterRole: v.optional(v.string()),            // "head" | "core" | "pool"
        squadIds: v.optional(v.array(v.string())),       // ["squad-infoprodutos", "squad-clinicas"]
        guildIds: v.optional(v.array(v.string())),       // ["guild-ia-marketing"]

        // Dossiê 3.0 — Assembly Line
        assemblyPhases: v.optional(v.array(v.string())), // ["PRODUCTION", "DISTRIBUTION"]
        triggers: v.optional(v.array(v.string())),       // ["status:briefed", "status:approved"]

        // Dossiê 3.0 — System Prompt (para uso por AI)
        systemPrompt: v.optional(v.string()),            // Prompt completo em inglês
    }).index("by_agent_id", ["id"]).index("by_session_key", ["sessionKey"]),

    // Mesas de Trabalho (Core Architecture)
    tasks: defineTable({
        title: v.string(),
        description: v.string(),
        status: v.string(), // "inbox" | "assigned" | "in_progress" | "review" | "done"
        assigneeIds: v.optional(v.array(v.id("agents"))), // Novos assignees
        owner: v.optional(v.string()), // Deprecated: manter por compatibilidade temporária

        priority: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        parentId: v.optional(v.id("tasks")),
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_status", ["status"]).index("by_owner", ["owner"]),

    messages: defineTable({
        taskId: v.id("tasks"),
        fromAgentId: v.id("agents"),
        content: v.string(),
        attachments: v.optional(v.array(v.id("documents"))),
        timestamp: v.number(),
    }).index("by_task", ["taskId"]),

    activities: defineTable({
        type: v.string(), // "task_created" | "message_sent" | "document_created"
        agentId: v.id("agents"),
        message: v.string(),
        timestamp: v.number(),

        // Campos legados para compatibilidade
        action: v.optional(v.string()),
        details: v.optional(v.string()),
        taskId: v.optional(v.id("tasks")),
    }).index("by_timestamp", ["timestamp"]),

    documents: defineTable({
        title: v.string(),
        content: v.string(), // Markdown
        type: v.string(), // "deliverable" | "research" | "protocol"
        taskId: v.optional(v.id("tasks")), // Link direto para task

        // Legado
        tags: v.optional(v.array(v.string())),
        lastUpdated: v.number(),
    }).index("by_type", ["type"]).index("by_task", ["taskId"]),

    notifications: defineTable({
        mentionedAgentId: v.id("agents"),
        content: v.string(),
        delivered: v.boolean(),
        timestamp: v.number(),

        // Legado
        recipientId: v.optional(v.string()),
        senderId: v.optional(v.string()),
        read: v.optional(v.boolean()),
        type: v.optional(v.string()),
    }).index("by_recipient", ["mentionedAgentId", "delivered"]),

    // Tabelas Auxiliares (Não mencionadas no core novo, mas úteis)
    memories: defineTable({
        agentId: v.string(),
        key: v.string(),
        value: v.any(),
        expiresAt: v.optional(v.number()),
        updatedAt: v.number(),
    }).index("by_agent_key", ["agentId", "key"]),

    workspace_files: defineTable({
        agentId: v.string(),
        path: v.string(),
        name: v.string(),
        type: v.string(),
        content: v.optional(v.string()),
        size: v.optional(v.number()),
        lastModified: v.number(),
    }).index("by_agent", ["agentId"]).index("by_agent_path", ["agentId", "path"]),

    skills: defineTable({
        name: v.string(),
        description: v.string(),
        category: v.string(),
        agentId: v.optional(v.string()),
        enabled: v.boolean(),
        config: v.optional(v.string()),
        lastUpdated: v.number(),
    }).index("by_category", ["category"]).index("by_agent", ["agentId"]),
    secrets: defineTable({
        key: v.string(), // "GITHUB_PAT"
        value: v.string(), // "ghp_..."
        description: v.optional(v.string()),
        category: v.optional(v.string()), // "auth", "api", "system"
        lastUpdated: v.number(),
    }).index("by_key", ["key"]),
});
