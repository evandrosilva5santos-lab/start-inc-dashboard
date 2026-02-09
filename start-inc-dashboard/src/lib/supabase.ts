import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Agent = {
    id: string
    name: string
    role: string
    emoji: string | null
    level: 'strategic' | 'tactical' | 'operational'
    autonomy: 'high' | 'medium' | 'low'
    reports_to: string | null
    responsibilities: string[] | null
    decisions: string[] | null
    limits: string | null
    profile: string | null
    model: string | null
    workspace_path: string | null
    inputs: string[] | null
    outputs: string[] | null
    created_at: string
    updated_at: string
    department: string | null
    skills?: AgentSkill[]
}

export type AgentSkill = {
    id: string
    agent_id: string
    skill_name: string
    skill_path: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

export type AgentHistory = {
    id: string
    agent_id: string
    change_type: string
    old_value: any
    new_value: any
    changed_by: string | null
    changed_at: string
}
