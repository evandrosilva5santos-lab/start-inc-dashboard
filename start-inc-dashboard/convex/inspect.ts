import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const inspectDuplicates = action({
    handler: async (ctx) => {
        const agents = await ctx.runQuery(api.agents.list);

        // Agrupar por nome normalizado
        const byName: Record<string, any[]> = {};

        for (const agent of agents) {
            // Normalizar nome: "Vision | CEO" -> "Vision", "Jarvis | COO" -> "Jarvis"
            let layoutName = agent.name;
            if (agent.name.includes("|")) {
                layoutName = agent.name.split("|")[0].trim();
            }

            if (!byName[layoutName]) {
                byName[layoutName] = [];
            }
            byName[layoutName].push(agent);
        }

        // Listar duplicatas
        const duplicates = [];
        for (const [name, list] of Object.entries(byName)) {
            if (list.length > 1) {
                duplicates.push({
                    name,
                    count: list.length,
                    versions: list.map(a => ({
                        id: a.id,
                        full_name: a.name,
                        soul: a.soul ? "✅ Presente" : "❌ Ausente",
                        creature: a.creature ? "✅ Presente" : "❌ Ausente"
                    }))
                });
            }
        }

        return duplicates;
    }
});
