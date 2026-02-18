import { query } from "./_generated/server";

export const audit = query({
    handler: async (ctx) => {
        const agents = await ctx.db.query("agents").collect();

        const report = agents.map(agent => {
            const missingFields = [];
            if (!agent.rank) missingFields.push("rank");
            if (!agent.soul) missingFields.push("soul");
            if (!agent.level) missingFields.push("level");
            if (!agent.department) missingFields.push("department");
            if (!agent.personality) missingFields.push("personality");
            if (!agent.background) missingFields.push("background");
            if (!agent.essence) missingFields.push("essence");
            if (!agent.capabilities || agent.capabilities.length === 0) missingFields.push("capabilities");

            // Verifica se Soul está curto demais (provavelmente placeholder)
            const soulStatus = agent.soul && agent.soul.length > 50 ? "OK" : "⚠️ SOUL CURTA/VAZIA";

            return {
                name: agent.name,
                status: missingFields.length === 0 ? "✅ COMPLETO" : "❌ INCOMPLETO",
                rank: agent.rank || "N/A",
                missing: missingFields,
                soulHealth: soulStatus
            };
        });

        // Ordenar: Incompletos primeiro
        return report.sort((a, b) => (a.status === "❌ INCOMPLETO" ? -1 : 1));
    }
});
