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
    const role = (agent.role || '').toLowerCase()
    const name = (agent.name || '').toLowerCase()

    // NOVO DEPARTAMENTO: ALTO COMANDO (Coração da Empresa)
    if (name === 'vision' || name === 'jarvis') return "Alto comando"

    if (role.includes('ceo') || role.includes('board') || role.includes('cso') || role.includes('coo')) return "Estratégia"
    if (role.includes('marketing') || role.includes('revenue') || role.includes('vendas') || role.includes('growth') || role.includes('receita') || role.includes('tráfego') || role.includes('copy')) return "Receita"
    if (role.includes('tech') || role.includes('product') || role.includes('ai') || role.includes('dados') || role.includes('automação') || role.includes('vídeo') || role.includes('produto')) return "Produto"
    if (role.includes('people') || role.includes('hr') || role.includes('rh') || role.includes('cultura') || role.includes('recrutamento') || role.includes('psicologia')) return "RH"
    if (role.includes('finance') || role.includes('cfo') || role.includes('investment') || role.includes('financeiro')) return "Finanças"
    return "Estratégia"
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

    // --- ESTILIZAÇÃO POR HIERARQUIA (MODIFICADA) ---
    // Alto Comando (Vision/Jarvis): Cyan
    // Estratégico (Diretores): ROXO (Purple-500)
    // Tático (Heads): LARANJA/AMBAR (Orange-500) -> Mudei de Azul para Laranja, para diferenciar bem
    // Operacional: VERMELHO/ROSADO (Rose-500) -> Ou manter Verde? O usuário disse 'outra cor'.
    // Vamos de:
    // Estratégico: Purple (Roxo Nobre)
    // Tático: Amber (Ouro/Âmbar) - HEADS PRECISAM BRILHAR
    // Operacional: Blue (Operação Padrão)

    let borderClass = ''
    let bgHoverClass = ''

    if (dept === 'Alto comando') {
      borderClass = 'border-l-4 border-cyan-400 bg-cyan-900/40'
      bgHoverClass = 'hover:bg-cyan-800/60 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
    } else {
      if (agent.level === 'strategic') {
        // ESTRATÉGICO = ROXO (Com fundo levemente roxo)
        borderClass = 'border-l-4 border-purple-500 bg-purple-900/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
      } else if (agent.level === 'tactical') {
        // TÁTICO = AZUL (Com fundo levemente azul, bem diferente do Roxo)
        borderClass = 'border-l-4 border-blue-500 bg-blue-900/20 shadow-[0_0_5px_rgba(59,130,246,0.1)]'
      } else {
        // OPERACIONAL = SLATE (Fundo mais escuro/neutro)
        borderClass = 'border-l-4 border-slate-600 bg-slate-800/40 shadow-none'
      }
      bgHoverClass = 'border border-white/5 hover:border-white/20 hover:bg-opacity-40'
    }

    // Parse Role: "CSO - Diretor de Estratégia" -> ["CSO", "Diretor de Estratégia"]
    // Or "Head de Recrutamento" -> ["Head", "Recrutamento"] (Simple fallback logic)
    let roleShort = ''
    let roleDesc = ''

    const role = agent.role || ''
    if (role.includes(' - ')) {
      const parts = role.split(' - ')
      roleShort = parts[0]
      roleDesc = parts[1]
    } else if (role.toLowerCase().startsWith('head de ')) {
      roleShort = 'HEAD'
      roleDesc = role.replace('Head de ', '')
    } else {
      // Fallback for mentors or simple roles
      roleShort = role.split(' ')[0].toUpperCase().substring(0, 8) // First word or cropped
      roleDesc = role
    }

    // Role Color Text
    let roleColorClass = ''
    if (dept === 'Alto comando') roleColorClass = 'text-cyan-400'
    else if (agent.level === 'strategic') roleColorClass = 'text-purple-400'
    else if (agent.level === 'tactical') roleColorClass = 'text-blue-400' // Blue for Heads
    else roleColorClass = 'text-slate-400'

    return (
      <div
        key={agent.id}
        id={`agent-${agent.id}`}
        className={`rounded-xl p-4 cursor-pointer hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative z-10 w-full mb-3 ${borderClass} ${bgHoverClass}`}
        onClick={() => setModalData({ type: 'agent', data: agent })}
      >
        <div className="flex items-center gap-4">
          <div className="text-3xl filter drop-shadow-md">{agent.emoji || '🤖'}</div>
          <div className="flex flex-col overflow-hidden">
            <div className="font-extrabold text-base text-white tracking-tight leading-tight mb-0.5">{agent.name}</div>
            <div className={`font-black text-xs tracking-widest uppercase mb-0.5 ${roleColorClass}`}>{roleShort}</div>
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide opacity-80 truncate">{roleDesc}</div>
          </div>
        </div>
      </div>
    )
  }

  const renderMentorCard = (agent: Agent, isSecret: boolean) => (
    <div
      key={agent.id}
      className={`relative group bg-slate-900/40 border ${isSecret ? 'border-purple-500/30' : 'border-slate-700'} rounded-2xl p-6 hover:bg-slate-800 transition-all cursor-pointer`}
      onClick={() => setModalData({ type: 'agent', data: agent })}
    >
      {isSecret && (
        <div className="absolute top-2 right-2 text-[10px] bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">
          ACESSO EXCLUSIVO VISION
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
        <p className="text-sm text-slate-400 line-clamp-2">{agent.profile || 'Mentor Especialista'}</p>

        <button className="mt-2 w-full py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/20">
          CONSULTAR MENTOR
        </button>
      </div>
    </div>
  )

  const renderDeptColumn = (deptName: string) => {
    const deptAgents = agents.filter(a => getDept(a) === deptName && !isMentor(a))

    const strategic = deptAgents.filter(a => a.level === 'strategic')
    const tactical = deptAgents.filter(a => a.level === 'tactical')
    const operational = deptAgents.filter(a => a.level === 'operational')

    const count = deptAgents.length

    // Estilo especial para 'Alto comando'
    const isCommand = deptName === 'Alto comando'
    const containerClass = isCommand
      ? 'bg-cyan-950/20 border border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.05)]'
      : 'bg-slate-900/20 border border-slate-800/50'

    return (
      <div className={`flex flex-col min-w-[250px] flex-1 rounded-2xl h-full backdrop-blur-sm ${containerClass}`}>
        <div className={`p-4 border-b rounded-t-2xl flex justify-between items-center ${isCommand ? 'border-cyan-500/30 bg-cyan-900/20' : 'border-slate-800/50 bg-slate-900/40'}`}>
          <span className={`font-mono text-xs uppercase tracking-[0.2em] font-bold ${isCommand ? 'text-cyan-400' : 'text-blue-300'}`}>{deptName}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${isCommand ? 'bg-cyan-900 text-cyan-200' : 'bg-slate-800 text-slate-400'}`}>{count}</span>
        </div>

        <div className="p-3 flex flex-col gap-2 flex-1 relative">
          {strategic.length > 0 && (
            <div className="mb-2">
              <div className={`text-[9px] uppercase font-bold mb-2 ml-1 tracking-wider ${isCommand ? 'text-cyan-600' : 'text-slate-600'}`}>Estratégico</div>
              {strategic.map(renderAgentCard)}
            </div>
          )}

          {tactical.length > 0 && (
            <div className="mb-2">
              <div className={`text-[9px] uppercase font-bold mb-2 ml-1 tracking-wider ${isCommand ? 'text-cyan-600' : 'text-slate-600'}`}>Tático</div>
              {tactical.map(renderAgentCard)}
            </div>
          )}

          {operational.length > 0 && (
            <div>
              <div className={`text-[9px] uppercase font-bold mb-2 ml-1 tracking-wider ${isCommand ? 'text-cyan-600' : 'text-slate-600'}`}>Operacional</div>
              {operational.map(renderAgentCard)}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30 p-6 overflow-x-hidden">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <header className="max-w-[1700px] mx-auto mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-800/60 pb-6 mb-6">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-1">
              🏛️ START INC. COMMAND
            </h1>
            <p className="text-xs font-mono text-blue-400 tracking-[0.3em] uppercase opacity-80">
              Sistema Operacional Executivo AI v2.6 (Cores do Grid)
            </p>
          </div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{metrics.activeAgents}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Agentes Ativos</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-400">{metrics.strategicCount}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Diretoria</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">{metrics.recruitmentPipeline}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Candidatos</div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setActiveSection('grid')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all duration-300 border ${activeSection === 'grid' ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}
          >
            🌐 O GRID (ORGANOGRAMA)
          </button>
          <button
            onClick={() => setActiveSection('mentors')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all duration-300 border ${activeSection === 'mentors' ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}
          >
            🧠 MENTORES & CONSELHEIROS
          </button>
          <button
            onClick={() => setActiveSection('recruitment')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all duration-300 border ${activeSection === 'recruitment' ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}
          >
            ⚔️ SALA DE GUERRA (RECRUTAMENTO)
          </button>
          <button
            onClick={() => setActiveSection('orgchart')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all duration-300 border ${activeSection === 'orgchart' ? 'bg-amber-600/20 border-amber-500 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}
          >
            🌳 ORGANOGRAMA INTERATIVO
          </button>
        </div>
      </header>

      <main className="max-w-[1700px] mx-auto min-h-[600px] relative">

        {/* GRID VIEW */}
        {activeSection === 'grid' && (
          <div id="grid-layout-container" className="relative flex gap-6 overflow-x-auto pb-10 min-h-[70vh]">
            {/* ALTO COMANDO (NOVA COLUNA DESTAQUE) */}
            {renderDeptColumn("Alto comando")}

            {/* COLUNAS PADRAO */}
            {renderDeptColumn("Estratégia")}
            {renderDeptColumn("Receita")}
            {renderDeptColumn("Produto")}
            {renderDeptColumn("RH")}
            {renderDeptColumn("Finanças")}

            <svg id="dependency-layer" className="absolute top-0 left-0 w-full h-full pointer-events-none z-[5]" style={{ overflow: 'visible' }}></svg>
          </div>
        )}

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
