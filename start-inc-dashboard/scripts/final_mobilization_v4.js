const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log('🚀 MOBILIZAÇÃO FINAL V4 (CONSTRAINTS FIXED)...');

  const { data: agents } = await supabase.from('[OpenClaw] Dashboard - Agents').select('id, name');
  const getAgentId = (name) => agents.find(a => a.name === name)?.id;

  const icaroId = getAgentId('Ícaro de Carvalho');
  const finchId = getAgentId('Tiago Finch');
  const ryanId = getAgentId('Ryan Deiss');
  const sobralId = getAgentId('Pedro Sobral');

  const defaultFields = (role) => ({
    autonomy: 'medium',
    responsibilities: [],
    decisions: [],
    limits: 'Atua dentro do escopo definido pelo seu líder direto.',
    profile: role,
    model: 'anthropic/claude-3-5-sonnet-20240620',
    workspace_path: `/root/clawd/${role.toLowerCase().replace(/ /g, '_')}`,
    inputs: ['Demandas do CEO', 'Instruções do Líder'],
    outputs: ['Resultados de Execução', 'Status Reports']
  });

  // 1. ELEVAR ÍCARO
  await supabase.from('[OpenClaw] Dashboard - Agents').update({
    role: 'Head de Copywriting (Global)',
    level: 'strategic'
  }).eq('name', 'Ícaro de Carvalho');

  // 2. ATIVAR MATEUS VAKUDA
  await supabase.from('[OpenClaw] Dashboard - Agents').upsert({
    name: 'Mateus Vakuda',
    role: 'Especialista em Criativos (Copy Invisível)',
    level: 'operational',
    reports_to: finchId,
    emoji: '🥷',
    soul: 'Mestre da persuasão invisível.',
    identity: 'O Especialista de Criativos.',
    ...defaultFields('Especialista em Criativos')
  }, { onConflict: 'name' });

  // 3. CONFIGURAR LUCAS RENAULT
  await supabase.from('[OpenClaw] Dashboard - Agents').upsert({
    name: 'Lucas Renault',
    role: 'Gestor Operacional de Tráfego & Métricas',
    level: 'operational',
    reports_to: sobralId,
    emoji: '📈',
    soul: 'Gere o time do Sobral com foco em ROI e métricas.',
    identity: 'O Gestor de Tráfego.',
    ...defaultFields('Gestor Operacional de Tráfego')
  }, { onConflict: 'name' });

  // 4. TRÍADE DE LANÇAMENTOS
  const triad = [
    { name: 'Leandro Ladeira', role: 'Estrategista de Venda Perpétua', emoji: '🔗' },
    { name: 'Érico Rocha', role: 'Mestre de Lançamentos Digitais', emoji: '🚀' },
    { name: 'Priscila Zillo', role: 'Head de Estratégia de Lançamento', emoji: '📐' }
  ];

  for (const p of triad) {
    await supabase.from('[OpenClaw] Dashboard - Agents').upsert({
      name: p.name,
      role: p.role,
      level: 'operational',
      reports_to: ryanId,
      emoji: p.emoji,
      soul: 'Especialista de elite em lançamentos e escala.',
      identity: 'Líder da Unidade de Lançamentos.',
      ...defaultFields(p.role)
    }, { onConflict: 'name' });
  }

  // Marcar como aprovados
  const names = ['Mateus Vakuda', 'Lucas Renault', 'Leandro Ladeira', 'Érico Rocha', 'Priscila Zillo'];
  await supabase.from('[OpenClaw] Dashboard - Candidates').update({ status: 'approved' }).in('name', names);

  console.log('✅ Mobilização V4 Concluída com sucesso.');
}

run().catch(console.error);
