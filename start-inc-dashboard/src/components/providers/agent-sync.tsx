"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAgentStore } from "@/store/useAgentStore";
import { Agent } from "@/types";

export function AgentSync() {
    const convexAgents = useQuery(api.agents.list);
    const setAgents = useAgentStore((state) => state.setAgents);

    useEffect(() => {
        if (convexAgents) {
            setAgents(convexAgents as unknown as Agent[]);
        }
    }, [convexAgents, setAgents]);

    return null; // Componente invisível de sincronização
}
