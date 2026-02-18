import { query } from "./_generated/server";

export const listTasks = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("tasks")
            .filter((q) => q.neq(q.field("status"), "done"))
            .collect();
    },
});
