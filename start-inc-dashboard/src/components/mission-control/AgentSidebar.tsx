"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";

export default function AgentSidebar() {
    const agents = useQuery(api.agents.list);

    if (!agents) return <div className="animate-pulse space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-white/5 rounded-2xl" />
        ))}
    </div>;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Active Agents</h2>
                <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter animate-pulse">
                    {agents.filter(a => a.status === 'active' || a.status === 'working').length} Online
                </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {agents.map((agent, idx) => (
                    <motion.div
                        key={agent._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all cursor-pointer"
                    >
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl shadow-inner">
                                {agent.emoji || '🤖'}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${agent.status === 'active' || agent.status === 'working' ? 'bg-emerald-500' :
                                    agent.status === 'blocked' ? 'bg-red-500' : 'bg-slate-600'
                                }`} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold truncate group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{agent.name}</div>
                            <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest truncate">{agent.role}</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
