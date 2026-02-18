
import { query } from "./_generated/server";
import { v } from "convex/values";

export const listActive = query({
    handler: async (ctx) => {
        // Busca tarefas 'in_progress'
        const tasks = await ctx.db
            .query("tasks")
            .withIndex("by_status", (q) => q.eq("status", "in_progress"))
            .order("desc")
            .take(20);

        // Opcional: Enrich com dados do agente (se necessário)
        // Por enquanto retornamos as tarefas cruas
        return tasks;
    },
});

export const getStats = query({
    handler: async (ctx) => {
        const activeCount = await ctx.db
            .query("tasks")
            .withIndex("by_status", (q) => q.eq("status", "in_progress"))
            .collect();

        const completedCount = await ctx.db
            .query("tasks")
            .withIndex("by_status", (q) => q.eq("status", "done"))
            .collect();

        return {
            active: activeCount.length,
            completed: completedCount.length,
            total: activeCount.length + completedCount.length
        };
    },
});
