/**
 * Script de Migração: Supabase -> Convex
 * Migra todos os agentes do Supabase para o Convex
 */

import { createClient } from '@supabase/supabase-js';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

const supabase = createClient(supabaseUrl, supabaseKey);
const convex = new ConvexHttpClient(convexUrl);

async function migrateAgents() {
    console.log('🚀 Iniciando migração Supabase -> Convex...\n');

    try {
        // 1. Buscar todos os agentes do Supabase
        console.log('📥 Buscando agentes do Supabase...');
        const { data: agents, error } = await supabase
            .from('[OpenClaw] Dashboard - Agents')
            .select('*')
            .order('name');

        if (error) {
            throw new Error(`Erro ao buscar agentes: ${error.message}`);
        }

        if (!agents || agents.length === 0) {
            console.log('⚠️  Nenhum agente encontrado no Supabase.');
            return;
        }

        console.log(`✅ ${agents.length} agentes encontrados no Supabase.\n`);

        // 2. Enviar para o Convex
        console.log('📤 Enviando para o Convex...');
        const result = await convex.mutation(api.migrate.importFromSupabase, {
            agents: agents,
        });

        console.log('\n✅ Migração concluída!');
        console.log(`📊 Resumo:`);
        console.log(`   - Total processado: ${result.total}`);
        console.log(`   - Criados: ${result.created}`);
        console.log(`   - Atualizados: ${result.updated}`);
        console.log(`   - Erros: ${result.errors}`);
    } catch (err: any) {
        console.error('\n❌ Erro durante a migração:', err.message);
        process.exit(1);
    }
}

migrateAgents();
