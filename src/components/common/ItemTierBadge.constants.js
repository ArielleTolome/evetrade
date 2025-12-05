// Item tier patterns and their configurations
export const TIER_PATTERNS = [
  {
    pattern: /Officer|'s Modified$/i,
    tier: 'officer',
    label: 'Officer',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/50',
    desc: 'Best-in-slot faction modules'
  },
  {
    pattern: /Deadspace|A-Type|B-Type|C-Type|X-Type/i,
    tier: 'deadspace',
    label: 'Deadspace',
    color: 'text-red-300',
    bg: 'bg-red-500/20',
    border: 'border-red-500/50',
    desc: 'High-end PvE drops'
  },
  {
    pattern: /Navy|Fleet|Federation|Republic|State|Empire/i,
    tier: 'faction',
    label: 'Faction',
    color: 'text-purple-300',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/50',
    desc: 'Faction warfare modules'
  },
  {
    pattern: / II$/i,
    tier: 't2',
    label: 'T2',
    color: 'text-yellow-300',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/50',
    desc: 'Tech II - Requires skills'
  },
  {
    pattern: /Strategic Cruiser|Subsystem/i,
    tier: 't3',
    label: 'T3',
    color: 'text-green-300',
    bg: 'bg-green-500/20',
    border: 'border-green-500/50',
    desc: 'Tech III - Modular ships'
  },
  {
    pattern: /Storyline/i,
    tier: 'storyline',
    label: 'Story',
    color: 'text-cyan-300',
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/50',
    desc: 'Mission reward items'
  },
  {
    pattern: /Blueprint/i,
    tier: 'blueprint',
    label: 'BPC/BPO',
    color: 'text-blue-300',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50',
    desc: 'Manufacturing blueprint'
  },
  {
    pattern: /SKIN/i,
    tier: 'skin',
    label: 'SKIN',
    color: 'text-pink-300',
    bg: 'bg-pink-500/20',
    border: 'border-pink-500/50',
    desc: 'Ship skin'
  },
  {
    pattern: /Prototype|Experimental|Limited/i,
    tier: 'meta',
    label: 'Meta',
    color: 'text-slate-300',
    bg: 'bg-slate-500/20',
    border: 'border-slate-500/50',
    desc: 'Named meta module'
  },
];

const DEFAULT_TIER = {
  tier: 't1',
  label: 'T1',
  color: 'text-slate-400',
  bg: 'bg-slate-600/20',
  border: 'border-slate-600/30',
  desc: 'Tech I - Basic module'
};

/**
 * Detect item tier from item name
 */
export function detectTier(itemName) {
  if (!itemName) return DEFAULT_TIER;

  for (const tierConfig of TIER_PATTERNS) {
    if (tierConfig.pattern.test(itemName)) {
      return tierConfig;
    }
  }

  return DEFAULT_TIER;
}

/**
 * Estimate meta level from item characteristics
 * In production, this would come from item data
 */
export function estimateMetaLevel(tier) {
  switch (tier) {
    case 'officer': return 14;
    case 'deadspace': return 12;
    case 'faction': return 8;
    case 't2': return 5;
    case 't3': return 5;
    case 'storyline': return 6;
    case 'meta': return 3;
    default: return 0;
  }
}
