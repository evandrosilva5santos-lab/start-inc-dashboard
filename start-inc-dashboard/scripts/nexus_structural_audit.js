const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log('🏗️ INICIANDO AUDITORIA ESTRUTURAL (MODEL, WORKSPACE, DEPARTMENT)...');
  const { data: agents, error } = await supabase.from('[OpenClaw] Dashboard - Agents').select('*');
  if (error) { console.error(error); return; }

  let incomplete = [];

  agents.forEach(agent => {
    let missing = [];
    if (!agent.model) missing.push('model');
    if (!agent.workspace_path) missing.push('workspace_path');
    if (!agent.department) missing.push('department');

    if (missing.length > 0) {
      incomplete.push({ name: agent.name, level: agent.level, missing });
    }
  });

  if (incomplete.length === 0) {
    console.log('✅ ESTRUTURA COMPLETA: Todos os ' + agents.length + ' agentes possuem model, workspace_path e department.');
  } else {
    console.log('⚠️ ESTRUTURA INCOMPLETA: ' + incomplete.length + ' agentes com falhas estruturais.');
    incomplete.forEach(inc => {
      console.log(`❌ [${inc.level.toUpperCase()}] ${inc.name}: Faltando [${inc.missing.join(', ')}]`);
    });
  }
}

run();
