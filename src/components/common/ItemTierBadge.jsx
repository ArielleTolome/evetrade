import { useMemo } from 'react';

// Item tier patterns and their configurations
const TIER_PATTERNS = [
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
function detectTier(itemName) {
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
function estimateMetaLevel(tier) {
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

/**
 * Item Tier Badge Component
 * Displays item quality/meta level information for EVE Online items
 *
 * @param {string} itemName - Name of the item to detect tier from
 * @param {boolean} showMetaLevel - Whether to display the estimated meta level
 * @param {boolean} compact - Use compact styling for smaller spaces
 */
export function ItemTierBadge({ itemName, showMetaLevel = false, compact = false }) {
  const { tierInfo, metaLevel } = useMemo(() => {
    const tierInfo = detectTier(itemName);
    const metaLevel = estimateMetaLevel(tierInfo.tier);
    return { tierInfo, metaLevel };
  }, [itemName]);

  if (compact) {
    return (
      <span
        className={`px-1.5 py-0.5 text-xs rounded ${tierInfo.bg} ${tierInfo.color} font-medium`}
        title={tierInfo.desc}
      >
        {tierInfo.label}
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 group relative">
      <span
        className={`px-2 py-0.5 text-xs rounded border ${tierInfo.bg} ${tierInfo.border} ${tierInfo.color} font-medium`}
      >
        {tierInfo.label}
      </span>

      {showMetaLevel && metaLevel > 0 && (
        <span className="text-xs text-text-secondary">
          M{metaLevel}
        </span>
      )}

      {/* Tooltip */}
      <div className="absolute left-0 bottom-full mb-2 px-3 py-2 bg-space-black border border-accent-cyan/30 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className={`font-medium ${tierInfo.color}`}>{tierInfo.label}</div>
        <div className="text-text-secondary">{tierInfo.desc}</div>
        {metaLevel > 0 && (
          <div className="mt-1 text-text-secondary">Meta Level: {metaLevel}</div>
        )}
      </div>
    </div>
  );
}

// Export helpers
export { detectTier, estimateMetaLevel, TIER_PATTERNS };
export default ItemTierBadge;
