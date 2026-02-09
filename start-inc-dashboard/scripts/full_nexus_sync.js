const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log('🔄 INICIANDO NEXUS SYNC (VERSÃO FINAL)...');

  // 1. IDs fundamentais
  const { data: agents } = await supabase.from('agents').select('id, name');
  const getAgentId = (name) => agents.find(a => a.name === name)?.id;

  const ryanId = getAgentId('Ryan Deiss');
  const finchId = getAgentId('Tiago Finch');
  const sobralId = getAgentId('Pedro Sobral');
  
  // 2. Garantir Ícaro como Head Global de Copy
  await supabase.from('agents').update({
    role: 'Head de Copywriting (Global)',
    department: 'Copywriting',
    level: 'strategic'
  }).eq('name', 'Ícaro de Carvalho');
  
  const icaroId = getAgentId('Ícaro de Carvalho');
  console.log('✅ Ícaro de Carvalho posicionado como Head.');

  // 3. Squad de Copy do Ícaro (Mestres)
  const masters = [
    { name: 'Stefan Georgi', role: 'Mestre em Copywriting & Conversão', emoji: '🎯' },
    { name: 'Gary Halbert', role: 'Mestre em TSL (Cartas de Vendas)', emoji: '📜' },
    { name: 'Jon Benson', role: 'Mestre em VSL (Vídeos de Vendas)', emoji: '🎥' },
    { name: 'Paulo Maccedo', role: 'Especialista em Copy para WhatsApp', emoji: '📱' },
    { name: 'Amy Porterfield', role: 'Especialista em Email Marketing', emoji: '📧' },
    { name: 'Mateus Vakuda', role: 'Especialista em Criativos (Copy Invisível)', emoji: '🥷', dept: 'Copywriting', reports: finchId }
  ];

  for (const m of masters) {
    await supabase.from('agents').upsert({
      name: m.name,
      role: m.role,
      level: 'operational',
      reports_to: m.reports || icaroId,
      department: m.dept || 'Copywriting',
      emoji: m.emoji,
      autonomy: 'medium',
      soul: 'Especialista de elite em escrita persuasiva.',
      identity: `Mestre de ${m.role}.`
    }, { onConflict: 'name' });
    console.log(`✅ ${m.name} alocado ao Departamento de Copy.`);
  }

  // 4. Unidade de Lançamentos (Érico Head + Ladeira & Zillo)
  const { data: ericoRes } = await supabase.from('agents').select('id').eq('name', 'Érico Rocha').single();
  const ericoId = ericoRes?.id;

  if (ericoId) {
    await supabase.from('agents').update({
      role: 'Head de Lançamentos & Estratégia Digital',
      department: 'Lançamentos',
      level: 'strategic'
    }).eq('id', ericoId);

    const ops = [
      { name: 'Priscila Zillo', role: 'Operações de Lançamento & Estrutura' },
      { name: 'Leandro Ladeira', role: 'Operações de Perpétuo & Criativos' }
    ];

    for (const p of ops) {
      await supabase.from('agents').upsert({
        name: p.name,
        role: p.role,
        level: 'operational',
        reports_to: ericoId,
        department: 'Lançamentos',
        autonomy: 'medium'
      }, { onConflict: 'name' });
    }
    console.log('✅ Unidade de Lançamentos sincronizada.');
  }

  // 5. Gestão de Tráfego (Lucas Renault abaixo do Sobral)
  await supabase.from('agents').upsert({
    name: 'Lucas Renault',
    role: 'Gestor Operacional de Tráfego & Métricas',
    level: 'operational',
    reports_to: sobralId,
    department: 'Marketing',
    emoji: '📈',
    autonomy: 'medium',
    soul: 'O Pai do Tráfego. Gestão de processos e ROI.'
  }, { onConflict: 'name' });
  console.log('✅ Lucas Renault vinculado ao Sobral.');

  // 6. Marcar Candidatos como Aprovados
  const namesToApprove = [...masters.map(m => m.name), 'Leandro Ladeira', 'Érico Rocha', 'Priscila Zillo', 'Lucas Renault'];
  await supabase.from('candidates').update({ status: 'approved' }).in('name', namesToApprove);

  console.log('🏁 SINCRONIZAÇÃO COMPLETA. DASHBOARD ATUALIZADO VIA REALTIME.');
}

run().catch(console.error);
