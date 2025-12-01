import { useState, useEffect, useMemo } from 'react';
import { useEveAuth } from '../../hooks/useEveAuth';
import { getCharacterAssets, getTypeNames, getStationInfo, getStructureInfo } from '../../api/esi';
import { formatISK, formatNumber } from '../../utils/formatters';
import { GlassmorphicCard } from './GlassmorphicCard';

/**
 * Assets Inventory Component
 * Displays character assets across stations/structures
 */
export function AssetsInventory() {
  const { isAuthenticated, character, getAccessToken } = useEveAuth();
  const [assets, setAssets] = useState([]);
  const [typeNames, setTypeNames] = useState({});
  const [locationNames, setLocationNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Load assets when authenticated
  useEffect(() => {
    if (isAuthenticated && character?.id) {
      loadAssets();
    }
  }, [isAuthenticated, character?.id]);

  const loadAssets = async () => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      // Fetch all pages of assets
      let allAssets = [];
      let page = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const pageAssets = await getCharacterAssets(character.id, accessToken, page);
        if (pageAssets && pageAssets.length > 0) {
          allAssets = [...allAssets, ...pageAssets];
          page++;
          // ESI returns empty array when no more pages
          if (pageAssets.length < 1000) {
            hasMorePages = false;
          }
        } else {
          hasMorePages = false;
        }
      }

      setAssets(allAssets || []);

      // Get unique type IDs and fetch names
      const typeIds = [...new Set(allAssets.map((a) => a.type_id))];
      if (typeIds.length > 0) {
        const names = await getTypeNames(typeIds);
        const nameMap = {};
        names.forEach((n) => {
          nameMap[n.id] = n.name;
        });
        setTypeNames(nameMap);
      }

      // Get unique location IDs and fetch names
      const locationIds = [...new Set(allAssets.map((a) => a.location_id))];
      await fetchLocationNames(locationIds, accessToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch location names for stations and structures
  const fetchLocationNames = async (locationIds, accessToken) => {
    const locationMap = {};

    for (const locationId of locationIds) {
      try {
        // Station IDs are typically < 70000000, structure IDs are much larger
        if (locationId >= 1000000000000) {
          // Player structure
          const structure = await getStructureInfo(locationId, accessToken);
          locationMap[locationId] = structure.name || `Structure ${locationId}`;
        } else {
          // NPC station
          const station = await getStationInfo(locationId);
          locationMap[locationId] = station.name || `Station ${locationId}`;
        }
      } catch (err) {
        // If we can't fetch the name, use a fallback
        locationMap[locationId] = `Location ${locationId}`;
      }
    }

    setLocationNames(locationMap);
  };

  // Group assets by location
  const assetsByLocation = useMemo(() => {
    const grouped = {};

    assets.forEach((asset) => {
      // Only show top-level assets (not items inside containers)
      if (asset.location_flag === 'Hangar' || !asset.location_flag) {
        const locationId = asset.location_id;
        if (!grouped[locationId]) {
          grouped[locationId] = [];
        }
        grouped[locationId].push(asset);
      }
    });

    return grouped;
  }, [assets]);

  // Get unique locations for filter
  const locations = useMemo(() => {
    return Object.keys(assetsByLocation).map((locationId) => ({
      id: locationId,
      name: locationNames[locationId] || `Location ${locationId}`,
      count: assetsByLocation[locationId].length,
    }));
  }, [assetsByLocation, locationNames]);

  // Filter assets by selected location
  const filteredAssetsByLocation = useMemo(() => {
    if (selectedLocation === 'all') return assetsByLocation;
    return { [selectedLocation]: assetsByLocation[selectedLocation] };
  }, [assetsByLocation, selectedLocation]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalItems = assets.filter(
      (a) => a.location_flag === 'Hangar' || !a.location_flag
    ).reduce((sum, a) => sum + a.quantity, 0);

    const uniqueTypes = new Set(
      assets
        .filter((a) => a.location_flag === 'Hangar' || !a.location_flag)
        .map((a) => a.type_id)
    ).size;

    const totalLocations = Object.keys(assetsByLocation).length;

    return {
      totalItems,
      uniqueTypes,
      totalLocations,
    };
  }, [assets, assetsByLocation]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <GlassmorphicCard className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl text-text-primary">Assets Inventory</h3>
        <div className="flex items-center gap-3">
          {/* Location Filter */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary"
          >
            <option value="all">All Locations ({stats.totalLocations})</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.count})
              </option>
            ))}
          </select>

          {/* Refresh */}
          <button
            onClick={loadAssets}
            disabled={loading}
            className="p-2 text-text-secondary hover:text-accent-cyan transition-colors"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 rounded-lg bg-space-dark/50">
          <div className="text-lg font-bold text-accent-cyan">{formatNumber(stats.totalItems, 0)}</div>
          <div className="text-xs text-text-secondary">Total Items</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-space-dark/50">
          <div className="text-lg font-bold text-accent-gold">{formatNumber(stats.uniqueTypes, 0)}</div>
          <div className="text-xs text-text-secondary">Unique Types</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-space-dark/50">
          <div className="text-lg font-bold text-green-400">{stats.totalLocations}</div>
          <div className="text-xs text-text-secondary">Locations</div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
          <span className="ml-2 text-text-secondary text-sm">Loading assets...</span>
        </div>
      )}

      {/* Assets by Location */}
      {!loading && Object.keys(filteredAssetsByLocation).length > 0 && (
        <div className="space-y-6">
          {Object.entries(filteredAssetsByLocation).map(([locationId, locationAssets]) => (
            <div key={locationId} className="border border-accent-cyan/10 rounded-lg p-4">
              {/* Location Header */}
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-text-primary">
                  {locationNames[locationId] || `Location ${locationId}`}
                </h4>
                <span className="text-sm text-text-secondary">
                  {locationAssets.length} items
                </span>
              </div>

              {/* Assets Table */}
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-space-dark">
                    <tr className="text-text-secondary border-b border-accent-cyan/20">
                      <th className="text-left py-2 px-3">Item</th>
                      <th className="text-right py-2 px-3">Quantity</th>
                      <th className="text-left py-2 px-3">Location Flag</th>
                      <th className="text-left py-2 px-3">Packaged</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locationAssets
                      .sort((a, b) => {
                        const nameA = typeNames[a.type_id] || '';
                        const nameB = typeNames[b.type_id] || '';
                        return nameA.localeCompare(nameB);
                      })
                      .map((asset, index) => (
                        <tr
                          key={`${asset.item_id}-${index}`}
                          className="border-b border-accent-cyan/10 hover:bg-white/5"
                        >
                          <td className="py-2 px-3 text-text-primary">
                            {typeNames[asset.type_id] || `Type ${asset.type_id}`}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-accent-cyan">
                            {formatNumber(asset.quantity, 0)}
                          </td>
                          <td className="py-2 px-3 text-text-secondary capitalize text-xs">
                            {(asset.location_flag || 'Hangar').replace(/([A-Z])/g, ' $1').trim()}
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              asset.is_singleton
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-green-500/20 text-green-400'
                            }`}>
                              {asset.is_singleton ? 'Fitted' : 'Packaged'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && Object.keys(filteredAssetsByLocation).length === 0 && (
        <div className="text-center py-8 text-text-secondary">
          No assets found
        </div>
      )}
    </GlassmorphicCard>
  );
}

export default AssetsInventory;
