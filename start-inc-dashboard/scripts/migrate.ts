
import { createClient } from '@supabase/supabase-js';
import { ConvexHttpClient } from 'convex/browser';
import * as dotenv from 'dotenv';
import { api } from '../convex/_generated/api';
import { TABLE_NAMES } from '../src/lib/constants';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

if (!supabaseUrl || !supabaseAnonKey || !convexUrl) {
    console.error('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, or NEXT_PUBLIC_CONVEX_URL');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const convex = new ConvexHttpClient(convexUrl);

async function migrate() {
    console.log(`Fetching agents from Supabase (Table: ${TABLE_NAMES.AGENTS})...`);

    // We are querying the Supabase TABLE directly
    const { data: agents, error } = await supabase
        .from(TABLE_NAMES.AGENTS)
        .select('*');

    if (error) {
        console.error('Error fetching from Supabase:', error);
        process.exit(1);
    }

    if (!agents || agents.length === 0) {
        console.log('No agents found in Supabase.');
        return;
    }

    console.log(`Found ${agents.length} agents. Migrating to Convex...`);

    // Prepare data for Convex mutation
    const agentsPayload = agents.map(agent => ({
        id: agent.name.toLowerCase().replace(/\s+/g, '-'), // Generate ID if needed, or use existing if UUID
        name: agent.name,
        role: agent.role,
        emoji: agent.emoji,
        level: agent.level,
        description: agent.description || agent.profile,
        status: agent.status || 'idle',
        department: agent.department,
        reports_to: agent.reports_to,
        // Add other fields as necessary based on your schema
    }));

    try {
        await convex.mutation(api.migrate.importFromSupabase, { agents: agentsPayload });
        console.log('Migration successful!');
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

migrate();
