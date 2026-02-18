const fs = require('fs');
const path = require('path');
const https = require('https');

// 🔧 CONFIGURAÇÃO
const CONVEX_URL = "https://sincere-lynx-996.convex.cloud";
const API_ENDPOINT = `${CONVEX_URL}/api/run`;

// Diretório onde o Jarvis guarda os agentes (Ajuste se necessário, padrão OpenClaw)
const BASE_DIR = process.env.AGENTS_PATH || './agents';

// Mapeamento de Ranks para Níveis
const HIERARCHY = {
    'STRATEGIC': ['marechal', 'major', 'staff', 'capitao'], // Alto Comando
    'TACTICAL': ['tenente'], // Gestores de Squad
    'OPERATIONAL': ['sargento', 'soldado'] // Executores
};

// Argumento de Linha de Comando (STRATEGIC, TACTICAL, OPERATIONAL)
const targetLevel = process.argv[2] ? process.argv[2].toUpperCase() : 'ALL';
console.log(`🎯 Alvo da Sincronização: ${targetLevel}`);

async function fetchConvex() {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            path: 'audit_check:listAllFull',
            args: {},
            format: 'json'
        });

        const req = https.request(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': body.length
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const parsed = JSON.parse(data);
                        // Convex retorna { value: [...] } ou direto [...] dependendo do formato
                        const agents = parsed.value || parsed;
                        resolve(agents);
                    } catch (e) {
                        reject(new Error(`Erro ao parsear JSON: ${e.message}`));
                    }
                } else {
                    reject(new Error(`Erro API Convex (${res.statusCode}): ${data}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(body);
        req.end();
    });
}

(async () => {
    try {
        console.log("📡 Conectando ao Convex DB...");
        const allAgents = await fetchConvex();

        console.log(`📥 Recebidos ${allAgents.length} agentes totais.`);

        // Filtrar por Nível
        const filteredAgents = allAgents.filter(agent => {
            if (targetLevel === 'ALL') return true;

            const rank = (agent.rank || '').toLowerCase();
            const allowedRanks = HIERARCHY[targetLevel];

            if (!allowedRanks) {
                console.error(`❌ Nível desconhecido: ${targetLevel}. Use STRATEGIC, TACTICAL ou OPERATIONAL.`);
                process.exit(1);
            }

            return allowedRanks.includes(rank);
        });

        console.log(`🧐 Filtrados: ${filteredAgents.length} agentes do nível ${targetLevel}.`);

        // Criar Arquivos
        if (!fs.existsSync(BASE_DIR)) fs.mkdirSync(BASE_DIR, { recursive: true });

        for (const agent of filteredAgents) {
            const agentId = agent.id || agent.name.toLowerCase().replace(/\s+/g, '-');
            const agentDir = path.join(BASE_DIR, agentId);

            if (!fs.existsSync(agentDir)) fs.mkdirSync(agentDir, { recursive: true });

            // 1. SOUL.md
            const soulContent = agent.soul || `# IDENTITY\nName: ${agent.name}\n(Alma em construção...)`;
            fs.writeFileSync(path.join(agentDir, 'SOUL.md'), soulContent);

            // 2. IDENTITY.md
            const identityContent = `# IDENTITY
Name: ${agent.name}
Role: ${agent.role}
Rank: ${agent.rank}
Department: ${agent.department}
Reporting To: ${agent.reportingTo || 'N/A'}
Motto: "${agent.motto || ''}"
Status: ${agent.status}
`;
            fs.writeFileSync(path.join(agentDir, 'IDENTITY.md'), identityContent);

            console.log(`✅ [${agent.rank.toUpperCase()}] ${agent.name} sincronizado.`);
        }

        console.log(`\n🏁 Sincronização ${targetLevel} concluída com sucesso.`);

    } catch (error) {
        console.error("❌ Erro fatal:", error.message);
    }
})();
