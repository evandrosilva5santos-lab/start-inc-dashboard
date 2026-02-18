#!/bin/bash
# SQUAD_OS - Strategic Pace (Vision 2h, Jarvis 15m, Katy 7h)
# Ajustado para reduzir ruído e focar em ciclos estratégicos longos.

echo "# --- CRONTAB CONFIGURATION (STRATEGIC PACE) ---"
echo ""

# Jarvis (COO) - A cada 15 min (Pulso Operacional Tático)
# O gerente precisa estar presente para mover as tarefas.
echo "*/15 * * * * npx convex run activities:log --agentId jarvis --type heartbeat --message 'COO Ops Pulse'"

# Vision (CEO) - A cada 2 horas (Visão Macro Estratégica)
# O CEO não precisa microgerenciar, apenas alinhar a direção.
echo "0 */2 * * * npx convex run activities:log --agentId vision --type heartbeat --message 'CEO Strategy Check'"

# Katy (Secretária) - A cada 7 horas (Registro Consolidado)
# A secretária faz o balanço do turno (manhã/tarde/noite).
echo "0 */7 * * * npx convex run activities:log --agentId katy --type heartbeat --message 'Secretarial Log'"

echo ""
echo "# Operários (MrBeast, Gary, Code): Dormindo. Acordam apenas sob demanda."
echo "# --- END CONFIGURATION ---"
