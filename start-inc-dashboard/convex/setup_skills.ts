import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const registerAll = mutation({
    args: {},
    handler: async (ctx) => {
        const skills = [
            // 🕵️ FIRECRAWL (Inteligência & Scraping)
            {
                name: "firecrawl",
                category: "intelligence",
                description: "Permite navegar na web, fazer scraping de sites, extrair dados estruturados e buscar informações em tempo real. Essencial para pesquisa de mercado e análise de concorrentes.",
                config: JSON.stringify({ tools: ["scrape", "crawl", "search", "map"] }),
                enabled: true,
            },
            // ⚡ N8N (Automação & Processos)
            {
                name: "n8n-mcp",
                category: "automation",
                description: "Executa workflows complexos de automação no N8N. Permite integrar sistemas díspares, processar webhooks e orquestrar fluxos de trabalho sem intervenção manual.",
                config: JSON.stringify({ tools: ["execute_workflow", "list_workflows"] }),
                enabled: true,
            },
            // 🐙 GITKRAKEN (Gestão de Código & Versão)
            {
                name: "GitKraken",
                category: "engineering",
                description: "Gerenciamento avançado de repositórios Git. Permite visualizar histórico, realizar merges complexos, gerenciar branches e garantir a integridade do código-fonte.",
                config: JSON.stringify({ tools: ["git_status", "git_commit", "git_push", "git_log"] }),
                enabled: true,
            },
            // 🗄️ SUPABASE (Banco de Dados & Backend)
            {
                name: "supabase-mcp-server",
                category: "engineering",
                description: "Interação direta com o banco de dados Supabase. Permite executar SQL, gerenciar tabelas, logs e edge functions. Poder total sobre o backend.",
                config: JSON.stringify({ tools: ["execute_sql", "list_tables", "get_logs"] }),
                enabled: true,
            },
            // 🌲 PINECONE (Memória Vetorial & Busca Semântica)
            {
                name: "pinecone-mcp-server",
                category: "intelligence",
                description: "Gestão de memória de longo prazo e busca semântica. Permite indexar conhecimento, buscar similaridades e recuperar contexto histórico relevante.",
                config: JSON.stringify({ tools: ["search", "upsert", "query"] }),
                enabled: true,
            },
            // 🎨 SHADCN (UI/UX Design System)
            {
                name: "shadcn",
                category: "design",
                description: "Biblioteca de componentes de UI. Permite buscar, instalar e configurar componentes visuais modernos para o frontend.",
                config: JSON.stringify({ tools: ["add_component", "list_components"] }),
                enabled: true,
            },
            // 🧠 CONTEXT7 (Documentação Técnica)
            {
                name: "context7",
                category: "knowledge",
                description: "Acesso a documentações técnicas atualizadas de bibliotecas e frameworks. Use para resolver dúvidas de implementação.",
                config: JSON.stringify({ tools: ["search_docs", "read_doc"] }),
                enabled: true,
            },
            // 🚀 CONVEX (Infraestrutura Própria)
            {
                name: "convex",
                category: "core",
                description: "Controle total sobre a própria infraestrutura do Convex. Logs, agendamentos, queries e mutations do sistema operacional.",
                config: JSON.stringify({ tools: ["list_tables", "run_action", "get_logs"] }),
                enabled: true,
            }
        ];

        // Limpa skills antigas (opcional, para evitar duplicatas sujas)
        // await ctx.db.query("skills").collect().then(all => all.forEach(s => ctx.db.delete(s._id)));

        for (const skill of skills) {
            // Verifica se já existe para não duplicar, atualiza se existir
            const existing = await ctx.db
                .query("skills")
                .filter(q => q.eq(q.field("name"), skill.name))
                .first();

            if (existing) {
                await ctx.db.patch(existing._id, {
                    description: skill.description,
                    category: skill.category,
                    config: skill.config,
                    enabled: skill.enabled,
                    lastUpdated: Date.now(),
                });
            } else {
                await ctx.db.insert("skills", {
                    ...skill,
                    lastUpdated: Date.now(),
                });
            }
        }

        return `✅ Arsenal registrado: ${skills.length} skills operacionais.`;
    },
});
