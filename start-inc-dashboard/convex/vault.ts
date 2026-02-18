
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// GURU (Guardião Único de Recursos e Utilidades)
// Este módulo centraliza o acesso a chaves de API e credenciais sensíveis.

// Recupera um segredo pelo nome da chave (Ex: 'GITHUB_PAT')
export const access = query({
    args: { key: v.string() },
    handler: async (ctx, args) => {
        const secret = await ctx.db
            .query("secrets")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .first();

        if (!secret) return null;

        // Opcional: Logar acesso no futuro para auditoria
        return secret.value;
    },
});

// Armazena ou atualiza um segredo (Operação crítica)
export const store = mutation({
    args: {
        key: v.string(),        // Nome da chave (UPPERCASE)
        value: v.string(),      // Valor REAL (token/key)
        description: v.optional(v.string()),
        category: v.optional(v.string()), // 'auth', 'llm', 'infra'
    },
    handler: async (ctx, args) => {
        // Verifica se a chave jÃ¡ existe
        const existing = await ctx.db
            .query("secrets")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .first();

        if (existing) {
            // Atualiza o valor
            await ctx.db.patch(existing._id, {
                value: args.value,
                description: args.description ?? existing.description,
                category: args.category ?? existing.category,
                lastUpdated: Date.now(),
            });
            return { status: "updated", id: existing._id };
        } else {
            // Cria nova chave
            const id = await ctx.db.insert("secrets", {
                key: args.key,
                value: args.value,
                description: args.description,
                category: args.category,
                lastUpdated: Date.now(),
            });
            return { status: "created", id };
        }
    },
});
