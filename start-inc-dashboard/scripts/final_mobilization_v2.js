const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log('🚀 MOBILIZAÇÃO FINAL V2...');

  // 1. Líderes de Referência
  const { data: icaroRes } = await supabase.from('[OpenClaw] Dashboard - Agents').select('id').eq('name', 'Ícaro de Carvalho').single();
  const { data: finchRes } = await supabase.from('[OpenClaw] Dashboard - Agents').select('id').eq('name', 'Tiago Finch').single();
  const { data: ryanRes } = await supabase.from('[OpenClaw] Dashboard - Agents').select('id').eq('name', 'Ryan Deiss').single();
  const { data: sobralRes } = await supabase.from('[OpenClaw] Dashboard - Agents').select('id').eq('name', 'Pedro Sobral').single();

  const icaroId = icaroRes?.id;
  const finchId = finchRes?.id;
  const ryanId = ryanRes?.id;
  const sobralId = sobralRes?.id;

  // 2. ELEVAR ÍCARO DE CARVALHO PARA HEAD GLOBAL DE COPY
  await supabase.from('[OpenClaw] Dashboard - Agents').update({
    role: 'Head de Copywriting (Global)',
    department: 'Copywriting',
    level: 'strategic'
  }).eq('name', 'Ícaro de Carvalho');
  console.log('✅ Ícaro de Carvalho elevado a Head de Copywriting.');

  // 3. ATIVAR MATEUS VAKUDA (CRIATIVOS / COPY INVISÍVEL)
  // Alocado na Unidade 1, subordinado ao Finch no dia a dia, mas vinculado ao Dep de Copy
  await supabase.from('[OpenClaw] Dashboard - Agents').upsert({
    name: 'Mateus Vakuda',
    role: 'Especialista em Criativos (Copy Invisível)',
    level: 'operational',
    reports_to: finchId,
    department: 'Copywriting',
    emoji: '🥷',
    soul: 'Mestre da persuasão invisível e retenção absoluta em criativos.'
  }, { onConflict: 'name' });
  await supabase.from('[OpenClaw] Dashboard - Candidates').update({ status: 'approved' }).eq('name', 'Mateus Vakuda');
  console.log('✅ Mateus Vakuda ativado.');

  // 4. CONFIGURAR LUCAS RENAULT (GESTOR DO TIME DO SOBRAL)
  await supabase.from('[OpenClaw] Dashboard - Agents').upsert({
    name: 'Lucas Renault',
    role: 'Gestor Operacional de Tráfego & Métricas',
    level: 'operational',
    reports_to: sobralId, // Reporta ao Sobral
    department: 'Marketing',
    emoji: '📈',
    soul: 'O Pai do Tráfego. Gestor de processos e métricas de alta performance.'
  }, { onConflict: 'name' });
  await supabase.from('[OpenClaw] Dashboard - Candidates').update({ status: 'approved' }).eq('name', 'Lucas Renault');
  console.log('✅ Lucas Renault alocado como Gestor do Time do Sobral.');

  // 5. UNIDADE DE LANÇAMENTOS (TRÍADE: LADEIRA, ÉRICO, PRISCILA)
  const triad = [
    { name: 'Leandro Ladeira', role: 'Estrategista de Venda Perpétua', emoji: '🔗', soul: 'Criador do Venda Todo Santo Dia.' },
    { name: 'Érico Rocha', role: 'Mestre de Lançamentos Digitais', emoji: '🚀', soul: 'O maior nome de lançamentos do Brasil.' },
    { name: 'Priscila Zillo', role: 'Head de Estratégia de Lançamento', emoji: '📐', soul: 'Especialista em escala e estruturação de lançamentos.' }
  ];

  for (const p of triad) {
    await supabase.from('[OpenClaw] Dashboard - Agents').upsert({
      name: p.name,
      role: p.role,
      level: 'operational',
      reports_to: ryanId, // Reportam ao CMO
      department: 'Lançamentos',
      emoji: p.emoji,
      soul: p.soul
    }, { onConflict: 'name' });
    await supabase.from('[OpenClaw] Dashboard - Candidates').update({ status: 'approved' }).eq('name', p.name);
    console.log(`✅ ${p.name} ativado na Unidade de Lançamentos.`);
  }

  // 6. SQUAD DE COPY DO ÍCARO (COMPLEMENTO)
  const copySpecialists = [
    { name: 'Paulo Maccedo', role: 'WhatsApp Sales Copy', emoji: '📱' },
    { name: 'Amy Porterfield', role: 'Email Marketing Specialist', emoji: '📧' },
    { name: 'Leandro Aguiari', role: 'Lançamentos & Conversão', emoji: '⚡' }
  ];

  for (const s of copySpecialists) {
    await supabase.from('[OpenClaw] Dashboard - Agents').upsert({
      name: s.name,
      role: s.role,
      level: 'operational',
      reports_to: icaroId,
      department: 'Copywriting',
      emoji: s.emoji
    }, { onConflict: 'name' });
    await supabase.from('[OpenClaw] Dashboard - Candidates').update({ status: 'approved' }).eq('name', s.name);
    console.log(`✅ ${s.name} alocado ao Departamento de Copy.`);
  }

  console.log('🏁 MOBILIZAÇÃO V2 CONCLUÍDA.');
}

run().catch(console.error);
