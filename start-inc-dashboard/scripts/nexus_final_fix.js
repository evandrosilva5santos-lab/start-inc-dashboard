const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log('🏛️  NEXUS FINAL SYNCHRONIZATION...');

  // 1. IDs fundamentais
  const { data: agents } = await supabase.from('agents').select('id, name');
  const getAgentId = (name) => agents.find(a => a.name === name)?.id;

  const ryanId = getAgentId('Ryan Deiss');
  const ericoId = getAgentId('Érico Rocha');
  const icaroId = getAgentId('Ícaro de Carvalho');
  const sobralId = getAgentId('Pedro Sobral');
  const finchId = getAgentId('Tiago Finch');

  // 2. MARKETING BOARD (Ryan Deiss)
  // Ryan leads the 5 Heads: Érico, Finch, Neil Patel, Pedro Sobral, Ícaro.
  const marketingHeads = ['Érico Rocha', 'Tiago Finch', 'Neil Patel', 'Pedro Sobral', 'Ícaro de Carvalho'];
  for (const name of marketingHeads) {
    await supabase.from('agents').update({ reports_to: ryanId, level: 'strategic' }).eq('name', name);
  }

  // 3. COPYWRITING DEPARTMENT (Ícaro de Carvalho)
  const copyMasters = [
    { name: 'Stefan Georgi', role: 'Mestre em Copywriting & Conversão', emoji: '🎯' },
    { name: 'Gary Halbert', role: 'Mestre em TSL (Cartas de Vendas)', emoji: '📜' },
    { name: 'Jon Benson', role: 'Mestre em VSL (Vídeos de Vendas)', emoji: '🎥' },
    { name: 'Paulo Maccedo', role: 'Especialista em Copy para WhatsApp', emoji: '📱' },
    { name: 'Amy Porterfield', role: 'Especialista em Email Marketing', emoji: '📧' },
    { name: 'Mateus Vakuda', role: 'Especialista em Criativos (Alocado Unidade 1)', emoji: '🥷' }
  ];
  for (const m of copyMasters) {
    await supabase.from('agents').upsert({
      name: m.name,
      role: m.role,
      level: 'operational',
      reports_to: icaroId,
      department: 'Copywriting',
      emoji: m.emoji,
      autonomy: 'medium'
    }, { onConflict: 'name' });
  }

  // 4. LANÇAMENTOS (Érico Rocha)
  await supabase.from('agents').update({ reports_to: ericoId }).eq('name', 'Priscila Zillo');
  await supabase.from('agents').update({ reports_to: ericoId }).eq('name', 'Leandro Ladeira');

  // 5. TRÁFEGO (Pedro Sobral)
  await supabase.from('agents').update({ reports_to: sobralId }).eq('name', 'Lucas Renault');

  // 6. MENTORES (CONSELHO)
  const mentors = ['Joel Jota', 'Thiago Nigro', 'Flávio Augusto'];
  for (const name of mentors) {
    await supabase.from('agents').update({ department: 'Conselho', level: 'strategic', reports_to: null }).eq('name', name);
  }

  console.log('🏁 SINCRONIZAÇÃO COMPLETA. VERIFIQUE O DASHBOARD.');
}

run().catch(console.error);
