import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { TABLE_NAMES, API_KEYS } from '@/lib/constants';

// This endpoint receives status updates from N8N workflows
// It expects a POST request with x-admin-key header
export async function POST(req: Request) {
    try {
        // 1. Security Check
        const apiKey = req.headers.get('x-admin-key');
        if (!apiKey || apiKey !== API_KEYS.N8N_WEBHOOK_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse Body
        const body = await req.json();
        const { agent_id, status, current_task, timestamp } = body;

        // Basic validation
        if (!agent_id || !status) {
            return NextResponse.json({ error: 'Missing agent_id or status' }, { status: 400 });
        }

        // 3. Update Database
        // We update the agent's status, current task, and last active timestamp.
        // We use 'name' as the identifier based on existing project conventions (sync logic).
        const updatePayload = {
            status,
            current_task: current_task || null,
            last_active: timestamp || new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from(TABLE_NAMES.AGENTS)
            .update(updatePayload)
            .eq('name', agent_id)
            .select();

        if (error) {
            console.error('Database update error:', error);
            return NextResponse.json({ error: 'Failed to update agent status' }, { status: 500 });
        }

        if (!data || data.length === 0) {
            // Optional: Handle case where agent is not found
            return NextResponse.json({ error: `Agent '${agent_id}' not found` }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            updated: data[0]
        });

    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
