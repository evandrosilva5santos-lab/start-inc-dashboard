import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Agent } from '@/types';
import { TABLE_NAMES } from '@/lib/constants';
import { isMentor } from '@/lib/agent-utils';
import { updateAgentStatus as updateAgentStatusApi } from '@/lib/modal';

interface AgentMetrics {
    activeAgents: number;
    strategicCount: number;
    recruitmentPipeline: number;
}

interface AgentState {
    agents: Agent[];
    metrics: AgentMetrics;
    loading: boolean;
    error: string | null;

    // Actions
    fetchAgents: () => Promise<void>;
    updateAgentStatus: (agentId: string, status: string) => Promise<void>;
    setRecruitmentPipeline: (count: number) => void;

    // Realtime
    initializeSubscription: () => () => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
    agents: [],
    metrics: {
        activeAgents: 0,
        strategicCount: 0,
        recruitmentPipeline: 0
    },
    loading: true, // Start loading by default
    error: null,

    fetchAgents: async () => {
        set({ loading: true, error: null });
        try {
            const { data, error } = await supabase
                .from(TABLE_NAMES.AGENTS)
                .select('*');

            if (error) throw error;

            if (data) {
                const agents = data as Agent[];

                // Calculate metrics
                const activeOnly = agents.filter(a => !isMentor(a));
                const strategicCount = activeOnly.filter(a => a.level === 'strategic').length;

                set({
                    agents,
                    metrics: {
                        activeAgents: activeOnly.length,
                        strategicCount,
                        recruitmentPipeline: get().metrics.recruitmentPipeline // Preserve existing or updated separately
                    },
                    loading: false
                });
            }
        } catch (err: any) {
            console.error('Failed to fetch agents:', err);
            set({ error: err.message || 'Failed to fetch agents', loading: false });
        }
    },

    updateAgentStatus: async (agentId, status) => {
        const { agents } = get();
        const previousAgents = [...agents];
        const agent = agents.find(a => a.id === agentId);

        if (!agent) {
            console.error('Agent not found for update:', agentId);
            return;
        }

        // Optimistic Update
        const updatedAgents = agents.map(a =>
            a.id === agentId ? { ...a, status } : a
        );
        set({ agents: updatedAgents });

        try {
            await updateAgentStatusApi(agent.name, status);
        } catch (error) {
            console.error('Failed to update agent status via API:', error);
            // Revert on error
            set({ agents: previousAgents });
            // Ideally trigger a toast notification here
        }
    },

    setRecruitmentPipeline: (count) => {
        set((state) => ({
            metrics: {
                ...state.metrics,
                recruitmentPipeline: count
            }
        }));
    },

    initializeSubscription: () => {
        console.log('Initializing Agent Realtime Subscription...');
        const channel = supabase
            .channel('agents-realtime-store')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: TABLE_NAMES.AGENTS },
                (payload) => {
                    console.log('Realtime agent update received:', payload);
                    get().fetchAgents();
                }
            )
            .subscribe();

        return () => {
            console.log('Cleaning up Agent Subscription...');
            supabase.removeChannel(channel);
        };
    }
}));
