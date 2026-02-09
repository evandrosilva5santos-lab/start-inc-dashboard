const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data: agents, error } = await supabase.from('agents').select('*');
  if (error) { console.error(error); return; }

  const criticalFields = [
    'soul', 
    'identity', 
    'profile', 
    'competencies', 
    'results', 
    'responsibilities', 
    'decisions', 
    'inputs', 
    'outputs', 
    'knowledge_base'
  ];

  let incomplete = [];

  agents.forEach(agent => {
    let missing = [];
    criticalFields.forEach(field => {
      const value = agent[field];
      if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value.trim() === '')) {
        missing.push(field);
      }
    });
    if (missing.length > 0) {
      incomplete.push({ name: agent.name, level: agent.level, missing });
    }
  });

  console.log('\n--- 🛡️ RELATÓRIO DE VARREDURA FINAL DO NEXUS ---');
  if (incomplete.length === 0) {
    console.log('✅ SUCESSO ABSOLUTO: Todos os ' + agents.length + ' agentes estão rigorosamente completos.');
    console.log('✅ Campos verificados: ' + criticalFields.join(', '));
  } else {
    console.log('⚠️ ALERTA: Foram detectadas lacunas em ' + incomplete.length + ' agentes.');
    incomplete.forEach(inc => {
      console.log(`❌ [${inc.level.toUpperCase()}] ${inc.name}: Faltando [${inc.missing.join(', ')}]`);
    });
  }
}

run();
