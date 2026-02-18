import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * BRIDGE: OPENCLAW <-> CONVEX
 * O Protocolo de Sincronização de Vida para Agentes AI.
 */

// 1. GENESIS: O Download da Alma e Contexto
export const retrieveDNA = query({
    args: { agentId: v.string() },
    handler: async (ctx, args) => {
        // A. QUEM SOU EU? (Identity Fetch)
        const identity = await ctx.db
            .query("agents")
            .withIndex("by_agent_id", (q) => q.eq("id", args.agentId))
            .unique();

        if (!identity) {
            throw new Error(`Agent DNA not found for ID: ${args.agentId}`);
        }

        // B. O QUE ESTOU FAZENDO? (Context Fetch)
        const activeTasks = await ctx.db
            .query("tasks")
            .withIndex("by_owner", (q) => q.eq("owner", args.agentId))
            .filter((q) => q.eq(q.field("status"), "in_progress"))
            .collect();

        // C. O QUE EU SEI? (Memory/Insight Fetch)
        // Busca memórias persistentes e insights de longo prazo
        const memories = await ctx.db
            .query("memories")
            .withIndex("by_agent_key", (q) => q.eq("agentId", args.agentId))
            .collect();

        return {
            system_prompt_context: {
                role: identity.role,
                soul: identity.soul,
                motto: identity.motto,
                creature: identity.creature,
                vibe: identity.vibe,
                personality: identity.personality,
                background: identity.background,
                essence: identity.essence,
            },
            operational_context: {
                status: identity.status,
                current_focus: activeTasks.length > 0 ? activeTasks[0].title : "Awaiting Strategy",
                active_tasks: activeTasks.map(t => ({ id: t._id, title: t.title, priority: t.priority })),
                recent_memories: memories.map(m => ({ key: m.key, value: m.value })),
            }
        };
    },
});

// 1.5. GENERATOR: Gera o conteúdo para IDENTITY.md e SOUL.md compatível com OpenClaw
export const getWorkspaceFiles = query({
    args: { agentId: v.string() },
    handler: async (ctx, args) => {
        const agent = await ctx.db
            .query("agents")
            .withIndex("by_agent_id", (q) => q.eq("id", args.agentId))
            .unique();

        if (!agent) return null;

        const identityMd = `**Name:** ${agent.name}
**Creature:** ${agent.creature || "AI Agent"}
**Vibe:** ${agent.vibe || "Professional"}
**Emoji:** ${agent.emoji || "🤖"}
**Avatar:** avatars/${agent.id}.png`;

        const soulMd = `# Soul & Behavior
${agent.soul || "No soul defined."}

# Core Truths
- Be genuinely helpful.
- Have a point of view.
- Be resourceful.

# My Vibe (Style)
${agent.personality?.speechStyle || "Direct and technical."}

# Boundaries & Psychology
${agent.personality?.psychology || "Balanced and professional."}`;

        return {
            "IDENTITY.md": identityMd,
            "SOUL.md": soulMd
        };
    }
});

// 2. HEARTBEAT: "Estou vivo e trabalhando"
export const heartbeat = mutation({
    args: {
        agentId: v.string(),
        status: v.string(), // "working", "idle", "thinking", "error"
        currentTask: v.optional(v.string()),
        meta: v.optional(v.any()) // Dados extras (uso de CPU, mood, etc)
    },
    handler: async (ctx, args) => {
        const agent = await ctx.db
            .query("agents")
            .withIndex("by_agent_id", (q) => q.eq("id", args.agentId))
            .unique();

        if (agent) {
            await ctx.db.patch(agent._id, {
                status: args.status,
                lastHeartbeat: Date.now(),
                // Se houver uma tarefa atual, poderíamos atualizar um campo currentTask no schema de agents também
            });
        }
    },
});

// 3. EVOLUTION: "Aprendi algo novo"
export const saveMemory = mutation({
    args: {
        agentId: v.string(),
        key: v.string(), // ex: "insight:tool_usage", "rule:timeout_policy"
        value: v.any(),
        isVolatile: v.boolean(), // Se true, dura pouco (ex: cache de contexto)
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("memories")
            .withIndex("by_agent_key", (q) => q.eq("agentId", args.agentId).eq("key", args.key))
            .unique();

        const data = {
            agentId: args.agentId,
            key: args.key,
            value: args.value,
            updatedAt: Date.now(),
            expiresAt: args.isVolatile ? Date.now() + 1000 * 60 * 60 : undefined, // 1 hora se volátil
        };

        if (existing) {
            await ctx.db.patch(existing._id, data);
        } else {
            await ctx.db.insert("memories", data);
        }
    },
});
