import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { QuickTradeCalculator } from '../components/common/QuickTradeCalculator';
import { TopRecommendations } from '../components/common/TopRecommendations';
import { TradingStats } from '../components/common/TradingStats';
import { ProfitDistribution } from '../components/common/ProfitDistribution';
import { Toast } from '../components/common/Toast';
import { FormInput, FormSelect, StationAutocomplete } from '../components/forms';
import { TradingTable } from '../components/tables';
import { SkeletonTable } from '../components/common/SkeletonLoader';
import { useResources } from '../hooks/useResources';
import { useApiCall } from '../hooks/useApiCall';
import { useTradeForm } from '../hooks/useTradeForm';
import { usePortfolio } from '../hooks/usePortfolio';
import { useEveAuth } from '../hooks/useEveAuth';
import { useFavorites } from '../hooks/useFavorites';
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from '../hooks/useKeyboardShortcuts';
import { fetchStationTrading } from '../api/trading';
import { getCharacterOrders, getCharacterSkills, calculateTradingTaxes, getTypeNames, getWalletBalance } from '../api/esi';
import { formatISK, formatNumber, formatPercent } from '../utils/formatters';
import { TAX_OPTIONS } from '../utils/constants';
import { getStationData } from '../utils/stations';

/**
 * Item category mapping based on EVE Online group IDs
 * This maps common trading categories to their corresponding group IDs
 */
const ITEM_CATEGORIES = {
  all: { label: 'All Items', groupIds: null },
  ships: {
    label: 'Ships',
    groupIds: [
      25, 26, 27, 28, 29, 30, 31, // Frigates
      237, 324, 358, 380, 381, 419, 420, 463, 540, 541, 543, 830, 831, 834, 893, 894, 1283, // Cruisers
      883, 1202, 1305, // Freighters
      420, 463, 540, 541, 902, 906, // Industrials
      27, 28, 29, 30, 324, 358, 380, 419, 420, 463, 485, 513, 540, 541, 543, 547, 659, 830, 831, 832, 833, 834, 883, 893, 894, 898, 900, 902, 906, 941, 963, 1022, 1201, 1202, 1283, 1305, 1527, 1534, // All ship groups
    ]
  },
  modules: {
    label: 'Modules',
    groupIds: [
      40, 41, 46, 53, 54, 55, 56, 67, 76, 77, 131, 155, 209, 328, 376, 428, 449, 761, 771, 772, 773, 774, 775, 776, 777, 778, 779, 780, 781, 782, 1154, 1156, 1157, 1159, 1160, 1161, 1162, 1163, 1164, 1165, 1166, 1167, 1168, 1169, 1170, 1171, 1172, 1173, 1174, 1175, 1176, 1177, 1178, 1179, 1180, 1181, 1182, 1183, 1184, 1185, 1186, 1187, 1188, 1189, 1190, 1191, 1192, 1193, 1194, 1195, 1196, 1197, 1198, 1199, 1200
    ]
  },
  ammo: {
    label: 'Ammo & Charges',
    groupIds: [83, 85, 86, 87, 88, 89, 90, 137, 217, 383, 384, 385, 386, 387, 388, 390, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418]
  },
  drones: {
    label: 'Drones',
    groupIds: [100, 101, 549, 639, 640, 641, 1159, 1872, 1881]
  },
  skillbooks: {
    label: 'Skillbooks',
    groupIds: [266, 270, 273, 275, 278, 280, 282, 283]
  },
  blueprints: {
    label: 'Blueprints',
    groupIds: [2, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
  },
  materials: {
    label: 'Materials',
    groupIds: [18, 423, 424, 425, 426, 427, 428, 429, 712, 1031, 1032, 1033, 1034, 1035, 1036, 1037, 1038, 1039, 1040, 1041]
  },
  implants: {
    label: 'Implants & Boosters',
    groupIds: [300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 1040]
  },
  apparel: {
    label: 'Apparel',
    groupIds: [1159, 1872]
  },
};

/**
 * Station Trading Page Component
 * Refactored to use the useTradeForm hook for reduced duplication
 */
export function StationTradingPage() {
  const navigate = useNavigate();
  const { universeList, loading: resourcesLoading, loadInvTypes, invTypes } = useResources();
  const { data, loading, error, execute } = useApiCall(fetchStationTrading);
  const { saveRoute } = usePortfolio();
  const { isAuthenticated, character, getAccessToken } = useEveAuth();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState([]);
  const [typeNames, setTypeNames] = useState({});
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [characterTaxes, setCharacterTaxes] = useState(null);
  const [usingPersonalTaxes, setUsingPersonalTaxes] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
  const [hideScams, setHideScams] = useState(false);
  const [highQualityOnly, setHighQualityOnly] = useState(false);

  // Refs for keyboard shortcuts
  const searchInputRef = useRef(null);
  const tableRef = useRef(null);

  // Load invTypes for category filtering
  useEffect(() => {
    loadInvTypes();
  }, [loadInvTypes]);

  // Load character skills and wallet balance when authenticated
  useEffect(() => {
    if (isAuthenticated && character?.id) {
      loadCharacterData();
    } else {
      setCharacterTaxes(null);
      setWalletBalance(null);
      setUsingPersonalTaxes(false);
    }
  }, [isAuthenticated, character?.id]);

  // Load character data (skills, wallet)
  const loadCharacterData = async () => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      // Load skills to calculate taxes
      const skills = await getCharacterSkills(character.id, accessToken);
      const taxes = calculateTradingTaxes(skills);
      setCharacterTaxes(taxes);

      // Load wallet balance
      const balance = await getWalletBalance(character.id, accessToken);
      setWalletBalance(balance);
    } catch (err) {
      console.error('Failed to load character data:', err);
    }
  };

  // Custom validation for station-specific fields
  const customValidation = useCallback((formData) => {
    const errors = {};

    if (!formData.station) {
      errors.station = 'Please select a station';
    } else if (!getStationData(formData.station, universeList)) {
      errors.station = 'Invalid station selected';
    }

    return errors;
  }, [universeList]);

  // Transform form data to API format
  const transformData = useCallback((formData) => {
    const stationData = getStationData(formData.station, universeList);
    if (!stationData) return null;

    // Use character taxes if authenticated and available
    let tax = formData.tax;
    let brokerFee = formData.brokerFee / 100;

    if (isAuthenticated && characterTaxes) {
      tax = characterTaxes.salesTax;
      brokerFee = characterTaxes.brokerFee;
      setUsingPersonalTaxes(true);
    } else {
      setUsingPersonalTaxes(false);
    }

    return {
      stationId: stationData.station,
      minProfit: formData.profit,
      tax: tax,
      minVolume: formData.minVolume,
      brokerFee: brokerFee,
      marginAbove: formData.marginAbove / 100,
      marginBelow: formData.marginBelow / 100,
    };
  }, [universeList, isAuthenticated, characterTaxes]);

  // Handle form submission
  const onSubmit = useCallback(async (transformedData) => {
    if (!transformedData) return;
    await execute(transformedData);
  }, [execute]);

  // Use the reusable trade form hook
  const {
    form,
    errors,
    updateForm,
    handleSubmit,
  } = useTradeForm(
    {
      station: '',
      profit: 1000000,
      tax: 0.0375,
      minVolume: 100,
      brokerFee: 3,
      marginAbove: 10,
      marginBelow: 50,
    },
    {
      customValidation,
      transformData,
      onSubmit,
    }
  );

  // Load orders when authenticated and station selected
  const loadOrders = useCallback(async () => {
    if (!isAuthenticated || !character?.id || !form.station) return;

    setOrdersLoading(true);
    setOrdersError(null);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      const stationData = getStationData(form.station, universeList);
      if (!stationData) return;

      // Get all character orders
      const allOrders = await getCharacterOrders(character.id, accessToken);

      // Filter to only show orders at the selected station
      const stationOrders = allOrders.filter((o) => o.location_id === stationData.station);
      setOrders(stationOrders);

      // Get unique type IDs and fetch names
      const typeIds = [...new Set(stationOrders.map((o) => o.type_id))];
      if (typeIds.length > 0) {
        const names = await getTypeNames(typeIds);
        const nameMap = {};
        names.forEach((n) => {
          nameMap[n.id] = n.name;
        });
        setTypeNames(nameMap);
      }
    } catch (err) {
      setOrdersError(err.message);
    } finally {
      setOrdersLoading(false);
    }
  }, [isAuthenticated, character?.id, form.station, universeList, getAccessToken]);

  // Load orders when station changes
  useEffect(() => {
    if (isAuthenticated && form.station) {
      loadOrders();
    }
  }, [isAuthenticated, form.station, loadOrders]);

  // Handle row click to view orders
  const handleRowClick = useCallback(
    (item) => {
      const stationData = getStationData(form.station, universeList);
      if (!stationData) return;

      const itemId = item['Item ID'] || item.itemId;
      const fromLocation = `${stationData.region}:${stationData.station}`;

      navigate(`/orders?itemId=${itemId}&from=${fromLocation}&to=${fromLocation}`);
    },
    [form.station, universeList, navigate]
  );

  // Handle save route
  const handleSaveRoute = useCallback(() => {
    saveRoute({
      name: routeName || `${form.station} Trading`,
      type: 'station-trading',
      station: form.station,
      params: { ...form },
    });
    setShowSaveModal(false);
    setRouteName('');
  }, [form, routeName, saveRoute]);

  // Clipboard helper functions
  const copyToClipboard = useCallback(async (text, successMessage = 'Copied to clipboard!') => {
    try {
      await navigator.clipboard.writeText(text);
      setToastMessage(successMessage);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setToastMessage('Failed to copy to clipboard');
    }
  }, []);

  // Copy individual row
  const copyRowToClipboard = useCallback((item) => {
    const text = `Item: ${item.Item}
Buy Price: ${formatISK(item['Buy Price'], false)}
Sell Price: ${formatISK(item['Sell Price'], false)}
Profit per Unit: ${formatISK(item['Profit per Unit'], false)}
Net Profit: ${formatISK(item['Net Profit'], false)}
Margin: ${formatPercent(item['Gross Margin'] / 100, 1)}`;

    copyToClipboard(text, 'Trade copied!');
  }, [copyToClipboard]);

  // Copy all results as formatted table
  const copyAllResults = useCallback((trades) => {
    const header = 'Item\tBuy Price\tSell Price\tProfit/Unit\tNet Profit\tMargin';
    const rows = trades.map(trade =>
      `${trade.Item}\t${formatISK(trade['Buy Price'], false)}\t${formatISK(trade['Sell Price'], false)}\t${formatISK(trade['Profit per Unit'], false)}\t${formatISK(trade['Net Profit'], false)}\t${formatPercent(trade['Gross Margin'] / 100, 1)}`
    ).join('\n');

    const text = `${header}\n${rows}`;
    copyToClipboard(text, `Copied ${trades.length} trades!`);
  }, [copyToClipboard]);

  // Copy for EVE Online Multibuy format
  const copyMultibuyFormat = useCallback((trades) => {
    const text = trades.map(trade =>
      `${trade.Item} x ${trade.Volume || 1}`
    ).join('\n');

    copyToClipboard(text, 'Multibuy list copied!');
  }, [copyToClipboard]);

  // Tax options for dropdown
  const taxOptions = useMemo(
    () =>
      TAX_OPTIONS.map((opt) => ({
        value: opt.value,
        label: opt.label,
      })),
    []
  );

  // Calculate summary stats for orders
  const ordersStats = useMemo(() => {
    const buyOrders = orders.filter((o) => o.is_buy_order);
    const sellOrders = orders.filter((o) => !o.is_buy_order);

    const buyEscrow = buyOrders.reduce((sum, o) => sum + o.escrow, 0);
    const sellValue = sellOrders.reduce((sum, o) => sum + o.price * o.volume_remain, 0);

    return {
      totalOrders: orders.length,
      buyOrders: buyOrders.length,
      sellOrders: sellOrders.length,
      buyEscrow,
      sellValue,
      totalValue: buyEscrow + sellValue,
    };
  }, [orders]);

  // Filter data by category
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return data;
    }

    let filtered = data;

    // Apply category filter
    if (categoryFilter !== 'all' && invTypes) {
      const category = ITEM_CATEGORIES[categoryFilter];
      if (category && category.groupIds) {
        filtered = filtered.filter((item) => {
          const itemId = item['Item ID'] || item.itemId;
          if (!itemId || !invTypes[itemId]) return false;

          const itemData = invTypes[itemId];
          const groupId = itemData.groupID;

          return category.groupIds.includes(groupId);
        });
      }
    }

    // Apply favorites filter
    if (showFavoritesOnly && favorites.length > 0) {
      filtered = filtered.filter((item) => {
        const itemId = item['Item ID'] || item.itemId;
        return favorites.includes(itemId);
      });
    }

    // Apply high quality filter
    if (highQualityOnly) {
      filtered = filtered.filter((item) => {
        const margin = (item['Gross Margin'] || 0) / 100;
        const profit = item['Net Profit'] || 0;
        const volume = item['Volume'] || 0;
        // High quality = good margin (>10%) AND good profit (>1M ISK) AND decent volume (>100)
        return margin > 0.10 && profit > 1000000 && volume > 100;
      });
    }

    return filtered;
  }, [data, categoryFilter, invTypes, showFavoritesOnly, favorites, highQualityOnly]);

  // Keyboard shortcuts configuration
  const keyboardHandlers = useMemo(() => ({
    // Toggle favorites filter (f key)
    'f': () => {
      setShowFavoritesOnly(prev => !prev);
      setToastMessage(`Favorites filter ${!showFavoritesOnly ? 'enabled' : 'disabled'}`);
    },
    // Refresh data (r key)
    'r': () => {
      if (form.station && data !== null) {
        handleSubmit(new Event('submit'));
        setToastMessage('Refreshing data...');
      }
    },
    // Focus search box (/ or Ctrl+K)
    '/': () => {
      searchInputRef.current?.focus();
    },
    'ctrl+k': () => {
      searchInputRef.current?.focus();
    },
    // Clear search / close modals (Escape)
    'escape': () => {
      if (searchInputRef.current === document.activeElement) {
        searchInputRef.current.value = '';
        searchInputRef.current.blur();
      }
      if (showSaveModal) setShowSaveModal(false);
      if (showOrders) setShowOrders(false);
    },
    // Navigate table rows (j/k vim style)
    'j': () => {
      const trades = Array.isArray(filteredData) ? filteredData : [];
      if (trades.length > 0) {
        setSelectedRowIndex(prev => Math.min(prev + 1, trades.length - 1));
      }
    },
    'k': () => {
      setSelectedRowIndex(prev => Math.max(prev - 1, 0));
    },
    // Open selected trade details (Enter)
    'enter': () => {
      const trades = Array.isArray(filteredData) ? filteredData : [];
      if (selectedRowIndex >= 0 && selectedRowIndex < trades.length) {
        handleRowClick(trades[selectedRowIndex]);
      }
    },
    // Copy selected trade (c)
    'c': () => {
      const trades = Array.isArray(filteredData) ? filteredData : [];
      if (selectedRowIndex >= 0 && selectedRowIndex < trades.length) {
        copyRowToClipboard(trades[selectedRowIndex]);
      }
    },
    // Copy multibuy format (m)
    'm': () => {
      const trades = Array.isArray(filteredData) ? filteredData : [];
      if (trades.length > 0) {
        copyMultibuyFormat(trades);
      }
    },
    // Toggle high quality filter (h)
    'h': () => {
      setHighQualityOnly(prev => !prev);
      setToastMessage(`High quality filter ${!highQualityOnly ? 'enabled' : 'disabled'}`);
    },
  }), [form.station, data, handleSubmit, showSaveModal, showOrders, filteredData, selectedRowIndex, showFavoritesOnly, highQualityOnly, copyRowToClipboard, copyMultibuyFormat, handleRowClick]);

  // Initialize keyboard shortcuts
  const { showHelp, setShowHelp } = useKeyboardShortcuts(keyboardHandlers);

  // Define custom shortcuts for help modal
  const customShortcuts = useMemo(() => [
    {
      category: 'Filtering',
      items: [
        { keys: ['f'], description: 'Toggle favorites filter' },
        { keys: ['h'], description: 'Toggle high quality filter' },
      ],
    },
    {
      category: 'Actions',
      items: [
        { keys: ['r'], description: 'Refresh data' },
        { keys: ['/', 'Ctrl+K'], description: 'Focus search' },
        { keys: ['j', 'k'], description: 'Navigate up/down' },
        { keys: ['Enter'], description: 'Open selected trade' },
        { keys: ['c'], description: 'Copy selected trade' },
        { keys: ['m'], description: 'Copy multibuy format' },
      ],
    },
  ], []);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    if (!data || !Array.isArray(data) || !invTypes) {
      return {};
    }

    const counts = { all: data.length };

    Object.entries(ITEM_CATEGORIES).forEach(([key, category]) => {
      if (key === 'all') return;

      if (!category.groupIds) {
        counts[key] = 0;
        return;
      }

      counts[key] = data.filter((item) => {
        const itemId = item['Item ID'] || item.itemId;
        if (!itemId || !invTypes[itemId]) return false;

        const itemData = invTypes[itemId];
        const groupId = itemData.groupID;

        return category.groupIds.includes(groupId);
      }).length;
    });

    return counts;
  }, [data, invTypes]);

  // Table columns configuration
  const tableColumns = useMemo(
    () => [
      {
        key: 'Favorite',
        label: '',
        className: 'w-12',
        render: (data, row) => {
          const itemId = row['Item ID'] || row.itemId;
          const isFav = isFavorite(itemId);
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(itemId);
              }}
              className="p-1 hover:scale-110 transition-transform focus:outline-none"
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg
                className={`w-5 h-5 ${isFav ? 'fill-accent-gold text-accent-gold' : 'fill-none text-text-secondary'}`}
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
            </button>
          );
        },
      },
      {
        key: 'Item',
        label: 'Item',
        className: 'font-medium',
      },
      {
        key: 'Buy Price',
        label: 'Buy Price',
        type: 'num',
        render: (data) => formatISK(data, false),
      },
      {
        key: 'Sell Price',
        label: 'Sell Price',
        type: 'num',
        render: (data) => formatISK(data, false),
      },
      {
        key: 'Volume',
        label: 'Volume',
        type: 'num',
        render: (data) => formatNumber(data, 0),
      },
      {
        key: 'Profit per Unit',
        label: 'Profit/Unit',
        type: 'num',
        render: (data) => formatISK(data, false),
      },
      {
        key: 'Net Profit',
        label: 'Net Profit',
        type: 'num',
        defaultSort: true,
        render: (data) => formatISK(data, false),
      },
      {
        key: 'Gross Margin',
        label: 'Margin',
        type: 'num',
        render: (data) => formatPercent(data / 100, 1),
      },
      {
        key: 'actions',
        label: 'Actions',
        className: 'w-20',
        render: (data, row) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyRowToClipboard(row);
            }}
            className="p-1.5 text-text-secondary hover:text-accent-cyan transition-colors"
            title="Copy trade details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        ),
      },
    ],
    [isFavorite, toggleFavorite, copyRowToClipboard]
  );

  return (
    <PageLayout
      title="Station Trading"
      subtitle="Find profitable buy/sell margins within a single station"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Toast Notification */}
        {toastMessage && (
          <Toast
            message={toastMessage}
            onClose={() => setToastMessage(null)}
            type="success"
          />
        )}

        {/* Form */}
        <GlassmorphicCard className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Primary Fields */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StationAutocomplete
                label="Station"
                value={form.station}
                onChange={(v) => updateForm('station', v)}
                placeholder="Jita IV - Moon 4 - Caldari Navy Assembly Plant"
                error={errors.station}
                required
              />

              <FormInput
                label="Minimum Profit"
                type="number"
                value={form.profit}
                onChange={(v) => updateForm('profit', v)}
                suffix="ISK"
                error={errors.profit}
                min={0}
              />

              <FormInput
                label="Minimum Volume"
                type="number"
                value={form.minVolume}
                onChange={(v) => updateForm('minVolume', v)}
                suffix="units"
                error={errors.minVolume}
                min={0}
              />
            </div>

            {/* Category Filter */}
            <div className="border-t border-accent-cyan/10 pt-6">
              <FormSelect
                label="Item Category"
                value={categoryFilter}
                onChange={(v) => setCategoryFilter(v)}
                options={Object.entries(ITEM_CATEGORIES).map(([key, category]) => ({
                  value: key,
                  label: `${category.label}${categoryCounts[key] !== undefined ? ` (${categoryCounts[key]})` : ''}`,
                }))}
              />
            </div>

            {/* Advanced Filters Toggle */}
            <div className="border-t border-accent-cyan/10 pt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-accent-cyan hover:text-accent-cyan/80 transition-colors"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
              </button>
            </div>

            {/* Advanced Filters (Collapsible) */}
            {showAdvanced && (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
                <FormSelect
                  label="Sales Tax Level"
                  value={form.tax}
                  onChange={(v) => updateForm('tax', parseFloat(v))}
                  options={taxOptions}
                />

                <FormInput
                  label="Broker Fee"
                  type="number"
                  value={form.brokerFee}
                  onChange={(v) => updateForm('brokerFee', v)}
                  suffix="%"
                  step={0.01}
                  error={errors.brokerFee}
                  min={0}
                  max={100}
                />

                <FormInput
                  label="Margin Above"
                  type="number"
                  value={form.marginAbove}
                  onChange={(v) => updateForm('marginAbove', v)}
                  suffix="%"
                  error={errors.marginAbove}
                  min={0}
                  max={100}
                />

                <FormInput
                  label="Margin Below"
                  type="number"
                  value={form.marginBelow}
                  onChange={(v) => updateForm('marginBelow', v)}
                  suffix="%"
                  error={errors.marginBelow}
                  min={0}
                  max={100}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || resourcesLoading}
              className="btn-primary w-full py-4 text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-space-black/30 border-t-space-black rounded-full animate-spin" />
                  Searching...
                </span>
              ) : (
                'Find Trades'
              )}
            </button>
          </form>
        </GlassmorphicCard>

        {/* Wallet Balance & Tax Rate Indicator */}
        {isAuthenticated && (
          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm">
            {walletBalance !== null && (
              <div className="flex items-center gap-2 px-4 py-2 bg-accent-gold/10 border border-accent-gold/20 rounded-lg">
                <svg className="w-4 h-4 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-accent-gold font-medium">Wallet:</span>
                <span className="text-text-primary font-mono">{formatISK(walletBalance, false)}</span>
              </div>
            )}
            {usingPersonalTaxes && characterTaxes && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-400 font-medium">Using your tax rates:</span>
                <span className="text-text-secondary">
                  Broker {formatPercent(characterTaxes.brokerFee, 2)} / Sales {formatPercent(characterTaxes.salesTax, 2)}
                  {characterTaxes.accountingLevel > 0 && (
                    <span className="ml-1 text-xs">(Accounting V{characterTaxes.accountingLevel})</span>
                  )}
                  {characterTaxes.brokerRelationsLevel > 0 && (
                    <span className="ml-1 text-xs">(Broker Relations V{characterTaxes.brokerRelationsLevel})</span>
                  )}
                </span>
              </div>
            )}
            {!usingPersonalTaxes && (
              <div className="flex items-center gap-2 px-4 py-2 bg-accent-cyan/10 border border-accent-cyan/20 rounded-lg">
                <svg className="w-4 h-4 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-accent-cyan">Using default tax rates</span>
              </div>
            )}
          </div>
        )}

        {/* Character Orders at This Station */}
        {isAuthenticated && form.station && (
          <GlassmorphicCard className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowOrders(!showOrders)}
                className="flex items-center gap-2 text-lg font-display text-text-primary hover:text-accent-cyan transition-colors"
              >
                <svg
                  className={`w-5 h-5 transition-transform ${showOrders ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Your Orders at This Station
                {orders.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-accent-cyan/20 text-accent-cyan rounded-full">
                    {orders.length}
                  </span>
                )}
              </button>
              {showOrders && (
                <button
                  onClick={loadOrders}
                  disabled={ordersLoading}
                  className="p-2 text-text-secondary hover:text-accent-cyan transition-colors"
                  title="Refresh orders"
                >
                  <svg className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
            </div>

            {showOrders && (
              <>
                {/* Summary Stats */}
                {orders.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 rounded-lg bg-space-dark/50">
                      <div className="text-lg font-bold text-red-400">{formatISK(ordersStats.buyEscrow, false)}</div>
                      <div className="text-xs text-text-secondary">Buy Escrow ({ordersStats.buyOrders})</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-space-dark/50">
                      <div className="text-lg font-bold text-green-400">{formatISK(ordersStats.sellValue, false)}</div>
                      <div className="text-xs text-text-secondary">Sell Value ({ordersStats.sellOrders})</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-space-dark/50">
                      <div className="text-lg font-bold text-accent-gold">{formatISK(ordersStats.totalValue, false)}</div>
                      <div className="text-xs text-text-secondary">Total Locked</div>
                    </div>
                  </div>
                )}

                {/* Error */}
                {ordersError && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {ordersError}
                  </div>
                )}

                {/* Loading */}
                {ordersLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
                    <span className="ml-2 text-text-secondary text-sm">Loading orders...</span>
                  </div>
                )}

                {/* Orders Table */}
                {!ordersLoading && orders.length > 0 && (
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-space-dark">
                        <tr className="text-text-secondary border-b border-accent-cyan/20">
                          <th className="text-left py-2 px-3">Item</th>
                          <th className="text-left py-2 px-3">Type</th>
                          <th className="text-right py-2 px-3">Price</th>
                          <th className="text-right py-2 px-3">Volume</th>
                          <th className="text-right py-2 px-3">Filled</th>
                          <th className="text-right py-2 px-3">Expires</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => {
                          const volumeFilled = order.volume_total - order.volume_remain;
                          const fillPercent = (volumeFilled / order.volume_total) * 100;
                          const expiresDate = new Date(order.issued);
                          expiresDate.setDate(expiresDate.getDate() + order.duration);
                          const daysLeft = Math.ceil((expiresDate - new Date()) / (1000 * 60 * 60 * 24));

                          return (
                            <tr
                              key={order.order_id}
                              className="border-b border-accent-cyan/10 hover:bg-white/5"
                            >
                              <td className="py-2 px-3 text-text-primary">
                                {typeNames[order.type_id] || `Type ${order.type_id}`}
                              </td>
                              <td className="py-2 px-3">
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  order.is_buy_order
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-green-500/20 text-green-400'
                                }`}>
                                  {order.is_buy_order ? 'BUY' : 'SELL'}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right font-mono text-text-primary">
                                {formatISK(order.price, false)}
                              </td>
                              <td className="py-2 px-3 text-right font-mono text-text-secondary">
                                {formatNumber(order.volume_remain, 0)} / {formatNumber(order.volume_total, 0)}
                              </td>
                              <td className="py-2 px-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-16 h-1.5 bg-space-dark rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-accent-cyan rounded-full"
                                      style={{ width: `${fillPercent}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-text-secondary">{formatPercent(fillPercent / 100, 0)}</span>
                                </div>
                              </td>
                              <td className={`py-2 px-3 text-right text-sm ${
                                daysLeft <= 3 ? 'text-red-400' : daysLeft <= 7 ? 'text-yellow-400' : 'text-text-secondary'
                              }`}>
                                {daysLeft}d
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Empty State */}
                {!ordersLoading && orders.length === 0 && (
                  <div className="text-center py-8 text-text-secondary">
                    No active orders at this station
                  </div>
                )}
              </>
            )}
          </GlassmorphicCard>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            <strong>Error:</strong> {typeof error === 'string' ? error : error.message || 'An error occurred'}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <GlassmorphicCard>
            <SkeletonTable rows={10} columns={7} />
          </GlassmorphicCard>
        )}

        {/* Results */}
        {data !== null && !loading && (() => {
          // Normalize data to array and apply filtering
          const allTrades = Array.isArray(data) ? data : (data && typeof data === 'object' ? [data] : []);
          const trades = Array.isArray(filteredData) ? filteredData : (filteredData && typeof filteredData === 'object' ? [filteredData] : []);

          if (allTrades.length === 0) {
            return (
              <GlassmorphicCard className="text-center py-12">
                <p className="text-text-secondary text-lg">
                  No trades found matching your criteria.
                </p>
                <p className="text-text-secondary/70 mt-2">
                  Try lowering your minimum profit or adjusting margin ranges.
                </p>
              </GlassmorphicCard>
            );
          }

          if (trades.length === 0 && allTrades.length > 0) {
            return (
              <GlassmorphicCard className="text-center py-12">
                <p className="text-text-secondary text-lg">
                  No trades found in the selected category.
                </p>
                <p className="text-text-secondary/70 mt-2">
                  Try selecting a different category or "All Items".
                </p>
              </GlassmorphicCard>
            );
          }

          return (
            <>
              {/* Action Bar */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="text-text-secondary">
                    Found <span className="text-accent-cyan font-medium">{trades.length}</span> profitable trades
                    {categoryFilter !== 'all' && allTrades.length !== trades.length && (
                      <span className="ml-2 text-text-secondary/70">
                        (filtered from {allTrades.length} total)
                      </span>
                    )}
                  </div>
                  {favorites.length > 0 && (
                    <button
                      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                        showFavoritesOnly
                          ? 'bg-accent-gold/20 border-accent-gold/50 text-accent-gold'
                          : 'bg-white/5 border-accent-cyan/20 text-text-secondary hover:bg-white/10'
                      }`}
                      title="Toggle favorites filter (f)"
                    >
                      <svg
                        className={`w-4 h-4 ${showFavoritesOnly ? 'fill-accent-gold' : 'fill-none'}`}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                        />
                      </svg>
                      <span className="text-sm">
                        {showFavoritesOnly ? 'Show All' : 'Favorites Only'}
                      </span>
                      <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-mono bg-space-dark/80 border border-accent-cyan/30 rounded">f</kbd>
                    </button>
                  )}
                  <button
                    onClick={() => setHighQualityOnly(!highQualityOnly)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                      highQualityOnly
                        ? 'bg-green-500/20 border-green-500/50 text-green-400'
                        : 'bg-white/5 border-accent-cyan/20 text-text-secondary hover:bg-white/10'
                    }`}
                    title="Toggle high quality filter (h)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">
                      {highQualityOnly ? 'All Trades' : 'High Quality'}
                    </span>
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-mono bg-space-dark/80 border border-accent-cyan/30 rounded">h</kbd>
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => copyAllResults(trades)}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg hover:bg-accent-cyan/30 transition-colors text-sm"
                    title="Copy all results as table"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Copy All
                  </button>
                  <button
                    onClick={() => copyMultibuyFormat(trades)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                    title="Copy in EVE Online multibuy format"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Multibuy
                  </button>
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg hover:bg-accent-cyan/30 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Save Route
                  </button>
                </div>
              </div>

              {/* Top 10 Recommendations */}
              <TopRecommendations
                data={trades}
                onItemClick={handleRowClick}
                maxItems={10}
              />

              {/* Statistics Summary */}
              <TradingStats data={trades} />

              {/* Profit Distribution */}
              <ProfitDistribution data={trades} className="mb-8" />

              {/* Quality Legend */}
              <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-text-secondary">
                <span className="font-medium">Trade Quality:</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-yellow-400/30 border-l-2 border-yellow-400"></span>
                  Excellent
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-green-400/20 border-l-2 border-green-400"></span>
                  Good
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-cyan-400/15 border-l-2 border-cyan-400"></span>
                  Fair
                </span>
              </div>

              {/* Full Results Table */}
              <TradingTable
                data={trades}
                columns={tableColumns}
                onRowClick={handleRowClick}
                defaultSort={{ column: 'Net Profit', direction: 'desc' }}
                emptyMessage="No trades found matching your criteria"
                showQualityIndicators={true}
                searchInputRef={searchInputRef}
                expandableRowContent={(row) => (
                  <QuickTradeCalculator
                    buyPrice={row['Buy Price']}
                    sellPrice={row['Sell Price']}
                    initialQuantity={row['Volume'] || 1}
                    brokerFee={characterTaxes?.brokerFee || form.brokerFee / 100}
                    salesTax={characterTaxes?.salesTax || form.tax}
                    itemName={row['Item']}
                  />
                )}
              />
            </>
          );
        })()}
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
              placeholder={`${form.station} Trading`}
              className="w-full px-4 py-3 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-cyan mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-accent-cyan/20 text-text-secondary hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoute}
                className="flex-1 px-4 py-2 rounded-lg bg-accent-cyan text-space-black font-medium hover:bg-accent-cyan/90 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        customShortcuts={customShortcuts}
      />
    </PageLayout>
  );
}

export default StationTradingPage;
