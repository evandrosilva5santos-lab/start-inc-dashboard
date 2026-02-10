const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log('🎬 MOBILIZANDO UNIDADE 3: VIRAL IA MACHINE...');

  // 1. Obter IDs dos líderes
  const { data: agents } = await supabase.from('[OpenClaw] Dashboard - Agents').select('id, name');
  const getAgentId = (name) => agents.find(a => a.name === name)?.id;

  const garyId = getAgentId('Gary Vaynerchuk'); // CCO
  if (!garyId) {
    console.error('Gary Vaynerchuk (CCO) não encontrado para report.');
    return;
  }

  // 2. TIM FERRISS (Conselho)
  await supabase.from('[OpenClaw] Dashboard - Agents').update({
    role: 'Conselheiro Secreto / Mentor de Vision & Jarvis',
    level: 'strategic',
    department: 'Conselho',
    reports_to: null
  }).eq('name', 'Tim Ferriss');
  await supabase.from('[OpenClaw] Dashboard - Candidates').delete().eq('name', 'Tim Ferriss');
  console.log('🛡️ Tim Ferriss elevado ao Conselho.');

  // 3. HEADS DE CONTEÚDO
  // Paulo Cuenca (Redes Sociais)
  const cuencaData = {
    name: 'Paulo Cuenca',
    role: 'Head de Redes Sociais',
    level: 'strategic',
    reports_to: garyId,
    department: 'Conteúdo',
    emoji: '📹'
  };
  await supabase.from('[OpenClaw] Dashboard - Agents').upsert(cuencaData, { onConflict: 'name' });
  
  // MrBeast (Head de Youtube)
  const beastData = {
    name: 'MrBeast',
    role: 'Head de Youtube',
    level: 'strategic',
    reports_to: garyId,
    department: 'Conteúdo',
    emoji: '🦁'
  };
  await supabase.from('[OpenClaw] Dashboard - Agents').upsert(beastData, { onConflict: 'name' });
  console.log('✅ Heads de Conteúdo (Cuenca & MrBeast) ativados.');

  // IDs dos novos heads para subordinação
  const updatedAgents = await supabase.from('[OpenClaw] Dashboard - Agents').select('id, name');
  const cuencaId = updatedAgents.data.find(a => a.name === 'Paulo Cuenca')?.id;
  const beastId = updatedAgents.data.find(a => a.name === 'MrBeast')?.id;

  // 4. OPERACIONAL
  // Penoni (em Paulo Cuenca)
  await supabase.from('[OpenClaw] Dashboard - Agents').upsert({
    name: 'Penoni',
    role: 'Estrategista de Reels Virais (Operacional)',
    level: 'operational',
    reports_to: cuencaId,
    department: 'Conteúdo',
    emoji: '📱'
  }, { onConflict: 'name' });

  // Peter Jordan (em MrBeast)
  await supabase.from('[OpenClaw] Dashboard - Agents').upsert({
    name: 'Peter Jordan',
    role: 'Estrategista de Youtube (Operacional)',
    level: 'operational',
    reports_to: beastId,
    department: 'Conteúdo',
    emoji: '📺'
  }, { onConflict: 'name' });

  // Free Tools Editor (em Paulo Cuenca ou Gary)
  await supabase.from('[OpenClaw] Dashboard - Agents').upsert({
    name: 'Free Tools Editor',
    role: 'Especialista em Edição de Vídeo AI',
    level: 'operational',
    reports_to: cuencaId,
    department: 'Conteúdo',
    emoji: '✂️'
  }, { onConflict: 'name' });

  // 5. Marcar aprovados no pool
  const namesToApprove = ['Paulo Cuenca', 'MrBeast', 'Penoni', 'Peter Jordan', 'Free Tools Editor'];
  await supabase.from('[OpenClaw] Dashboard - Candidates').update({ status: 'approved' }).in('name', namesToApprove);

  console.log('🏁 UNIDADE 3 SINCRONIZADA. REALTIME ATIVO.');
}

run().catch(console.error);
