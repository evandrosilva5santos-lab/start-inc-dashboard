"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

const CONVEX_URL = 'https://sincere-lynx-996.convex.cloud/api/run';

interface TaskPulse {
  taskId: string;
  pulse: 'none' | 'heartbeat' | 'urgent';
  timestamp: number;
}

interface TaskPulseManagerProps {
  activeTasks: string[];
}

export default function TaskPulseManager({ activeTasks }: TaskPulseManagerProps) {
  const [pulses, setPulses] = useState<Record<string, TaskPulse>>({});
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  useEffect(() => {
    // Atualizar status de todas as tarefas ativas
    activeTasks.forEach(taskId => {
      const pulse = pulses[taskId];
      
      if (!pulse) {
        // Primeira atualização - heartbeat
        setPulses(prev => ({
          ...prev,
          [taskId]: { taskId, pulse: 'heartbeat', timestamp: Date.now() }
        }));
      } else {
        // Atualizações subsequentes - nenhuma
        setPulses(prev => ({
          ...prev,
          [taskId]: { ...pulse, pulse: 'none' }
        }));
      }
    });

    setLastUpdate(Date.now());
  }, [activeTasks]);

  useEffect(() => {
    // Pulso para tarefas críticas
    const interval = setInterval(() => {
      activeTasks.forEach(taskId => {
        const taskPulse = pulses[taskId];
        if (taskPulse?.pulse === 'none' && taskId.startsWith('critical')) {
          setPulses(prev => ({
            ...prev,
            [taskId]: { taskId, pulse: 'urgent', timestamp: Date.now() }
          }));
        }
      });
    }, 2000); // A cada 2 segundos

    return () => clearInterval(interval);
  }, [activeTasks, pulses]);

  return null; // Componente não visual - gerencia estado apenas
}

// Hook customizado para consumir o estado dos pulses
export function useTaskPulses(taskId: string, pulses: Record<string, TaskPulse>) {
  const pulse = pulses[taskId];

  return {
    pulse: pulse?.pulse || 'none',
    shouldPulse: pulse?.pulse === 'heartbeat' || pulse?.pulse === 'urgent',
    lastUpdate: pulse?.timestamp,
  };
}
