
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Obtém o DNA (essência) de um agente específico
export const getDna = query({
    args: { agentId: v.id("agents") },
    handler: async (ctx, args) => {
        const agent = await ctx.db.get(args.agentId);
        if (!agent) throw new Error("Agent not found");
        return {
            id: agent._id,
            name: agent.name,
            systemPrompt: agent.systemPrompt || "", // Prompt do Sistema
            soul: agent.soul || "", // Arquivo Soul
            mission: agent.essence?.mission || "",
            vision: agent.essence?.vision || "",
        };
    },
});

// Atualiza o DNA do agente (Poderoso! Muda o comportamento da IA)
export const updateDna = mutation({
    args: {
        agentId: v.id("agents"),
        field: v.string(), // "systemPrompt" | "soul" | "mission"
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const { agentId, field, content } = args;

        // Mapeamento de campos seguros
        if (field === "systemPrompt") {
            await ctx.db.patch(agentId, { systemPrompt: content });
        } else if (field === "soul") {
            await ctx.db.patch(agentId, { soul: content });
        } else if (field === "mission") {
            // Atualiza dentro do objeto 'essence' (mais complexo)
            const agent = await ctx.db.get(agentId);
            const currentEssence = agent?.essence || { mission: "", vision: "", values: [] };
            await ctx.db.patch(agentId, {
                essence: { ...currentEssence, mission: content }
            });
        }

        return { success: true, timestamp: Date.now() };
    },
});
