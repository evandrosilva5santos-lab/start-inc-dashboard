import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// npx convex run documents:create
export const create = mutation({
    args: {
        title: v.string(),
        content: v.string(),
        type: v.string(), // "deliverable", "research", etc.
        taskId: v.optional(v.id("tasks")),
        tags: v.optional(v.array(v.string())),

        // Atividade
        agentId: v.optional(v.id("agents")),
    },
    handler: async (ctx, args) => {
        const docId = await ctx.db.insert("documents", {
            title: args.title,
            content: args.content,
            type: args.type,
            taskId: args.taskId,
            tags: args.tags || [],
            lastUpdated: Date.now(),
        });

        if (args.agentId) {
            await ctx.db.insert("activities", {
                type: "document_created",
                agentId: args.agentId,
                message: `Created document: ${args.title}`,
                taskId: args.taskId,
                timestamp: Date.now(),
            });
        }

        return docId;
    },
});

export const listByType = query({
    args: { type: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (args.type) {
            return await ctx.db
                .query("documents")
                .withIndex("by_type", (q) => q.eq("type", args.type!))
                .collect();
        }
        return await ctx.db.query("documents").collect();
    },
});
