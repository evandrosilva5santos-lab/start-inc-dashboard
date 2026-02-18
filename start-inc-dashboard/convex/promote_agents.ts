import { mutation } from "./_generated/server";

// Adicionar Katy à lista de Promoção
const PROMOTIONS = [
    // ... (Manter os anteriores se possível, ou apenas adicionar Katy se for incremental)
    // Vou colocar a lista completa para garantir consistência
    { name: "Talles Gomes", role: "c-level", department: "Revenue", title: "Head of Sales" },
    { name: "Érico Rocha", role: "agent", department: "Revenue", title: "Launch Strategist" },
    { name: "Jordan Belfort", role: "c-level", department: "Revenue", title: "CRO" },
    { name: "Alfredo Soares", role: "c-level", department: "Product", title: "Head of Strategy" },
    { name: "Neil Patel", role: "c-level", department: "Growth", title: "Head of Traffic" },
    { name: "Pedro Sobral", role: "agent", department: "Growth", title: "Ads Specialist" },
    { name: "Quill", role: "agent", department: "Growth", title: "Outreach Specialist" },
    { name: "Adam Grant", role: "c-level", department: "People", title: "Head of Culture" },
    { name: "Primo Rico", role: "c-level", department: "Finance", title: "CFO" },
    { name: "Lázaro", role: "agent", department: "Finance", title: "Financial Analyst" },
    { name: "Elon Musk", role: "c-level", department: "Tech", title: "Visionary CSO" },
    { name: "Shark", role: "c-level", department: "Tech", title: "CTO" },
    { name: "Atlas", role: "c-level", department: "Management", title: "Sub-COO" },
    { name: "Dener Lippert", role: "c-level", department: "Product", title: "Business Architect" },
    { name: "Russell Brunson", role: "agent", department: "Product", title: "Funnel Architect" },
    { name: "MrBeast", role: "c-level", department: "Growth", title: "Head of Viral Content" },
    { name: "Peter Jordan", role: "agent", department: "Growth", title: "YouTube Scriptwriter" },
    { name: "Paulo Cuenca", role: "agent", department: "Growth", title: "Instagram Strategist" },
    { name: "Thiago Reis", role: "agent", department: "Growth", title: "B2B Growth Lead" },
    { name: "Gary Halbert", role: "c-level", department: "Revenue", title: "Head of Copy" },
    { name: "Paulo Maccedo", role: "agent", department: "Revenue", title: "Senior Copywriter" },
    { name: "Jon Benson", role: "agent", department: "Revenue", title: "VSL Specialist" },
    { name: "Leandro Ladeira", role: "agent", department: "Revenue", title: "Perpetual Sales Analyst" },
    { name: "Caio Carneiro", role: "agent", department: "Revenue", title: "Sales Closer" },
    { name: "Alex Hormozi", role: "c-level", department: "Revenue", title: "Offer Strategist" },
    { name: "Wanda", role: "agent", department: "Tech", title: "UI/UX Designer" },

    // NEW ADDITION
    { name: "Katy", role: "agent", department: "Management", title: "Executive Assistant" },
];

export const promote = mutation({
    handler: async (ctx) => {
        const results = [];
        for (const p of PROMOTIONS) {
            const slug = p.name.toLowerCase().replace(/ /g, "-");
            const sessionKey = `agent:${slug}:main`;
            const existing = await ctx.db.query("agents").filter(q => q.eq(q.field("name"), p.name)).first();

            if (existing) {
                await ctx.db.patch(existing._id, {
                    role: p.role,
                    department: p.department,
                    sessionKey: sessionKey,
                    // status: "idle", // Não resetar status se já estiver rodando
                    lastHeartbeat: Date.now()
                });
                results.push(`✅ Updated ${p.name}`);
            } else {
                await ctx.db.insert("agents", {
                    name: p.name,
                    id: slug,
                    role: p.role,
                    status: "idle",
                    sessionKey: sessionKey,
                    department: p.department,
                    lastHeartbeat: Date.now(),
                    model: "claude-3-5-sonnet-20241022",
                    identity: `I am ${p.name}, ${p.title} at Start Inc.`,
                    motto: "Efficiency is key.",
                    capabilities: ["organization", "transcription", "scheduling"]
                });
                results.push(`✨ Created ${p.name}`);
            }
        }
        return results;
    }
});
