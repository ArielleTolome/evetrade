import { useMemo } from 'react';
import { detectTier, estimateMetaLevel } from './ItemTierBadge.constants';


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

export default ItemTierBadge;
