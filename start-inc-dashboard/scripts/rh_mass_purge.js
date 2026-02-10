const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function purgeCandidates() {
  const { data: candidates, error } = await supabase.from('[OpenClaw] Dashboard - Candidates').select('*');
  if (error) { console.error(error); return; }

  console.log('🧹 INICIANDO LIMPEZA RADICAL NO RH...');
  
  const toDelete = [];
  const kept = [];

  candidates.forEach(c => {
    // CRITÉRIOS DE PURGA (START INC. STANDARD):
    // 1. Falta de 'Vulto Público' (Sem alma ou resultados descritos)
    // 2. Não adequação aos 3 pilares estratégicos
    // 3. Perfis 'Genéricos'

    const soul = (c.soul || '');
    const results = (c.results || '');
    const role = (c.role_target || '');
    
    // Se não tem descrição mínima de quem é ou o que fez, está fora.
    const isWeak = soul.length < 15 && results.length < 15;
    const isGeneric = role.toLowerCase().includes('generalista') || role.toLowerCase().includes('assistente');

    if (isWeak || isGeneric) {
        toDelete.push(c.id);
    } else {
        kept.push({ name: c.name, role: c.role_target });
    }
  });

  if (toDelete.length > 0) {
    await supabase.from('[OpenClaw] Dashboard - Candidates').delete().in('id', toDelete);
    console.log(`🔥 PURGA EXECUTADA: ${toDelete.length} candidatos eliminados.`);
  }

  console.log(`✅ SOBREVIVENTES: ${kept.length} candidatos de alto vulto restantes.`);
  console.log('\n💎 RADAR DE ELITE (SURVIVORS):');
  kept.slice(0, 15).forEach(k => console.log(`- ${k.name} [${k.role}]`));
}

purgeCandidates();
