#!/bin/bash
# SQUAD_OS - Rate-Limited Heartbeat (Optimized for Convex Free Tier)
# Reduz de 104 requests/hora para apenas 4 requests/hora

echo "# --- CRONTAB CONFIGURATION (OPTIMIZED FOR RATE LIMITS) ---"
echo ""

# Batch Heartbeat: A cada 1 hora (em vez de 15 min)
# Atualiza TODOS os agentes em uma única chamada
echo "0 * * * * npx convex run heartbeat_batch:batchUpdate"

# Backup: Heartbeat Individual apenas para agentes críticos (1x/hora)
echo "5 * * * * npx convex run activities:log --agentId jarvis --type heartbeat --message 'COO Status Check'"
echo "10 * * * * npx convex run activities:log --agentId vision --type heartbeat --message 'Strategic Review'"

echo ""
echo "# Jobs Especiais (Daily/Weekly)"
echo "0 8 * * * npx convex run activities:log --agentId jarvis --type briefing --message 'Daily Briefing'"
echo "0 6 * * 1 npx convex run activities:log --agentId vision --type audit --message 'Weekly Strategy Review'"

echo ""
echo "# --- END CONFIGURATION ---"
echo "# Rate: ~10 requests/hour (bem abaixo do limite)"
