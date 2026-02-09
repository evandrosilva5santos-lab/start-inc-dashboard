const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log('🧹 INICIANDO PURGA FINAL E ATIVAÇÃO DO G4 (FUTURE SQUAD)...');

  // 1. Encontrar Elon Musk (CSO)
  const { data: elon } = await supabase.from('agents').select('id').eq('name', 'Elon Musk').single();
  if (!elon) {
    console.error('Elon Musk (CSO) não encontrado.');
    return;
  }

  // 2. Definir o G4 (Future Squad)
  const futureSquad = [
    { name: 'Talles Gomes', role: 'Estrategista de Escala & G4', emoji: '🚀' },
    { name: 'Alfredo Soares', role: 'Estrategista de Vendas & G4', emoji: '💰' },
    { name: 'Bruno Nardon', role: 'Estrategista de Growth & G4', emoji: '📈' }
  ];

  const selectedNames = [
    'Talles Gomes', 'Alfredo Soares', 'Bruno Nardon',
    'Elon Musk', 'David Sacks', 'Ryan Deiss', 'Gary Vaynerchuk', 'Jarvis', 'Vision',
    'Ícaro de Carvalho', 'Tiago Finch', 'Neil Patel', 'Pedro Sobral', 'Dener Lippert',
    'Lucas Renault', 'Paulo Cuenca', 'MrBeast', 'Penoni', 'Peter Jordan', 'Free Tools Editor',
    'Leandro Ladeira', 'Érico Rocha', 'Priscila Zillo', 'Mateus Vakuda', 'Paulo Guedes', 'Lázaro',
    'John Carmack', 'Patty McCord', 'Angela Duckworth', 'Lou Adler', 'Adam Grant',
    'Joel Jota', 'Thiago Nigro', 'Flávio Augusto', 'Tim Ferriss', 'Stefan Georgi', 'Gary Halbert', 'Jon Benson', 'Paulo Maccedo', 'Amy Porterfield'
  ];

  // 3. Ativar o Future Squad junto do Elon Musk
  for (const s of futureSquad) {
    const { data: cand } = await supabase.from('candidates').select('*').eq('name', s.name).limit(1).single();
    
    await supabase.from('agents').upsert({
      name: s.name,
      role: s.role,
      level: 'tactical',
      reports_to: elon.id,
      department: 'Estratégia',
      emoji: s.emoji,
      soul: cand?.soul || 'Mestre em escala e visão de futuro empresarial.',
      identity: `Membro do Future Squad (G4). Interação Global.`,
      autonomy: 'high',
      responsibilities: ['Definição de visão de futuro', 'Interação entre departamentos', 'Escala exponencial'],
      limits: 'Responde ao CSO e ao CEO.',
      model: 'anthropic/claude-3-5-sonnet-20240620'
    }, { onConflict: 'name' });
    
    console.log(`✅ ${s.name} ativado no Future Squad (ao lado de Elon Musk).`);
  }

  // 4. PURGA TOTAL: Apagar todos os candidatos que não foram selecionados (Approved)
  // E apagar agentes que não estão na lista de elite
  console.log('🔥 Executando purga total de candidatos não aprovados...');
  const { error: purgeCandErr } = await supabase.from('candidates').delete().not('status', 'eq', 'approved');
  if (purgeCandErr) console.error('Erro na purga de candidatos:', purgeCandErr);

  // 5. Garantir que apenas a elite permaneça em Agentes
  const { data: allAgents } = await supabase.from('agents').select('id, name');
  const idsToDelete = allAgents.filter(a => !selectedNames.includes(a.name)).map(a => a.id);
  
  if (idsToDelete.length > 0) {
    console.log(`🔥 Removendo ${idsToDelete.length} agentes excedentes...`);
    await supabase.from('agents').delete().in('id', idsToDelete);
  }

  console.log('🏁 NEXUS BLINDADO: Apenas a elite e o Future Squad permanecem.');
}

run().catch(console.error);
