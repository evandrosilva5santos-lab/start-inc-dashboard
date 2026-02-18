import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listFiles = query({
    args: { agentId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("workspace_files")
            .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
            .collect();
    },
});

export const updateFile = mutation({
    args: {
        agentId: v.string(),
        path: v.string(),
        name: v.string(),
        type: v.string(),
        content: v.optional(v.string()),
        size: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("workspace_files")
            .withIndex("by_agent_path", (q) => q.eq("agentId", args.agentId).eq("path", args.path))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                content: args.content,
                size: args.size,
                lastModified: Date.now(),
            });
        } else {
            await ctx.db.insert("workspace_files", {
                ...args,
                lastModified: Date.now(),
            });
        }
    },
});
