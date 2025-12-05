import { useState, useCallback, useMemo, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { Button } from '../components/common/Button';
import PullToRefresh from '../components/common/PullToRefresh';
import { ProfitDistribution } from '../components/common/ProfitDistribution';
import { FormInput, FormSelect, RegionAutocomplete } from '../components/forms';
import { TradingTable } from '../components/tables';
import { SkeletonTable } from '../components/common/SkeletonLoader';
import { useResources } from '../hooks/useResources';
import { useApiCall } from '../hooks/useApiCall';
import { DataFreshnessIndicator } from '../components/common/DataFreshnessIndicator';
import { RegionPresets } from '../components/common/TradeHubPresets';
import { ActionableError } from '../components/common/ActionableError';
import { useToast } from '../components/common/ToastProvider';
import { usePortfolio } from '../hooks/usePortfolio';
import { useEveAuth } from '../hooks/useEveAuth';
import { fetchRegionHauling } from '../api/trading';
import { getCharacterAssets, getWalletBalance, getTypeNames, getStationInfo, getStructureInfo, getRegionFromSystem } from '../api/esi';
import { formatISK, formatNumber, formatPercent, formatCompact } from '../utils/formatters';
import {
  TAX_OPTIONS,
  TRADE_PREFERENCE_OPTIONS,
} from '../utils/constants';
import { getRegionData } from '../utils/stations';

/**
 * Region Hauling Page Component
 */
export function RegionHaulingPage() {
  const { universeList, nearbyRegions, loading: resourcesLoading } = useResources();
  const { data, loading, error, lastUpdated, execute } = useApiCall(fetchRegionHauling);
  const { saveRoute } = usePortfolio();
  const { isAuthenticated, character, getAccessToken } = useEveAuth();
  const toast = useToast();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [routeName, setRouteName] = useState('');

  // Form state
  const [form, setForm] = useState({
    fromRegion: '',
    toRegion: '',
    useNearby: false,
    fromPreference: 'sell',
    toPreference: 'buy',
    minProfit: 1000000,
    maxWeight: 30000,
    minROI: 5,
    maxBudget: 1000000000,
    tax: 0.0375,
  });

  // EVE auth state
  const [showOnlyWithAssets, setShowOnlyWithAssets] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [assetsError, setAssetsError] = useState(null);
  // Combine related state objects to prevent race conditions
  const [assetMetadata, setAssetMetadata] = useState({
    typeNames: {},
    locationNames: {},
    regionNames: {},
  });

  // Form error state
  const [formError, setFormError] = useState(null);

  // Copy to clipboard helper
  const copyToClipboard = useCallback(async (text, message = 'Copied!') => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy');
    }
  }, [toast]);

  // Copy trade details for in-game use
  const copyTradeDetails = useCallback((item) => {
    const itemName = item.Item || item.name;
    const fromLocation = typeof item.From === 'object' ? item.From.name : item.From;
    const toLocation = typeof item['Take To'] === 'object' ? item['Take To'].name : item['Take To'];
    const buyPrice = item['Buy Price'] || item.buyPrice || 0;
    const sellPrice = item['Sell Price'] || item.sellPrice || 0;
    const quantity = item.Quantity || item.quantity || 0;
    const profit = item.Profit || item.profit || 0;
    const roi = item.ROI || item.roi || 0;
    const jumps = item.Jumps || item.jumps || 0;

    const text = `${itemName}
Buy at: ${fromLocation}
Buy Price: ${formatISK(buyPrice, false)}
Sell at: ${toLocation}
Sell Price: ${formatISK(sellPrice, false)}
Quantity: ${formatNumber(quantity, 0)}
Profit: ${formatISK(profit, false)}
ROI: ${formatPercent(roi / 100, 1)}
Jumps: ${jumps}`;

    copyToClipboard(text, 'Trade details copied!');
  }, [copyToClipboard]);

  // Copy just the item name
  const copyItemName = useCallback((itemName) => {
    copyToClipboard(itemName, 'Item name copied!');
  }, [copyToClipboard]);

  // Get nearby regions for selected origin
  const nearbyRegionsList = useMemo(() => {
    if (!form.fromRegion || !nearbyRegions) return [];
    return nearbyRegions[form.fromRegion] || [];
  }, [form.fromRegion, nearbyRegions]);

  // Update form field
  const updateForm = useCallback((key, value) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      // Reset toRegion when switching to nearby (in single state update)
      if (key === 'useNearby' && value) {
        updated.toRegion = 'Nearby Regions';
      }
      return updated;
    });
  }, []);

  // Load assets and wallet when authenticated
  useEffect(() => {
    if (isAuthenticated && character?.id) {
      loadAssetsAndWallet();
    }
  }, [isAuthenticated, character?.id, loadAssetsAndWallet]);

  const loadAssetsAndWallet = useCallback(async () => {
    setAssetsLoading(true);
    setAssetsError(null);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      // Load wallet balance
      const balance = await getWalletBalance(character.id, accessToken);
      setWalletBalance(balance);

      // Load all assets
      let allAssets = [];
      let page = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const pageAssets = await getCharacterAssets(character.id, accessToken, page);
        if (pageAssets && pageAssets.length > 0) {
          allAssets = [...allAssets, ...pageAssets];
          page++;
          if (pageAssets.length < 1000) {
            hasMorePages = false;
          }
        } else {
          hasMorePages = false;
        }
      }

      // Filter to only hangar items
      const hangarAssets = allAssets.filter(
        (a) => a.location_flag === 'Hangar' || !a.location_flag
      );
      setAssets(hangarAssets);

      // Get type names
      const typeIds = [...new Set(hangarAssets.map((a) => a.type_id))];
      const nameMap = {};
      if (typeIds.length > 0) {
        const names = await getTypeNames(typeIds);
        names.forEach((n) => {
          nameMap[n.id] = n.name;
        });
      }

      // Get location names and map to regions
      const locationIds = [...new Set(hangarAssets.map((a) => a.location_id))];
      const locationMap = {};
      const regionMap = {};

      for (const locationId of locationIds) {
        try {
          if (locationId >= 1000000000000) {
            const structure = await getStructureInfo(locationId, accessToken);
            locationMap[locationId] = structure?.name || `Structure ${locationId}`;
            if (structure?.solar_system_id) {
              // Map structure's solar system to region
              try {
                const regionData = await getRegionFromSystem(structure.solar_system_id);
                regionMap[locationId] = regionData?.regionName || 'Unknown Region';
              } catch {
                regionMap[locationId] = 'Unknown Region';
              }
            } else {
              regionMap[locationId] = 'Unknown Region';
            }
          } else {
            const station = await getStationInfo(locationId);
            locationMap[locationId] = station?.name || `Station ${locationId}`;
            if (station?.system_id && universeList) {
              // Find region from universeList using station name
              const stationData = Object.values(universeList).find(
                (s) => s.station === locationId
              );
              regionMap[locationId] = stationData?.regionName || 'Unknown Region';
            } else {
              regionMap[locationId] = 'Unknown Region';
            }
          }
        } catch {
          locationMap[locationId] = `Location ${locationId}`;
          regionMap[locationId] = 'Unknown Region';
        }
      }

      // Update all metadata in a single state update to prevent race conditions
      setAssetMetadata({
        typeNames: nameMap,
        locationNames: locationMap,
        regionNames: regionMap,
      });
    } catch (err) {
      console.error('Failed to load assets:', err);
      setAssetsError(err.message || 'Failed to load assets and wallet');
      toast.error('Failed to load character assets');
    } finally {
      setAssetsLoading(false);
    }
  }, [character?.id, getAccessToken, toast, universeList]);

  // Get region ID from name
  const getRegionId = useCallback(
    (regionName) => {
      if (!universeList) return null;

      const regionData = getRegionData(regionName, universeList);
      return regionData?.region || null;
    },
    [universeList]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Clear any previous form errors
      setFormError(null);

      const fromId = getRegionId(form.fromRegion);
      if (!fromId) {
        setFormError('Please select a valid origin region');
        return;
      }

      let toParam;
      if (form.useNearby) {
        // Use nearby regions
        toParam = `${form.toPreference}-nearby`;
      } else {
        const toId = getRegionId(form.toRegion);
        if (!toId) {
          setFormError('Please select a valid destination region');
          return;
        }
        toParam = `${form.toPreference}-${toId}`;
      }

      const fromParam = `${form.fromPreference}-${fromId}`;

      try {
        await execute({
          from: fromParam,
          to: toParam,
          minProfit: form.minProfit,
          maxWeight: form.maxWeight,
          minROI: form.minROI,
          maxBudget: form.maxBudget,
          tax: form.tax,
        });
      } catch (err) {
        console.error('Hauling request failed:', err);
      }
    },
    [form, getRegionId, execute]
  );

  // Option arrays for dropdowns
  const taxOptions = useMemo(() => TAX_OPTIONS.map((o) => ({ value: o.value, label: o.label })), []);
  const prefOptions = useMemo(() => TRADE_PREFERENCE_OPTIONS.map((o) => ({ value: o.value, label: o.label })), []);

  // Helper to check if user has item at origin location/region
  const hasAssetAtLocation = useCallback(
    (itemName, locationName) => {
      if (!assets.length || !itemName || !locationName) return false;

      // Find matching location by name
      const matchingLocation = Object.entries(assetMetadata.locationNames).find(
        ([_, name]) => name === locationName
      );
      if (!matchingLocation) return false;

      const locationId = parseInt(matchingLocation[0]);

      // Find matching type by name
      const matchingType = Object.entries(assetMetadata.typeNames).find(
        ([_, name]) => name === itemName
      );
      if (!matchingType) return false;

      const typeId = parseInt(matchingType[0]);

      // Check if we have this item at this location
      return assets.some(
        (asset) => asset.location_id === locationId && asset.type_id === typeId
      );
    },
    [assets, assetMetadata.locationNames, assetMetadata.typeNames]
  );

  // Helper to check if user has item in region
  const hasAssetInRegion = useCallback(
    (itemName, regionName) => {
      if (!assets.length || !itemName || !regionName) return false;

      // Find matching type by name
      const matchingType = Object.entries(assetMetadata.typeNames).find(
        ([_, name]) => name === itemName
      );
      if (!matchingType) return false;

      const typeId = parseInt(matchingType[0]);

      // Check if we have this item in any location in this region
      return assets.some((asset) => {
        if (asset.type_id !== typeId) return false;
        const assetRegion = assetMetadata.regionNames[asset.location_id];
        return assetRegion === regionName;
      });
    },
    [assets, assetMetadata.typeNames, assetMetadata.regionNames]
  );

  // Count assets at origin region
  const assetsAtOrigin = useMemo(() => {
    if (!isAuthenticated || !assets.length || !form.fromRegion) return 0;

    // Count items in origin region
    return assets.filter((asset) => {
      const assetRegion = assetMetadata.regionNames[asset.location_id];
      return assetRegion === form.fromRegion;
    }).length;
  }, [isAuthenticated, assets, form.fromRegion, assetMetadata.regionNames]);

  // Filter data based on asset ownership
  const filteredData = useMemo(() => {
    if (!data || !showOnlyWithAssets || !isAuthenticated) return data;

    return data.filter((item) => {
      const fromLocation = typeof item.From === 'object' ? item.From.name : item.From;
      const itemName = item.Item || item.name;

      // For region hauling, we match by region name extracted from location
      // Check if the item exists in the origin region
      return hasAssetInRegion(itemName, form.fromRegion) || hasAssetAtLocation(itemName, fromLocation);
    });
  }, [data, showOnlyWithAssets, isAuthenticated, hasAssetInRegion, hasAssetAtLocation, form.fromRegion]);

  // Table columns configuration
  const tableColumns = useMemo(
    () => [
      {
        key: 'Item',
        label: 'Item',
        className: 'font-medium min-w-[180px]',
        render: (data, row) => {
          const itemName = row.Item || row.name;
          const fromLocation = typeof row.From === 'object' ? row.From.name : row.From;
          const hasAsset = isAuthenticated && (
            hasAssetInRegion(itemName, form.fromRegion) ||
            hasAssetAtLocation(itemName, fromLocation)
          );

          return (
            <div className="flex items-center gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  copyItemName(itemName);
                }}
                variant="ghost"
                size="sm"
                className="p-1 h-auto min-h-0"
                title="Copy item name"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </Button>
              <span className="truncate">{itemName}</span>
              {hasAsset && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex-shrink-0">
                  Owned
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: 'From',
        label: 'Buy At',
        className: 'min-w-[140px]',
        render: (data, row) => {
          const location = typeof data === 'object' ? data.name : data;
          const buyPrice = row['Buy Price'] || row.buyPrice || 0;
          return (
            <div className="flex flex-col">
              <span className="text-text-primary truncate" title={location}>{location}</span>
              {buyPrice > 0 && (
                <span className="text-xs text-red-400 font-mono">
                  Buy: {formatCompact(buyPrice)}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: 'Take To',
        label: 'Sell At',
        className: 'min-w-[140px]',
        render: (data, row) => {
          const location = typeof data === 'object' ? data.name : data;
          const sellPrice = row['Sell Price'] || row.sellPrice || 0;
          return (
            <div className="flex flex-col">
              <span className="text-text-primary truncate" title={location}>{location}</span>
              {sellPrice > 0 && (
                <span className="text-xs text-green-400 font-mono">
                  Sell: {formatCompact(sellPrice)}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: 'Quantity',
        label: 'Qty',
        type: 'num',
        className: 'text-right',
        render: (data, row) => (
          <span className="font-mono">{formatNumber(data || row.quantity, 0)}</span>
        ),
      },
      {
        key: 'Investment',
        label: 'Investment',
        type: 'num',
        className: 'text-right',
        render: (_, row) => {
          const buyPrice = row['Buy Price'] || row.buyPrice || 0;
          const quantity = row.Quantity || row.quantity || 0;
          const investment = buyPrice * quantity;
          return (
            <span className="font-mono text-text-secondary">{formatCompact(investment)}</span>
          );
        },
      },
      {
        key: 'Profit',
        label: 'Profit',
        type: 'num',
        defaultSort: true,
        className: 'text-right',
        render: (data, row) => {
          const profit = data || row.profit;
          return (
            <span className={`font-mono font-semibold ${profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {profit > 0 ? '+' : ''}{formatCompact(profit)}
            </span>
          );
        },
      },
      {
        key: 'Profit per Jump',
        label: 'ISK/Jump',
        type: 'num',
        className: 'text-right',
        render: (data, row) => {
          const iskPerJump = data || row.profitPerJump || 0;
          return (
            <span className="font-mono text-accent-cyan">{formatCompact(iskPerJump)}</span>
          );
        },
      },
      {
        key: 'ROI',
        label: 'ROI',
        type: 'num',
        className: 'text-right',
        render: (data, row) => {
          const roi = data || row.roi;
          return (
            <span className={`font-mono font-semibold ${roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {roi > 0 ? '+' : ''}{formatPercent(roi / 100, 1)}
            </span>
          );
        },
      },
      {
        key: 'Jumps',
        label: 'Jumps',
        type: 'num',
        className: 'text-center',
        render: (data, row) => {
          const jumps = data || row.jumps;
          return (
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${jumps <= 5 ? 'bg-green-500/20 text-green-400' :
              jumps <= 15 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
              {jumps || 'N/A'}
            </span>
          );
        },
      },
      {
        key: 'actions',
        label: '',
        className: 'w-10',
        render: (_, row) => (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              copyTradeDetails(row);
            }}
            variant="ghost"
            size="sm"
            className="p-2 h-auto min-h-0"
            title="Copy trade details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </Button>
        ),
      },
    ],
    [isAuthenticated, hasAssetInRegion, hasAssetAtLocation, form.fromRegion, copyItemName, copyTradeDetails]
  );

  // Handle row click - copy trade details when clicking a row
  const handleRowClick = useCallback(
    (item) => {
      copyTradeDetails(item);
    },
    [copyTradeDetails]
  );

  const handleRefresh = useCallback(async () => {
    if (form.fromRegion && (form.toRegion || form.useNearby)) {
      await handleSubmit(new Event('submit'));
      toast.info('Data refreshed!');
    }
  }, [form, handleSubmit, toast]);

  // Handle save route
  const handleSaveRoute = useCallback(() => {
    const toName = form.useNearby ? 'Nearby Regions' : form.toRegion;
    saveRoute({
      name: routeName || `${form.fromRegion} -> ${toName}`,
      type: 'region-hauling',
      from: form.fromRegion,
      to: toName,
      params: { ...form },
    });
    setShowSaveModal(false);
    setRouteName('');
  }, [form, routeName, saveRoute]);

  return (
    <PageLayout
      title="Region Hauling"
      subtitle="Find the best trades across entire regions"
    >
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Form */}
          <GlassmorphicCard className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Error Display */}
            {formError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm" role="alert">
                {formError}
              </div>
            )}

            {/* Region Selection */}
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-4">
                <RegionAutocomplete
                  label="Origin Region"
                  value={form.fromRegion}
                  onChange={(v) => updateForm('fromRegion', v)}
                  placeholder="The Forge, Domain, Sinq Laison..."
                  required
                />
                <RegionPresets
                  selectedRegion={form.fromRegion}
                  onRegionSelect={(region) => updateForm('fromRegion', region)}
                  compact
                />
                <FormSelect
                  label="Trade Preference"
                  value={form.fromPreference}
                  onChange={(v) => updateForm('fromPreference', v)}
                  options={prefOptions}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.useNearby}
                      onChange={(e) => updateForm('useNearby', e.target.checked)}
                      className="w-4 h-4 rounded border-accent-cyan/30 bg-space-dark text-accent-cyan focus:ring-accent-cyan"
                    />
                    <span className="text-sm text-text-secondary">Use nearby regions</span>
                  </label>
                </div>

                {form.useNearby ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-secondary">
                      Nearby Regions
                    </label>
                    <div className="p-3 rounded-lg bg-space-dark/50 border border-accent-cyan/20">
                      {nearbyRegionsList.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {nearbyRegionsList.map((region) => (
                            <span
                              key={region}
                              className="px-2 py-1 text-xs rounded-full bg-accent-purple/20 text-accent-purple"
                            >
                              {region}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-text-secondary/50 text-sm">
                          Select an origin region to see nearby regions
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <RegionAutocomplete
                    label="Destination Region"
                    value={form.toRegion}
                    onChange={(v) => updateForm('toRegion', v)}
                    placeholder="Select destination region..."
                    excludeRegions={[form.fromRegion]}
                    required
                  />
                )}

                <FormSelect
                  label="Trade Preference"
                  value={form.toPreference}
                  onChange={(v) => updateForm('toPreference', v)}
                  options={prefOptions}
                />
              </div>
            </div>

            {/* Other Parameters */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <FormInput
                label="Minimum Profit"
                type="number"
                value={form.minProfit}
                onChange={(v) => updateForm('minProfit', v)}
                suffix="ISK"
                min={0}
                step={100000}
              />
              <FormInput
                label="Max Cargo Weight"
                type="number"
                value={form.maxWeight}
                onChange={(v) => updateForm('maxWeight', v)}
                suffix="m³"
                min={0}
                step={1000}
              />
              <FormInput
                label="Minimum ROI"
                type="number"
                value={form.minROI}
                onChange={(v) => updateForm('minROI', v)}
                suffix="%"
                min={0}
                max={1000}
                step={1}
              />
              <FormInput
                label="Max Budget"
                type="number"
                value={form.maxBudget}
                onChange={(v) => updateForm('maxBudget', v)}
                suffix="ISK"
                min={0}
                step={10000000}
              />
            </div>

            <div className="grid sm:grid-cols-1 gap-4 md:gap-6">
              <FormSelect
                label="Sales Tax Level"
                value={form.tax}
                onChange={(v) => updateForm('tax', parseFloat(v))}
                options={taxOptions}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || resourcesLoading}
              variant="primary"
              size="lg"
              className="w-full text-base md:text-lg min-h-[44px]"
              loading={loading}
            >
              {loading ? 'Searching...' : 'Find Trades'}
            </Button>
          </form>
        </GlassmorphicCard>

        {/* EVE Auth Info Panel */}
        {isAuthenticated && (
          <GlassmorphicCard className="mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-6 text-sm">
                <div>
                  <div className="text-sm text-text-secondary mb-1">Character</div>
                  <div className="text-text-primary font-medium">{character?.name}</div>
                </div>
                {walletBalance !== null && (
                  <div>
                    <div className="text-sm text-text-secondary mb-1">Available ISK</div>
                    <div className="text-accent-cyan font-medium">{formatISK(walletBalance)}</div>
                  </div>
                )}
                {form.fromRegion && (
                  <div>
                    <div className="text-sm text-text-secondary mb-1">Assets in {form.fromRegion}</div>
                    <div className="text-accent-gold font-medium">{formatNumber(assetsAtOrigin, 0)} items</div>
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyWithAssets}
                  onChange={(e) => setShowOnlyWithAssets(e.target.checked)}
                  className="w-4 h-4 rounded border-accent-cyan/30 bg-space-dark text-accent-cyan focus:ring-accent-cyan"
                />
                <span className="text-sm text-text-secondary">Show only routes with my assets</span>
              </label>
            </div>
            {assetsLoading && (
              <div className="mt-3 flex items-center gap-2 text-text-secondary text-sm">
                <div className="w-4 h-4 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
                <span>Loading assets...</span>
              </div>
            )}
            {assetsError && (
              <div className="mt-3 text-red-400 text-sm">{assetsError}</div>
            )}
          </GlassmorphicCard>
        )}

        {/* Error */}
        {error && (
          <ActionableError
            error={error}
            onRetry={() => handleSubmit({ preventDefault: () => { } })}
            className="mb-8"
          />
        )}

        {/* Loading */}
        {loading && (
          <GlassmorphicCard>
            <SkeletonTable rows={10} columns={8} />
          </GlassmorphicCard>
        )}

        {/* Results */}
        {data && !loading && (
          <>
            {filteredData.length === 0 ? (
              <GlassmorphicCard className="text-center py-12">
                <p className="text-text-secondary text-lg">
                  {showOnlyWithAssets && isAuthenticated
                    ? 'No trades found where you own items in the origin region.'
                    : 'No trades found matching your criteria.'}
                </p>
                <p className="text-text-secondary/70 mt-2">
                  {showOnlyWithAssets && isAuthenticated
                    ? 'Try disabling the asset filter or adjusting your parameters.'
                    : 'Try adjusting your parameters or selecting different regions.'}
                </p>
              </GlassmorphicCard>
            ) : (
              <>
                {/* Action Bar */}
                <div className="mb-6 flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                    <div className="text-text-secondary text-sm">
                      Found <span className="text-accent-cyan font-medium">{filteredData.length}</span> profitable trades
                      {showOnlyWithAssets && isAuthenticated && data.length !== filteredData.length && (
                        <span className="ml-2 text-text-secondary/70">
                          ({data.length} total)
                        </span>
                      )}
                    </div>
                    <DataFreshnessIndicator
                      lastUpdated={lastUpdated}
                      onRefresh={() => handleSubmit({ preventDefault: () => { } })}
                      isLoading={loading}
                      compact
                    />
                  </div>
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg hover:bg-accent-cyan/30 transition-colors text-xs md:text-sm min-h-[44px]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span className="hidden sm:inline">Save Route</span>
                    <span className="sm:hidden">Save</span>
                  </button>
                </div>

                {/* Profit Distribution */}
                <ProfitDistribution data={filteredData} profitKey="Profit" className="mb-8" />

                {/* Full Results Table */}
                <TradingTable
                  tableId="region-hauling-table"
                  data={filteredData}
                  columns={tableColumns}
                  onRowClick={handleRowClick}
                  defaultSort={{ column: 'Profit', direction: 'desc' }}
                  emptyMessage="No trades found matching your criteria"
                />
              </>
            )}
          </>
        )}
        </div>
      </PullToRefresh>

      {/* Save Route Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-space-dark border border-accent-cyan/20 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="font-display text-xl text-text-primary mb-4">Save Route</h3>
            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder={`${form.fromRegion} -> ${form.useNearby ? 'Nearby Regions' : form.toRegion}`}
              className="w-full px-4 py-3 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-cyan mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-accent-cyan/20 text-text-secondary hover:bg-white/5 transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoute}
                className="flex-1 px-4 py-2 rounded-lg bg-accent-cyan text-space-black font-medium hover:bg-accent-cyan/90 transition-colors min-h-[44px]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default RegionHaulingPage;
