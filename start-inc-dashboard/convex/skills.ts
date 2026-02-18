import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Lista todas as skills disponíveis no sistema
export const listAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("skills").collect();
    },
});

// Pega skills de um agente específico
export const getByAgent = query({
    args: { agentId: v.id("agents") },
    handler: async (ctx, args) => {
        // 1. Busca skills globais
        const globalSkills = await ctx.db
            .query("skills")
            .filter((q) => q.eq(q.field("agentId"), undefined))
            .collect();

        // 2. Busca skills específicas do agente
        const agentSkills = await ctx.db
            .query("skills")
            .filter((q) => q.eq(q.field("agentId"), args.agentId))
            .collect();

        return [...globalSkills, ...agentSkills];
    },
});

// Registra ou atualiza uma skill (Chamado pelo OpenClaw/VPS)
export const registerSkill = mutation({
    args: {
        name: v.string(),
        description: v.string(),
        category: v.string(),
        config: v.optional(v.string()), // JSON configuration
        agentId: v.optional(v.string()) // Se for específica de um agente
    },
    handler: async (ctx, args) => {
        // Verifica se já existe
        const existing = await ctx.db
            .query("skills")
            .filter((q) => q.eq(q.field("name"), args.name))
            .first();

        if (existing) {
            // Atualiza
            await ctx.db.patch(existing._id, {
                description: args.description,
                category: args.category,
                config: args.config,
                lastUpdated: Date.now(),
            });
            return existing._id;
        } else {
            // Cria nova
            return await ctx.db.insert("skills", {
                name: args.name,
                description: args.description,
                category: args.category,
                config: args.config,
                agentId: args.agentId,
                enabled: true,
                lastUpdated: Date.now(),
            });
        }
    },
});
