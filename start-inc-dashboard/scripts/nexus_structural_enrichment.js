const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const DEFAULT_MODEL = 'zai/glm-4.7';
const CLAUDE_MODEL = 'anthropic/claude-3-5-sonnet-20240620';

async function run() {
  console.log('🏗️ INICIANDO ENRIQUECIMENTO ESTRUTURAL DO NEXUS...');
  const { data: agents } = await supabase.from('agents').select('*');

  const updates = agents.map(agent => {
    let update = { name: agent.name };
    let changed = false;

    // 1. MODEL logic
    if (!agent.model) {
      // Prioritize Claude for high-level creative roles, GLM-4 for general
      if (['strategic', 'tactical'].includes(agent.level) || agent.role.toLowerCase().includes('copy') || agent.role.toLowerCase().includes('marketing')) {
        update.model = CLAUDE_MODEL;
      } else {
        update.model = DEFAULT_MODEL;
      }
      changed = true;
    }

    // 2. DEPARTMENT logic (if missing)
    if (!agent.department) {
      if (agent.level === 'strategic') update.department = 'Board & Strategy';
      else if (agent.role.toLowerCase().includes('venda') || agent.role.toLowerCase().includes('marketing') || agent.role.toLowerCase().includes('ads')) update.department = 'Growth & Sales';
      else if (agent.role.toLowerCase().includes('tech') || agent.role.toLowerCase().includes('science') || agent.role.toLowerCase().includes('infra')) update.department = 'Engineering & Data';
      else update.department = 'Management';
      changed = true;
    }

    // 3. WORKSPACE_PATH logic (if missing)
    if (!agent.workspace_path) {
      const slug = agent.name.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      let base = '/root/clawd/';
      if (agent.level === 'strategic') base += 'board/';
      else if (agent.level === 'tactical') base += 'management/';
      else base += 'ops/';
      
      update.workspace_path = base + slug;
      changed = true;
    }

    return changed ? update : null;
  }).filter(u => u !== null);

  console.log(`🚀 Processando ${updates.length} atualizações estruturais...`);

  for (const item of updates) {
    const { name, ...fields } = item;
    const { error } = await supabase.from('agents').update(fields).eq('name', name);
    if (error) console.error(`Erro em ${name}:`, error);
    else console.log(`✅ [ESTRUTURA] ${name} atualizado.`);
  }

  console.log('🏁 ENRIQUECIMENTO ESTRUTURAL FINALIZADO.');
}

run();
