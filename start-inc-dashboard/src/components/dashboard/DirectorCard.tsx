import { useState } from 'react';
import { HeadCard } from './HeadCard';
import { Agent, ModalData } from '@/types';

interface DirectorCardProps {
    director: Agent;
    agents: Agent[];
    setModalData: (data: ModalData) => void;
}

export function DirectorCard({ director, agents, setModalData }: DirectorCardProps) {
    const [expanded, setExpanded] = useState(false);
    const directReports = agents.filter(a => a.reports_to === director.id);

    return (
        <div className="space-y-3">
            <div
                onClick={() => setExpanded(!expanded)}
                className="glass-panel p-6 rounded-2xl cursor-pointer transition-all group relative hover:border-blue-400/50 hover:shadow-blue-500/10"
            >
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <span className="text-4xl filter drop-shadow-md">{director.emoji}</span>
                    {directReports.length > 0 && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 rounded-full font-mono uppercase tracking-wider">
                            {expanded ? '▼' : '►'} {directReports.length} Reports
                        </span>
                    )}
                </div>
                <div className="font-black text-xl text-white tracking-tight relative z-10">{director.name}</div>
                <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-1 relative z-10">{director.role}</div>
            </div>

            {expanded && directReports.length > 0 && (
                <div className="ml-6 space-y-2 border-l-2 border-slate-700 pl-4 animate-in fade-in slide-in-from-left-2 duration-300">
                    {directReports.map(head => (
                        <HeadCard key={head.id} head={head} agents={agents} setModalData={setModalData} />
                    ))}
                </div>
            )}
        </div>
    );
}
