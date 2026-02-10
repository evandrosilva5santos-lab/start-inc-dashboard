import { Agent, ModalData } from '@/types';

interface MentorCardProps {
    agent: Agent;
    isSecret: boolean;
    onClick: (data: ModalData) => void;
}

export function MentorCard({ agent, isSecret, onClick }: MentorCardProps) {
    return (
        <div
            className={`relative group bg-slate-900/40 border ${isSecret ? 'border-purple-500/30' : 'border-slate-800'} rounded-2xl p-6 hover:bg-slate-800 transition-all cursor-pointer backdrop-blur-md`}
            onClick={() => onClick({ type: 'agent', data: agent })}
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
    );
}
