const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log('🎬 MOBILIZANDO UNIDADE 3 V2 (FIELDS FIXED)...');

  const { data: agents } = await supabase.from('[OpenClaw] Dashboard - Agents').select('id, name');
  const getAgentId = (name) => agents.find(a => a.name === name)?.id;
  const garyId = getAgentId('Gary Vaynerchuk');

  const defaultFields = (role) => ({
    autonomy: 'medium',
    responsibilities: [],
    decisions: [],
    limits: 'Atua dentro do escopo definido pelo CCO ou Head da unidade.',
    profile: role,
    model: 'anthropic/claude-3-5-sonnet-20240620',
    workspace_path: `/root/clawd/${role.toLowerCase().replace(/ /g, '_')}`,
    inputs: ['Trends do TikTok/Youtube', 'Briefings de Marca'],
    outputs: ['Conteúdo Viral', 'Métricas de Retenção']
  });

  // 1. TIM FERRISS
  await supabase.from('[OpenClaw] Dashboard - Agents').update({
    role: 'Conselheiro Secreto / Mentor de Vision & Jarvis',
    level: 'strategic',
    department: 'Conselho',
    reports_to: null
  }).eq('name', 'Tim Ferriss');

  // 2. PAULO CUENCA (Head Redes Sociais)
  await supabase.from('[OpenClaw] Dashboard - Agents').upsert({
    name: 'Paulo Cuenca',
    role: 'Head de Redes Sociais',
    level: 'strategic',
    reports_to: garyId,
    department: 'Conteúdo',
    emoji: '📹',
    soul: 'Mestre da narrativa e branding emocional.',
    identity: 'O Estrategista de Conteúdo.',
    ...defaultFields('Head de Redes Sociais')
  }, { onConflict: 'name' });

  // 3. MrBeast (Head Youtube)
  await supabase.from('[OpenClaw] Dashboard - Agents').upsert({
    name: 'MrBeast',
    role: 'Head de Youtube',
    level: 'strategic',
    reports_to: garyId,
    department: 'Conteúdo',
    emoji: '🦁',
    soul: 'Foco total em cliques e retenção extrema.',
    identity: 'O Rei do Youtube.',
    ...defaultFields('Head de Youtube')
  }, { onConflict: 'name' });

  // Pegar IDs novos
  const res = await supabase.from('[OpenClaw] Dashboard - Agents').select('id, name');
  const cuencaId = res.data.find(a => a.name === 'Paulo Cuenca')?.id;
  const beastId = res.data.find(a => a.name === 'MrBeast')?.id;

  // 4. OPERACIONAL
  await supabase.from('[OpenClaw] Dashboard - Agents').upsert({
    name: 'Penoni',
    role: 'Estrategista de Reels Virais (Operacional)',
    level: 'operational',
    reports_to: cuencaId,
    department: 'Conteúdo',
    emoji: '📱',
    soul: 'Ganchos virais e edição dinâmica.',
    identity: 'O Sniper dos Reels.',
    ...defaultFields('Estrategista de Reels')
  }, { onConflict: 'name' });

  await supabase.from('[OpenClaw] Dashboard - Agents').upsert({
    name: 'Peter Jordan',
    role: 'Estrategista de Youtube (Operacional)',
    level: 'operational',
    reports_to: beastId,
    department: 'Conteúdo',
    emoji: '📺',
    soul: 'Criação de autoridade e comunidade no Youtube.',
    identity: 'O Especialista de Youtube.',
    ...defaultFields('Estrategista de Youtube')
  }, { onConflict: 'name' });

  await supabase.from('[OpenClaw] Dashboard - Agents').upsert({
    name: 'Free Tools Editor',
    role: 'Especialista em Edição de Vídeo AI',
    level: 'operational',
    reports_to: cuencaId,
    department: 'Conteúdo',
    emoji: '✂️',
    soul: 'Edição ágil usando ferramentas de IA de ponta.',
    identity: 'O Editor de Elite.',
    ...defaultFields('Editor de Vídeo AI')
  }, { onConflict: 'name' });

  console.log('🏁 UNIDADE 3 SINCRONIZADA COM SUCESSO.');
}

run();
