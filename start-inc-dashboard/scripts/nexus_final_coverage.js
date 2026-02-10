const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log('🎯 COBERTURA FINAL DO NEXUS (G4 + TACTICAL HEADS)...');

  const updates = [
    {
      name: 'Talles Gomes',
      competencies: 'Gestão de Crise, Escala de Operações, Cultura de Execução, Equity Strategy',
      results: 'Fundador da Easy Taxi (presente em 35 países) e G4 Educação. Referência em gestão robusta no BR.'
    },
    {
      name: 'Alfredo Soares',
      competencies: 'Atitude em Vendas, Marketing de Diferenciação, Funis de E-commerce, Escala Comercial',
      results: 'Autor de "Bora Vender". VP na VTEX e cofundador da G4 Educação.'
    },
    {
      name: 'Bruno Nardon',
      competencies: 'Growth Hacking, Data-Driven Strategy, Transformação Digital, Liderança Ágil',
      results: 'Cofundador da Rappi Brasil, Kanui e G4 Educação. Mestre em escala acelerada.'
    },
    {
      name: 'Érico Rocha',
      competencies: 'Estratégia de Lançamento (Semente, Interno, Possuído), Copywriting de Vídeo, Gatilhos Mentais',
      results: 'Responsável por validar a Fórmula de Lançamento no Brasil, gerando bilhões em vendas totais.'
    },
    {
      name: 'Paulo Cuenca',
      competencies: 'Branding Digital, Estratégia de Conteúdo Visual, Narrativa de Venda, Retenção Social',
      results: 'Líder em branding para criadores. Estrategista por trás de perfis com milhões de seguidores.'
    },
    {
      name: 'MrBeast',
      competencies: 'Retenção de Audiência, Engenharia de Thumbnails, Algoritmo do Youtube, Viralidade Estruturada',
      results: 'Maior Youtuber do mundo. Dono de marcas globais (Feastables, MrBeast Burger) via audiência.'
    },
    {
      name: 'Lázaro',
      competencies: 'Turnaround Empresarial, Gestão de Fluxo de Caixa, Auditoria Operacional, Liderança de Boards',
      results: 'Fez a Jequiti crescer de 21M para 500M+. CEO de diversas gigantes do varejo.'
    },
    {
        name: 'Peter Jordan',
        competencies: 'Estratégia de Canal, Engajamento de Fãs, Monetização de Visualização, Gestão de Comunidade',
        results: 'Fundador do Ei Nerd e Peter Aqui. Autoridade máxima em entretenimento e Youtube no Brasil.'
    }
  ];

  for (const agent of updates) {
    const { error } = await supabase.from('[OpenClaw] Dashboard - Agents').update(agent).eq('name', agent.name);
    if (error) console.error(`Erro em ${agent.name}:`, error);
    else console.log(`✅ [COVERAGE] ${agent.name} finalizado.`);
  }

  console.log('🏁 NEXUS 100% BLINDADO E ATUALIZADO.');
}

run();
