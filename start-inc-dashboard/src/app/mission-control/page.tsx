"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export default function MissionControlPage() {
  const [activeTab, setActiveTab] = useState<'missions' | 'neural' | 'dna'>('missions');
  const [editingAgent, setEditingAgent] = useState<any | null>(null);

  // Convex Hooks (Real-time & Type Safe)
  const tasks = useQuery(api.tasks.listActive);
  const skills = useQuery(api.skills.listAll);
  const agents = useQuery(api.agents.list);
  const updateAgent = useMutation(api.agents.updateAgent);

  const loading = tasks === undefined || skills === undefined || agents === undefined;

  async function handleUpdateAgent(agentId: string, newPrompt: string) {
    if (!editingAgent) return;
    try {
      await updateAgent({
        id: editingAgent.id, // External ID like 'vision'
        soul: newPrompt
      });
      setEditingAgent(null);
    } catch (err) {
      console.error('Error updating agent:', err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400 font-bold tracking-widest uppercase text-xs">Carregando Mission Control...</p>
        </div>
      </div>
    );
  }

  const activeTasks = tasks.filter(t => t.status === 'in_progress');
  const skillsByCategory = (skills || []).reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-black bg-gradient-to-br from-cyan-400 to-indigo-400 bg-clip-text text-transparent mb-2 tracking-tighter">
            MISSION CONTROL
          </h1>
          <div className="flex items-center justify-center gap-4 text-slate-400 text-xs font-black uppercase tracking-widest">
            <span>Neural Matrix</span>
            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
            <span>Mission Monitor</span>
            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
            <span>Agent DNA</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          {[
            { id: 'missions', label: 'Missions', icon: '🎯' },
            { id: 'neural', label: 'Neural Matrix', icon: '🧠' },
            { id: 'dna', label: 'Agent DNA', icon: '🧬' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-105'
                  : 'bg-slate-800/40 text-slate-500 hover:bg-slate-800/60 hover:text-slate-300'
                }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Section */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'missions' && (
            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-baseline gap-4 mb-4">
                <h2 className="text-2xl font-black uppercase tracking-tight">Active Operations</h2>
                <span className="text-indigo-400 font-mono text-sm">[{activeTasks.length}]</span>
              </div>

              {activeTasks.length === 0 ? (
                <div className="text-center py-24 bg-slate-800/20 rounded-3xl border border-slate-700/30 border-dashed">
                  <p className="text-slate-500 font-mono text-xs uppercase">No active missions detected in the sector.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeTasks.map(task => (
                    <div key={task._id} className="group relative bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest ${task.priority === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'
                          }`}>
                          {task.priority || 'standard'}
                        </span>
                        <span className="text-slate-600 font-mono text-[10px]">#{task._id.slice(-4)}</span>
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-cyan-400 transition-colors">{task.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">{task.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-700/30 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span>Updated {new Date(task.updatedAt || task.createdAt).toLocaleDateString()}</span>
                        <div className="flex -space-x-2">
                          {task.assigneeIds?.map((id: any) => (
                            <div key={id} className="w-6 h-6 rounded-full bg-indigo-500/30 border border-slate-700 flex items-center justify-center">👤</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'neural' && (
            <div className="space-y-12">
              {Object.entries(skillsByCategory).map(([category, catSkills]) => (
                <div key={category}>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-6 border-l-4 border-indigo-500 pl-4">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {catSkills.map(skill => (
                      <div key={skill._id} className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-5 hover:border-indigo-500/30 transition-all">
                        <h4 className="font-bold text-sm mb-2">{skill.name}</h4>
                        <p className="text-slate-500 text-xs leading-relaxed">{skill.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'dna' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Agent List */}
              <div className="lg:col-span-4 space-y-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 px-2">Select Agent Profile</div>
                {agents?.map(agent => (
                  <button
                    key={agent._id}
                    onClick={() => setEditingAgent(agent)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 ${editingAgent?._id === agent._id
                        ? 'bg-indigo-600 border-indigo-400 shadow-lg shadow-indigo-600/20'
                        : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60'
                      }`}
                  >
                    <div className="text-2xl">{agent.emoji || '🤖'}</div>
                    <div>
                      <div className="font-bold text-sm">{agent.name}</div>
                      <div className={`text-[10px] uppercase font-black tracking-widest ${editingAgent?._id === agent._id ? 'text-indigo-200' : 'text-slate-500'}`}>
                        {agent.role}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* DNA Editor */}
              <div className="lg:col-span-8">
                {editingAgent ? (
                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-black uppercase">Core Protocol Editing</h3>
                        <p className="text-slate-500 text-xs uppercase tracking-widest">Rewriting personality substrate for {editingAgent.name}</p>
                      </div>
                      <div className="text-4xl">{editingAgent.emoji}</div>
                    </div>

                    <div className="space-y-6">
                      <div className="relative">
                        <div className="absolute top-4 left-4 text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-slate-900/80 px-2 py-1 rounded">System Prompt (The Soul)</div>
                        <textarea
                          value={editingAgent.soul || editingAgent.systemPrompt || ''}
                          onChange={(e) => setEditingAgent({ ...editingAgent, soul: e.target.value })}
                          className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl p-10 pt-12 text-slate-300 font-mono text-sm focus:outline-none focus:border-indigo-500/50 min-h-[400px] leading-relaxed transition-all"
                          placeholder="Initialize agent personality matrix..."
                        />
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={() => handleUpdateAgent(editingAgent._id, editingAgent.soul || '')}
                          className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-all active:scale-95"
                        >
                          Synchronize DNA Matrix
                        </button>
                        <button
                          onClick={() => setEditingAgent(null)}
                          className="px-8 bg-slate-700/50 text-slate-400 font-black uppercase tracking-widest text-xs py-4 rounded-xl hover:bg-slate-700 transition-all"
                        >
                          Abort
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center py-24 bg-slate-800/10 rounded-3xl border border-slate-700/20 border-dashed text-center">
                    <div>
                      <div className="text-4xl mb-4 grayscale opacity-30">🧬</div>
                      <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.2em]">Select an agent to access Neural DNA</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
