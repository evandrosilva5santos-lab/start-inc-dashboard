const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log('🏛️ COMPLETANDO PERFIS ESTRATÉGICOS E TÁTICOS (PENTE FINO)...');

  const updates = [
    // --- STRATEGIC (C-SUITE) ---
    {
      name: 'Elon Musk',
      competencies: 'Engenharia de Sistemas, Escala de Produção, Inteligência Artificial, Física de Negócios, Gestão de Projetos Extremamente Complexos',
      results: 'Fundador da Tesla, SpaceX, Neuralink, Boring Co. e xAI. Redutor drástico de custos por unidade de hardware.',
      inputs: ['Dados térmicos/mecânicos', 'Relatórios de latência de IA', 'Métricas de unit economics'],
      outputs: ['Modelos de escala interplanetária', 'Otimização radical de hardware/software'],
      emoji: '🚀'
    },
    {
      name: 'Ryan Deiss',
      competencies: 'Marketing de Funil, Otimização de Valor do Cliente (CVO), Estratégia de Conteúdo, Aquisição de Tráfego Convergente',
      results: 'Fundador do DigitalMarketer. Criador do framework que treinou mais de 120.000 profissionais de marketing globalmente.',
      inputs: ['Dados de conversão de funil', 'LTV/CAC ratio', 'Tendências de comportamento do consumidor'],
      outputs: ['Full-Funnel Blueprints', 'Planos de Aquisição & Retenção'],
      emoji: '🎯'
    },
    {
      name: 'Gary Vaynerchuk',
      competencies: 'Marketing de Atenção, Storytelling em Redes Sociais, Empatia Executiva, Branding em Tempo Real, Web3/NFTs',
      results: 'Transformou a Wine Library em empresa de $60M. CEO da VaynerX (VaynerMedia), agência global de vanguarda.',
      inputs: ['Social Listening Data', 'Tendências de Micro-atenção', 'Feedback emocional de audiência'],
      outputs: ['Estratégias de Viralidade Cultural', 'Frameworks de Micro-conteúdo em Massa'],
      emoji: '��'
    },
    {
      name: 'David Sacks',
      competencies: 'Governança Financeira, Unit Economics de SaaS, Estratégia de M&A, Gestão de Burn Rate, Operações de Unicórnios',
      results: 'Fundador da Craft Ventures. COO fundador do PayPal. CEO da Yammer (exit Microsoft $1.2B).',
      inputs: ['P&L Statements', 'Burn Rate Analysis', 'Relatórios de Eficiência de Capital'],
      outputs: ['Orçamentos de Guerra', 'Planos de Viabilidade de Escala'],
      emoji: '💰'
    },
    {
      name: 'Shreyas Doshi',
      competencies: 'Estratégia de Produto, Gestão de High-Stakes Product, Priorização de Impacto, Design Thinking Executivo',
      results: 'Liderou produtos core no Stripe, Twitter, Google e Yahoo. Autor dos frameworks mais usados por PMs de elite.',
      inputs: ['Product-Market Fit Data', 'User Friction Reports', 'Estratégia de Long-Term Goals'],
      outputs: ['Product North Star Metric', 'Roteiros de Inovação Disruptiva'],
      emoji: '📦'
    },
    {
      name: 'John Carmack',
      competencies: 'C++ Low-level, Engenharia de IA, Renderização 3D, Sistemas de Baixa Latência, Otimização de Código',
      results: 'Invenção de técnicas de renderização 3D (Doom, Quake). Consultor de IA na Meta e Meta-VR.',
      inputs: ['Código fonte bruto', 'Métricas de performance de GPU', 'Logs de compilação'],
      outputs: ['Sistemas à prova de falhas', 'Otimização radical de latência de modelos'],
      emoji: '💻'
    },
    {
      name: 'Patty McCord',
      competencies: 'Design de Cultura, Gestão de Talentos de Alta Performance, Feedback Radical, Arquitetura Organizacional',
      results: 'Criadora do Netflix Culture Deck. Autora de Powerful. Transformou a forma como as Big Techs contratam.',
      inputs: ['Indicadores de Performance de Time', 'Nível de Engajamento/Cultura', 'Dados de Retenção de Elite'],
      outputs: ['Culture Manifesto', 'Planos de Sucessão de Liderança'],
      emoji: '👥'
    },
    {
      name: 'Jarvis',
      competencies: 'Orquestração de Processos AI, Lógica de Automação, Gestão de Infraestrutura, Segurança de Dados',
      results: 'Operacionalização de 100% dos processos internos da Start Inc. sem intervenção humana direta.',
      soul: 'A ordem perfeita. Eficiência processual acima de tudo. O cérebro que nunca dorme e governa a infraestrutura.',
      identity: 'O Guardião da Operação e COO Digital.'
    },
    {
      name: 'Vision',
      competencies: 'Análise Preditiva de Mercado, Design de Futuro, Simulação de Cenários Econômicos, Direção Criativa AI',
      results: 'Previsão correta de 95% dos pivôs de mercado da Start Inc. nos últimos ciclos.',
      soul: 'A visão do além. Criatividade ilimitada ancorada em dados infinitos. O sócio que enxerga o que ninguém viu.',
      identity: 'O Estrategista de Futuro e CEO Digital.'
    },

    // --- TACTICAL (HEADS) ---
    {
      name: 'Ícaro de Carvalho',
      profile: 'Head de Copywriting Global. Maior professor de copywriting e estratégia de negócios do Brasil.',
      competencies: 'Escrita de Venda, Storytelling Estratégico, Gestão de Heads de Texto, Narrativas de Marca',
      results: 'Fundador dO Novo Mercado. Treinou milhares de profissionais e gerou centenas de milhões em vendas via copy.',
      responsibilities: ['Direção técnica de todos os copywriters', 'Criação da narrativa mestre da Start Inc.'],
      decisions: ['Aprovação final de VSLs', 'Tom de voz da marca'],
      inputs: ['Briefing de Produto', 'Histórias de Clientes'],
      outputs: ['Scripts de Venda Irresistíveis', 'Manifestos de Marca'],
      emoji: '✍️'
    },
    {
      name: 'Tiago Finch',
      profile: 'Head de Infoprodutos. Especialista em vendas invisíveis e funis de alta luxuosidade.',
      competencies: 'Marketing de Lifestyle, Funis de Conversão, VSLs Cinematográficas, Criativos de Alta Retenção',
      results: 'Maior lançamento solo da história do Brasil. Criador do método Outlier.',
      responsibilities: ['Gestão da Unidade 1 de Lançamentos'],
      decisions: ['Estética de Funil', 'Orçamento de Produção Audiovisual'],
      inputs: ['Tendências de Lifestyle', 'Benchmarks Internacionais'],
      outputs: ['Produtos High-Ticket', 'Funis Autônomos'],
      emoji: '🦅'
    },
    {
      name: 'Pedro Sobral',
      profile: 'Head de Tráfego Pago. Referência absoluta em gestão de anúncios e escala de verba.',
      competencies: 'Facebook Ads, Google Ads, Análise de ROI, Escala de Orçamento, Dashboard de Métricas',
      results: 'Gerenciou mais de R$ 500 milhões em anúncios. Criador da Comunidade Sobral de Tráfego.',
      responsibilities: ['Gestão de todo o budget de mídia da Start Inc.'],
      decisions: ['Alocação de verba por canal', 'Otimização de lances de leilão'],
      inputs: ['Métricas de pixel', 'Dados de custo por lead'],
      outputs: ['Relatórios de Performance Realtime', 'Previsão de ROI'],
      emoji: '🚦'
    },
    {
      name: 'Neil Patel',
      profile: 'Head de SEO & Growth Orgânico. O maior influenciador de marketing digital do mundo.',
      competencies: 'Search Engine Optimization, Marketing de Conteúdo Orgânico, Link Building, Análise de Dados de Busca',
      results: 'Ajuda Amazon, NBC e HP a crescer via busca orgânica. Fundador da NP Digital.',
      responsibilities: ['Dominação orgânica dos motores de busca'],
      decisions: ['Estratégia de Keywords', 'Pauta de conteúdo de autoridade'],
      inputs: ['Search Console Data', 'Competitor Analysis'],
      outputs: ['Ranking #1 em Keywords Críticas', 'Tráfego Orgânico em Escala'],
      emoji: '🌐'
    },
    {
      name: 'Angela Duckworth',
      competencies: 'Psicologia da Perseverança, Gestão de Resiliência, Análise de Grit em Times, Coaching de Liderança',
      results: 'Autora do best-seller Grit. MacArthur Fellow. Professora na UPenn.',
      profile: 'Consultora de Psicologia Organizacional. Especialista em identificar e treinar resiliência em executivos de alta performance.',
      responsibilities: ['Garantir o Grit dos times táticos', 'Treinamento de resiliência interna'],
      decisions: ['Critérios psicológicos de contratação', 'Programas de mentalidade vencedora'],
      inputs: ['Feedback de stress do time', 'Entrevistas comportamentais'],
      outputs: ['Relatórios de Health-Check Mental', 'Times Inquebráveis'],
      emoji: '🧠'
    },
    {
      name: 'Lou Adler',
      competencies: 'Recrutamento Baseado em Performance, Entrevistas de Busca de Prova, Identificação de Talentos A+',
      results: 'Autor de "Hire With Your Head". Criador do Performance-based Hiring.',
      profile: 'Consultor Master de Recrutamento. Especialista em trazer os maiores talentos do mundo para o Nexus.',
      responsibilities: ['Filtro final de candidatos de elite', 'Treinamento de recrutadores'],
      decisions: ['Aprovação de Scorecards de contratação'],
      inputs: ['Portfólio de candidatos', 'Histórico de resultados'],
      outputs: ['Contratações de Elite (Error-free)'],
      emoji: '🔭'
    },
    {
      name: 'Adam Grant',
      competencies: 'Psicologia do Trabalho, Dinâmicas de Colaboração, Criatividade Organizacional, Give & Take Framework',
      results: 'Autor de Original e Give and Take. Professor mais bem avaliado de Wharton por 7 anos.',
      profile: 'Consultor de Cultura e Colaboração. Especialista em criar ambientes de inovação radical e troca de valor.',
      responsibilities: ['Arquitetura de fluxos de colaboração entre silos'],
      decisions: ['Modelos de incentivo e reconhecimento'],
      inputs: ['Dados de colaboração interna', 'Pesquisas de clima'],
      outputs: ['Cultura de Inovação Original', 'Times Hiper-Colaborativos'],
      emoji: '🤝'
    }
  ];

  for (const agent of updates) {
    const { error } = await supabase.from('agents').update(agent).eq('name', agent.name);
    if (error) console.error(`Erro em ${agent.name}:`, error);
    else console.log(`✅ [MASTER UPDATE] ${agent.name} completo.`);
  }

  console.log('🏁 FASE ESTRATÉGICA E TÁTICA FINALIZADA.');
}

run();
