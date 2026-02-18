import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Definir ou Atualizar um fragmento de memória (Short-term)
export const setMemory = mutation({
    args: {
        agentId: v.string(),
        key: v.string(),
        value: v.any(),
        ttlMinutes: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const timestamp = Date.now();
        const expiresAt = args.ttlMinutes ? timestamp + args.ttlMinutes * 60000 : undefined;

        const existing = await ctx.db
            .query("memories")
            .withIndex("by_agent_key", (q) => q.eq("agentId", args.agentId).eq("key", args.key))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                value: args.value,
                expiresAt,
                updatedAt: timestamp,
            });
        } else {
            await ctx.db.insert("memories", {
                agentId: args.agentId,
                key: args.key,
                value: args.value,
                expiresAt,
                updatedAt: timestamp,
            });
        }
    },
});

// Recuperar memória específica
export const getMemory = query({
    args: { agentId: v.string(), key: v.string() },
    handler: async (ctx, args) => {
        const memory = await ctx.db
            .query("memories")
            .withIndex("by_agent_key", (q) => q.eq("agentId", args.agentId).eq("key", args.key))
            .unique();

        if (!memory) return null;

        // Se tiver validade e expirou, ignorar (opcional: deletar)
        if (memory.expiresAt && memory.expiresAt < Date.now()) {
            return null;
        }

        return memory.value;
    },
});

// Listar todas as memórias ativas de um agente (O "Snapshot" mental)
export const getAgentSnapshot = query({
    args: { agentId: v.string() },
    handler: async (ctx, args) => {
        const now = Date.now();
        const all = await ctx.db
            .query("memories")
            .withIndex("by_agent_key", (q) => q.eq("agentId", args.agentId))
            .collect();

        return all.filter(m => !m.expiresAt || m.expiresAt > now);
    },
});
