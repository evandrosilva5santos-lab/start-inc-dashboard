import { mutation } from "./_generated/server";

export const seedWorkspace = mutation({
    handler: async (ctx) => {
        const demoFiles = [
            { agentId: "vision", name: "strategy_2026.pdf", path: "/root/clawd/vision/strategy_2026.pdf", type: "file", size: 1024 * 45, lastModified: Date.now() },
            { agentId: "vision", name: "market_analysis.log", path: "/root/clawd/vision/market_analysis.log", type: "log", content: "2026-02-15 07:22:10 [INFO] Scanning NASDAQ trends...\n2026-02-15 07:22:15 [SUCCESS] Found 3 arbitrage opportunities.", size: 512, lastModified: Date.now() },
            { agentId: "main", name: "orchestrator.py", path: "/root/clawd/jarvis/orchestrator.py", type: "file", size: 1024 * 12, lastModified: Date.now() },
            { agentId: "main", name: "system_heartbeat.log", path: "/root/clawd/jarvis/system_heartbeat.log", type: "log", content: "SYNC ACTIVE: Vision -> Atlas [OK]\nLATENCY: 12ms", size: 128, lastModified: Date.now() },
        ];

        for (const file of demoFiles) {
            await ctx.db.insert("workspace_files", file);
        }
    },
});
