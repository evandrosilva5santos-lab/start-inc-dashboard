const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data: erico } = await supabase.from('[OpenClaw] Dashboard - Agents').select('id').eq('name', 'Érico Rocha').single();
  if (!erico) { console.error('Erico not found'); return; }

  // 1. Érico como Head
  await supabase.from('[OpenClaw] Dashboard - Agents').update({
    role: 'Head de Lançamentos & Estratégia Digital',
    level: 'strategic'
  }).eq('id', erico.id);

  // 2. Priscila como Operacional
  await supabase.from('[OpenClaw] Dashboard - Agents').update({
    role: 'Operações de Lançamento & Estrutura',
    level: 'operational',
    reports_to: erico.id
  }).eq('name', 'Priscila Zillo');

  // 3. Ladeira como Operacional
  await supabase.from('[OpenClaw] Dashboard - Agents').update({
    role: 'Operações de Perpétuo & Criativos',
    level: 'operational',
    reports_to: erico.id
  }).eq('name', 'Leandro Ladeira');

  console.log('✅ HIERARQUIA DE LANÇAMENTOS SINCRONIZADA.');
}
run();
