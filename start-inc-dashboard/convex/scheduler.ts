import { query } from "./_generated/server";

export const whatsNext = query({
    handler: async (ctx) => {
        // 1. Quem são os Chefes? (Sempre ativos nos seus horários, controllado pelo client, 
        // mas aqui podemos listar quem DEVE estar ativo se tiver trabalho)

        // 2. Quem tem trabalho?
        const activeTasks = await ctx.db.query("tasks")
            .filter(q => q.eq(q.field("status"), "in_progress"))
            .collect();

        const agentsToWake = new Set<string>();

        for (const task of activeTasks) {
            if (task.assigneeIds) {
                for (const agentId of task.assigneeIds) {
                    const agent = await ctx.db.get(agentId);
                    if (agent && agent.name) {
                        // Usa o slug ou nome para o CLI
                        const slug = agent.name.toLowerCase().replace(/ /g, "-").split("|")[0].trim();
                        agentsToWake.add(slug);
                    }
                }
            }
        }

        return Array.from(agentsToWake);
    }
});
