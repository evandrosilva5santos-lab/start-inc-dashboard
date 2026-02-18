import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    handler: async (ctx) => {
        return await ctx.db.query("agents").collect();
    },
});

export const getById = query({
    args: { id: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("agents")
            .withIndex("by_agent_id", (q) => q.eq("id", args.id))
            .unique();
    },
});

export const updateStatus = mutation({
    args: { id: v.string(), status: v.string() },
    handler: async (ctx, args) => {
        const agent = await ctx.db
            .query("agents")
            .withIndex("by_agent_id", (q) => q.eq("id", args.id))
            .unique();
        if (agent) {
            await ctx.db.patch(agent._id, { status: args.status, lastHeartbeat: Date.now() });
        }
    },
});

export const updateAgent = mutation({
    args: {
        id: v.string(),
        name: v.optional(v.string()),
        role: v.optional(v.string()),
        department: v.optional(v.string()),
        emoji: v.optional(v.string()),
        identity: v.optional(v.string()),
        motto: v.optional(v.string()),
        soul: v.optional(v.string()),
        creature: v.optional(v.string()),
        vibe: v.optional(v.string()),
        level: v.optional(v.string()),
        autonomy: v.optional(v.string()),
        model: v.optional(v.string()),
        reportingTo: v.optional(v.string()),
        capabilities: v.optional(v.array(v.string())),
        rank: v.optional(v.string()),
        systemPrompt: v.optional(v.string()),
        personality: v.optional(v.object({
            characteristics: v.array(v.string()),
            speechStyle: v.optional(v.string()),
            psychology: v.optional(v.string()),
            tastes: v.optional(v.array(v.string())),
            secret: v.optional(v.string()),
        })),
        background: v.optional(v.object({
            region: v.string(),
            references: v.array(v.string()),
            books: v.array(v.string()),
            expertise: v.array(v.string()),
        })),
        essence: v.optional(v.object({
            mission: v.string(),
            vision: v.string(),
            values: v.array(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        const agent = await ctx.db
            .query("agents")
            .withIndex("by_agent_id", (q) => q.eq("id", args.id))
            .unique();
        if (!agent) throw new Error(`Agent ${args.id} not found`);

        const { id, ...updates } = args;
        const filtered = Object.fromEntries(
            Object.entries(updates).filter(([, v]) => v !== undefined)
        );
        await ctx.db.patch(agent._id, { ...filtered, lastHeartbeat: Date.now() });
        return { success: true, updated: Object.keys(filtered) };
    },
});
