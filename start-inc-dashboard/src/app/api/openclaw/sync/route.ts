import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
    try {
        const { action } = await req.json()

        if (action === 'import') {
            // Definir o caminho para o arquivo openclaw_final.json
            // No mundo real, isso viria de uma variável de ambiente ou configuração
            const configPath = path.join(process.cwd(), '..', 'openclaw_final.json')

            const fileContent = await fs.readFile(configPath, 'utf8')
            const config = JSON.parse(fileContent)

            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            )

            const agentsList = config.agents
            const agentsToUpsert = []

            for (const [key, value] of Object.entries(agentsList)) {
                if (key === 'defaults') continue

                const agentData = value as any
                const name = agentData.identity?.name || key
                const emoji = agentData.identity?.emoji || null
                const workspace_path = agentData.workspace || null
                const model = agentData.model?.primary || null

                // Mapeamento heurístico de nível e autonomia se não existirem
                let level = 'operational'
                if (['vision', 'jarvis'].includes(key)) level = 'strategic'
                else if (['cso', 'cmo', 'cfo', 'cto', 'cro'].includes(key)) level = 'strategic'
                else if (['growth', 'product', 'content', 'okr_master', 'funnel_arch'].includes(key)) level = 'tactical'

                agentsToUpsert.push({
                    name,
                    role: name.includes('(') ? name.split('(')[1].replace(')', '') : 'AI Agent',
                    emoji,
                    level,
                    autonomy: level === 'strategic' ? 'high' : 'medium',
                    workspace_path,
                    model
                })
            }

            // Upsert por nome (já que o ID do JSON pode ser diferente do UUID do Supabase)
            // Nota: Em um sistema real, usaríamos uma chave única melhor
            for (const agent of agentsToUpsert) {
                await supabase
                    .from('agents')
                    .upsert(agent, { onConflict: 'name' })
            }

            return NextResponse.json({ success: true, count: agentsToUpsert.length })
        }

        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    } catch (error: any) {
        console.error('Erro na API de Sync:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
