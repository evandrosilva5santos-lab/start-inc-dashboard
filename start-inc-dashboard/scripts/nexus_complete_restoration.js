const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const CLAUDE_MODEL = 'anthropic/claude-3-5-sonnet-20240620';

async function run() {
  console.log('🏛️ INICIANDO RESTAURAÇÃO ESTRUTURAL COMPLETA (MÉTODO ROBUSTO)...');
  const { data: agents } = await supabase.from('[OpenClaw] Dashboard - Agents').select('*');

  for (const agent of agents) {
    let update = {};
    let changed = false;

    // 1. Corrigir Model
    if (!agent.model) {
      update.model = CLAUDE_MODEL;
      changed = true;
    }

    // 2. Corrigir Department / Mentores
    // Se o nível for estratégico ou ele for um mentor conhecido, o departamento deve ser 'Mentor'
    const isMentor = agent.level === 'strategic' || 
                     ['Talles Gomes', 'Joel Jota', 'Kim Scott', 'Peter Thiel', 'Thiago Nigro', 'Flávio Augusto'].includes(agent.name);
    
    if (isMentor) {
      if (agent.department !== 'Mentores') {
        update.department = 'Mentores';
        changed = true;
      }
    } else if (!agent.department) {
      if (agent.role.toLowerCase().includes('venda') || agent.role.toLowerCase().includes('marketing')) {
        update.department = 'Growth & Sales';
      } else {
        update.department = 'Operations';
      }
      changed = true;
    }

    // 3. Corrigir Workspace Path (Garantir slug único)
    if (!agent.workspace_path) {
      const slug = agent.name.toLowerCase()
        .replace(/ /g, '-')
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w-]/g, '');
      
      let folder = 'ops';
      if (agent.level === 'strategic') folder = 'board';
      else if (agent.level === 'tactical') folder = 'management';
      
      update.workspace_path = `/root/clawd/${folder}/${slug}`;
      changed = true;
    }

    if (changed) {
      const { error } = await supabase.from('[OpenClaw] Dashboard - Agents').update(update).eq('id', agent.id);
      if (error) console.error(`❌ Erro em ${agent.name}:`, error);
      else console.log(`✅ [OK] ${agent.name} -> ${JSON.stringify(update)}`);
    }
  }

  console.log('🏁 RESTAURAÇÃO FINALIZADA COM SUCESSO.');
}

run();
