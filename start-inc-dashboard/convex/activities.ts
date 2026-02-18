import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const log = mutation({
    args: {
        agentId: v.string(), // UUID/External ID
        type: v.string(),
        message: v.string()
    },
    handler: async (ctx, args) => {
        const agent = await ctx.db.query("agents")
            .withIndex("by_agent_id", (q) => q.eq("id", args.agentId))
            .unique();

        if (!agent) throw new Error(`Agent not found: ${args.agentId}`);

        return await ctx.db.insert("activities", {
            agentId: agent._id,
            type: args.type,
            message: args.message,
            timestamp: Date.now()
        });
    }
});

export const list = query({
    handler: async (ctx) => {
        return await ctx.db.query("activities").order("desc").take(20);
    },
});
