export type AgentLevel = 'strategic' | 'tactical' | 'operational';

export type Agent = {
    id: string;
    name: string;
    role: string;
    emoji: string | null;
    level: AgentLevel;
    reports_to: string | null;
    soul?: string;
    identity?: string;
    profile?: string;
    competencies?: string;
    results?: string;
    department?: string;
    creature?: string;
    vibe?: string;
    motto?: string;
    status?: string;
    tribe?: string;
    squad?: string;
    capacity_percent?: number;
    guild_tags?: string[];
    meta_url?: string;
    youtube_url?: string;
    site_url?: string;
    current_task?: string;
    last_active?: string;

    // Novos campos de identidade (Convex Sync)
    personality?: {
        characteristics: string[];
        speechStyle: string;
        psychology: string;
        tastes: string[];
        secret?: string;
    };
    background?: {
        region: string;
        references: string[];
        books: string[];
        expertise: string[];
    };
    essence?: {
        mission: string;
        vision: string;
        values: string[];
    };
    capabilities?: string[];
};

export type CandidateStatus = 'pool' | 'pre_selected' | 'rh_filter' | 'finalists' | 'approved';

export type Candidate = {
    id: string;
    name: string;
    role_target: string;
    emoji: string | null;
    nationality: string;
    results: string;
    competencies: string;
    soul: string;
    identity: string;
    status: CandidateStatus;
    created_at?: string;
};

export type ModalData = {
    type: 'agent' | 'candidate';
    data: Agent | Candidate | any; // avoiding detailed breakdown for now to match usage
};
