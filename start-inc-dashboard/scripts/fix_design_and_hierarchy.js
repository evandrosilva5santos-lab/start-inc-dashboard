const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log('🎨 REFINANDO CORES E HIERARQUIA DO NEXUS...');

  // 1. Identificar o Elon Musk (CSO)
  const { data: elon } = await supabase.from('[OpenClaw] Dashboard - Agents').select('id').eq('name', 'Elon Musk').single();
  
  // 2. MOVER O G4 PARA O TIME DO ELON (ESTRATÉGIA)
  const g4 = ['Talles Gomes', 'Alfredo Soares', 'Bruno Nardon'];
  if (elon) {
    await supabase.from('[OpenClaw] Dashboard - Agents').update({ 
      reports_to: elon.id, 
      department: 'Estratégia',
      level: 'tactical' 
    }).in('name', g4);
    console.log('✅ G4 movido para o time de Estratégia do Elon Musk.');
  }

  // 3. DIFERENCIAR HEADS DE DIRETORES (MUDAR HEADS PARA TÁTICO)
  // Diretores (C-Suite) permanecem Estratégicos (Roxo)
  // Heads de Departamentos tornam-se Táticos (Azul) para limpeza visual
  
  const headsToTactical = [
    'Érico Rocha', 
    'Tiago Finch', 
    'Ícaro de Carvalho', 
    'Pedro Sobral', 
    'Neil Patel', 
    'Paulo Cuenca', 
    'MrBeast', 
    'Dener Lippert',
    'John Carmack', // CTO pode ser estratégico ou tático, mas vamos diferenciar
    'Gary Vaynerchuk' // CCO é diretor, mas se o user quer diferenciar... 
  ];

  // Gary V e John Carmack são Diretores (C-Suite). Vou manter eles estratégicos.
  // Mas Érico, Finch, Sobral, Patel, Cuenca, MrBeast são HEADS.
  
  const actualHeads = [
    'Érico Rocha', 
    'Tiago Finch', 
    'Ícaro de Carvalho', 
    'Pedro Sobral', 
    'Neil Patel', 
    'Paulo Cuenca', 
    'MrBeast',
    'Caio Carneiro',
    'Angela Duckworth',
    'Lou Adler',
    'Adam Grant',
    'Lázaro'
  ];

  await supabase.from('[OpenClaw] Dashboard - Agents').update({ level: 'tactical' }).in('name', actualHeads);
  console.log('✅ Heads de departamento rebaixados para nível Tático (Azul) para distinção visual.');

  // 4. GARANTIR DIRETORES COMO ESTRATÉGICOS (Roxo)
  const directors = [
    'Ryan Deiss', // CMO
    'Elon Musk', // CSO
    'David Sacks', // CFO
    'Shreyas Doshi', // CPO
    'Patty McCord', // CHRO
    'Gary Vaynerchuk', // CCO
    'John Carmack', // CTO
    'Cassie Kozyrkov' // CDO
  ];
  
  await supabase.from('[OpenClaw] Dashboard - Agents').update({ level: 'strategic' }).in('name', directors);
  console.log('✅ Diretores (C-Suite) confirmados como nível Estratégico (Roxo).');

  console.log('🏁 SINCRONIZAÇÃO DE DESIGN CONCLUÍDA.');
}

run().catch(console.error);
