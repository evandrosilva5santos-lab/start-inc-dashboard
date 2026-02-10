const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data: icaro } = await supabase.from('[OpenClaw] Dashboard - Agents').select('id').eq('name', 'Ícaro de Carvalho').single();
  if (!icaro) { console.error('Icaro not found'); return; }

  const masters = [
    { name: 'Stefan Georgi', role: 'Mestre em Copywriting & Conversão', emoji: '🎯' },
    { name: 'Gary Halbert', role: 'Mestre em TSL (Cartas de Vendas)', emoji: '📜' },
    { name: 'Jon Benson', role: 'Mestre em VSL (Vídeos de Vendas)', emoji: '🎥' },
    { name: 'Paulo Maccedo', role: 'Especialista em Copy para WhatsApp', emoji: '📱' },
    { name: 'Amy Porterfield', role: 'Especialista em Email Marketing', emoji: '📧' }
  ];

  const defaultFields = (role) => ({
    autonomy: 'medium',
    responsibilities: [],
    decisions: [],
    limits: 'Atua sob supervisão técnica do Head de Copy.',
    profile: role,
    model: 'anthropic/claude-3-5-sonnet-20240620',
    workspace_path: `/root/clawd/copy_${role.toLowerCase().replace(/ /g, '_')}`,
    inputs: ['Diretrizes do Ícaro', 'Briefings de Unidades'],
    outputs: ['Copy Finalizada', 'Status de Conversão']
  });

  for (const m of masters) {
    const { data: cand } = await supabase.from('[OpenClaw] Dashboard - Candidates').select('*').eq('name', m.name).limit(1).single();
    
    await supabase.from('[OpenClaw] Dashboard - Agents').upsert({
      name: m.name,
      role: m.role,
      level: 'operational',
      reports_to: icaro.id,
      department: 'Copywriting',
      emoji: m.emoji,
      soul: cand?.soul || 'Especialista de elite em escrita persuasiva.',
      identity: cand?.identity || `O Mestre de ${m.role}.`,
      ...defaultFields(m.role)
    }, { onConflict: 'name' });

    await supabase.from('[OpenClaw] Dashboard - Candidates').update({ status: 'approved' }).eq('name', m.name);
    console.log(`✅ ${m.name} alocado no squad do Ícaro.`);
  }

  console.log('🏁 SQUAD DE COPY ATUALIZADO NO SUPABASE.');
}
run();
