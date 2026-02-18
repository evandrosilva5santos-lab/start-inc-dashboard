import { mutation } from "./_generated/server";

/**
 * Remove duplicatas de agentes baseado no ID
 * Mantém apenas o registro mais recente de cada ID
 */
export const removeDuplicates = mutation({
    handler: async (ctx) => {
        const allAgents = await ctx.db.query("agents").collect();

        // Agrupar por ID
        const groupedById = new Map<string, typeof allAgents>();

        for (const agent of allAgents) {
            const existing = groupedById.get(agent.id);
            if (!existing) {
                groupedById.set(agent.id, [agent]);
            } else {
                existing.push(agent);
            }
        }

        let removed = 0;

        // Para cada grupo com duplicatas, manter apenas o mais recente
        for (const [id, agents] of groupedById.entries()) {
            if (agents.length > 1) {
                // Ordenar por _creationTime (mais recente primeiro)
                agents.sort((a, b) => b._creationTime - a._creationTime);

                // Remover todos exceto o primeiro (mais recente)
                for (let i = 1; i < agents.length; i++) {
                    await ctx.db.delete(agents[i]._id);
                    removed++;
                }

                console.log(`Removidas ${agents.length - 1} duplicata(s) do agente: ${agents[0].name}`);
            }
        }

        return {
            success: true,
            removed,
            totalAgents: groupedById.size,
        };
    },
});
