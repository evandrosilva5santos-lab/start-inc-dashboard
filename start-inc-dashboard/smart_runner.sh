#!/bin/bash
# SMART RUNNER: Dynamic Task Allocation Scheduler
# Roda a cada 1 minuto no CRON.
# Verifica no Convex quem tem trabalho e acorda APENAS esses agentes.

# 1. Obter lista de agentes ativos (com tarefas 'in_progress')
# Requer 'jq' instalado para parsear JSON (ou grep simples)
AGENTS_JSON=$(npx convex run scheduler:whatsNext)

# Limpar output para pegar só o array (ex: ["mrbeast", "gary"])
# (Isso depende do formato de saída do npx convex run, que pode incluir logs)
# Assumindo que retorna JSON limpo no final.

echo "Dynamic Agents with Active Tasks: $AGENTS_JSON"

# 2. Executar Heartbeat para cada agente ativo
# Parse simples (se for array simples)
for agent in $(echo $AGENTS_JSON | tr -d '[],"'); do
    if [ "$agent" != "" ]; then
        echo "Wake up: $agent"
        # Dispara o heartbeat/processamento
        npx convex run activities:log --agentId "$agent" --type heartbeat --message "Processing Active Task" &
    fi
done

# 3. Rotina Fixa (Executada independentemente das tarefas)
DATE_MIN=$(date +%M)
DATE_HOUR=$(date +%H)

# Jarvis (A cada 15 min: 0, 15, 30, 45)
if (( DATE_MIN % 15 == 0 )); then
    echo "Wake up: Jarvis (Routine)"
    npx convex run activities:log --agentId jarvis --type heartbeat --message "COO Routine" &
fi

# Vision (A cada 2 horas: 0, 2, 4...)
if (( DATE_HOUR % 2 == 0 && DATE_MIN == 0 )); then
    echo "Wake up: Vision (Routine)"
    npx convex run activities:log --agentId vision --type heartbeat --message "CEO Routine" &
fi


# Katy (A cada 7 minutos: 0, 7, 14, 21...)
if (( DATE_MIN % 7 == 0 )); then
    echo "Wake up: Katy (Routine)"
    npx convex run activities:log --agentId katy --type heartbeat --message "Secretary Routine" &
fi

wait
echo "Done."
