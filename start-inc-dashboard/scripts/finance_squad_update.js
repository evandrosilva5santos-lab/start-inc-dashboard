const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log('💰 ATUALIZANDO SQUAD FINANCEIRO (SACKS + GUEDES + LÁZARO)...');

  // 1. Encontrar David Sacks (CFO)
  const { data: sacks } = await supabase.from('agents').select('id').eq('name', 'David Sacks').single();
  
  if (!sacks) {
    console.error('David Sacks (CFO) não encontrado.');
    return;
  }

  const financeSquad = [
    { 
      name: 'Paulo Guedes', 
      role: 'Analista de Macroeconomia & Estratégia Financeira', 
      emoji: '📈', 
      soul: 'Especialista em análise de mercado e alocação de capital.' 
    },
    { 
      name: 'Lázaro', 
      role: 'Head de Operações Financeiras & Tesouraria', 
      emoji: '🏦', 
      soul: 'Gestão rigorosa de caixa e operações de alto ticket.' 
    }
  ];

  const defaultFields = (role) => ({
    level: 'operational',
    autonomy: 'medium',
    reports_to: sacks.id,
    department: 'Finanças',
    profile: role,
    model: 'anthropic/claude-3-5-sonnet-20240620',
    workspace_path: `/root/clawd/finance_${role.toLowerCase().replace(/ /g, '_')}`,
    inputs: ['Diretrizes do CFO', 'Relatórios de Receita'],
    outputs: ['Análises Financeiras', 'Controle de Caixa']
  });

  for (const f of financeSquad) {
    // Tenta encontrar o candidato para pegar dados se existir
    const { data: cand } = await supabase.from('candidates').select('*').eq('name', f.name).limit(1).single();

    await supabase.from('agents').upsert({
      name: f.name,
      role: f.role,
      emoji: f.emoji,
      soul: f.soul,
      identity: cand?.identity || `O especialista financeiro da Start Inc.`,
      ...defaultFields(f.role)
    }, { onConflict: 'name' });

    await supabase.from('candidates').update({ status: 'approved' }).eq('name', f.name);
    console.log(`✅ ${f.name} alocado no time do David Sacks.`);
  }

  console.log('🏁 TIME FINANCEIRO SINCRONIZADO NO SUPABASE.');
}

run().catch(console.error);
