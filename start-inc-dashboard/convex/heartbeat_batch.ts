import { mutation } from "./_generated/server";

/**
 * Batch Heartbeat: Atualiza todos os agentes de uma vez
 * Reduz 26 requests para 1 único request
 */
export const batchUpdate = mutation({
    handler: async (ctx) => {
        const allAgents = await ctx.db.query("agents").collect();
        const now = Date.now();
        let updated = 0;

        for (const agent of allAgents) {
            // Atualiza lastHeartbeat para todos os agentes ativos
            if (agent.role === "agent" || agent.role === "c-level") {
                await ctx.db.patch(agent._id, {
                    lastHeartbeat: now,
                });
                updated++;
            }
        }

        return { updated, timestamp: now };
    }
});
