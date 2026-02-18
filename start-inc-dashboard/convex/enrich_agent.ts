import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateSoul = mutation({
    args: {
        id: v.id("agents"),
        identityData: v.object({
            soul: v.string(),
            vibe: v.string(),
            motto: v.string(),
            role: v.string(),
            capabilities: v.array(v.string()),
            personality: v.object({
                characteristics: v.array(v.string()),
                speechStyle: v.optional(v.string()),
                psychology: v.optional(v.string()),
                secret: v.optional(v.string())
            }),
            essence: v.object({
                mission: v.string(),
                vision: v.string(),
                values: v.array(v.string())
            })
        })
    },
    handler: async (ctx, args) => {
        // Atualiza campos de alma e identidade
        await ctx.db.patch(args.id, {
            soul: args.identityData.soul,
            vibe: args.identityData.vibe,
            motto: args.identityData.motto,
            role: args.identityData.role,
            capabilities: args.identityData.capabilities,
            personality: args.identityData.personality,
            essence: args.identityData.essence,

            // Garante campos operacionais
            status: "idle", // Substitui isActive
            lastHeartbeat: Date.now()
        });
        return `Soul injected into Agent ${args.id}`;
    }
});
