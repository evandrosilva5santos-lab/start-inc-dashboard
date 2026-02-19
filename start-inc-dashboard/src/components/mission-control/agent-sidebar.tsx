"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Inbox, CheckSquare, CheckCircle2, User, Edit, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Agent {
  _id: string;
  id: string;
  name: string;
  role?: string;
  department?: string;
  soul?: string;
  systemPrompt?: string;
  status: "idle" | "active" | "blocked" | "working" | "sleeping";
  lastHeartbeat?: number;
}

interface AgentSidebarProps {
  agents: Agent[];
  onAgentClick: (agent: Agent) => void;
  selectedAgentId: string | null;
}

export default function AgentSidebar({ agents, onAgentClick, selectedAgentId }: AgentSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAgents = searchQuery
    ? agents.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.role?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : agents;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "working":
        return "text-emerald-400";
      case "blocked":
        return "text-red-400";
      case "sleeping":
        return "text-slate-500";
      default:
        return "text-slate-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "working":
        return <Activity className="w-3 h-3" />;
      case "blocked":
        return <X className="w-3 h-3" />;
      case "sleeping":
        return <Activity className="w-3 h-3 opacity-50" />;
      default:
        return <Activity className="w-3 h-3" />;
    }
  };

  return (
    <motion.div
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-[280px] h-[calc(100vh-8rem)] bg-slate-800/50 border-r border-slate-700/30 backdrop-blur-sm p-4 flex flex-col"
    >
      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar pilotos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700/30 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-2">
        <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Online</div>
          <div className="text-xl font-black text-emerald-400">
            {agents.filter(a => a.status === "active" || a.status === "working").length}
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total</div>
          <div className="text-xl font-black text-slate-300">
            {agents.length}
          </div>
        </div>
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredAgents.map((agent, index) => {
            const isSelected = selectedAgentId === agent._id;

            return (
              <motion.div
                key={agent._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                layout
                onClick={() => onAgentClick(agent)}
                className={cn(
                  "group relative bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 cursor-pointer transition-all duration-200",
                  isSelected ? "border-indigo-500/50 bg-indigo-500/10" : "hover:border-indigo-500/30 hover:bg-slate-800/50"
                )}
              >
                {/* Status Indicator */}
                <div className="absolute top-3 right-3">
                  <div className={cn("rounded-full p-1", agent.status === "active" || agent.status === "working" ? "bg-emerald-500/20" : "bg-slate-700/50")}>
                    {getStatusIcon(agent.status)}
                  </div>
                </div>

                {/* Agent Header */}
                <div className="flex items-center gap-3 mb-2 pr-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg flex items-center justify-center text-lg">
                    {agent.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-200 truncate">{agent.name}</h4>
                    {agent.role && (
                      <p className="text-xs text-slate-500 truncate">{agent.role}</p>
                    )}
                  </div>
                </div>

                {/* Department */}
                {agent.department && (
                  <div className="mb-2">
                    <span className="inline-block px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-wider rounded-md">
                      {agent.department}
                    </span>
                  </div>
                )}

                {/* Soul Preview */}
                <div className="mb-3">
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 opacity-80">
                    {agent.soul || agent.systemPrompt || "Sem alma definida"}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAgentClick(agent)}
                    className="flex-1 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black rounded-lg transition-all duration-200"
                  >
                    DNA
                  </button>
                  <button className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/30 rounded-lg transition-all duration-200">
                    <Edit className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                {/* Last Activity */}
                {agent.lastHeartbeat && (
                  <div className="text-xs text-slate-600 mt-2 pt-2 border-t border-slate-700/30">
                    <div className="flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      <span>
                        Última atividade: {new Date(agent.lastHeartbeat).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Nenhum piloto encontrado</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
