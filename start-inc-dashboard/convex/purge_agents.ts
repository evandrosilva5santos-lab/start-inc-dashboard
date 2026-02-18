import { mutation } from "./_generated/server";

// Função auxiliar com a lógica de identificação
async function getPurgeList(ctx: any) {
    const allAgents = await ctx.db.query("agents").collect();
    const officialAgents = [
        // ESTRATEGICO (MAJORES & CAPITÃES & MARECHAL)
        "Vision", "Jarvis", "Evandro", "Dener Lippert", "Primo Rico", "Alfredo Soares", "Talles Gomes",
        "Katy | Head de Projetos", // NOME OFICIAL EXIGIDO
        "Elon Musk",
        "Ryan Deiss", "Peter Thiel", "Bruno Nardon", "Atlas", "Lázaro",

        // TATICO (TENENTES)
        "Gary Halbert", "Russell Brunson", "Pedro Sobral", "Paulo Cuenca", "Neil Patel", "Alex Hormozi", "Adam Grant", "Érico Rocha", "Tiago Finch",
        "Stefan Georgi", "Caio Carneiro", "Priscila Zillo",

        // OPERACIONAL - SARGENTOS
        "Jon Benson", "MrBeast", "Peter Jordan", "Ícaro de Carvalho", "Leandro Ladeira",
        "Lucas Renault", "Paulo Maccedo", "Amy Porterfield", "Natanael Oliveira", "Thiago Reis", "Mateus Vakuda",

        // OPERACIONAL - SOLDADOS
        "Wanda", "Shuri", "Friday", "Loki", "Pepper", "Fury", "Quill"
    ];

    const toPurge = [];
    const toKeep = [];

    for (const agent of allAgents) {
        const cleanName = agent.name.trim();

        if (officialAgents.includes(cleanName)) {
            toKeep.push(cleanName);
        } else {
            // Verifica variações aceitáveis ou Admin
            if (cleanName.toLowerCase() === "evandro" || cleanName.toLowerCase() === "vision" || cleanName.toLowerCase() === "jarvis") {
                toKeep.push(cleanName);
            } else {
                toPurge.push({
                    id: agent._id,
                    name: agent.name,
                    reason: "Not in official military hierarchy"
                });
            }
        }
    }

    return {
        totalAgents: allAgents.length,
        officialCount: toKeep.length,
        purgeCount: toPurge.length,
        officialList: toKeep.sort(),
        targets: toPurge
    };
}

export const identifyPurgeTargets = mutation({
    handler: async (ctx) => {
        const result = await getPurgeList(ctx);
        return {
            ...result,
            targets: result.targets.map(t => t.name)
        };
    }
});

export const executePurge = mutation({
    handler: async (ctx) => {
        const result = await getPurgeList(ctx);
        const targets = result.targets;
        let deletedCount = 0;
        let names = [];
        for (const target of targets) {
            await ctx.db.delete(target.id);
            deletedCount++;
            names.push(target.name);
        }
        return `🗑️ PURGE COMPLETE. Deletados ${deletedCount} agentes não oficiais: ${names.join(", ")}`;
    }
});
