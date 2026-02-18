import { query } from "./_generated/server";
import { v } from "convex/values";

export const dumpAgent = query({
    args: { id: v.string() },
    handler: async (ctx, args) => {
        const agent = await ctx.db
            .query("agents")
            .withIndex("by_agent_id", (q) => q.eq("id", args.id))
            .unique();

        // Console log para ver no terminal quando rodar via npx convex run
        console.log("DUMP DO AGENTE:", JSON.stringify(agent, null, 2));
        return agent;
    },
});
