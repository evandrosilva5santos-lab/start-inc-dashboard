import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const grid = action({
    args: {},
    handler: async (ctx) => {
        // Busca todos os agentes
        const agents = await ctx.runQuery(api.agents.list, {});

        console.log("\n==== ⚡ COMMAND CENTER: AGENT STATUS ====\n");

        const formatTime = (ts: number | undefined) => {
            if (!ts) return "NEVER";
            const diff = Date.now() - ts;
            if (diff < 60000) return "Just now";
            if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
            return `${Math.floor(diff / 3600000)}h ago`;
        };

        const statusIcon = (agent: any) => {
            const diff = Date.now() - (agent.lastHeartbeat || 0);
            if (diff < 15 * 60 * 1000) return "🟢 ONLINE";
            if (agent.role === "c-level") return "🟡 STANDBY";
            return "zzz ASLEEP";
        };

        // Tipagem explícita para evitar erro de indexação TS
        const grouped: Record<string, any[]> = {
            "Management": [],
            "Revenue": [],
            "Growth": [],
            "Product": [],
            "Tech": [],
            "Finance": [],
            "People": [],
            "Other": []
        };

        agents.forEach((a: any) => {
            const dept = a.department || "Other";
            if (!grouped[dept]) grouped[dept] = [];
            grouped[dept].push(a);
        });

        for (const [dept, list] of Object.entries(grouped)) {
            if (list.length === 0) continue;
            console.log(`\n🛡️  ${dept.toUpperCase()}`);
            list.forEach((a: any) => {
                console.log(`   ${statusIcon(a)}  ${a.name.padEnd(20)} (${a.title || a.role}) - Last verify: ${formatTime(a.lastHeartbeat)}`);
            });
        }

        console.log("\n=========================================");
        console.log(`Total Agents: ${agents.length}`);
        console.log("=========================================\n");
    },
});
