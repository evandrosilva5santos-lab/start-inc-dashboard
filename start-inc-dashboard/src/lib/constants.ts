export const TABLE_NAMES = {
    AGENTS: '[OpenClaw] Dashboard - Agents',
    METRICS: '[OpenClaw] Dashboard - Metrics', // Assuming this exists or will exist
    SQUADS: '[OpenClaw] Dashboard - Squads',   // Assuming this exists
    TASKS: '[OpenClaw] Dashboard - Tasks',     // Assuming this exists
} as const;

export const API_KEYS = {
    // In a real app, strict server-side enving. 
    // For now, we utilize the presence of a known header value.
    N8N_WEBHOOK_SECRET: process.env.N8N_WEBHOOK_SECRET || 'start-inc-secret-key-v1'
};
