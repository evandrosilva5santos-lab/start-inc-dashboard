import { Agent, ModalData } from '@/types';
import { getAgentAccent, getLevelStyles } from '@/lib/agent-utils';
import { motion } from 'framer-motion';

interface AgentCardProps {
    agent: Agent;
    onClick: (data: ModalData) => void;
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
    const { color } = getAgentAccent(agent);
    const { colorClass } = getAgentAccent(agent);
    const levelStyle = getLevelStyles(agent.level, colorClass);

    const roleShort = agent.role?.split(' - ')[0] || agent.role;

    // Status visualization (assume 'online' if not specified, for visual demo)
    const status = agent.status || 'online';
    const statusColors = {
        online: '#22c55e',
        busy: '#f59e0b',
        offline: '#64748b'
    };
    const statusColor = statusColors[status as keyof typeof statusColors] || statusColors.online;

    return (
        <motion.div
            id={`agent-${agent.id}`}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{
                scale: 1.02,
                y: -2,
                transition: { duration: 0.3, ease: "easeOut" }
            }}
            whileTap={{ scale: 0.98 }}
            className={`rounded-2xl p-4 cursor-pointer relative z-10 w-full group overflow-hidden ${levelStyle}`}
            onClick={() => onClick({ type: 'agent', data: agent })}
        >
            {/* Glassmorphic shine effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Moving Glint Effect */}
            <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />

            {/* Glow effect on hover */}
            <motion.div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    boxShadow: `inset 0 0 20px ${color}10, 0 0 20px ${color}20`,
                }}
            />

            <div className="flex items-center gap-4 relative z-10">
                <motion.div
                    className="text-3xl filter drop-shadow-lg"
                    whileHover={{
                        rotate: [0, -10, 10, -10, 0],
                        scale: 1.1,
                        transition: { duration: 0.4 }
                    }}
                >
                    {agent.emoji || '🤖'}
                </motion.div>
                <div className="flex flex-col min-w-0 flex-1">
                    <div className="font-bold text-sm text-white truncate leading-tight tracking-wide group-hover:text-glow transition-all duration-300">
                        {agent.name}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1 truncate group-hover:text-white/80 transition-colors">
                        {roleShort}
                    </div>
                </div>

                {/* Department indicator dot (top-right) */}
                <motion.div
                    animate={{
                        boxShadow: [
                            `0 0 0px ${color}`,
                            `0 0 10px ${color}`,
                            `0 0 0px ${color}`
                        ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full opacity-60"
                    style={{ backgroundColor: color }}
                />

                {/* Status indicator dot (bottom-right) */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                    <motion.div
                        animate={{
                            scale: status === 'online' ? [1, 1.5, 1] : 1,
                            opacity: status === 'online' ? [0.5, 0, 0.5] : 0
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute w-2 h-2 rounded-full"
                        style={{ backgroundColor: statusColor }}
                    />
                    <div
                        className="w-2 h-2 rounded-full shadow-sm"
                        style={{ backgroundColor: statusColor, boxShadow: `0 0 8px ${statusColor}` }}
                    />
                </div>
            </div>
        </motion.div>
    );
}
