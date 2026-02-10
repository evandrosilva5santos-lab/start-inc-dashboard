import { useState } from 'react';
import { Agent, ModalData } from '@/types';

interface HeadCardProps {
    head: Agent;
    agents: Agent[];
    setModalData: (data: ModalData) => void;
}

export function HeadCard({ head, agents, setModalData }: HeadCardProps) {
    const [headExpanded, setHeadExpanded] = useState(false);
    const squadMembers = agents.filter(a => a.reports_to === head.id);

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
    );
}
