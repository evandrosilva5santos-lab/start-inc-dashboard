import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * MIGRATION: Supabase -> Convex
 * Migra todos os agentes do Supabase para o Convex
 */
export const importFromSupabase = mutation({
    args: {
        agents: v.array(v.any()),
    },
    handler: async (ctx, args) => {
        let created = 0;
        let updated = 0;
        let errors = 0;

        for (const supaAgent of args.agents) {
            try {
                // Mapear campos do Supabase para o schema do Convex
                const convexAgent = {
                    id: supaAgent.id,
                    name: supaAgent.name,
                    role: supaAgent.role,
                    emoji: supaAgent.emoji || "🤖",
                    level: supaAgent.level || "operational",
                    autonomy: supaAgent.autonomy || "medium",
                    department: supaAgent.department || "Ops",

                    // Novos campos de identidade
                    creature: undefined, // Será preenchido depois
                    vibe: undefined, // Será preenchido depois
                    soul: supaAgent.description || undefined,
                    identity: supaAgent.profile || undefined,
                    motto: undefined, // Será preenchido depois
                    model: supaAgent.model || "anthropic/claude-3-5-sonnet-20240620",
                    workspacePath: supaAgent.workspace_path || `/root/clawd/${supaAgent.id}`,

                    // Campos vazios por enquanto (podem ser preenchidos depois)
                    personality: undefined,
                    background: undefined,
                    essence: undefined,

                    capabilities: [], // Pode ser derivado do role
                    reportingTo: supaAgent.reports_to || undefined,

                    // Status
                    status: "idle",
                    lastHeartbeat: Date.now(),
                };

                // Verificar se já existe
                const existing = await ctx.db
                    .query("agents")
                    .withIndex("by_agent_id", (q) => q.eq("id", convexAgent.id))
                    .unique();

                if (existing) {
                    // Atualizar apenas se houver diferenças
                    await ctx.db.patch(existing._id, {
                        ...convexAgent,
                        lastHeartbeat: Date.now(),
                    });
                    updated++;
                } else {
                    // Inserir novo
                    await ctx.db.insert("agents", convexAgent);
                    created++;
                }
            } catch (err: any) {
                console.error(`Erro ao migrar agente ${supaAgent.name}:`, err);
                errors++;
            }
        }

        return {
            success: true,
            created,
            updated,
            errors,
            total: args.agents.length,
        };
    },
});
