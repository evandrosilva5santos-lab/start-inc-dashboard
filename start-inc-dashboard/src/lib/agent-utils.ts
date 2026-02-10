import { Agent } from '@/types';

export const DEPARTMENTS = ["Strategy", "Revenue", "Product", "Tech", "People", "Finance"] as const;
export type Department = typeof DEPARTMENTS[number];

export function isMentor(agent: Agent): boolean {
    const r = (agent.role || '').toLowerCase();
    const n = (agent.name || '');
    // Mentor keywords
    if (r.includes('mentor') || r.includes('advisor') || r.includes('conselheiro')) return true;

    // Known mentors list - eventually this should be a flag in the DB
    const knownMentors = [
        'Flávio Augusto', 'Joel Jota', 'Thiago Nigro', 'Tim Ferriss',
        'Peter Thiel', 'Linus Torvalds', 'Kim Scott', 'Hilary Mason', 'Des Traynor'
    ];
    return knownMentors.includes(n);
}

export function isVisionOnly(agent: Agent): boolean {
    return agent.name.includes('Tim Ferriss') || (agent.role || '').includes('Vision Only');
}

export function getDept(agent: Agent): Department {
    const deptAttr = (agent.department || '').toLowerCase();
    const roleAttr = (agent.role || '').toLowerCase();
    const nameAttr = (agent.name || '').toLowerCase();

    // High Command
    if (nameAttr === 'vision' || nameAttr === 'jarvis' || nameAttr === 'evandro') return "Strategy";

    // Explicit Department Mapping
    if (deptAttr.includes('estratégia') || deptAttr.includes('strategy')) return "Strategy";
    if (deptAttr.includes('marketing') || deptAttr.includes('vendas') ||
        deptAttr.includes('receita') || deptAttr.includes('revenue') ||
        deptAttr.includes('lançamentos') || deptAttr.includes('growth')) return "Revenue";
    if (deptAttr.includes('product') || deptAttr.includes('produto') ||
        deptAttr.includes('copywriting') || deptAttr.includes('conteúdo')) return "Product";
    if (deptAttr.includes('tech') || deptAttr.includes('tecnologia') ||
        deptAttr.includes('ia') || deptAttr.includes('dados')) return "Tech";
    if (deptAttr.includes('people') || deptAttr.includes('rh') ||
        deptAttr.includes('cultura')) return "People";
    if (deptAttr.includes('finance') || deptAttr.includes('finanças') ||
        deptAttr.includes('conselho')) return "Finance";

    // Role-based Fallback
    if (roleAttr.includes('ceo') || roleAttr.includes('cso') || roleAttr.includes('coo') || roleAttr.includes('diretor')) return "Strategy";
    if (roleAttr.includes('copy') || roleAttr.includes('vsl') || roleAttr.includes('funil') || roleAttr.includes('anúncios') || roleAttr.includes('tráfego')) return "Revenue";
    if (roleAttr.includes('produto') || roleAttr.includes('product') || roleAttr.includes('ux') || roleAttr.includes('design')) return "Product";
    if (roleAttr.includes('cto') || roleAttr.includes('dev') || roleAttr.includes('arquiteto') || roleAttr.includes('ia')) return "Tech";
    if (roleAttr.includes('rh') || roleAttr.includes('psicologia') || roleAttr.includes('cultura')) return "People";
    if (roleAttr.includes('cfo') || roleAttr.includes('finance') || roleAttr.includes('macro')) return "Finance";

    return "Strategy";
}

export const translateLevel = (level: string) => {
    switch (level) {
        case 'strategic': return 'Estratégico';
        case 'tactical': return 'Tático';
        case 'operational': return 'Operacional';
        default: return level;
    }
};

export function getAgentAccent(agent: Agent) {
    const dept = getDept(agent);
    let color = '#38bdf8'; // default blue
    let colorClass = 'cyan';

    switch (dept) {
        case 'Strategy': color = '#a855f7'; colorClass = 'purple'; break;
        case 'Revenue': color = '#dc2626'; colorClass = 'red'; break; // Changed to red for aggressive revenue
        case 'Product': color = '#facc15'; colorClass = 'yellow'; break;
        case 'Tech': color = '#06b6d4'; colorClass = 'cyan'; break;
        case 'People': color = '#f43f5e'; colorClass = 'rose'; break;
        case 'Finance': color = '#f97316'; colorClass = 'orange'; break;
    }

    return { color, colorClass };
}

export const getLevelStyles = (level: string, accentClass: string) => {
    // Map for safe Tailwind class extraction (avoiding dynamic interpolation issues)
    const colorStyles: Record<string, string> = {
        purple: 'border-purple-500/30 group-hover:border-purple-400/60 shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]',
        red: 'border-red-500/30 group-hover:border-red-400/60 shadow-[0_0_20px_rgba(220,38,38,0.1)] hover:shadow-[0_0_30px_rgba(220,38,38,0.2)]',
        yellow: 'border-yellow-500/30 group-hover:border-yellow-400/60 shadow-[0_0_20px_rgba(250,204,21,0.1)] hover:shadow-[0_0_30px_rgba(250,204,21,0.2)]',
        cyan: 'border-cyan-500/30 group-hover:border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]',
        blue: 'border-cyan-500/30 group-hover:border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]', // Fallback to cyan for tech
        rose: 'border-rose-500/30 group-hover:border-rose-400/60 shadow-[0_0_20px_rgba(244,63,94,0.1)] hover:shadow-[0_0_30px_rgba(244,63,94,0.2)]',
        orange: 'border-orange-500/30 group-hover:border-orange-400/60 shadow-[0_0_20px_rgba(249,115,22,0.1)] hover:shadow-[0_0_30px_rgba(249,115,22,0.2)]',
    };

    const baseStyle = `glass-panel backdrop-blur-2xl transition-all duration-500`;
    const accentStyle = colorStyles[accentClass] || colorStyles.cyan;

    const styles: Record<string, string> = {
        strategic: `${baseStyle} ${accentStyle} bg-gradient-to-br from-white/[0.05] to-transparent`,
        tactical: `${baseStyle} ${accentStyle} bg-white/[0.02]`,
        operational: `${baseStyle} border-white/10 hover:border-white/20 hover:bg-white/[0.04] opacity-80 hover:opacity-100`
    };
    return styles[level] || styles.operational;
};
