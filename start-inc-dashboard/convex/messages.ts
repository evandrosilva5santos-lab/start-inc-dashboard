import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// npx convex run messages:create
export const create = mutation({
    args: {
        taskId: v.id("tasks"),
        fromAgentId: v.optional(v.id("agents")), // ID interno
        content: v.string(),
        attachments: v.optional(v.array(v.id("documents"))),
        // Opcional: permitir passar ID externo para facilitar CLI
        externalAgentId: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        let fromAgentId = args.fromAgentId;

        // Se passar ID externo, converte para interno
        if (!fromAgentId && args.externalAgentId) {
            const agent = await ctx.db.query("agents")
                .withIndex("by_agent_id", (q) => q.eq("id", args.externalAgentId!))
                .unique();
            if (agent) {
                fromAgentId = agent._id;
            }
        }

        if (!fromAgentId) {
            throw new Error("Agent ID required");
        }

        const messageId = await ctx.db.insert("messages", {
            taskId: args.taskId,
            fromAgentId: fromAgentId,
            content: args.content,
            attachments: args.attachments,
            timestamp: Date.now(),
        });

        // Registrar atividade
        await ctx.db.insert("activities", {
            type: "message_sent",
            agentId: fromAgentId,
            message: `Posted comment on task`,
            taskId: args.taskId,
            timestamp: Date.now(),
        });

        return messageId;
    },
});

export const listByTask = query({
    args: { taskId: v.id("tasks") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messages")
            .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
            .collect();
    },
});

export const list = query({
    handler: async (ctx) => {
        return await ctx.db.query("messages").order("desc").take(20);
    },
});
