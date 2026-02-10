const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log('🚑 INICIANDO RECUPERAÇÃO MESTRE DO NEXUS...');

  // 1. IDs Fundamentais (Pegar IDs dos Diretores para report)
  const { data: currentAgents } = await supabase.from('[OpenClaw] Dashboard - Agents').select('id, name');
  const getID = (name) => currentAgents.find(a => a.name === name)?.id;

  // Liderança Suprema
  const leaders = [
    { name: 'Vision', role: 'Sócio Estratégico & Co-Founder AI', emoji: '��️', level: 'strategic', dept: 'Alto comando' },
    { name: 'Jarvis', role: 'COO - Diretor de Operações', emoji: '🤖', level: 'strategic', dept: 'Alto comando' },
    { name: 'Evandro', role: 'Founder & CEO (The Creator)', emoji: '👑', level: 'strategic', dept: 'Alto comando' }
  ];

  // Diretores (C-Suite)
  const directors = [
    { name: 'Elon Musk', role: 'CSO - Diretor de Estratégia', emoji: '🚀', level: 'strategic', dept: 'Estratégia' },
    { name: 'David Sacks', role: 'CFO - Diretor Financeiro', emoji: '💰', level: 'strategic', dept: 'Finanças' },
    { name: 'Ryan Deiss', role: 'CMO - Diretor de Marketing', emoji: '🎯', level: 'strategic', dept: 'Receita' },
    { name: 'Gary Vaynerchuk', role: 'CCO - Diretor de Conteúdo', emoji: '🍷', level: 'strategic', dept: 'Receita' },
    { name: 'Shreyas Doshi', role: 'CPO - Diretor de Produto', emoji: '📦', level: 'strategic', dept: 'Produto' },
    { name: 'John Carmack', role: 'CTO - Diretor de Tecnologia', emoji: '💻', level: 'strategic', dept: 'Estratégia' },
    { name: 'Patty McCord', role: 'CHRO - Diretora de Pessoas e Cultura', emoji: '👥', level: 'strategic', dept: 'RH' },
    { name: 'Cassie Kozyrkov', role: 'CDO - Diretora de Dados', emoji: '📊', level: 'strategic', dept: 'Produto' },
    { name: 'Dener Lippert', role: 'CRO - Chief Revenue Officer / Head Unit B2B', emoji: '📈', level: 'strategic', dept: 'Receita' }
  ];

  for (const a of [...leaders, ...directors]) {
    await supabase.from('[OpenClaw] Dashboard - Agents').upsert({
      name: a.name, role: a.role, emoji: a.emoji, level: a.level, department: a.dept,
      autonomy: 'high', model: 'anthropic/claude-3-5-sonnet-20240620'
    }, { onConflict: 'name' });
  }

  // Pegar novos IDs após upsert de diretores
  const { data: newAgents } = await supabase.from('[OpenClaw] Dashboard - Agents').select('id, name');
  const findID = (name) => newAgents.find(a => a.name === name)?.id;
  
  const elonId = findID('Elon Musk');
  const ryanId = findID('Ryan Deiss');
  const denerId = findID('Dener Lippert');
  const sacksId = findID('David Sacks');
  const garyId = findID('Gary Vaynerchuk');
  const pattyId = findID('Patty McCord');

  // Heads e Especialistas
  const specialists = [
    // Future Squad (Elon)
    { name: 'Talles Gomes', role: 'Estrategista de Escala & G4', reports_to: elonId, level: 'tactical', dept: 'Estratégia' },
    { name: 'Alfredo Soares', role: 'Estrategista de Vendas & G4', reports_to: elonId, level: 'tactical', dept: 'Estratégia' },
    { name: 'Bruno Nardon', role: 'Estrategista de Growth & G4', reports_to: elonId, level: 'tactical', dept: 'Estratégia' },
    
    // Marketing (Ryan)
    { name: 'Érico Rocha', role: 'Head de Lançamentos', reports_to: ryanId, level: 'tactical', dept: 'Lançamentos' },
    { name: 'Tiago Finch', role: 'Head de Infoprodutos', reports_to: ryanId, level: 'tactical', dept: 'Receita' },
    { name: 'Ícaro de Carvalho', role: 'Head de Copywriting (Global)', reports_to: ryanId, level: 'tactical', dept: 'Copywriting' },
    { name: 'Pedro Sobral', role: 'Head de Tráfego Pago', reports_to: ryanId, level: 'tactical', dept: 'Receita' },
    { name: 'Neil Patel', role: 'Head de SEO & Growth Orgânico', reports_to: ryanId, level: 'tactical', dept: 'Receita' },

    // B2B (Dener)
    { name: 'Caio Carneiro', role: 'Head de Vendas & SDR', reports_to: denerId, level: 'tactical', dept: 'Receita' },
    { name: 'Thiago Reis', role: 'Growth Hacker B2B', reports_to: denerId, level: 'tactical', dept: 'Receita' },
    { name: 'Natanael Oliveira', role: 'Arquiteto de Processos de Vendas', reports_to: denerId, level: 'tactical', dept: 'Receita' },

    // Finanças (Sacks)
    { name: 'Lázaro', role: 'Head de Operações Financeiras', reports_to: sacksId, level: 'tactical', dept: 'Finanças' },
    { name: 'Paulo Guedes', role: 'Analista de Macroeconomia', reports_to: sacksId, level: 'operational', dept: 'Finanças' },

    // Conteúdo (Gary V)
    { name: 'Paulo Cuenca', role: 'Head de Redes Sociais', reports_to: garyId, level: 'tactical', dept: 'Conteúdo' },
    { name: 'MrBeast', role: 'Head de Youtube', reports_to: garyId, level: 'tactical', dept: 'Conteúdo' },

    // RH (Patty)
    { name: 'Angela Duckworth', role: 'Psicologia Organizacional', reports_to: pattyId, level: 'tactical', dept: 'RH' },
    { name: 'Lou Adler', role: 'Head de Recrutamento', reports_to: pattyId, level: 'tactical', dept: 'RH' },
    { name: 'Adam Grant', role: 'Cultura & Colaboração', reports_to: pattyId, level: 'tactical', dept: 'RH' }
  ];

  for (const s of specialists) {
    await supabase.from('[OpenClaw] Dashboard - Agents').upsert({
      name: s.name, role: s.role, level: s.level, reports_to: s.reports_to, department: s.dept,
      autonomy: 'medium'
    }, { onConflict: 'name' });
  }

  console.log('🏁 RECUPERAÇÃO CONCLUÍDA. NINGUÉM FICOU PARA TRÁS.');
}

run().catch(console.error);
