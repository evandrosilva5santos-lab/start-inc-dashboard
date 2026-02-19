"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import TaskCard from "./TaskCard";
import { motion } from "framer-motion";

const COLUMNS = [
    { id: "inbox", label: "Caixa de Entrada", color: "bg-blue-500" },
    { id: "assigned", label: "Atribuídas", color: "bg-purple-500" },
    { id: "in_progress", label: "Em Andamento", color: "bg-amber-500" },
    { id: "review", label: "Revisão", color: "bg-indigo-500" },
    { id: "done", label: "Concluídas", color: "bg-emerald-500" },
    { id: "blocked", label: "Bloqueadas", color: "bg-red-500" },
];

export default function KanbanBoard() {
    const tasks = useQuery(api.tasks.listAll);

    if (!tasks) return (
        <div className="grid grid-cols-6 gap-4 h-full">
            {COLUMNS.map(col => (
                <div key={col.id} className="bg-white/[0.02] rounded-2xl animate-pulse" />
            ))}
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 h-full">
            {COLUMNS.map((column) => {
                const columnTasks = tasks.filter(t => t.status === column.id);

                return (
                    <div key={column.id} className="flex flex-col h-full min-w-[200px]">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${column.color}`} />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                                    {column.label}
                                </h3>
                            </div>
                            <span className="text-[9px] font-mono font-bold text-slate-600 bg-white/[0.03] px-1.5 py-0.5 rounded">
                                {columnTasks.length}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 min-h-[200px] pb-4">
                            {columnTasks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-24 border border-dashed border-white/[0.03] rounded-xl grayscale opacity-20">
                                    <span className="text-xl">📭</span>
                                </div>
                            ) : (
                                columnTasks.map(task => (
                                    <TaskCard key={task._id} task={task} />
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
