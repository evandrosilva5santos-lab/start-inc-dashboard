import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
    args: {
        mentionedAgentId: v.string(), // UUID/External ID
        content: v.string(),
        type: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const agent = await ctx.db.query("agents")
            .withIndex("by_agent_id", (q) => q.eq("id", args.mentionedAgentId))
            .unique();

        if (!agent) throw new Error(`Agent not found: ${args.mentionedAgentId}`);

        return await ctx.db.insert("notifications", {
            mentionedAgentId: agent._id,
            content: args.content,
            delivered: false,
            type: args.type || "info",
            timestamp: Date.now()
        });
    }
});

export const list = query({
    handler: async (ctx) => {
        return await ctx.db.query("notifications").order("desc").take(20);
    },
});
