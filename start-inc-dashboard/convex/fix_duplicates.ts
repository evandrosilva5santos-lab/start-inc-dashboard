import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const fixDuplicates = mutation({
    handler: async (ctx) => {
        // 1. Buscar os Agentes "Ricos" (OpenClaw)
        const richJarvis = await ctx.db
            .query("agents")
            .withIndex("by_agent_id", (q) => q.eq("id", "main"))
            .unique();

        const richVision = await ctx.db
            .query("agents")
            .withIndex("by_agent_id", (q) => q.eq("id", "vision"))
            .unique();

        // 2. Buscar os Agentes "Originais" (Supabase UUIDs)
        const allOriginals = await ctx.db.query("agents").collect();

        const originalJarvis = allOriginals.find(a => a.name === "Jarvis");
        const originalVision = allOriginals.find(a => a.name === "Vision");

        let changes = [];

        // --- MERGE JARVIS ---
        if (richJarvis && originalJarvis) {
            await ctx.db.patch(originalJarvis._id, {
                // Copiar dados ricos para o original
                name: richJarvis.name, // "Jarvis | COO"
                soul: richJarvis.soul,
                creature: richJarvis.creature,
                vibe: richJarvis.vibe,
                motto: richJarvis.motto,
                personality: richJarvis.personality,
                background: richJarvis.background,
                essence: richJarvis.essence,
                workspacePath: richJarvis.workspacePath,
                emoji: richJarvis.emoji,
                role: richJarvis.role, // Pode ser que queira manter o original? Não, o novo é melhor.
            });

            await ctx.db.delete(richJarvis._id);
            changes.push("Jarvis merged & duplicate deleted.");
        }

        // --- MERGE VISION ---
        if (richVision && originalVision) {
            await ctx.db.patch(originalVision._id, {
                name: richVision.name, // "Vision | CEO"
                soul: richVision.soul,
                creature: richVision.creature,
                vibe: richVision.vibe,
                motto: richVision.motto,
                personality: richVision.personality,
                background: richVision.background,
                essence: richVision.essence,
                workspacePath: richVision.workspacePath,
                emoji: richVision.emoji,
                role: richVision.role,
            });

            await ctx.db.delete(richVision._id);
            changes.push("Vision merged & duplicate deleted.");
        }

        return { success: true, changes };
    },
});
