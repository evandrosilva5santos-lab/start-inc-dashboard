"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Activity, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Agent {
  _id: string;
  id: string;
  name: string;
  role?: string;
  department?: string;
  soul?: string;
  systemPrompt?: string;
}

interface DNAEditorModalProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
  onSave: (agentId: string, newSoul: string) => void;
}

export default function DNAEditorModal({ agent, isOpen, onClose, onSave }: DNAEditorModalProps) {
  const [soul, setSoul] = useState(agent.soul || agent.systemPrompt || "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await onSave(agent._id, soul);
      onClose();
    } catch (err) {
      console.error("Error saving agent DNA:", err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            transition={{ duration: 0.2 }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-2xl font-black">
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-100">Editando: {agent.name}</h2>
                    {agent.role && (
                      <p className="text-slate-400 text-sm">{agent.role}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-4 mb-6">
                {/* Read-only Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={agent.name}
                      disabled
                      className="w-full bg-slate-900/50 border border-slate-700/30 rounded-lg px-4 py-3 text-slate-300 placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">
                      Função
                    </label>
                    <input
                      type="text"
                      value={agent.role}
                      disabled
                      className="w-full bg-slate-900/50 border border-slate-700/30 rounded-lg px-4 py-3 text-slate-300 placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">
                    Departamento
                  </label>
                  <input
                    type="text"
                    value={agent.department}
                    disabled
                    className="w-full bg-slate-900/50 border border-slate-700/30 rounded-lg px-4 py-3 text-slate-300 placeholder:text-slate-500"
                  />
                </div>

                {/* Editable Soul */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <label className="block text-xs text-slate-500 uppercase tracking-wider font-bold text-cyan-400">
                      ALMA (System Prompt)
                    </label>
                  </div>
                  <p className="text-xs text-slate-500">
                    Este é o código secreto que define a personalidade do agente.
                  </p>
                </div>

                <textarea
                  value={soul}
                  onChange={(e) => setSoul(e.target.value)}
                  rows={12}
                  placeholder="Insira a nova alma (system prompt) do agente..."
                  className="w-full bg-slate-900/50 border border-slate-700/30 rounded-lg px-4 py-3 text-slate-300 font-mono text-sm leading-relaxed placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700/30 rounded-lg font-medium text-slate-300 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={cn(
                    "px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 border border-transparent rounded-lg font-medium text-white transition-all flex items-center gap-2",
                    isSaving && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
