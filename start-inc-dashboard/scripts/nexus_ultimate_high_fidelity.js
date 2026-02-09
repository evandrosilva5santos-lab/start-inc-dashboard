const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log('💎 INICIANDO ENRIQUECIMENTO DE ALTA FIDELIDADE: GRANDES FEITOS, LEMAS E CRENÇAS...');

  const { data: agents, error } = await supabase.from('agents').select('*');
  if (error) { console.error(error); return; }

  // Mapeamento de dados de elite para os Mentores e Agentes Principais
  const eliteData = {
    'Peter Thiel': {
      motto: "Zero up to One: vertical progress is superior to globalization.",
      beliefs: [
        "Monopolies are the engine of progress",
        "Higher education is a bubble",
        "Freedom and democracy are not always compatible",
        "The next Bill Gates won't build an operating system"
      ],
      achievements: [
        "Co-founded PayPal (CEO)",
        "First outside investor in Facebook",
        "Founded Palantir Technologies",
        "Author of Zero to One"
      ]
    },
    'Elon Musk': {
      motto: "Constantly seek criticism. A well-thought-out critique is as valuable as gold.",
      beliefs: [
        "Humanity must be multi-planetary",
        "AI is a fundamental risk to civilization",
        "First principles thinking over reasoning by analogy",
        "Never give up on critical missions"
      ],
      achievements: [
        "Founded SpaceX (Reusable Rockets)",
        "CEO of Tesla (EV Revolution)",
        "Co-founded PayPal",
        "Founded Neuralink & The Boring Company"
      ]
    },
    'Flávio Augusto': {
      motto: "Dedicação é o melhor caminho para o sucesso. Geração de Valor.",
      beliefs: [
        "Empreender é a única via para a liberdade real",
        "A estabilidade não existe",
        "Vender é uma arte que todos devem dominar",
        "O fracasso é um professor, não um fim"
      ],
      achievements: [
        "Fundou a Wise Up",
        "Comprou o Orlando City (MLS)",
        "Criou o movimento Geração de Valor",
        "Bilionário Self-made brasileiro"
      ]
    },
    'Joel Jota': {
      motto: "O sucesso é treinável. Saúde, família e trabalho.",
      beliefs: [
        "A disciplina vence o talento",
        "Estar 100% presente em cada tarefa",
        "Rotina de elite gera resultados de elite",
        "O trabalho devolve sempre"
      ],
      achievements: [
        "Nadador da Seleção Brasileira (30+ medalhas)",
        "Top #1 Podcast de Negócios (Jota Jota)",
        "Mentor de performance de campeões mundiais",
        "Autor best-seller (O Sucesso é Treinável)"
      ]
    },
    'Thiago Nigro': {
      motto: "Quem planta valor, colhe resultado.",
      beliefs: [
        "Dinheiro é ferramenta para tempo",
        "O mérito é o motor da riqueza",
        "Errar pequeno para aprender grande",
        "Investir é para todos através da educação"
      ],
      achievements: [
        "Criou o canal O Primo Rico",
        "Fundou o Grupo Primo",
        "Autor de Do Mil ao Milhão",
        "Lançou a plataforma Finclass"
      ]
    },
    'Talles Gomes': {
      motto: "Ter uma ideia é fácil, difícil é executar. Nada Easy.",
      beliefs: [
        "Execução é o único diferencial competitivo",
        "Validar rápido e errar barato",
        "Gestão por meritocracia radical",
        "Educação prática transforma empresas"
      ],
      achievements: [
        "Fundou Easy Taxi (Expansão Global)",
        "Fundou Singu (Exit para Natura)",
        "Co-fundou G4 Educação",
        "Autor de Nada Easy"
      ]
    },
    'Alex Hormozi': {
      motto: "Make an offer so good people feel stupid saying no.",
      beliefs: [
        "Volume negates luck",
        "Pain motivates faster than pleasure",
        "Input controls output",
        "Acquisition is the most valuable skill"
      ],
      achievements: [
        "Founded Acquisition.com",
        "Grew and exited Gym Launch ($46M)",
        "Author of $100M Offers",
        "Scaled multiple companies to 9 figures"
      ]
    },
    'Linus Torvalds': {
      motto: "Talk is cheap. Show me the code.",
      beliefs: [
        "Open source is the superior way to build",
        "Pragmatism over dogma",
        "Simple architecture is better than complex features",
        "Code quality is non-negotiable"
      ],
      achievements: [
        "Created Linux Kernel",
        "Developed Git (Version Control)",
        "Millennium Technology Prize winner",
        "Changed the world of software forever"
      ]
    },
    'Kim Scott': {
      motto: "Radical Candor: Care personally, challenge directly.",
      beliefs: [
        "Clarity is kindness",
        "Quiet the ego to hear the truth",
        "Relationships, not power, drive growth",
        "Feedback is a gift"
      ],
      achievements: [
        "Author of Radical Candor",
        "Executive at Google & Apple",
        "Coach to Silicon Valley CEOs",
        "Co-founded Radical Candor Inc."
      ]
    }
  };

  console.log(`🚀 Processando ${agents.length} agentes para enriquecimento final...`);

  for (const agent of agents) {
    let update = {};
    const elite = eliteData[agent.name];

    if (elite) {
      update = {
        motto: elite.motto,
        beliefs: elite.beliefs,
        achievements: elite.achievements
      };
    } else {
      // Para os outros, geramos baseado no 'soul' e 'identity' já existentes no Supabase
      const mottoText = agent.soul ? agent.soul.split('.')[0] + '!' : "Excelência e Execução!";
      const beliefsList = agent.soul ? agent.soul.split('.').slice(0, 3).map(s => s.trim()).filter(s => s.length > 5) : ["Trabalho duro", "Foco no resultado"];
      const achievementsList = agent.results ? agent.results.split(',').map(r => r.trim()) : ["Recorde de performance", "Impacto no ecossistema"];

      update = {
        motto: mottoText,
        beliefs: beliefsList,
        achievements: achievementsList.slice(0, 4)
      };
    }

    const { error: updateError } = await supabase.from('agents').update(update).eq('id', agent.id);
    if (updateError) console.error(`❌ Erro em ${agent.name}:`, updateError);
    else console.log(`✅ [MASTER] ${agent.name}: Lemas e Feitos sincronizados.`);
  }

  console.log('🏁 NEXUS ULTIMATE ENRICHMENT: GRANDES FEITOS E CRENÇAS INJETADOS COM SUCESSO.');
}

run();
