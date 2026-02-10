const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log('🚀 INICIANDO MOBILIZAÇÃO FINAL V3...');

  // 1. Encontrar Líderes
  const { data: agents } = await supabase.from('[OpenClaw] Dashboard - Agents').select('id, name');
  
  const getAgentId = (name) => agents.find(a => a.name === name)?.id;

  const icaroId = getAgentId('Ícaro de Carvalho');
  const finchId = getAgentId('Tiago Finch');
  const ryanId = getAgentId('Ryan Deiss');
  const sobralId = getAgentId('Pedro Sobral');

  // 2. ELEVAR ÍCARO DE CARVALHO
  await supabase.from('[OpenClaw] Dashboard - Agents').update({
    role: 'Head de Copywriting (Global)',
    level: 'strategic'
  }).eq('name', 'Ícaro de Carvalho');

  // 3. ATIVAR MATEUS VAKUDA
  await supabase.from('[OpenClaw] Dashboard - Agents').upsert({
    name: 'Mateus Vakuda',
    role: 'Especialista em Criativos (Copy Invisível)',
    level: 'operational',
    reports_to: finchId,
    emoji: '🥷',
    soul: 'Mestre da persuasão invisível e retenção absoluta em criativos.'
  }, { onConflict: 'name' });

  // 4. CONFIGURAR LUCAS RENAULT (GESTOR DO TIME DO SOBRAL)
  await supabase.from('[OpenClaw] Dashboard - Agents').upsert({
    name: 'Lucas Renault',
    role: 'Gestor Operacional de Tráfego & Métricas',
    level: 'operational',
    reports_to: sobralId,
    emoji: '📈',
    soul: 'Gestor de processos e métricas de alta performance do time do Sobral.'
  }, { onConflict: 'name' });

  // 5. UNIDADE DE LANÇAMENTOS (LADEIRA, ÉRICO, PRISCILA)
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
      emoji: p.emoji
    }, { onConflict: 'name' });
  }

  // Marcar como aprovados na tabela de candidatos
  const allNames = ['Mateus Vakuda', 'Lucas Renault', 'Leandro Ladeira', 'Érico Rocha', 'Priscila Zillo'];
  await supabase.from('[OpenClaw] Dashboard - Candidates').update({ status: 'approved' }).in('name', allNames);

  console.log('✅ Mobilização V3 concluída.');
}

run().catch(console.error);
