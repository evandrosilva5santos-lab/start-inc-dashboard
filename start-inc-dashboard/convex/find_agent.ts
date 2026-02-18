import { query } from "./_generated/server";
import { v } from "convex/values";

export const byName = query({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        let agent = await ctx.db.query("agents")
            .filter(q => q.eq(q.field("name"), args.name))
            .first();

        if (!agent) {
            const all = await ctx.db.query("agents").collect();
            // Coerção para null se não encontrar
            agent = all.find(a => (a.name || "").toLowerCase().includes(args.name.toLowerCase())) ?? null;
        }

        if (agent) {
            return `FOUND: ${agent.name} (ID: ${agent._id})`;
        }
        return "NOT FOUND";
    }
});
