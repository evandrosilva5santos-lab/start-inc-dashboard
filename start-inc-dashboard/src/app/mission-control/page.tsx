"use client";

import { useEffect, useState } from "react";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigneeIds: string[];
  createdAt: number;
}

interface Skill {
  _id: string;
  name: string;
  description: string;
  category: string;
  location?: string;
}

interface Agent {
  _id: string;
  id: string;
  name: string;
  role?: string;
  department?: string;
  soul?: string;
  systemPrompt?: string;
  emoji?: string;
}

const CONVEX_URL = 'https://sincere-lynx-996.convex.cloud/api/run';

export default function MissionControlPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'missions' | 'neural' | 'dna'>('missions');
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [tasksRes, skillsRes, agentsRes] = await Promise.all([
        fetch(`${CONVEX_URL}/tasks/listTasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ args: {} })
        }),
        fetch(`${CONVEX_URL}/skills/list`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ args: {} })
        }),
        fetch(`${CONVEX_URL}/agents/list`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ args: {} })
        })
      ]);

      const tasksData = await tasksRes.json();
      const skillsData = await skillsRes.json();
      const agentsData = await agentsRes.json();

      setTasks(tasksData.value || []);
      setSkills(skillsData.value || []);
      setAgents(agentsData.value || []);
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setLoading(false);
    }
  }

  async function updateAgentSystemPrompt(agentId: string, newPrompt: string) {
    try {
      await fetch(`${CONVEX_URL}/agents/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          args: {
            id: agentId,
            updates: { systemPrompt: newPrompt }
          }
        })
      });
      await loadData();
    } catch (err) {
      console.error('Error updating agent:', err);
    }
  }

  const activeTasks = tasks.filter(t => t.status === 'in_progress');
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400">Carregando Mission Control...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black bg-gradient-to-br from-cyan-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            MISSION CONTROL
          </h1>
          <p className="text-slate-400 text-sm uppercase tracking-widest">
            Neural Matrix • Mission Monitor • Agent DNA
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-700/50 pb-px">
          <button
            onClick={() => setActiveTab('missions')}
            className={`px-6 py-3 text-sm font-black uppercase tracking-wider transition-all ${activeTab === 'missions'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-slate-500 hover:text-slate-400'
              }`}
          >
            Missões Ativas
          </button>
          <button
            onClick={() => setActiveTab('neural')}
            className={`px-6 py-3 text-sm font-black uppercase tracking-wider transition-all ${activeTab === 'neural'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-slate-500 hover:text-slate-400'
              }`}
          >
            Neural Matrix
          </button>
          <button
            onClick={() => setActiveTab('dna')}
            className={`px-6 py-3 text-sm font-black uppercase tracking-wider transition-all ${activeTab === 'dna'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-slate-500 hover:text-slate-400'
              }`}
          >
            Agent DNA
          </button>
        </div>

        {/* Content */}
        {activeTab === 'missions' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">
                  Missões em Progresso
                </div>
                <div className="text-5xl font-black text-indigo-400">
                  {activeTasks.length}
                </div>
              </div>
            </div>

            {activeTasks.length === 0 ? (
              <div className="text-center py-16 bg-slate-800/30 rounded-xl border border-slate-700/30">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-slate-400">Nenhuma missão ativa no momento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTasks.map(task => (
                  <div
                    key={task._id}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="text-xl font-bold flex-1">{task.title}</h3>
                      <span className={`px-3 py-1 rounded text-xs font-black uppercase ${task.priority === 'critical'
                        ? 'bg-red-500/20 text-red-400'
                        : task.priority === 'high'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-slate-400 mb-3 text-sm leading-relaxed">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>📅 {new Date(task.createdAt * 1000).toLocaleString('pt-BR')}</span>
                      {task.assigneeIds.length > 0 && (
                        <span>👥 {task.assigneeIds.length} agente(s) atribuído(s)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'neural' && (
          <div className="space-y-6">
            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
              <div key={category} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-4 text-indigo-400 uppercase tracking-wider">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorySkills.map(skill => (
                    <div
                      key={skill._id}
                      className="bg-slate-900/50 border border-slate-600/30 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 font-black">
                          {skill.name.charAt(0)}
                        </div>
                        <h4 className="font-bold flex-1">{skill.name}</h4>
                      </div>
                      {skill.description && (
                        <p className="text-slate-400 text-sm leading-relaxed">
                          {skill.description}
                        </p>
                      )}
                      {skill.location && (
                        <div className="mt-2 text-xs text-slate-500">
                          📍 {skill.location}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {skills.length === 0 && (
              <div className="text-center py-16 bg-slate-800/30 rounded-xl border border-slate-700/30">
                <div className="text-6xl mb-4">🧠</div>
                <p className="text-slate-400">Nenhuma skill cadastrada no Neural Matrix</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'dna' && (
          <div className="space-y-4">
            {editingAgent ? (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Editando: {editingAgent.name}</h3>
                  <button
                    onClick={() => setEditingAgent(null)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
                  >
                    Fechar
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={editingAgent.name}
                      disabled
                      className="w-full bg-slate-900/50 border border-slate-600/30 rounded-lg px-4 py-3 text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">
                      Função
                    </label>
                    <input
                      type="text"
                      value={editingAgent.role}
                      disabled
                      className="w-full bg-slate-900/50 border border-slate-600/30 rounded-lg px-4 py-3 text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">
                      Departamento
                    </label>
                    <input
                      type="text"
                      value={editingAgent.department}
                      disabled
                      className="w-full bg-slate-900/50 border border-slate-600/30 rounded-lg px-4 py-3 text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">
                      Alma (System Prompt)
                    </label>
                    <textarea
                      value={editingAgent.soul || editingAgent.systemPrompt}
                      onChange={(e) => {
                        if (editingAgent) {
                          setEditingAgent({ ...editingAgent, soul: e.target.value });
                        }
                      }}
                      rows={10}
                      className="w-full bg-slate-900/50 border border-slate-600/30 rounded-lg px-4 py-3 text-slate-300 font-mono text-sm"
                      placeholder="Insira a nova alma (system prompt) do agente..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (editingAgent) {
                          updateAgentSystemPrompt(editingAgent._id, editingAgent.soul || editingAgent.systemPrompt || '');
                          setEditingAgent(null);
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-lg font-black"
                    >
                      Salvar Alterações
                    </button>
                    <button
                      onClick={() => setEditingAgent(null)}
                      className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-black"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map(agent => (
                  <div
                    key={agent._id}
                    onClick={() => setEditingAgent(agent)}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm cursor-pointer hover:border-indigo-500/50 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center text-xl">
                        {agent.emoji || '🤖'}
                      </div>
                      <h4 className="font-bold flex-1">{agent.name}</h4>
                    </div>
                    {agent.role && (
                      <p className="text-slate-400 text-sm mb-2">{agent.role}</p>
                    )}
                    {agent.department && (
                      <div className="text-xs text-indigo-400 uppercase tracking-wider mb-2">
                        {agent.department}
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t border-slate-700/30">
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                        Alma
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                        {agent.soul || agent.systemPrompt || 'Sem alma definida'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {agents.length === 0 && (
              <div className="text-center py-16 bg-slate-800/30 rounded-xl border border-slate-700/30">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-slate-400">Nenhum agente encontrado no sistema</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
