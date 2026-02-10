'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAgentStore } from '@/store/useAgentStore'
import Head from 'next/head'
import { motion, AnimatePresence } from 'framer-motion'
import { Agent, Candidate, ModalData } from '@/types'
import { isMentor, isVisionOnly, translateLevel, getDept } from '@/lib/agent-utils'
import { DirectorCard } from '@/components/dashboard/DirectorCard'
import { MentorCard } from '@/components/dashboard/MentorCard'
import { PowerGrid } from '@/components/dashboard/PowerGrid'
import { AgentCard } from '@/components/dashboard/AgentCard'

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<'grid' | 'squads' | 'mentors' | 'recruitment' | 'orgchart'>('grid')
  const { agents, metrics, loading, error, fetchAgents, initializeSubscription, setRecruitmentPipeline } = useAgentStore()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [modalData, setModalData] = useState<ModalData | null>(null)

  // Recruitment Stats
  const [recStats, setRecStats] = useState({ pool: 0, pre: 0, rh: 0, final: 0, hired: 0 })

  useEffect(() => {
    // Initialize Agent Store (Fetch + Realtime)
    fetchAgents()
    const unsubscribeAgents = initializeSubscription()

    fetchCandidates()

    // Realtime subscriptions for Candidates
    const candidatesChannel = supabase
      .channel('candidates-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: '[OpenClaw] Dashboard - Candidates' }, () => {
        fetchCandidates()
      })
      .subscribe()

    return () => {
      unsubscribeAgents()
      supabase.removeChannel(candidatesChannel)
    }
  }, [])



  async function fetchCandidates() {
    const { data } = await supabase.from('[OpenClaw] Dashboard - Candidates').select('*').order('created_at', { ascending: true })
    if (data) {
      const c = data as Candidate[]
      setCandidates(c)
      setRecStats({
        pool: c.filter(x => x.status === 'pool').length,
        pre: c.filter(x => x.status === 'pre_selected').length,
        rh: c.filter(x => x.status === 'rh_filter').length,
        final: c.filter(x => x.status === 'finalists').length,
        hired: c.filter(x => x.status === 'approved').length,
      })
      setRecruitmentPipeline(c.length)
    }
  }

  async function updateCandidateStatus(id: string, newStatus: string) {
    const { error } = await supabase.from('[OpenClaw] Dashboard - Candidates').update({ status: newStatus }).eq('id', id)
    if (!error) {
      setModalData(null)
      fetchCandidates()
    } else {
      alert('Erro: ' + error.message)
    }
  }

  const SquadView = () => {
    const tribes = Array.from(new Set(agents.map(a => a.tribe).filter(Boolean)));

    return (
      <div className="space-y-12 pb-20">
        {tribes.map(tribeName => {
          const tribeAgents = agents.filter(a => a.tribe === tribeName);
          const squads = Array.from(new Set(tribeAgents.map(a => a.squad).filter(Boolean)));

          return (
            <div key={tribeName} className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                <h2 className="text-sm font-black text-purple-400 uppercase tracking-[0.6em] whitespace-nowrap">{tribeName}</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {squads.map(squadName => (
                  <div key={squadName} className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl hover:border-white/10 transition-all duration-500 group">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-white tracking-tight">{squadName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-bold">In_Operation</span>
                        </div>
                      </div>
                      <div className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-400 font-mono">MVP_v1.0</div>
                    </div>

                    <div className="space-y-3">
                      {agents.filter(a => a.squad === squadName).map(agent => (
                        <div key={agent.id} className="flex items-center gap-3 p-2 bg-white/[0.02] border border-white/[0.03] rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer" onClick={() => setModalData({ type: 'agent', data: agent })}>
                          <span className="text-xl">{agent.emoji}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-200 truncate">{agent.name}</div>
                            <div className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">{agent.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30 p-6 overflow-x-hidden relative">
      {/* Absolute Background Effects - Premium Glassmorphic Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -40, 0],
            y: [0, 40, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.3, 0.15],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute top-[40%] right-[10%] w-[25%] h-[25%] bg-purple-500/8 rounded-full blur-[100px]"
        />
      </div>

      <header className="max-w-[1700px] mx-auto mb-12 animate-fade-in relative z-20">
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,1)]"></div>
              <span className="text-[10px] font-black font-mono text-cyan-500 uppercase tracking-[0.5em]">Command_Active_Session</span>
            </div>
            <h1 className="text-6xl font-black bg-gradient-to-br from-white via-white to-slate-600 bg-clip-text text-transparent mb-1 tracking-tighter">
              START INC.
            </h1>
            <p className="text-xs font-mono text-slate-500 tracking-[0.3em] uppercase font-bold">
              Autonomous Executive Grid // v4.0.0
            </p>
          </div>
          <div className="flex gap-12 mt-6 md:mt-0">
            {[
              { label: 'Active Assets', value: metrics.activeAgents, color: 'text-white' },
              { label: 'Strategic', value: metrics.strategicCount, color: 'text-indigo-400' },
              { label: 'Recruitment', value: metrics.recruitmentPipeline, color: 'text-emerald-400' }
            ].map(m => (
              <div key={m.label} className="text-right">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{m.label}</div>
                <div className={`text-4xl font-black ${m.color}`}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {[
            { id: 'grid', label: '🛡️ Chapters', color: 'border-cyan-500 text-cyan-400 bg-cyan-500/10' },
            { id: 'squads', label: '⚡ Squads', color: 'border-purple-500 text-purple-400 bg-purple-500/10' },
            { id: 'mentors', label: '🧠 Board', color: 'border-violet-500 text-violet-400 bg-violet-500/10' },
            { id: 'recruitment', label: '⚔️ War Room', color: 'border-emerald-500 text-emerald-400 bg-emerald-500/10' },
            { id: 'orgchart', label: '🌳 Interaction', color: 'border-amber-500 text-amber-400 bg-amber-500/10' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setActiveSection(btn.id as any)}
              className={`px-6 py-3 rounded-2xl font-black text-[10px] transition-all duration-500 border uppercase tracking-[0.3em] ${activeSection === btn.id ? btn.color + ' shadow-[0_0_40px_rgba(34,211,238,0.1)] scale-105' : 'bg-slate-900/60 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-[1700px] mx-auto min-h-[600px] relative">

        {/* GRID VIEW */}
        {activeSection === 'grid' && (
          <PowerGrid
            agents={agents}
            setModalData={setModalData}
            isLoading={loading}
            error={error}
          />
        )}

        {/* SQUAD VIEW */}
        {activeSection === 'squads' && <SquadView />}

        {/* MENTORS VIEW */}
        {activeSection === 'mentors' && (
          <div>
            <h2 className="text-xl font-bold mb-6 text-purple-400 flex items-center gap-2">
              🦉 CONSELHO CONSULTIVO (BOARD ADVISORS) <span className="text-xs bg-slate-800 text-slate-500 px-2 py-1 rounded-full font-mono">SOB DEMANDA</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {agents.filter(a => isMentor(a) && !isVisionOnly(a)).map(a => (
                <MentorCard key={a.id} agent={a} isSecret={false} onClick={setModalData} />
              ))}
            </div>

            <div className="border-t border-slate-800 pt-8 mt-8">
              <h2 className="text-xl font-bold mb-6 text-slate-500 flex items-center gap-2 opacity-50">
                👁️ CONSELHO SECRETO <span className="text-xs bg-red-900/30 text-red-500 px-2 py-1 rounded-full font-mono border border-red-500/20">APENAS VISION</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 opacity-70 hover:opacity-100 transition-opacity">
                {agents.filter(a => isVisionOnly(a)).map(a => (
                  <MentorCard key={a.id} agent={a} isSecret={true} onClick={setModalData} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RECRUITMENT VIEW */}
        {activeSection === 'recruitment' && (
          <div className="flex gap-4 overflow-x-auto pb-6 h-[75vh]">
            {[
              { id: 'pool', title: 'Banco de Talentos', count: recStats.pool, color: 'border-slate-700' },
              { id: 'pre_selected', title: 'Pré-Seleção (Top 10)', count: recStats.pre, color: 'border-blue-500/50' },
              { id: 'rh_filter', title: 'Filtro RH (Top 6)', count: recStats.rh, color: 'border-purple-500/50' },
              { id: 'finalists', title: 'Finalistas', count: recStats.final, color: 'border-yellow-500/50' },
              { id: 'approved', title: 'Contratados / Ativos', count: recStats.hired, color: 'border-green-500/50' }
            ].map(col => (
              <div key={col.id} className={`flex flex-col min-w-[320px] max-w-[320px] bg-slate-900/40 rounded-xl border ${col.color} h-full`}>
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60 rounded-t-xl">
                  <span className="font-mono text-xs uppercase font-bold text-slate-300">{col.title}</span>
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">{col.count}</span>
                </div>
                <div className="p-3 overflow-y-auto flex-1 flex flex-col gap-3">
                  {candidates.filter(c => c.status === col.id).map(c => (
                    <div
                      key={c.id}
                      className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 hover:border-blue-500 cursor-pointer transition-all shadow-sm relative group"
                      onClick={() => setModalData({ type: 'candidate', data: c })}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xl">{c.emoji || '👤'}</span>
                        {c.nationality === 'BR' && <span className="text-[10px] font-bold text-green-500 border border-green-500/30 px-1 rounded">BR</span>}
                      </div>
                      <div className="font-bold text-slate-200">{c.name}</div>
                      <div className="text-xs text-slate-400 mt-1">{c.role_target}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* INTERACTIVE ORG CHART VIEW */}
        {activeSection === 'orgchart' && (
          <div className="pb-10">
            <div className="mb-8 bg-gradient-to-r from-amber-900/20 to-amber-800/10 border border-amber-500/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-amber-400 mb-2 flex items-center gap-3">
                🌳 Organograma Hierárquico Interativo
              </h2>
              <p className="text-slate-400 text-sm">
                Visualização dinâmica da cadeia de comando. Nível 0 (Sócio e Alto Comando) → Nível 1 (C-Level Estratégico) → Nível 2 (Líderes Táticos).
              </p>
            </div>

            {/* Level 0: HIGH COMMAND (Always Visible) */}
            <div className="mb-12">
              <h3 className="text-xs font-mono text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="bg-amber-500/20 px-2 py-1 rounded">NÍVEL 0</span> Alto Comando (Tríade)
              </h3>
              <div className="flex justify-center gap-6 items-center flex-wrap">
                {/* Jarvis - Operations */}
                {agents.filter(a => a.name === 'Jarvis').map(a => (
                  <div key={a.id} className="flex flex-col items-center group cursor-pointer" onClick={() => setModalData({ type: 'agent', data: a })}>
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-400 p-6 rounded-2xl shadow-2xl shadow-blue-500/20 w-80 text-center hover:scale-105 transition-transform duration-300">
                      <div className="text-5xl mb-3 drop-shadow-md">{a.emoji}</div>
                      <div className="font-bold text-2xl text-blue-300">{a.name}</div>
                      <div className="text-sm text-blue-400 font-mono tracking-wider mt-1 border-b border-blue-500/30 pb-2 mb-2 inline-block">COO - SYSTEM ARCHITECT</div>
                      <div className="text-[11px] text-slate-300 leading-relaxed italic opacity-80">"{a.motto || 'Precision & Speed'}"</div>
                    </div>
                  </div>
                ))}

                {/* Evandro - Founder */}
                {agents.filter(a => a.name === 'Evandro').map(a => (
                  <div key={a.id} className="flex flex-col items-center group cursor-pointer relative z-10" onClick={() => setModalData({ type: 'agent', data: a })}>
                    <div className="bg-gradient-to-b from-amber-500/30 to-amber-600/10 border-2 border-amber-400 p-8 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.3)] w-96 text-center hover:scale-105 transition-transform duration-300 backdrop-blur-xl">
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-amber-500 text-black font-black text-[10px] px-3 py-1 rounded-full tracking-widest uppercase shadow-lg">The Creator</div>
                      <div className="text-6xl mb-4 drop-shadow-xl">{a.emoji}</div>
                      <div className="font-black text-3xl text-amber-100 mb-1">{a.name}</div>
                      <div className="text-sm text-amber-500 font-mono tracking-[0.2em] uppercase mb-4">Founder & CEO</div>
                      <div className="text-xs text-slate-300 leading-relaxed border-t border-amber-500/30 pt-4">
                        {a.soul?.slice(0, 100)}...
                      </div>
                    </div>
                  </div>
                ))}

                {/* Vision - Strategy */}
                {agents.filter(a => a.name === 'Vision').map(a => (
                  <div key={a.id} className="flex flex-col items-center group cursor-pointer" onClick={() => setModalData({ type: 'agent', data: a })}>
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-2 border-purple-400 p-6 rounded-2xl shadow-2xl shadow-purple-500/20 w-80 text-center hover:scale-105 transition-transform duration-300">
                      <div className="text-5xl mb-3 drop-shadow-md">{a.emoji}</div>
                      <div className="font-bold text-2xl text-purple-300">{a.name}</div>
                      <div className="text-sm text-purple-400 font-mono tracking-wider mt-1 border-b border-purple-500/30 pb-2 mb-2 inline-block">CSO - STRATEGIC PARTNER</div>
                      <div className="text-[11px] text-slate-300 leading-relaxed italic opacity-80">"{a.motto || 'Structure for Scale'}"</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Level 1: C-SUITE (Dynamic) */}
            <div className="space-y-6">
              <h3 className="text-xs font-mono text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-blue-500/20 pb-2">
                <span className="bg-blue-500/20 px-2 py-1 rounded text-blue-300">NÍVEL 1</span> Diretoria Funcional (C-Suite)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {agents
                  .filter(a =>
                    a.level === 'strategic' &&
                    !['Jarvis', 'Evandro', 'Vision'].includes(a.name) &&
                    !isMentor(a)
                  )
                  .sort((a, b) => (a.department || '').localeCompare(b.department || ''))
                  .map(director => (
                    <DirectorCard key={director.id} director={director} agents={agents} setModalData={setModalData} />
                  ))}
              </div>
            </div>

            {/* Level 2: TACTICAL LEADERS (Orphans or Direct Reports Visualization can go here if needed) */}
            <div className="space-y-6 mt-12">
              <h3 className="text-xs font-mono text-green-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-green-500/20 pb-2">
                <span className="bg-green-500/20 px-2 py-1 rounded text-green-300">NÍVEL 2</span> Liderança Tática (Heads & Specialists)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {agents
                  .filter(a => a.level === 'tactical' && !a.reports_to) // Only show those who don't have a visible boss in the chart above to avoid duplicates if DirectorCard handles them
                  .map(head => (
                    <AgentCard key={head.id} agent={head} onClick={setModalData} />
                  ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* GLOBAL MODAL */}
      <AnimatePresence>
        {modalData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setModalData(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-slate-900/95 border border-slate-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl shadow-blue-500/10 p-8 relative backdrop-blur-xl"
              onClick={e => e.stopPropagation()}
            >
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                onClick={() => setModalData(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </motion.button>

              <div className="flex items-center gap-4 mb-6">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="text-6xl"
                >
                  {modalData.data.emoji}
                </motion.span>
                <div>
                  <h2 className="text-2xl font-bold text-white">{modalData.data.name}</h2>
                  <span className="text-blue-400 font-mono text-sm tracking-wider uppercase">{modalData.type === 'agent' ? modalData.data.role : modalData.data.role_target}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-slate-800/50 p-6 rounded-xl border-l-4 border-blue-500 backdrop-blur-sm"
                >
                  <h4 className="text-blue-400 text-xs font-bold tracking-widest mb-3 uppercase">DNA Central (Filosofia)</h4>
                  <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">{modalData.data.soul || 'N/A'}</p>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-slate-800/50 p-6 rounded-xl border-l-4 border-purple-500 backdrop-blur-sm"
                >
                  <h4 className="text-purple-400 text-xs font-bold tracking-widest mb-3 uppercase">Identidade & Competências</h4>
                  <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                    {modalData.type === 'candidate' ? (
                      <>
                        <strong className="text-white block mb-2">Competências Chave:</strong>
                        {modalData.data.competencies}
                        <br /><br />
                        <strong className="text-white block mb-2">Resultados Chave:</strong>
                        {modalData.data.results}
                      </>
                    ) : (
                      modalData.data.identity || 'N/A'
                    )}
                  </p>
                </motion.div>
              </div>

              <div className="mt-4 flex justify-between text-xs font-mono opacity-50">
                <span>STATUS: {modalData.data.status?.toUpperCase() || 'ATIVO'}</span>
                <span>NÍVEL: {translateLevel(modalData.data.level || 'N/A').toUpperCase()}</span>
              </div>

              {/* Candidate Action Buttons */}
              {modalData.type === 'candidate' && (
                <div className="flex gap-4 mt-8 pt-6 border-t border-slate-800">
                  {(() => {
                    const nextMap: any = { 'pool': 'pre_selected', 'pre_selected': 'rh_filter', 'rh_filter': 'finalists', 'finalists': 'approved' }
                    const prevMap: any = { 'approved': 'finalists', 'finalists': 'rh_filter', 'rh_filter': 'pre_selected', 'pre_selected': 'pool' }

                    const statusLabels: any = {
                      'pool': 'Banco',
                      'pre_selected': 'Pré-Seleção',
                      'rh_filter': 'Filtro RH',
                      'finalists': 'Finalistas',
                      'approved': 'Aprovado'
                    }

                    const status = modalData.data.status
                    const next = nextMap[status]
                    const prev = prevMap[status]

                    return (
                      <>
                        {prev && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateCandidateStatus(modalData.data.id, prev)}
                            className="flex-1 py-3 px-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg hover:bg-red-500/20 font-bold transition-colors uppercase text-sm tracking-wider"
                          >
                            ⛔ Reprovar / Voltar
                          </motion.button>
                        )}
                        {next && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateCandidateStatus(modalData.data.id, next)}
                            className="flex-1 py-3 px-4 bg-green-500/10 border border-green-500/50 text-green-500 rounded-lg hover:bg-green-500/20 font-bold transition-colors uppercase text-sm tracking-wider"
                          >
                            ✅ Aprovar ({statusLabels[next] || next})
                          </motion.button>
                        )}
                      </>
                    )
                  })()}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
