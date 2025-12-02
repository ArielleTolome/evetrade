import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { TopRecommendations } from '../components/common/TopRecommendations';
import { TradingStats } from '../components/common/TradingStats';
import { ProfitDistribution } from '../components/common/ProfitDistribution';
import { FormInput, FormSelect, StationAutocomplete } from '../components/forms';
import { TradingTable } from '../components/tables';
import { SkeletonTable } from '../components/common/SkeletonLoader';
import { useResources } from '../hooks/useResources';
import { useApiCall } from '../hooks/useApiCall';
import { DataFreshnessIndicator } from '../components/common/DataFreshnessIndicator';
import { TradeRoutePresets } from '../components/common/TradeHubPresets';
import { ActionableError } from '../components/common/ActionableError';
import { usePortfolio } from '../hooks/usePortfolio';
import { useEveAuth } from '../hooks/useEveAuth';
import { fetchStationHauling } from '../api/trading';
import { getCharacterAssets, getWalletBalance, getTypeNames, getStationInfo, getStructureInfo } from '../api/esi';
import { formatISK, formatNumber, formatPercent } from '../utils/formatters';
import { isCitadel } from '../utils/security';
import {
  TAX_OPTIONS,
  ROUTE_SAFETY_OPTIONS,
  SYSTEM_SECURITY_OPTIONS,
  TRADE_PREFERENCE_OPTIONS,
} from '../utils/constants';
import { getStationData } from '../utils/stations';

/**
 * Station Hauling Page Component
 */
export function StationHaulingPage() {
  const navigate = useNavigate();
  const { universeList, loading: resourcesLoading } = useResources();
  const { data, loading, error, lastUpdated, execute } = useApiCall(fetchStationHauling);
  const { saveRoute } = usePortfolio();
  const { isAuthenticated, character, getAccessToken } = useEveAuth();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [routeName, setRouteName] = useState('');

  // Form state
  const [form, setForm] = useState({
    fromStations: [],
    toStations: [],
    fromPreference: 'sell',
    toPreference: 'buy',
    minProfit: 1000000,
    maxWeight: 30000,
    minROI: 5,
    maxBudget: 1000000000,
    tax: 0.0375,
    systemSecurity: 'all',
    routeSafety: 'shortest',
  });

  // Temporary input values
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');

  // EVE auth state
  const [showOnlyWithAssets, setShowOnlyWithAssets] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [typeNames, setTypeNames] = useState({});
  const [locationNames, setLocationNames] = useState({});

  // Add station to list
  const addStation = useCallback((type, station) => {
    if (!station) return;
    setForm((prev) => ({
      ...prev,
      [`${type}Stations`]: [...prev[`${type}Stations`], station],
    }));
    if (type === 'from') setFromInput('');
    else setToInput('');
  }, []);

  // Remove station from list
  const removeStation = useCallback((type, station) => {
    setForm((prev) => ({
      ...prev,
      [`${type}Stations`]: prev[`${type}Stations`].filter((s) => s !== station),
    }));
  }, []);

  // Update form field
  const updateForm = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Load assets and wallet when authenticated
  useEffect(() => {
    if (isAuthenticated && character?.id) {
      loadAssetsAndWallet();
    }
  }, [isAuthenticated, character?.id]);

  const loadAssetsAndWallet = async () => {
    setAssetsLoading(true);
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
      if (typeIds.length > 0) {
        const names = await getTypeNames(typeIds);
        const nameMap = {};
        names.forEach((n) => {
          nameMap[n.id] = n.name;
        });
        setTypeNames(nameMap);
      }

      // Get location names
      const locationIds = [...new Set(hangarAssets.map((a) => a.location_id))];
      const locationMap = {};
      for (const locationId of locationIds) {
        try {
          if (locationId >= 1000000000000) {
            const structure = await getStructureInfo(locationId, accessToken);
            locationMap[locationId] = structure.name || `Structure ${locationId}`;
          } else {
            const station = await getStationInfo(locationId);
            locationMap[locationId] = station.name || `Station ${locationId}`;
          }
        } catch {
          locationMap[locationId] = `Location ${locationId}`;
        }
      }
      setLocationNames(locationMap);
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setAssetsLoading(false);
    }
  };

  // Build location string for API
  const buildLocationString = useCallback(
    (stations, preference) => {
      if (stations.length === 0) return '';

      const locations = stations.map((station) => {
        const data = getStationData(station, universeList);
        if (!data) return null;
        return `${data.region}:${data.station}`;
      }).filter(Boolean);

      if (locations.length === 0) return '';

      const prefix = preference !== 'none' ? `${preference}-` : '';
      return `${prefix}${locations.join(',')}`;
    },
    [universeList]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const fromLocation = buildLocationString(form.fromStations, form.fromPreference);
      const toLocation = buildLocationString(form.toStations, form.toPreference);

      if (!fromLocation || !toLocation) {
        alert('Please select at least one station for both origin and destination');
        return;
      }

      try {
        await execute({
          from: fromLocation,
          to: toLocation,
          minProfit: form.minProfit,
          maxWeight: form.maxWeight,
          minROI: form.minROI,
          maxBudget: form.maxBudget,
          tax: form.tax,
          systemSecurity: form.systemSecurity,
          routeSafety: form.routeSafety,
        });
      } catch (err) {
        console.error('Hauling request failed:', err);
      }
    },
    [form, buildLocationString, execute]
  );

  // Option arrays for dropdowns
  const taxOptions = useMemo(() => TAX_OPTIONS.map((o) => ({ value: o.value, label: o.label })), []);
  const routeOptions = useMemo(() => ROUTE_SAFETY_OPTIONS.map((o) => ({ value: o.value, label: o.label })), []);
  const securityOptions = useMemo(() => SYSTEM_SECURITY_OPTIONS.map((o) => ({ value: o.value, label: o.label })), []);
  const prefOptions = useMemo(() => TRADE_PREFERENCE_OPTIONS.map((o) => ({ value: o.value, label: o.label })), []);

  // Helper to check if user has item at origin
  const hasAssetAtLocation = useCallback(
    (itemName, locationName) => {
      if (!assets.length || !itemName || !locationName) return false;

      // Find matching location by name
      const matchingLocation = Object.entries(locationNames).find(
        ([_, name]) => name === locationName
      );
      if (!matchingLocation) return false;

      const locationId = parseInt(matchingLocation[0]);

      // Find matching type by name
      const matchingType = Object.entries(typeNames).find(
        ([_, name]) => name === itemName
      );
      if (!matchingType) return false;

      const typeId = parseInt(matchingType[0]);

      // Check if we have this item at this location
      return assets.some(
        (asset) => asset.location_id === locationId && asset.type_id === typeId
      );
    },
    [assets, locationNames, typeNames]
  );

  // Count assets at origin stations
  const assetsAtOrigin = useMemo(() => {
    if (!isAuthenticated || !assets.length || !form.fromStations.length) return 0;

    // Get all origin location IDs
    const originLocationIds = new Set();
    form.fromStations.forEach((stationName) => {
      const matchingLocation = Object.entries(locationNames).find(
        ([_, name]) => name === stationName
      );
      if (matchingLocation) {
        originLocationIds.add(parseInt(matchingLocation[0]));
      }
    });

    // Count unique items at origin locations
    return assets.filter((asset) => originLocationIds.has(asset.location_id)).length;
  }, [isAuthenticated, assets, form.fromStations, locationNames]);

  // Filter data based on asset ownership
  const filteredData = useMemo(() => {
    if (!data || !showOnlyWithAssets || !isAuthenticated) return data;

    return data.filter((item) => {
      const fromLocation = typeof item.From === 'object' ? item.From.name : item.From;
      const itemName = item.Item || item.name;
      return hasAssetAtLocation(itemName, fromLocation);
    });
  }, [data, showOnlyWithAssets, isAuthenticated, hasAssetAtLocation]);

  // Table columns configuration
  const tableColumns = useMemo(
    () => [
      {
        key: 'Item',
        label: 'Item',
        className: 'font-medium',
        render: (data, row) => {
          const itemName = row.Item || row.name;
          const fromLocation = typeof row.From === 'object' ? row.From.name : row.From;
          const hasAsset = isAuthenticated && hasAssetAtLocation(itemName, fromLocation);

          return (
            <div className="flex items-center gap-2">
              <span>{itemName}</span>
              {hasAsset && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                  Owned
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: 'From',
        label: 'From',
        render: (data) => (typeof data === 'object' ? data.name : data),
      },
      {
        key: 'Take To',
        label: 'To',
        render: (data) => (typeof data === 'object' ? data.name : data),
      },
      {
        key: 'Quantity',
        label: 'Quantity',
        type: 'num',
        render: (data, row) => formatNumber(data || row.quantity, 0),
      },
      {
        key: 'Profit',
        label: 'Profit',
        type: 'num',
        defaultSort: true,
        render: (data, row) => formatISK(data || row.profit, false),
      },
      {
        key: 'ROI',
        label: 'ROI',
        type: 'num',
        render: (data, row) => formatPercent((data || row.roi) / 100, 1),
      },
      {
        key: 'Jumps',
        label: 'Jumps',
        type: 'num',
        render: (data, row) => data || row.jumps || 'N/A',
      },
    ],
    [isAuthenticated, hasAssetAtLocation]
  );

  // Handle row click
  const handleRowClick = useCallback(
    (item) => {
      const itemId = item['Item ID'] || item.itemId;
      const fromLocation = item.fromLocation || '';
      const toLocation = item.toLocation || '';

      if (itemId && fromLocation && toLocation) {
        navigate(`/orders?itemId=${itemId}&from=${fromLocation}&to=${toLocation}`);
      }
    },
    [navigate]
  );

  // Handle save route
  const handleSaveRoute = useCallback(() => {
    const fromNames = form.fromStations.join(', ');
    const toNames = form.toStations.join(', ');
    saveRoute({
      name: routeName || `${fromNames} -> ${toNames}`,
      type: 'station-hauling',
      from: form.fromStations,
      to: form.toStations,
      params: { ...form },
    });
    setShowSaveModal(false);
    setRouteName('');
  }, [form, routeName, saveRoute]);

  return (
    <PageLayout
      title="Station Hauling"
      subtitle="Find profitable trades between specific stations"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Form */}
        <GlassmorphicCard className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quick Route Presets */}
            <TradeRoutePresets
              fromStation={form.fromStations[0]}
              toStation={form.toStations[0]}
              onRouteSelect={(from, to) => {
                setForm(prev => ({
                  ...prev,
                  fromStations: [from],
                  toStations: [to],
                }));
              }}
              className="pb-4 border-b border-accent-cyan/10"
            />

            {/* Station Selection */}
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* From Stations */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-text-secondary">
                  Origin Stations
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <StationAutocomplete
                      value={fromInput}
                      onChange={setFromInput}
                      placeholder="Add origin station..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => addStation('from', fromInput)}
                    className="btn-secondary px-3 md:px-4 min-h-[44px]"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {form.fromStations.map((station) => (
                    <span
                      key={station}
                      className={`
                        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
                        ${isCitadel(station) ? 'bg-accent-gold/20 text-accent-gold' : 'bg-accent-cyan/20 text-accent-cyan'}
                      `}
                    >
                      {station}
                      <button
                        type="button"
                        onClick={() => removeStation('from', station)}
                        className="hover:text-red-400"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <FormSelect
                  label="Trade Preference"
                  value={form.fromPreference}
                  onChange={(v) => updateForm('fromPreference', v)}
                  options={prefOptions}
                />
              </div>

              {/* To Stations */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-text-secondary">
                  Destination Stations
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <StationAutocomplete
                      value={toInput}
                      onChange={setToInput}
                      placeholder="Add destination station..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => addStation('to', toInput)}
                    className="btn-secondary px-3 md:px-4 min-h-[44px]"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {form.toStations.map((station) => (
                    <span
                      key={station}
                      className={`
                        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
                        ${isCitadel(station) ? 'bg-accent-gold/20 text-accent-gold' : 'bg-accent-purple/20 text-accent-purple'}
                      `}
                    >
                      {station}
                      <button
                        type="button"
                        onClick={() => removeStation('to', station)}
                        className="hover:text-red-400"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
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
              />
              <FormInput
                label="Max Cargo Weight"
                type="number"
                value={form.maxWeight}
                onChange={(v) => updateForm('maxWeight', v)}
                suffix="m³"
              />
              <FormInput
                label="Minimum ROI"
                type="number"
                value={form.minROI}
                onChange={(v) => updateForm('minROI', v)}
                suffix="%"
              />
              <FormInput
                label="Max Budget"
                type="number"
                value={form.maxBudget}
                onChange={(v) => updateForm('maxBudget', v)}
                suffix="ISK"
              />
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              <FormSelect
                label="Sales Tax Level"
                value={form.tax}
                onChange={(v) => updateForm('tax', parseFloat(v))}
                options={taxOptions}
              />
              <FormSelect
                label="System Security"
                value={form.systemSecurity}
                onChange={(v) => updateForm('systemSecurity', v)}
                options={securityOptions}
              />
              <FormSelect
                label="Route Safety"
                value={form.routeSafety}
                onChange={(v) => updateForm('routeSafety', v)}
                options={routeOptions}
              />
            </div>

            <button
              type="submit"
              disabled={loading || resourcesLoading}
              className="btn-primary w-full py-3 md:py-4 text-base md:text-lg min-h-[44px]"
            >
              {loading ? 'Searching...' : 'Find Trades'}
            </button>
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
                {form.fromStations.length > 0 && (
                  <div>
                    <div className="text-sm text-text-secondary mb-1">Assets at Origin</div>
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
          </GlassmorphicCard>
        )}

        {/* Error */}
        {error && (
          <ActionableError
            error={error}
            onRetry={() => handleSubmit({ preventDefault: () => {} })}
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
                    ? 'No trades found where you own items at the origin.'
                    : 'No trades found matching your criteria.'}
                </p>
                <p className="text-text-secondary/70 mt-2">
                  {showOnlyWithAssets && isAuthenticated
                    ? 'Try disabling the asset filter or adjusting your parameters.'
                    : 'Try adjusting your parameters or adding more stations.'}
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
                      onRefresh={() => handleSubmit({ preventDefault: () => {} })}
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

                {/* Top Recommendations */}
                <TopRecommendations
                  data={filteredData}
                  onItemClick={handleRowClick}
                  maxItems={10}
                  profitKey="Profit"
                />

                {/* Statistics Summary */}
                <TradingStats data={filteredData} profitKey="Profit" />

                {/* Profit Distribution */}
                <ProfitDistribution data={filteredData} profitKey="Profit" className="mb-8" />

                {/* Full Results Table */}
                <TradingTable
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

      {/* Save Route Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-space-dark border border-accent-cyan/20 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="font-display text-xl text-text-primary mb-4">Save Route</h3>
            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder={`${form.fromStations.join(', ')} -> ${form.toStations.join(', ')}`}
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

export default StationHaulingPage;
