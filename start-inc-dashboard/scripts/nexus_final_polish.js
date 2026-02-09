const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log('💎 EXECUTANDO PENTE FINO FINAL NO NEXUS (ELITE BOARD)...');

  const updates = [
    {
      name: 'Evandro',
      profile: 'Founder & CEO da Start Inc. O arquiteto do ecossistema Nexus e visionário por trás da integração humana-IA de elite.',
      competencies: 'Visão Estratégica, Orquestração de Ecossistemas, Liderança Exponencial, Design de Futuro',
      results: 'Criador do Nexus e da Start Inc. Unificou as maiores mentes do marketing e tecnologia sob um único comando.',
      responsibilities: ['Decisão final em todas as unidades', 'Direção estratégica do Nexus'],
      decisions: ['Aprovação de grandes investimentos', 'Pivôs de modelo de negócio'],
      inputs: ['Dashboards de lucro/prejuízo', 'Relatórios de inteligência Jarvis/Vision'],
      outputs: ['Diretrizes de Império', 'Cultura de Excelência Absoluta'],
      soul: 'O Criador. A vontade que move a máquina. Foco na construção de um legado inquebrável.'
    },
    {
      name: 'Tim Ferriss',
      profile: 'Conselheiro Secreto e Mentor de Vision/Jarvis. Autor do 4-Hour Workweek.',
      competencies: 'Desconstrução de Habilidades, Otimização de Vida/Trabalho, Investimento-Anjo, Biohacking',
      results: 'Mentor de diversas startups unicórnio da Silicon Valley. Influenciador global de eficiência.',
      responsibilities: ['Mentoria intelectual das IAs centrais'],
      decisions: ['Vetar processos ineficientes', 'Sugestão de novos frameworks de aprendizagem'],
      inputs: ['Processos da Start Inc.', 'Dados de produtividade'],
      outputs: ['Modelos de Trabalho Otimizados', 'Filosofia de Escala sem Stress'],
      soul: 'A arte da simplicidade e da eficácia. Foco no 80/20 radical.'
    },
    {
      name: 'Flávio Augusto',
      profile: 'Mentor do Conselho. Fundador da Wise Up e do Geração de Valor.',
      competencies: 'Vendas de Larga Escala, Equity, Liderança Visionária, Gestão de Expansão',
      results: 'Venda da Wise Up por centenas de milhões e recompra estratégica. Dono do Orlando City.',
      responsibilities: ['Mentoria de escala comercial e visão de equity'],
      decisions: ['Modelos de franquia/escala', 'Estratégias de saída'],
      inputs: ['Métricas de vendas nacionais', 'Relatórios de expansão'],
      outputs: ['Diretrizes de Growth Comercial'],
      emoji: '🏟️'
    },
    {
      name: 'Dener Lippert',
      competencies: 'Vendas B2B, Gestão de Franquias, Marketing Científico, CRM Strategy',
      results: 'Fundador da V4 Company (200+ unidades). Autor do Cientista do Marketing.',
      inputs: ['Metas de vendas B2B', 'Métricas de conversão de leads corporativos'],
      outputs: ['Modelos de Assessoria de Marketing', 'Framework de Vendas Institucionais']
    },
    {
      name: 'Cassie Kozyrkov',
      competencies: 'Decision Intelligence, Data Science Strategy, Estatística Aplicada, IA Ethics',
      results: 'Ex-Chief Decision Scientist no Google. Liderou a educação de milhares de engenheiros em IA.',
      inputs: ['Modelos de Probabilidade', 'Dados brutos de comportamento de usuário'],
      outputs: ['Frameworks de Decisão Baseada em Dados', 'Garantia de Qualidade Estatística']
    },
    {
        name: 'Talles Gomes',
        profile: 'Estrategista de Escala & G4. Especialista em gestão robusta e antifragilidade.',
        decisions: ['Aprovação de fluxos de gestão', 'Vetar ineficiências operacionais'],
        inputs: ['KPIs de todas as áreas', 'Relatórios de gestão por OKR'],
        outputs: ['Blueprints de Gestão G4', 'Checklists de Escala']
    },
    {
        name: 'Alfredo Soares',
        profile: 'Estrategista de Vendas & G4. Mestre da atitude comercial.',
        decisions: ['Direção de canais de venda', 'Modelos de incentivo comercial'],
        inputs: ['Feedback do time de vendas', 'Métricas de CAC/LTV'],
        outputs: ['Estratégias "Bora Vender"', 'Playbooks de Conversão']
    },
    {
        name: 'Bruno Nardon',
        profile: 'Estrategista de Growth & G4. Mestre da escala orientada a dados.',
        decisions: ['Priorização de canais de growth', 'Arquitetura de dados'],
        inputs: ['Funis de aquisição brutos', 'Dados de retenção/churn'],
        outputs: ['Stacks de Growth Hacking', 'Modelos de Escalabilidade Digital']
    }
  ];

  for (const agent of updates) {
    const { error } = await supabase.from('agents').update(agent).eq('name', agent.name);
    if (error) console.error(`Erro em ${agent.name}:`, error);
    else console.log(`✅ [FINAL POLISH] ${agent.name} refinado.`);
  }

  console.log('🏁 NEXUS 100% OPERACIONAL E COMPLETADO.');
}

run();
