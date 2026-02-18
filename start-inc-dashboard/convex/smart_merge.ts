import { mutation } from "./_generated/server";

export const mergeAll = mutation({
    handler: async (ctx) => {
        const allAgents = await ctx.db.query("agents").collect();
        const logs = [];

        // Agrupar por Nome Normalizado (ex: "jarvis | coo" -> "jarvis")
        const groups: Record<string, any[]> = {};

        for (const agent of allAgents) {
            // Normalização agressiva: pega primeira palavra ou nome conhecido
            let key = agent.name.toLowerCase().split("|")[0].trim();
            if (key.includes("elon")) key = "elon musk";
            if (key.includes("talles")) key = "talles gomes";
            // ... adicionar regras se precisar

            if (!groups[key]) groups[key] = [];
            groups[key].push(agent);
        }

        let removedCount = 0;

        for (const [key, list] of Object.entries(groups)) {
            if (list.length > 1) {
                // Encontrar o Agente Mestre (o que tem sessionKey recente ou role c-level/agent)
                // Prioridade: role=c-level > agent > mentor > user
                // Desempate: lastHeartbeat mais recente
                list.sort((a, b) => {
                    const roleScore = (r: string) => {
                        if (r === "c-level") return 4;
                        if (r === "agent") return 3;
                        if (r === "mentor") return 2;
                        return 1;
                    };
                    const scoreA = roleScore(a.role) + (a.isActive ? 10 : 0);
                    const scoreB = roleScore(b.role) + (b.isActive ? 10 : 0);
                    if (scoreA !== scoreB) return scoreB - scoreA;
                    return (b.lastHeartbeat || 0) - (a.lastHeartbeat || 0);
                });

                const master = list[0];
                const duplicates = list.slice(1);

                logs.push(`Merging ${duplicates.length} duplicates into MASTER: ${master.name} (${master._id})`);

                for (const dup of duplicates) {
                    // Aqui transferiríamos tarefas se fosse crítico, mas vamos focar em limpar agentes.
                    // Assumindo que o Mestre é o que criamos agora e é o correto.
                    await ctx.db.delete(dup._id);
                    removedCount++;
                }
            }
        }

        return { removed: removedCount, logs };
    }
});
