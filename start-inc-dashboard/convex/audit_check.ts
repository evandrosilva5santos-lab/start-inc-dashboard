import { query } from "./_generated/server";

export const listAllFull = query({
    handler: async (ctx) => {
        const agents = await ctx.db.query("agents").collect();
        // Retorna o objeto completo para sincronização local
        return agents.map(a => ({
            id: a.id || a.name.toLowerCase().replace(/\s+/g, '-'), // Garante um ID de pasta
            name: a.name,
            role: a.role,
            rank: a.rank,
            department: a.department,
            soul: a.soul, // O conteúdo do SOUL.md
            personality: a.personality, // Config extra
            motto: a.motto,
            status: a.status,
            reportingTo: a.reportingTo
        })).sort((a, b) => a.name.localeCompare(b.name));
    }
});
