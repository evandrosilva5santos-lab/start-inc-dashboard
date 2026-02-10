import { useEffect } from 'react';
import { Agent, ModalData } from '@/types';
import { DEPARTMENTS, getDept, isMentor, translateLevel } from '@/lib/agent-utils';
import { AgentCard } from './AgentCard';

interface PowerGridProps {
    agents: Agent[];
    setModalData: (data: ModalData) => void;
    isLoading?: boolean;
    error?: string | null;
}

export function PowerGrid({ agents, setModalData, isLoading, error }: PowerGridProps) {
    const levels = ["strategic", "tactical", "operational"] as const;

    useEffect(() => {
        // Drawing logic moved inside the component
        const drawLines = () => {
            const svg = document.getElementById('dependency-layer');
            if (!svg) return;
            svg.innerHTML = '';

            const gridAgents = agents.filter(a => !isMentor(a));
            const container = document.getElementById('grid-layout-container');
            if (!container) return;
            const containerRect = container.getBoundingClientRect();

            gridAgents.forEach(agent => {
                if (agent.reports_to) {
                    const fromEl = document.getElementById(`agent-${agent.reports_to}`);
                    const toEl = document.getElementById(`agent-${agent.id}`);

                    if (fromEl && toEl) {
                        const fromRect = fromEl.getBoundingClientRect();
                        const toRect = toEl.getBoundingClientRect();

                        const x1 = (fromRect.left + fromRect.width / 2) - containerRect.left;
                        const y1 = (fromRect.bottom - 5) - containerRect.top;
                        const x2 = (toRect.left + toRect.width / 2) - containerRect.left;
                        const y2 = (toRect.top + 5) - containerRect.top;

                        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        // Simple sigmoid curve logic or just use existing logic
                        // existing: M x1 y1 C x1 (y1+y2)/2, x2 (y1+y2)/2, x2 y2
                        const d = `M ${x1} ${y1} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2}`;

                        path.setAttribute("d", d);
                        path.setAttribute("class", "dependency-line");
                        path.setAttribute("fill", "none");
                        path.setAttribute("stroke", "rgba(56, 189, 248, 0.2)");
                        path.setAttribute("stroke-width", "1.5");
                        path.setAttribute("stroke-dasharray", "5, 5");

                        svg.appendChild(path);
                    }
                }
            });
        };

        const handleResize = () => requestAnimationFrame(drawLines);
        window.addEventListener('resize', handleResize);
        // Initial draw with delay to ensure DOM is ready
        setTimeout(drawLines, 800);
        // Also try to draw immediately if possible or after slight delay
        setTimeout(drawLines, 100);

        return () => window.removeEventListener('resize', handleResize);
    }, [agents]);

    if (isLoading) {
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                    <div className="text-cyan-500 font-mono text-sm animate-pulse">INITIALIZING GRID PROTOCOLS...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-xl max-w-md text-center">
                    <div className="text-red-500 text-4xl mb-3">⚠️</div>
                    <h3 className="text-red-400 font-bold mb-2">SYSTEM ERROR</h3>
                    <p className="text-slate-400 text-sm mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-mono transition-colors"
                    >
                        RETRY CONNECTION
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto pb-10 custom-scrollbar">
            <div id="grid-layout-container" className="relative grid grid-cols-[140px_repeat(6,300px)] gap-6 min-w-max pr-10 pl-4">
                {/* Header Row */}
                <div className="h-20"></div>
                {DEPARTMENTS.map((dept) => {
                    const colors: any = { Strategy: 'text-purple-400', Revenue: 'text-red-400', Product: 'text-yellow-400', Tech: 'text-cyan-400', People: 'text-rose-400', Finance: 'text-orange-400' };
                    return (
                        <div key={dept} className="h-20 flex flex-col items-center justify-center border-b border-white/5 pb-4">
                            <span className={`text-[12px] font-black font-mono ${colors[dept]} uppercase tracking-[0.4em] drop-shadow-lg`}>{dept}</span>
                            <div className={`w-12 h-0.5 mt-3 rounded-full opacity-50 bg-current ${colors[dept]}`}></div>
                        </div>
                    );
                })}

                {/* Level Rows */}
                {levels.map((lvl) => (
                    <div key={lvl} className="contents">
                        <div className="flex flex-col items-end justify-center pr-10 border-r border-white/5 opacity-60 relative group">
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 transform -rotate-90 origin-right translate-x-5 whitespace-nowrap group-hover:text-white transition-colors duration-300">
                                {translateLevel(lvl)}
                            </span>
                        </div>
                        {DEPARTMENTS.map((dept) => {
                            const cellAgents = agents.filter(a => !isMentor(a) && a.level === lvl && getDept(a) === dept);
                            return (
                                <div key={`${lvl}-${dept}`} className="min-h-[220px] glass-panel rounded-3xl p-5 flex flex-col gap-4 group/cell transition-all duration-500 relative overflow-hidden hover:shadow-[0_0_40px_rgba(0,0,0,0.3)] hover:border-white/10">
                                    {/* Subtle grid bg */}
                                    <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                                    {cellAgents.map(agent => (
                                        <AgentCard key={agent.id} agent={agent} onClick={setModalData} />
                                    ))}
                                    {cellAgents.length === 0 && (
                                        <div className="flex-1 flex items-center justify-center opacity-0 group-hover/cell:opacity-20 transition-opacity duration-500">
                                            <div className="w-12 h-12 rounded-full border border-dashed border-slate-500 flex items-center justify-center text-[8px] font-mono text-slate-500">
                                                VACANT
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}

                <svg id="dependency-layer" className="absolute top-0 left-0 w-full h-full pointer-events-none z-[50]" style={{ overflow: 'visible' }}></svg>
            </div>
        </div>
    );
}
