'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Head from 'next/head'

// --- TYPES ---
type Agent = {
  id: string
  name: string
  role: string
  emoji: string | null
  level: 'strategic' | 'tactical' | 'operational'
  reports_to: string | null
  soul?: string
  identity?: string
  profile?: string
  competencies?: string
  results?: string
  department?: string
}

type Candidate = {
  id: string
  name: string
  role_target: string
  emoji: string | null
  nationality: string
  results: string
  competencies: string
  soul: string
  identity: string
  status: 'pool' | 'pre_selected' | 'rh_filter' | 'finalists' | 'approved'
}

// Nested component for Director cards with expand state
function DirectorCard({ director, agents, setModalData }: { director: Agent, agents: Agent[], setModalData: (data: any) => void }) {
  const [expanded, setExpanded] = useState(false)
  const directReports = agents.filter(a => a.reports_to === director.id)

  return (
    <div className="space-y-3">
      <div
        onClick={() => setExpanded(!expanded)}
        className="bg-slate-800/60 border border-slate-700 hover:border-blue-500 p-4 rounded-xl cursor-pointer transition-all group relative"
      >
        <div className="flex justify-between items-start mb-2">
          <span className="text-3xl">{director.emoji}</span>
          {directReports.length > 0 && (
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-mono">
              {expanded ? '▼' : '►'} {directReports.length}
            </span>
          )}
        </div>
        <div className="font-bold text-white">{director.name}</div>
        <div className="text-sm text-slate-400 mt-1">{director.role}</div>
      </div>

      {expanded && directReports.length > 0 && (
        <div className="ml-6 space-y-2 border-l-2 border-slate-700 pl-4 animate-in fade-in slide-in-from-left-2 duration-300">
          {directReports.map(head => (
            <HeadCard key={head.id} head={head} agents={agents} setModalData={setModalData} />
          ))}
        </div>
      )}
    </div>
  )
}

// Nested component for Head cards
function HeadCard({ head, agents, setModalData }: { head: Agent, agents: Agent[], setModalData: (data: any) => void }) {
  const [headExpanded, setHeadExpanded] = useState(false)
  const squadMembers = agents.filter(a => a.reports_to === head.id)

  return (
    <div className="space-y-2">
      <div
        onClick={() => setHeadExpanded(!headExpanded)}
        className="bg-slate-900/60 border border-slate-600 hover:border-purple-500 p-3 rounded-lg cursor-pointer transition-all text-sm"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-lg">{head.emoji}</span>
            <div>
              <div className="font-semibold text-slate-200">{head.name}</div>
              <div className="text-sm text-slate-500">{head.role}</div>
            </div>
          </div>
          {squadMembers.length > 0 && (
            <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono">
              {headExpanded ? '▼' : '►'} {squadMembers.length}
            </span>
          )}
        </div>
      </div>

      {headExpanded && squadMembers.length > 0 && (
        <div className="ml-4 space-y-1.5 border-l border-slate-600 pl-3 animate-in fade-in slide-in-from-left-1 duration-200">
          {squadMembers.map(member => (
            <div
              key={member.id}
              onClick={() => setModalData({ type: 'agent', data: member })}
              className="bg-slate-950/60 border border-slate-700 hover:border-green-500 p-2 rounded-md cursor-pointer transition-all text-xs"
            >
              <div className="flex items-center gap-2">
                <span>{member.emoji}</span>
                <div className="flex-1">
                  <div className="font-semibold text-slate-300">{member.name}</div>
                  <div className="text-sm text-slate-500">{member.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<'grid' | 'mentors' | 'recruitment' | 'orgchart'>('grid')
  const [agents, setAgents] = useState<Agent[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [modalData, setModalData] = useState<any>(null)

  // Dashboard Metrics
  const [metrics, setMetrics] = useState({
    activeAgents: 0,
    strategicCount: 0,
    recruitmentPipeline: 0
  })

  // Recruitment Stats
  const [recStats, setRecStats] = useState({ pool: 0, pre: 0, rh: 0, final: 0, hired: 0 })

  useEffect(() => {
    fetchAgents()
    fetchCandidates()

    // Realtime subscriptions
    const agentsChannel = supabase
      .channel('agents-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, () => {
        fetchAgents()
      })
      .subscribe()

    const candidatesChannel = supabase
      .channel('candidates-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates' }, () => {
        fetchCandidates()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(agentsChannel)
      supabase.removeChannel(candidatesChannel)
    }
  }, [])

  useEffect(() => {
    if (activeSection === 'grid') {
      const handleResize = () => requestAnimationFrame(drawLines)
      window.addEventListener('resize', handleResize)
      setTimeout(drawLines, 800)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [activeSection, agents])

  async function fetchAgents() {
    const { data } = await supabase.from('agents').select('*')
    if (data) {
      setAgents(data as Agent[])
      // Mentores não contam como ativos operacionais
      const activeOnly = (data as Agent[]).filter(a => !isMentor(a))
      setMetrics({
        activeAgents: activeOnly.length,
        strategicCount: activeOnly.filter(a => a.level === 'strategic').length,
        recruitmentPipeline: 0
      })
    }
  }

  async function fetchCandidates() {
    const { data } = await supabase.from('candidates').select('*').order('created_at', { ascending: true })
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
      setMetrics(prev => ({ ...prev, recruitmentPipeline: c.length }))
    }
  }

  // --- LÓGICA ---
  function isMentor(agent: Agent) {
    const r = (agent.role || '').toLowerCase()
    return r.includes('mentor') || r.includes('advisor') || r.includes('conselheiro') ||
      ['Flávio Augusto', 'Joel Jota', 'Thiago Nigro', 'Tim Ferriss', 'Peter Thiel', 'Linus Torvalds', 'Kim Scott', 'Hilary Mason', 'Des Traynor'].includes(agent.name)
  }

  function isVisionOnly(agent: Agent) {
    return agent.name.includes('Tim Ferriss') || (agent.role || '').includes('Vision Only')
  }

  function getDept(agent: Agent) {
    const deptAttr = (agent.department || '').toLowerCase();
    const roleAttr = (agent.role || '').toLowerCase();
    const nameAttr = (agent.name || '').toLowerCase();

    // High Command
    if (nameAttr === 'vision' || nameAttr === 'jarvis' || nameAttr === 'evandro') return "Strategy";

    // Explicit Department Mapping
    if (deptAttr.includes('estratégia') || deptAttr.includes('strategy')) return "Strategy";
    if (deptAttr.includes('marketing') || deptAttr.includes('vendas') || deptAttr.includes('receita') || deptAttr.includes('revenue') || deptAttr.includes('lançamentos') || deptAttr.includes('growth')) return "Revenue";
    if (deptAttr.includes('product') || deptAttr.includes('produto') || deptAttr.includes('copywriting') || deptAttr.includes('conteúdo')) return "Product";
    if (deptAttr.includes('tech') || deptAttr.includes('tecnologia') || deptAttr.includes('ia') || deptAttr.includes('dados')) return "Tech";
    if (deptAttr.includes('people') || deptAttr.includes('rh') || deptAttr.includes('cultura')) return "People";
    if (deptAttr.includes('finance') || deptAttr.includes('finanças') || deptAttr.includes('conselho')) return "Finance";

    // Role-based Fallback
    if (roleAttr.includes('ceo') || roleAttr.includes('cso') || roleAttr.includes('coo') || roleAttr.includes('diretor')) return "Strategy";
    if (roleAttr.includes('copy') || roleAttr.includes('vsl') || roleAttr.includes('funil') || roleAttr.includes('anúncios') || roleAttr.includes('tráfego')) return "Revenue";
    if (roleAttr.includes('produto') || roleAttr.includes('product') || roleAttr.includes('ux') || roleAttr.includes('design')) return "Product";
    if (roleAttr.includes('cto') || roleAttr.includes('dev') || roleAttr.includes('arquiteto') || roleAttr.includes('ia')) return "Tech";
    if (roleAttr.includes('rh') || roleAttr.includes('psicologia') || roleAttr.includes('cultura')) return "People";
    if (roleAttr.includes('cfo') || roleAttr.includes('finance') || roleAttr.includes('macro')) return "Finance";

    return "Strategy";
  }

  const translateLevel = (level: string) => {
    switch (level) {
      case 'strategic': return 'Estratégico'
      case 'tactical': return 'Tático'
      case 'operational': return 'Operacional'
      default: return level
    }
  }

  function drawLines() {
    const svg = document.getElementById('dependency-layer')
    if (!svg) return
    svg.innerHTML = ''

    const gridAgents = agents.filter(a => !isMentor(a))
    const container = document.getElementById('grid-layout-container')
    if (!container) return
    const containerRect = container.getBoundingClientRect()

    gridAgents.forEach(agent => {
      if (agent.reports_to) {
        const fromEl = document.getElementById(`agent-${agent.reports_to}`)
        const toEl = document.getElementById(`agent-${agent.id}`)

        if (fromEl && toEl) {
          const fromRect = fromEl.getBoundingClientRect()
          const toRect = toEl.getBoundingClientRect()

          const x1 = (fromRect.left + fromRect.width / 2) - containerRect.left
          const y1 = (fromRect.bottom - 5) - containerRect.top
          const x2 = (toRect.left + toRect.width / 2) - containerRect.left
          const y2 = (toRect.top + 5) - containerRect.top

          const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
          const d = `M ${x1} ${y1} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2}`

          path.setAttribute("d", d)
          path.setAttribute("class", "dependency-line")
          path.setAttribute("fill", "none")
          path.setAttribute("stroke", "rgba(56, 189, 248, 0.2)")
          path.setAttribute("stroke-width", "1.5")
          path.setAttribute("stroke-dasharray", "5, 5")

          svg.appendChild(path)
        }
      }
    })
  }

  async function updateCandidateStatus(id: string, newStatus: string) {
    const { error } = await supabase.from('candidates').update({ status: newStatus }).eq('id', id)
    if (!error) {
      setModalData(null)
      fetchCandidates()
    } else {
      alert('Erro: ' + error.message)
    }
  }

  // --- RENDER HELPERS ---
  const renderAgentCard = (agent: Agent) => {
    const dept = getDept(agent)
    let accentColor = '#38bdf8' // default blue
    let accentClass = 'cyan'

    switch (dept) {
      case 'Strategy': accentColor = '#a855f7'; accentClass = 'purple'; break;
      case 'Revenue': accentColor = '#22c55e'; accentClass = 'green'; break;
      case 'Product': accentColor = '#facc15'; accentClass = 'yellow'; break;
      case 'Tech': accentColor = '#38bdf8'; accentClass = 'blue'; break;
      case 'People': accentColor = '#f43f5e'; accentClass = 'rose'; break;
      case 'Finance': accentColor = '#fb923c'; accentClass = 'orange'; break;
    }

    const levelStyles: any = {
      strategic: `border-${accentClass}-500/50 bg-${accentClass}-900/10 shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)]`,
      tactical: `border-${accentClass}-500/30 bg-slate-900/40`,
      operational: `border-slate-800 bg-slate-900/20 opacity-80 hover:opacity-100`
    }

    const roleShort = agent.role?.split(' - ')[0] || agent.role;

    return (
      <div
        key={agent.id}
        id={`agent-${agent.id}`}
        className={`rounded-xl p-3 border cursor-pointer hover:transform hover:-translate-y-1 transition-all duration-300 relative z-10 w-full backdrop-blur-md ${levelStyles[agent.level] || levelStyles.operational}`}
        onClick={() => setModalData({ type: 'agent', data: agent })}
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl brightness-110 drop-shadow-md">{agent.emoji || '🤖'}</div>
          <div className="flex flex-col min-w-0">
            <div className="font-bold text-sm text-white truncate leading-tight tracking-tight">{agent.name}</div>
            <div className="text-[10px] font-black uppercase tracking-wider opacity-60 mt-0.5 truncate">
              {roleShort}
            </div>
          </div>
          <div className={`absolute -right-1 -top-1 w-2 h-2 rounded-full`} style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }}></div>
        </div>
      </div>
    )
  }

  const renderMentorCard = (agent: Agent, isSecret: boolean) => (
    <div
      key={agent.id}
      className={`relative group bg-slate-900/40 border ${isSecret ? 'border-purple-500/30' : 'border-slate-800'} rounded-2xl p-6 hover:bg-slate-800 transition-all cursor-pointer backdrop-blur-md`}
      onClick={() => setModalData({ type: 'agent', data: agent })}
    >
      {isSecret && (
        <div className="absolute top-2 right-2 text-[10px] bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">
          SECRET VISION ACCESS
        </div>
      )}
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-4xl border border-slate-700 shadow-inner">
          {agent.emoji || '🧠'}
        </div>
        <div>
          <h3 className="font-bold text-lg text-white">{agent.name}</h3>
          <p className="text-xs text-blue-400 font-mono mt-1 uppercase tracking-wider">{agent.role}</p>
        </div>
        <p className="text-sm text-slate-400 line-clamp-2">{agent.profile || 'Expert Advisor'}</p>
      </div>
    </div>
  )

  const PowerGrid = () => {
    const depts = ["Strategy", "Revenue", "Product", "Tech", "People", "Finance"];
    const levels = ["strategic", "tactical", "operational"];

    return (
      <div className="w-full overflow-x-auto pb-10 custom-scrollbar">
        <div id="grid-layout-container" className="relative grid grid-cols-[140px_repeat(6,280px)] gap-4 min-w-max pr-10">
          {/* Header Row */}
          <div className="h-16"></div>
          {depts.map((dept) => (
            <div key={dept} className="h-16 flex flex-col items-center justify-center border-b border-white/5 pb-2">
              <span className="text-[11px] font-black font-mono text-cyan-500 uppercase tracking-[0.4em]">{dept}</span>
              <div className="w-10 h-0.5 bg-cyan-500/40 mt-2 rounded-full"></div>
            </div>
          ))}

          {/* Level Rows */}
          {levels.map((lvl) => (
            <div key={lvl} className="contents">
              <div className="flex flex-col items-end justify-center pr-8 border-r border-white/5 opacity-50 relative">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 transform -rotate-90 origin-right translate-x-4 whitespace-nowrap">
                  {translateLevel(lvl)}
                </span>
                <div className="h-full w-px bg-slate-800 absolute right-0 top-0"></div>
              </div>
              {depts.map((dept) => (
                <div key={`${lvl}-${dept}`} className="min-h-[180px] bg-slate-900/20 border border-white/[0.03] rounded-2xl p-4 flex flex-col gap-3 group/cell hover:bg-slate-900/40 transition-all duration-500">
                  {agents
                    .filter(a => !isMentor(a) && a.level === lvl && getDept(a) === dept)
                    .map(renderAgentCard)
                  }
                  {agents.filter(a => !isMentor(a) && a.level === lvl && getDept(a) === dept).length === 0 && (
                    <div className="flex-1 flex items-center justify-center opacity-0 group-hover/cell:opacity-10 transition-opacity">
                      <div className="w-10 h-10 rounded-full border border-dashed border-slate-600 flex items-center justify-center text-[8px] font-mono">VACANCY</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          <svg id="dependency-layer" className="absolute top-0 left-0 w-full h-full pointer-events-none z-[5]" style={{ overflow: 'visible' }}></svg>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30 p-6 overflow-x-hidden relative">
      {/* Absolute Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
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
            { id: 'grid', label: '⚔️ The Grid', color: 'border-cyan-500 text-cyan-400 bg-cyan-500/10' },
            { id: 'mentors', label: '🧠 Board', color: 'border-purple-500 text-purple-400 bg-purple-500/10' },
            { id: 'recruitment', label: '⚡ War Room', color: 'border-emerald-500 text-emerald-400 bg-emerald-500/10' },
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
        {activeSection === 'grid' && <PowerGrid />}

        {/* MENTORS VIEW */}
        {activeSection === 'mentors' && (
          <div>
            <h2 className="text-xl font-bold mb-6 text-purple-400 flex items-center gap-2">
              🦉 CONSELHO CONSULTIVO (BOARD ADVISORS) <span className="text-xs bg-slate-800 text-slate-500 px-2 py-1 rounded-full font-mono">SOB DEMANDA</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {agents.filter(a => isMentor(a) && !isVisionOnly(a)).map(a => renderMentorCard(a, false))}
            </div>

            <div className="border-t border-slate-800 pt-8 mt-8">
              <h2 className="text-xl font-bold mb-6 text-slate-500 flex items-center gap-2 opacity-50">
                👁️ CONSELHO SECRETO <span className="text-xs bg-red-900/30 text-red-500 px-2 py-1 rounded-full font-mono border border-red-500/20">APENAS VISION</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 opacity-70 hover:opacity-100 transition-opacity">
                {agents.filter(a => isVisionOnly(a)).map(a => renderMentorCard(a, true))}
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
                Clique nos cards para expandir/colapsar os times. Nível 0 (Alto Comando) → Nível 1 (Diretoria) → Nível 2 (Heads) → Nível 3 (Squad Operacional).
              </p>
            </div>

            {/* Level 0: HIGH COMMAND (Always Visible) */}
            <div className="mb-12">
              <h3 className="text-xs font-mono text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="bg-amber-500/20 px-2 py-1 rounded">NÍVEL 0</span> Alto Comando
              </h3>
              <div className="flex justify-center gap-6 items-center">
                {/* Jarvis - Left Hand */}
                {agents.filter(a => a.name === 'Jarvis').map(a => (
                  <div key={a.id} className="flex flex-col items-center">
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-400 p-6 rounded-2xl shadow-2xl shadow-blue-500/20 w-64 text-center">
                      <div className="text-5xl mb-3">{a.emoji}</div>
                      <div className="font-bold text-xl text-blue-300">{a.name}</div>
                      <div className="text-sm text-blue-500/80 uppercase tracking-wider mt-1">COO - Operações</div>
                      <div className="mt-3 text-[10px] text-slate-400 leading-relaxed">{a.soul?.slice(0, 80)}...</div>
                    </div>
                  </div>
                ))}

                {/* Evandro - Center */}
                {agents.filter(a => a.name === 'Evandro').map(a => (
                  <div key={a.id} className="flex flex-col items-center">
                    <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-2 border-amber-400 p-6 rounded-2xl shadow-2xl shadow-amber-500/20 w-64 text-center">
                      <div className="text-5xl mb-3">{a.emoji}</div>
                      <div className="font-bold text-xl text-amber-300">{a.name}</div>
                      <div className="text-sm text-amber-500/80 uppercase tracking-wider mt-1">{a.role}</div>
                      <div className="mt-3 text-[10px] text-slate-400 leading-relaxed">{a.soul?.slice(0, 80)}...</div>
                    </div>
                  </div>
                ))}

                {/* Vision - Right Hand */}
                {agents.filter(a => a.name === 'Vision').map(a => (
                  <div key={a.id} className="flex flex-col items-center">
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-2 border-purple-400 p-6 rounded-2xl shadow-2xl shadow-purple-500/20 w-64 text-center">
                      <div className="text-5xl mb-3">{a.emoji}</div>
                      <div className="font-bold text-xl text-purple-300">{a.name}</div>
                      <div className="text-sm text-purple-500/80 uppercase tracking-wider mt-1">Sócio Estratégico</div>
                      <div className="mt-3 text-[10px] text-slate-400 leading-relaxed">{a.soul?.slice(0, 80)}...</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Level 1: C-SUITE (Collapsible) */}
            <div className="space-y-6">
              <h3 className="text-xs font-mono text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="bg-blue-500/20 px-2 py-1 rounded">NÍVEL 1</span> Diretoria Funcional (C-Suite)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {agents.filter(a => {
                  const csuite = ['Ryan Deiss', 'Dener Lippert', 'Gary Vaynerchuk', 'Elon Musk', 'John Carmack', 'David Sacks', 'Patty McCord'];
                  return csuite.includes(a.name);
                }).map(director => (
                  <DirectorCard key={director.id} director={director} agents={agents} setModalData={setModalData} />
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* GLOBAL MODAL */}
      {modalData && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModalData(null)}>
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-8 relative animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-slate-500 hover:text-white" onClick={() => setModalData(null)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-6xl">{modalData.data.emoji}</span>
              <div>
                <h2 className="text-2xl font-bold text-white">{modalData.data.name}</h2>
                <span className="text-blue-400 font-mono text-sm tracking-wider uppercase">{modalData.type === 'agent' ? modalData.data.role : modalData.data.role_target}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="bg-slate-800/50 p-6 rounded-xl border-l-4 border-blue-500">
                <h4 className="text-blue-400 text-xs font-bold tracking-widest mb-3 uppercase">DNA Central (Filosofia)</h4>
                <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">{modalData.data.soul || 'N/A'}</p>
              </div>

              <div className="bg-slate-800/50 p-6 rounded-xl border-l-4 border-purple-500">
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
              </div>
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
                        <button
                          onClick={() => updateCandidateStatus(modalData.data.id, prev)}
                          className="flex-1 py-3 px-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg hover:bg-red-500/20 font-bold transition-colors uppercase text-sm tracking-wider"
                        >
                          ⛔ Reprovar / Voltar
                        </button>
                      )}
                      {next && (
                        <button
                          onClick={() => updateCandidateStatus(modalData.data.id, next)}
                          className="flex-1 py-3 px-4 bg-green-500/10 border border-green-500/50 text-green-500 rounded-lg hover:bg-green-500/20 font-bold transition-colors uppercase text-sm tracking-wider"
                        >
                          ✅ Aprovar ({statusLabels[next] || next})
                        </button>
                      )}
                    </>
                  )
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
