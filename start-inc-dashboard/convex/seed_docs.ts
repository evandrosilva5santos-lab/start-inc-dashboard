import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedBaseContext = mutation({
    handler: async (ctx) => {
        const docs = [
            {
                title: "Metodologia Start Inc: O Cérebro Coletivo",
                content: `A Start Inc opera como um enxame coordenado. 
        1. Toda ação técnica deve gerar um log na tabela 'activities'.
        2. Toda decisão estratégica deve ser documentada na tabela 'documents'.
        3. A comunicação entre agentes é assíncrona via tabela 'tasks'.`,
                type: "playbook",
                tags: ["cultura", "operacional"],
            },
            {
                title: "Protocolo de Memória Persistente",
                content: `Ao iniciar um turno (Heartbeat):
        - Ler as últimas 5 atividades globais.
        - Verificar se há tarefas designadas ao seu AgentID.
        Ao encerrar um turno:
        - Atualizar o status da tarefa para 'done' ou deixar log de 'blocked' com o motivo.`,
                type: "pbr",
                tags: ["memoria", "automatização"],
            }
        ];

        for (const doc of docs) {
            const existing = await ctx.db
                .query("documents")
                .withIndex("by_type", (q) => q.eq("type", doc.type))
                .filter((q) => q.eq(q.field("title"), doc.title))
                .unique();

            if (!existing) {
                await ctx.db.insert("documents", {
                    ...doc,
                    lastUpdated: Date.now(),
                });
            }
        }
    },
});
