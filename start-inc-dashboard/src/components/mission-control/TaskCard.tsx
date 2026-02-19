"use client";

import { motion } from "framer-motion";
import { Id } from "../../../convex/_generated/dataModel";

interface TaskCardProps {
    task: any;
}

export default function TaskCard({ task }: TaskCardProps) {
    const isHighPriority = task.priority === "high" || task.priority === "critical";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 hover:border-white/10 hover:bg-white/[0.05] transition-all cursor-grab active:cursor-grabbing"
        >
            {/* Priority Indicator Line */}
            <div className={`absolute top-0 left-0 w-1 h-full rounded-l-xl ${task.priority === 'critical' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                    task.priority === 'high' ? 'bg-orange-500' :
                        task.status === 'done' ? 'bg-emerald-500' : 'bg-indigo-500'
                }`} />

            <div className="flex justify-between items-start mb-2 pl-2">
                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${task.priority === 'critical' ? 'bg-red-500/20 text-red-500' :
                        task.priority === 'high' ? 'bg-orange-500/20 text-orange-500' :
                            'bg-indigo-500/20 text-indigo-400'
                    }`}>
                    {task.priority || 'standard'}
                </span>
                <span className="text-slate-600 font-mono text-[9px]">#{task._id.toString().slice(-4)}</span>
            </div>

            <h4 className="text-xs font-bold text-slate-200 mb-2 pl-2 line-clamp-2 leading-snug group-hover:text-white transition-colors">
                {task.title}
            </h4>

            <p className="text-[10px] text-slate-500 mb-4 pl-2 line-clamp-2 leading-relaxed">
                {task.description}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-white/[0.03] ml-2">
                <div className="flex -space-x-1.5">
                    {task.assigneeIds?.length > 0 ? (
                        task.assigneeIds.map((id: any) => (
                            <div key={id.toString()} className="w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] shadow-sm">
                                👤
                            </div>
                        ))
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-800/50 border border-white/5 flex items-center justify-center text-[8px] text-slate-600">
                            ?
                        </div>
                    )}
                </div>

                <div className="text-[8px] font-black uppercase tracking-tighter text-slate-600">
                    {new Date(task.updatedAt || task.createdAt).toLocaleDateString()}
                </div>
            </div>
        </motion.div>
    );
}
