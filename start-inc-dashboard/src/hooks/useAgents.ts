'use client'

import { useAgentStore } from '@/store/useAgentStore'

/**
 * Custom hook to access Agent state logic.
 * Wraps the Zustand store for cleaner component usage.
 */
export function useAgents() {
    return useAgentStore()
}
