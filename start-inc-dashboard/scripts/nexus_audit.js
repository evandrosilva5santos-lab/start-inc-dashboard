const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data: agents, error } = await supabase.from('agents').select('*');
  if (error) { console.error(error); return; }

  const report = agents.map(a => {
    const missing = [];
    if (!a.soul) missing.push('soul');
    if (!a.identity) missing.push('identity');
    if (!a.profile) missing.push('profile');
    if (!a.competencies) missing.push('competencies');
    if (!a.results) missing.push('results');
    if (!a.emoji) missing.push('emoji');
    if (!a.responsibilities || a.responsibilities.length === 0) missing.push('responsibilities');
    if (!a.decisions || a.decisions.length === 0) missing.push('decisions');
    if (!a.inputs || a.inputs.length === 0) missing.push('inputs');
    if (!a.outputs || a.outputs.length === 0) missing.push('outputs');
    if (!a.knowledge_base || a.knowledge_base.length === 0) missing.push('knowledge_base');

    return { name: a.name, level: a.level, missingCount: missing.length, missingFields: missing };
  });

  // Sort by level priority: strategic -> tactical -> operational
  const levelOrder = { 'strategic': 0, 'tactical': 1, 'operational': 2 };
  report.sort((a, b) => {
    if (levelOrder[a.level] !== levelOrder[b.level]) {
      return levelOrder[a.level] - levelOrder[b.level];
    }
    return b.missingCount - a.missingCount;
  });

  console.log('--- NEXUS AUDIT REPORT ---');
  report.forEach(r => {
    if (r.missingCount > 0) {
      console.log(`[${r.level.toUpperCase()}] ${r.name}: ${r.missingCount} missing (${r.missingFields.join(', ')})`);
    } else {
      console.log(`[${r.level.toUpperCase()}] ${r.name}: COMPLETE ✅`);
    }
  });
}
run();
