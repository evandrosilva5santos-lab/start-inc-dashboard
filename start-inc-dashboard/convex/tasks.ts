import { query, mutation } from "./_generated/server";
import { v } from "convex/values";


// Listar tarefas de um agente específico (Adaptado para novos assignees)
export const getAgentTasks = query({
    args: { agentId: v.string() }, // agentId no formato Convex ID ou String ID? Vamos suportar ambos se possível, ou focar no novo.
    handler: async (ctx, args) => {
        // Tenta achar tasks onde este agente está nos assignees
        // Como assignees é lista, query simples não funciona bem sem indice multikey ou filter
        // Convex suporta array search em filtro

        // Primeiro, descobrir o ID interno se args.agentId for string externa "jarvis"
        const agent = await ctx.db.query("agents")
            .withIndex("by_agent_id", (q) => q.eq("id", args.agentId))
            .unique();

        if (!agent) return []; // Agente não encontrado

        // Busca tasks onde assigneeIds contem agent._id
        const tasks = await ctx.db.query("tasks").collect();
        return tasks.filter(t => t.assigneeIds?.includes(agent._id));
    },
});

// NOVA: Create Task (npx convex run tasks:create)
export const create = mutation({
    args: {
        title: v.string(),
        description: v.string(),
        status: v.optional(v.string()), // "inbox", "assigned"...
        priority: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        assigneeIds: v.optional(v.array(v.id("agents"))),
        parentId: v.optional(v.id("tasks")),
    },
    handler: async (ctx, args) => {
        const timestamp = Date.now();
        const taskId = await ctx.db.insert("tasks", {
            title: args.title,
            description: args.description,
            status: args.status || "inbox",
            assigneeIds: args.assigneeIds || [],
            priority: args.priority || "medium",
            tags: args.tags || [],
            parentId: args.parentId,
            createdAt: timestamp,
            updatedAt: timestamp,
            owner: undefined, // Deprecated
        });

        // Registrar atividade
        if (args.assigneeIds && args.assigneeIds.length > 0) {
            for (const agentId of args.assigneeIds) {
                await ctx.db.insert("activities", {
                    type: "task_created",
                    agentId: agentId,
                    message: `Assigned to task: ${args.title}`,
                    taskId: taskId,
                    timestamp,
                });
            }
        }

        return taskId;
    },
});

// NOVA: Update Task (npx convex run tasks:update)
export const update = mutation({
    args: {
        id: v.id("tasks"),
        status: v.optional(v.string()),
        assigneeIds: v.optional(v.array(v.id("agents"))),
        description: v.optional(v.string()),
        priority: v.optional(v.string()),
        title: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const timestamp = Date.now();

        await ctx.db.patch(id, {
            ...updates,
            updatedAt: timestamp,
        });

        // Registrar atividade se houver mudança de status
        if (updates.status) {
            // Precisaria saber QUEM mudou. Como é CLI, assumimos "system" ou pegamos de auth
            // Por simplificação:
            // await ctx.db.insert("activities", { type: "status_changed", message: ... })
        }

        return true;
    },
});

// Alias for old code compatibility (createTask)
export const createTask = mutation({
    args: {
        title: v.string(),
        description: v.string(),
        owner: v.string(), // ID externo
        priority: v.string(),
    },
    handler: async (ctx, args) => {
        // Converter owner ID externo para interno
        const agent = await ctx.db.query("agents")
            .withIndex("by_agent_id", (q) => q.eq("id", args.owner))
            .unique();

        const assigneeIds = agent ? [agent._id] : [];

        const taskId = await ctx.db.insert("tasks", {
            title: args.title,
            description: args.description,
            status: "inbox",
            priority: args.priority,
            assigneeIds: assigneeIds,
            tags: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        return taskId;
    },
});

// Alias for old code compatibility (updateTaskStatus)
export const updateTaskStatus = mutation({
    args: {
        taskId: v.id("tasks"),
        status: v.string(),
        agentId: v.string(), // ID Externo
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.taskId, {
            status: args.status,
            updatedAt: Date.now(),
        });

        // Converter agentId externo para interno
        const agent = await ctx.db.query("agents")
            .withIndex("by_agent_id", (q) => q.eq("id", args.agentId))
            .unique();

        if (agent) {
            await ctx.db.insert("activities", {
                type: "status_changed",
                agentId: agent._id,
                message: `Changed status to ${args.status}`,
                taskId: args.taskId,
                timestamp: Date.now()
            });
        }
    },
});

// Listar todas as tarefas ativas
export const listTasks = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("tasks")
            .filter((q) => q.neq(q.field("status"), "done"))
            .collect();
    },
});
// Listar arquivos do workspace
export const listWorkspaceFiles = query({
    args: { agentId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("workspace_files")
            .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
            .collect();
    },
});

// Atualizar arquivo do workspace
export const updateWorkspaceFile = mutation({
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

export const list = query({
    handler: async (ctx) => {
        return await ctx.db.query("tasks").order("desc").take(50);
    },
});

