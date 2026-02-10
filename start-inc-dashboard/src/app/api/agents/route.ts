import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { TABLE_NAMES } from '@/lib/constants';

export const dynamic = 'force-dynamic'; // Always fetch fresh data

const HIERARCHY_WEIGHTS: Record<string, number> = {
    'strategic': 3,
    'tactical': 2,
    'operational': 1,
};

export async function GET() {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAMES.AGENTS)
            .select('*');

        if (error) {
            console.error('Error fetching agents:', error);
            // In a real production app, we might return a cached version or empty list gracefully
            return NextResponse.json({ error: 'Failed to fetch agent swarm' }, { status: 500 });
        }

        // Transform and sort data for the grid
        const agents = (data || []).map(agent => ({
            ...agent,
            status: agent.status || 'idle',
            current_task: agent.current_task || 'Awaiting protocols...',
            emoji: agent.emoji || '🤖',
            // Ensure level is valid for sorting
            level: agent.level?.toLowerCase() || 'operational'
        })).sort((a, b) => {
            const weightA = HIERARCHY_WEIGHTS[a.level] || 0;
            const weightB = HIERARCHY_WEIGHTS[b.level] || 0;
            return weightB - weightA; // Descending order (Strategic first)
        });

        return NextResponse.json({ agents });

    } catch (error: any) {
        console.error('Agents API Error:', error);
        return NextResponse.json({ error: 'Internal System Failure' }, { status: 500 });
    }
}
