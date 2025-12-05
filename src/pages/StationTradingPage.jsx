import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { EmptyState } from '../components/common/EmptyState';
import PullToRefresh from '../components/common/PullToRefresh';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { Button } from '../components/common/Button';
import { QuickTradeCalculator } from '../components/common/QuickTradeCalculator';
import { TopRecommendations } from '../components/common/TopRecommendations';
import { TradingStats } from '../components/common/TradingStats';
import { ProfitDistribution } from '../components/common/ProfitDistribution';
import { useToast } from '../components/common/ToastProvider';
import { FormInput, FormSelect, StationAutocomplete } from '../components/forms';
import { TradingTable } from '../components/tables';
import { SkeletonTable } from '../components/common/SkeletonLoader';
import { SmartFilters } from '../components/common/SmartFilters';
import { VolumeIndicator, VolumeTrendIndicator } from '../components/common/VolumeIndicator';
import { ProfitPerHour } from '../components/common/ProfitPerHour';
import { TradeRiskScore } from '../components/common/TradeRiskScore';
import { SessionSummary } from '../components/common/SessionSummary';
import { PriceSparkline } from '../components/common/PriceSparkline';
import { CompetitionAnalysis } from '../components/common/CompetitionAnalysis';
import { ItemTierBadge } from '../components/common/ItemTierBadge';
import { TradeSimulator } from '../components/trading/TradeSimulator';
import { AdvancedSortPanel, applySorts } from '../components/common/AdvancedSortPanel';
import { BulkActionsBar, SelectionCheckbox } from '../components/common/BulkActionsBar';
import { DataFreshnessIndicator } from '../components/common/DataFreshnessIndicator';
import { TradingDashboard } from '../components/common/TradingDashboard';
import { TradeOpportunityScore, TradeOpportunityBadge } from '../components/common/TradeOpportunityScore';
import { QuickFiltersBar, useQuickFilters } from '../components/common/QuickFiltersBar';
import { TradeHubPresets } from '../components/common/TradeHubPresets';
import { ActionableError } from '../components/common/ActionableError';
import { EveLinksDropdown, EveLinksInline } from '../components/common/EveLinks';
import { TradeDecisionBadge, TradeDecisionCard } from '../components/common/TradeDecisionCard';
import { OrderBookCard } from '../components/common/OrderBookPreview';
import { AffordabilityBadge, AffordabilityCard } from '../components/common/AffordabilityIndicator';
import { QuickPricePanel, QuickCopyButtons } from '../components/common/QuickPricePanel';
import { PriceStatusBadge, PriceDifference, RecommendedPrice, OrdersSummaryStats } from '../components/common/OrderPriceStatus';
import { ProfitSummaryCard, TradeActivityFeed } from '../components/common/ProfitTracker';
// New Station Trading Features
import { MobileQuickActions } from '../components/common/MobileQuickActions';
import { OrderUpdateReminder } from '../components/common/OrderUpdateReminder';
import { PriceUndercutAlert } from '../components/common/PriceUndercutAlert';
import { OrderExpiryTracker } from '../components/common/OrderExpiryTracker';
import { VolumeVelocityAnalysis } from '../components/common/VolumeVelocityAnalysis';
import { CompetitionCounter } from '../components/common/CompetitionCounter';
import { MarketManipulationAlert } from '../components/common/MarketManipulationAlert';
import { InventoryValueTracker } from '../components/common/InventoryValueTracker';
import { ISKPerHourEstimator } from '../components/common/ISKPerHourEstimator';
import { SmartMultibuyBudget } from '../components/common/SmartMultibuyBudget';
import { OrderUpdatePriorityQueue } from '../components/common/OrderUpdatePriorityQueue';
import { useResources } from '../hooks/useResources';
import { useApiCall } from '../hooks/useApiCall';
import { useTradeForm } from '../hooks/useTradeForm';
import { usePortfolio } from '../hooks/usePortfolio';
import { useEveAuth } from '../hooks/useEveAuth';
import { useFavorites } from '../hooks/useFavorites';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import KeyboardShortcutsModal from '../components/common/KeyboardShortcutsModal';
import { useScamDetection } from '../hooks/useScamDetection';
import { useTradeSession } from '../hooks/useTradeSession';
import { usePriceAlerts } from '../hooks/usePriceAlerts';
import { fetchStationTrading } from '../api/trading';
import { getCharacterOrders, getCharacterSkills, calculateTradingTaxes, getTypeNames, getWalletBalance, getWalletTransactions } from '../api/esi';
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
  const location = useLocation();
  const { universeList, loading: resourcesLoading, loadInvTypes, invTypes } = useResources();
  const { data, loading, error, lastUpdated, execute } = useApiCall(fetchStationTrading);
  const { saveRoute } = usePortfolio();
  const { isAuthenticated, character, getAccessToken } = useEveAuth();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { calculateScamRisk, isLikelyScam } = useScamDetection();
  const {
    session,
    addToShoppingList,
    removeFromShoppingList,
    trackView,
    clearSession,
    sessionDuration,
    shoppingListCount,
    viewedCount,
    totalPotentialProfit,
  } = useTradeSession();
  const {
    checkAlerts,
    triggeredAlerts,
    dismissTriggered,
  } = usePriceAlerts();

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
  const toast = useToast();
  const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
  const [hideScams, setHideScams] = useState(false);
  const [highQualityOnly, setHighQualityOnly] = useState(false);

  // Smart Filters state
  const [smartFilters, setSmartFilters] = useState({
    hideScams: false,
    hideLowVolume: false,
    highQualityOnly: false,
    verifiedOnly: false,
    minVolume: 0,
    maxVolume: null,
    minMargin: 0,
    maxMargin: 100,
    minProfit: 0,
    maxProfit: null,
    riskLevels: ['low', 'medium', 'high', 'extreme'],
  });

  // Advanced Sort state
  const [advancedSorts, setAdvancedSorts] = useState([]);

  // Bulk selection state
  const [selectedItems, setSelectedItems] = useState([]);

  // Quick filters state
  const [quickFilterIds, setQuickFilterIds] = useState([]);

  // Dashboard view state
  const [showDashboard, setShowDashboard] = useState(true);

  // New features state
  const [showTradingTools, setShowTradingTools] = useState(false);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [activeToolTab, setActiveToolTab] = useState('overview'); // overview, orders, analysis, tools
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatorPrefill, setSimulatorPrefill] = useState(null);

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

  // Check price alerts when data changes
  useEffect(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      checkAlerts(data);
    }
  }, [data, checkAlerts]);

  // Load character data (skills, wallet, transactions)
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

      // Load wallet transactions for ISK/hour calculation
      try {
        const transactions = await getWalletTransactions(character.id, accessToken);
        setWalletTransactions(transactions || []);
      } catch (txErr) {
        console.error('Failed to load wallet transactions:', txErr);
        setWalletTransactions([]);
      }
    } catch (err) {
      console.error('Failed to load character data:', err);
    }
  };

  // Custom validation for station-specific fields
  const customValidation = useCallback((formData) => {
    const errors = {};

    // Explicitly check if station is empty or not provided
    if (!formData.station || formData.station.trim() === '') {
      errors.station = 'Please select a station';
      return errors;
    }

    // Check if station data is valid
    const stationData = getStationData(formData.station, universeList);
    if (!stationData) {
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

  const handleRefresh = useCallback(async () => {
    if (form.station) {
      await handleSubmit(new Event('submit'));
      toast.info('Data refreshed!');
    }
  }, [form.station, handleSubmit, toast]);

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
      const stationOrders = Array.isArray(allOrders)
        ? allOrders.filter((o) => o.location_id === stationData.station)
        : [];
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

  // Handle row click to view item details
  const handleRowClick = useCallback(
    (item) => {
      const stationData = getStationData(form.station, universeList);
      if (!stationData) return;

      const itemId = item['Item ID'] || item.itemId;
      const itemName = item['Item'] || item.name || 'Unknown Item';
      const buyPrice = item['Buy Price'] || item.buyPrice || 0;
      const sellPrice = item['Sell Price'] || item.sellPrice || 0;
      const margin = item['Gross Margin'] || item.margin || 0;
      const volume = item['Volume'] || item.volume || 0;
      const profit = item['Profit per Unit'] || item['Net Profit'] || item.profit || 0;

      // Track view
      trackView(item);

      // Navigate to item detail page with all trading data
      const params = new URLSearchParams({
        itemId,
        itemName,
        stationId: stationData.stationId || '',
        regionId: stationData.regionId || '10000002',
        buyPrice: buyPrice.toString(),
        sellPrice: sellPrice.toString(),
        margin: margin.toString(),
        volume: volume.toString(),
        profit: profit.toString(),
      });

      navigate(`/item-detail?${params.toString()}`);
    },
    [form.station, universeList, navigate, trackView]
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
      toast.success(successMessage);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      toast.error('Failed to copy to clipboard');
    }
  }, [toast]);

  // Copy individual row
  const copyRowToClipboard = useCallback((item) => {
    const text = `Item: ${item.Item}
Lowest Sell (Buy At): ${formatISK(item['Buy Price'], false)}
Highest Buy (Sell At): ${formatISK(item['Sell Price'], false)}
Profit per Unit: ${formatISK(item['Profit per Unit'], false)}
Net Profit: ${formatISK(item['Net Profit'], false)}
Margin: ${formatPercent(item['Gross Margin'] / 100, 1)}`;

    copyToClipboard(text, 'Trade copied!');
  }, [copyToClipboard]);

  // Copy all results as formatted table
  const copyAllResults = useCallback((trades) => {
    const header = 'Item\tLowest Sell\tHighest Buy\tProfit/Unit\tNet Profit\tMargin';
    const rows = trades.map(trade =>
      `${trade.Item}\t${formatISK(trade['Buy Price'], false)}\t${formatISK(trade['Sell Price'], false)}\t${formatISK(trade['Profit per Unit'], false)}\t${formatISK(trade['Net Profit'], false)}\t${formatPercent(trade['Gross Margin'] / 100, 1)}`
    ).join('\n');

    const text = `${header}\n${rows}`;
    copyToClipboard(text, `Copied ${trades.length} trades!`);
  }, [copyToClipboard]);

  // Copy for EVE Online Multibuy format (correct format: "Item Name 10000")
  const copyMultibuyFormat = useCallback((trades, options = {}) => {
    const { useRecommendedQty = false, maxInvestment = null } = options;

    const text = trades.map(trade => {
      let qty = trade.Volume || 1;
      // If using recommended quantity based on budget
      if (useRecommendedQty && maxInvestment && trade['Buy Price']) {
        qty = Math.floor(maxInvestment / trade['Buy Price']);
      }
      // EVE multibuy format: "Item Name 10000" (space-separated, no 'x')
      return `${trade.Item} ${qty}`;
    }).join('\n');

    copyToClipboard(text, 'Multibuy list copied!');
  }, [copyToClipboard]);

  // Export shopping list
  const exportShoppingList = useCallback(() => {
    if (session.shoppingList.length === 0) return;
    copyMultibuyFormat(session.shoppingList);
  }, [session.shoppingList, copyMultibuyFormat]);

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
    if (!orders || !Array.isArray(orders)) {
      return { totalOrders: 0, buyOrders: 0, sellOrders: 0, buyEscrow: 0, sellValue: 0, totalValue: 0 };
    }
    const buyOrders = orders.filter((o) => o.is_buy_order);
    const sellOrders = orders.filter((o) => !o.is_buy_order);

    const buyEscrow = buyOrders.reduce((sum, o) => sum + (o.escrow || 0), 0);
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

  // Filter data by category and smart filters
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

    // Apply smart filters
    if (smartFilters.hideScams) {
      filtered = filtered.filter((item) => !isLikelyScam(item, data));
    }

    if (smartFilters.hideLowVolume) {
      filtered = filtered.filter((item) => (item['Volume'] || 0) >= 50);
    }

    if (smartFilters.highQualityOnly) {
      filtered = filtered.filter((item) => {
        const margin = (item['Gross Margin'] || 0) / 100;
        const profit = item['Net Profit'] || 0;
        const volume = item['Volume'] || 0;
        return margin > 0.10 && profit > 1000000 && volume > 100;
      });
    }

    if (smartFilters.minVolume > 0) {
      filtered = filtered.filter((item) => (item['Volume'] || 0) >= smartFilters.minVolume);
    }

    if (smartFilters.maxVolume !== null) {
      filtered = filtered.filter((item) => (item['Volume'] || 0) <= smartFilters.maxVolume);
    }

    if (smartFilters.minMargin > 0) {
      filtered = filtered.filter((item) => (item['Gross Margin'] || 0) >= smartFilters.minMargin);
    }

    if (smartFilters.maxMargin < 100) {
      filtered = filtered.filter((item) => (item['Gross Margin'] || 0) <= smartFilters.maxMargin);
    }

    if (smartFilters.minProfit > 0) {
      filtered = filtered.filter((item) => (item['Net Profit'] || 0) >= smartFilters.minProfit);
    }

    if (smartFilters.maxProfit !== null) {
      filtered = filtered.filter((item) => (item['Net Profit'] || 0) <= smartFilters.maxProfit);
    }

    // Apply risk level filter
    if (smartFilters.riskLevels.length < 4) {
      filtered = filtered.filter((item) => {
        const risk = calculateScamRisk(item, data);
        return smartFilters.riskLevels.includes(risk.level);
      });
    }

    // Apply favorites filter
    if (showFavoritesOnly && favorites.length > 0) {
      filtered = filtered.filter((item) => {
        const itemId = item['Item ID'] || item.itemId;
        return favorites.includes(itemId);
      });
    }

    // Apply legacy high quality filter
    if (highQualityOnly) {
      filtered = filtered.filter((item) => {
        const margin = (item['Gross Margin'] || 0) / 100;
        const profit = item['Net Profit'] || 0;
        const volume = item['Volume'] || 0;
        return margin > 0.10 && profit > 1000000 && volume > 100;
      });
    }

    return filtered;
  }, [data, categoryFilter, invTypes, smartFilters, showFavoritesOnly, favorites, highQualityOnly, calculateScamRisk, isLikelyScam]);

  // Apply quick filters
  const quickFilteredData = useQuickFilters(filteredData, quickFilterIds);

  // Apply advanced sorting
  const sortedData = useMemo(() => {
    const dataToSort = quickFilteredData || filteredData;
    if (!dataToSort || !Array.isArray(dataToSort)) return dataToSort;
    if (advancedSorts.length === 0) return dataToSort;

    return applySorts(dataToSort, advancedSorts, tableColumns);
  }, [quickFilteredData, filteredData, advancedSorts]);

  // Keyboard shortcuts configuration
  const keyboardHandlers = useMemo(() => ({
    // Toggle favorites filter (f key)
    'f': () => {
      setShowFavoritesOnly(prev => !prev);
      toast.info(`Favorites filter ${!showFavoritesOnly ? 'enabled' : 'disabled'}`);
    },
    // Refresh data (r key)
    'r': () => {
      if (form.station && data !== null) {
        handleSubmit(new Event('submit'));
        toast.info('Refreshing data...');
      }
    },
    // Focus search box (/ or Ctrl+K or Ctrl+F)
    '/': () => {
      searchInputRef.current?.focus();
    },
    'ctrl+k': () => {
      searchInputRef.current?.focus();
    },
    'ctrl+f': () => {
      searchInputRef.current?.focus();
    },
    // Clear search / close modals / deselect (Escape)
    'escape': () => {
      if (searchInputRef.current === document.activeElement) {
        searchInputRef.current.value = '';
        searchInputRef.current.blur();
      }
      if (showSaveModal) setShowSaveModal(false);
      if (showOrders) setShowOrders(false);
      if (selectedRowIndex >= 0) setSelectedRowIndex(-1);
    },
    // Navigate table rows (arrow keys)
    'arrowdown': () => {
      const trades = Array.isArray(sortedData) ? sortedData : [];
      if (trades.length > 0) {
        setSelectedRowIndex(prev => prev < 0 ? 0 : Math.min(prev + 1, trades.length - 1));
      }
    },
    'arrowup': () => {
      const trades = Array.isArray(sortedData) ? sortedData : [];
      if (trades.length > 0 && selectedRowIndex >= 0) {
        setSelectedRowIndex(prev => Math.max(prev - 1, 0));
      }
    },
    // Navigate table rows (j/k vim style)
    'j': () => {
      const trades = Array.isArray(sortedData) ? sortedData : [];
      if (trades.length > 0) {
        setSelectedRowIndex(prev => prev < 0 ? 0 : Math.min(prev + 1, trades.length - 1));
      }
    },
    'k': () => {
      const trades = Array.isArray(sortedData) ? sortedData : [];
      if (trades.length > 0 && selectedRowIndex >= 0) {
        setSelectedRowIndex(prev => Math.max(prev - 1, 0));
      }
    },
    // Open selected trade details (Enter)
    'enter': () => {
      const trades = Array.isArray(sortedData) ? sortedData : [];
      if (selectedRowIndex >= 0 && selectedRowIndex < trades.length) {
        handleRowClick(trades[selectedRowIndex]);
      }
    },
    // Copy selected trade (Ctrl+C)
    'ctrl+c': () => {
      const trades = Array.isArray(sortedData) ? sortedData : [];
      if (selectedRowIndex >= 0 && selectedRowIndex < trades.length) {
        copyRowToClipboard(trades[selectedRowIndex]);
      }
    },
    // Copy multibuy format (m)
    'm': () => {
      const trades = Array.isArray(sortedData) ? sortedData : [];
      if (trades.length > 0) {
        copyMultibuyFormat(trades);
      }
    },
    // Toggle watchlist panel (w key)
    'w': () => {
      setShowFavoritesOnly(prev => !prev);
      toast.info(`Watchlist ${!showFavoritesOnly ? 'shown' : 'hidden'}`);
    },
    // Add selected item to watchlist (a key)
    'a': () => {
      const trades = Array.isArray(sortedData) ? sortedData : [];
      if (selectedRowIndex >= 0 && selectedRowIndex < trades.length) {
        const itemId = trades[selectedRowIndex]['Item ID'] || trades[selectedRowIndex].itemId;
        const wasInWatchlist = isFavorite(itemId);
        toggleFavorite(itemId);
        toast.success(`${wasInWatchlist ? 'Removed from' : 'Added to'} watchlist`);
      }
    },
    // Quick filter presets (1-5 keys)
    '1': () => {
      if (quickFilterIds.length > 0 && data !== null) {
        setQuickFilterIds([quickFilterIds[0]]);
        toast.info('Quick filter 1 applied');
      }
    },
    '2': () => {
      if (quickFilterIds.length > 1 && data !== null) {
        setQuickFilterIds([quickFilterIds[1]]);
        toast.info('Quick filter 2 applied');
      }
    },
    '3': () => {
      if (quickFilterIds.length > 2 && data !== null) {
        setQuickFilterIds([quickFilterIds[2]]);
        toast.info('Quick filter 3 applied');
      }
    },
    '4': () => {
      if (quickFilterIds.length > 3 && data !== null) {
        setQuickFilterIds([quickFilterIds[3]]);
        toast.info('Quick filter 4 applied');
      }
    },
    '5': () => {
      if (quickFilterIds.length > 4 && data !== null) {
        setQuickFilterIds([quickFilterIds[4]]);
        toast.info('Quick filter 5 applied');
      }
    },
    // Toggle high quality filter (h)
    'h': () => {
      setHighQualityOnly(prev => !prev);
      toast.info(`High quality filter ${!highQualityOnly ? 'enabled' : 'disabled'}`);
    },
    // Toggle dashboard view (b for board)
    'b': () => {
      setShowDashboard(prev => !prev);
      toast.info(`Dashboard ${!showDashboard ? 'shown' : 'hidden'}`);
    },
  }), [form.station, data, handleSubmit, showSaveModal, showOrders, sortedData, selectedRowIndex, showFavoritesOnly, highQualityOnly, showDashboard, copyRowToClipboard, copyMultibuyFormat, handleRowClick, toggleFavorite, isFavorite, quickFilterIds]);

  // Local state for keyboard shortcuts help modal
  const [showHelp, setShowHelp] = useState(false);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts(
    () => setShowHelp(prev => !prev),  // toggleShortcutsModal
    undefined  // toggleSearchModal
  );

  // Define custom shortcuts for help modal
  const customShortcuts = useMemo(() => [
    {
      category: 'Station Trading - Filtering',
      items: [
        { keys: ['f'], description: 'Toggle favorites filter' },
        { keys: ['w'], description: 'Toggle watchlist panel' },
        { keys: ['h'], description: 'Toggle high quality filter' },
        { keys: ['b'], description: 'Toggle dashboard view' },
        { keys: ['1-5'], description: 'Apply quick filter preset' },
      ],
    },
    {
      category: 'Station Trading - Actions',
      items: [
        { keys: ['r'], description: 'Refresh data' },
        { keys: ['/', 'Ctrl+F', 'Ctrl+K'], description: 'Focus search' },
        { keys: ['↑', '↓', 'j', 'k'], description: 'Navigate table rows' },
        { keys: ['Enter'], description: 'Open selected trade details' },
        { keys: ['Ctrl+C'], description: 'Copy selected trade' },
        { keys: ['a'], description: 'Add selected to watchlist' },
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

  // Table columns configuration with new components
  const tableColumns = useMemo(
    () => [
      {
        key: 'Select',
        label: '',
        className: 'w-12',
        render: (data, row) => {
          const itemId = row['Item ID'] || row.itemId;
          return (
            <SelectionCheckbox
              itemId={itemId}
              isSelected={selectedItems.includes(itemId)}
              onToggle={() => {
                setSelectedItems(prev =>
                  prev.includes(itemId)
                    ? prev.filter(id => id !== itemId)
                    : [...prev, itemId]
                );
              }}
            />
          );
        },
      },
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
        key: 'Decision',
        label: '',
        className: 'w-16',
        render: (data, row) => (
          <TradeDecisionBadge
            trade={row}
            allTrades={Array.isArray(sortedData) ? sortedData : []}
          />
        ),
      },
      {
        key: 'Item',
        label: 'Item',
        className: 'font-medium',
        render: (itemName, row) => (
          <div className="flex items-center gap-2">
            <TradeOpportunityBadge trade={row} />
            <ItemTierBadge itemName={itemName} compact={true} />
            <span>{itemName}</span>
          </div>
        ),
      },
      {
        key: 'Buy Price',
        label: 'Lowest Sell',
        type: 'num',
        render: (data, row) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-red-400">{formatISK(data, false)}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(String(data), 'Buy price copied!');
                }}
                className="p-1 text-text-secondary hover:text-accent-cyan transition-colors opacity-60 hover:opacity-100"
                title="Copy buy price"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <span className="text-[10px] text-text-secondary">Buy at this price</span>
          </div>
        ),
      },
      {
        key: 'Sell Price',
        label: 'Highest Buy',
        type: 'num',
        render: (data, row) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-green-400">{formatISK(data, false)}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(String(data), 'Sell price copied!');
                }}
                className="p-1 text-text-secondary hover:text-accent-cyan transition-colors opacity-60 hover:opacity-100"
                title="Copy sell price"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <span className="text-[10px] text-text-secondary">Sell at this price</span>
          </div>
        ),
      },
      {
        key: 'Volume',
        label: 'Volume',
        type: 'num',
        render: (data, row) => {
          const typeId = row['Item ID'] || row.itemId;
          const stationData = getStationData(form.station, universeList);
          const regionId = stationData?.region;

          // Use VolumeTrendIndicator if we have the required data
          if (typeId && regionId) {
            return (
              <VolumeTrendIndicator
                typeId={typeId}
                regionId={regionId}
                currentVolume={data}
                compact={true}
              />
            );
          }

          // Fallback to basic VolumeIndicator
          const maxVolume = Math.max(...(Array.isArray(sortedData) ? sortedData : []).map(t => t.Volume || 0), 1000);
          return <VolumeIndicator volume={data} maxVolume={maxVolume} compact={true} />;
        },
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
        render: (data, row) => (
          <div className="flex flex-col gap-1">
            <span>{formatISK(data, false)}</span>
            <ProfitPerHour trade={row} inline={true} />
          </div>
        ),
      },
      {
        key: 'Gross Margin',
        label: 'Margin',
        type: 'num',
        render: (data, row) => (
          <div className="flex items-center gap-2">
            <span>{formatPercent(data / 100, 1)}</span>
            <CompetitionAnalysis trade={row} compact={true} />
          </div>
        ),
      },
      {
        key: 'Risk',
        label: 'Risk',
        type: 'num',
        render: (data, row) => {
          const risk = calculateScamRisk(row, Array.isArray(sortedData) ? sortedData : []);
          return <TradeRiskScore trade={row} compact={true} />;
        },
      },
      {
        key: 'Afford',
        label: '',
        className: 'w-20',
        render: (data, row) => {
          if (walletBalance === null) return null;
          const cost = row['Buy Price'] || 0;
          return (
            <AffordabilityBadge cost={cost} walletBalance={walletBalance} />
          );
        },
      },
      {
        key: 'quickCopy',
        label: 'Quick Copy',
        className: 'w-32',
        render: (data, row) => (
          <QuickCopyButtons
            buyPrice={row['Buy Price']}
            sellPrice={row['Sell Price']}
            onCopy={(msg) => toast.success(msg)}
          />
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        className: 'w-36',
        render: (data, row) => {
          const itemId = row['Item ID'] || row.itemId;
          const stationData = getStationData(form.station, universeList);
          const regionId = stationData?.region;
          const stationId = stationData?.station;

          return (
            <div className="flex gap-1 items-center">
              {/* EVE Links Dropdown */}
              <EveLinksDropdown
                typeId={itemId}
                regionId={regionId}
                stationId={stationId}
                itemName={row.Item}
              />
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToShoppingList(row);
                  toast.success('Added to shopping list');
                }}
                className="p-1.5 text-text-secondary hover:text-green-400 transition-colors"
                title="Add to shopping list"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSimulatorPrefill({
                    buyPrice: row['Buy Price'],
                    sellPrice: row['Sell Price'],
                    quantity: row['Volume'],
                  });
                  setShowSimulator(true);
                  toast.info('Simulator pre-filled with trade data.');
                }}
                className="p-1.5 text-text-secondary hover:text-accent-purple transition-colors"
                title="Simulate this trade"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M12 8h.01M15 8h.01M15 5h.01M12 5h.01M9 5h.01M4 7h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z" />
                </svg>
              </button>
            </div>
          );
        },
      },
    ],
    [isFavorite, toggleFavorite, copyRowToClipboard, sortedData, selectedItems, calculateScamRisk, addToShoppingList, walletBalance, form.station, universeList, toast]
  );

  return (
    <PageLayout
      title="Station Trading"
      subtitle="Find profitable buy/sell margins within a single station"
    >
      <PullToRefresh onRefresh={handleRefresh}>
        {/* Add padding-bottom for mobile quick actions bar */}
        <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">

        {/* Price Alert Notifications */}
        {triggeredAlerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {triggeredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 bg-accent-gold/10 border border-accent-gold/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <div>
                    <div className="text-text-primary font-medium">
                      Price Alert: {alert.itemName}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {alert.type} is {alert.condition} {alert.threshold}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => dismissTriggered(alert.id)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Form */}
        <GlassmorphicCard className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Primary Fields */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="space-y-3">
                <StationAutocomplete
                  label="Station"
                  value={form.station}
                  onChange={(v) => updateForm('station', v)}
                  placeholder="Jita IV - Moon 4 - Caldari Navy Assembly Plant"
                  error={errors.station}
                  required
                />
                <TradeHubPresets
                  selectedStation={form.station}
                  onStationSelect={(station) => updateForm('station', station)}
                  compact
                />
              </div>

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

            <div className="border-t border-accent-cyan/10 pt-4">
              <Button
                  onClick={() => setShowSimulator(!showSimulator)}
                  variant="secondary"
                  className="w-full"
                  data-testid="toggle-simulator-button"
              >
                {showSimulator ? 'Hide' : 'Show'} Trade Simulator
              </Button>
            </div>

            {/* Advanced Filters (Collapsible) */}
            {showAdvanced && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-fadeIn">
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

        {showSimulator && (
          <div className="my-8">
            <TradeSimulator prefillData={simulatorPrefill} />
          </div>
        )}

        {/* Wallet Balance & Tax Rate Indicator */}
        {isAuthenticated && (
          <div className="mb-6 flex flex-wrap items-center gap-2 md:gap-4 text-xs sm:text-sm">
            {walletBalance !== null && (
              <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-accent-gold/10 border border-accent-gold/20 rounded-lg">
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
                {orders?.length > 0 && (
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
                {/* Enhanced Summary Stats - EVE Tycoon Style */}
                {orders?.length > 0 && (
                  <OrdersSummaryStats orders={orders} className="mb-6" />
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

                {/* Enhanced Orders Table with Price Comparison */}
                {!ordersLoading && orders?.length > 0 && (
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-space-dark z-10">
                        <tr className="text-text-secondary border-b border-accent-cyan/20">
                          <th className="text-left py-2 px-3">Item</th>
                          <th className="text-left py-2 px-3">Type</th>
                          <th className="text-right py-2 px-3">Your Price</th>
                          <th className="text-center py-2 px-3">Status</th>
                          <th className="text-right py-2 px-3">Difference</th>
                          <th className="text-left py-2 px-3">Update To</th>
                          <th className="text-right py-2 px-3">Volume</th>
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

                          // Find market price from current trade data
                          const tradeData = Array.isArray(data) ? data.find(t =>
                            (t['Item ID'] || t.itemId) === order.type_id
                          ) : null;

                          // For buy orders, compare to highest buy (Sell Price in our data)
                          // For sell orders, compare to lowest sell (Buy Price in our data)
                          const marketPrice = order.is_buy_order
                            ? tradeData?.['Sell Price']  // Highest buy order price
                            : tradeData?.['Buy Price'];  // Lowest sell order price

                          return (
                            <tr
                              key={order.order_id}
                              className="border-b border-accent-cyan/10 hover:bg-white/5 transition-colors"
                            >
                              <td className="py-2 px-3 text-text-primary">
                                {typeNames[order.type_id] || `Type ${order.type_id}`}
                              </td>
                              <td className="py-2 px-3">
                                <span className={`px-2 py-0.5 rounded text-xs ${order.is_buy_order
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-green-500/20 text-green-400'
                                  }`}>
                                  {order.is_buy_order ? 'BUY' : 'SELL'}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(String(order.price), 'Price copied!');
                                  }}
                                  className="font-mono text-text-primary hover:text-accent-cyan transition-colors"
                                  title="Click to copy"
                                >
                                  {formatISK(order.price, false)}
                                </button>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <PriceStatusBadge
                                  orderPrice={order.price}
                                  marketPrice={marketPrice}
                                  isBuyOrder={order.is_buy_order}
                                />
                              </td>
                              <td className="py-2 px-3 text-right">
                                <PriceDifference
                                  orderPrice={order.price}
                                  marketPrice={marketPrice}
                                  isBuyOrder={order.is_buy_order}
                                />
                              </td>
                              <td className="py-2 px-3">
                                <RecommendedPrice
                                  marketPrice={marketPrice}
                                  isBuyOrder={order.is_buy_order}
                                  onCopy={(msg) => toast.success(msg)}
                                />
                              </td>
                              <td className="py-2 px-3 text-right">
                                <div className="flex flex-col items-end gap-1">
                                  <span className="font-mono text-text-secondary text-xs">
                                    {formatNumber(order.volume_remain, 0)} / {formatNumber(order.volume_total, 0)}
                                  </span>
                                  <div className="w-16 h-1.5 bg-space-dark rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-accent-cyan rounded-full"
                                      style={{ width: `${fillPercent}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className={`py-2 px-3 text-right text-sm ${daysLeft <= 3 ? 'text-red-400' : daysLeft <= 7 ? 'text-yellow-400' : 'text-text-secondary'
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

        {/* Trading Tools Panel - New Features */}
        {isAuthenticated && orders?.length > 0 && (
          <GlassmorphicCard className="mb-8">
            <button
              onClick={() => setShowTradingTools(!showTradingTools)}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-purple/20 rounded-lg">
                  <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-text-primary font-medium">Trading Tools & Analysis</h3>
                  <p className="text-xs text-text-secondary">
                    Advanced order management and market analysis
                  </p>
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-text-secondary transition-transform ${showTradingTools ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showTradingTools && (
              <div className="px-4 pb-4 space-y-4">
                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 p-1 bg-space-dark/50 rounded-lg">
                  {[
                    { id: 'overview', label: 'Overview', icon: '📊' },
                    { id: 'orders', label: 'Order Management', icon: '📋' },
                    { id: 'analysis', label: 'Market Analysis', icon: '🔍' },
                    { id: 'tools', label: 'Smart Tools', icon: '🛠️' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveToolTab(tab.id)}
                      className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeToolTab === tab.id
                          ? 'bg-accent-cyan/20 text-accent-cyan'
                          : 'text-text-secondary hover:bg-white/5'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-4">
                  {/* Overview Tab */}
                  {activeToolTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Price Undercut Alerts */}
                      <PriceUndercutAlert
                        orders={orders}
                        marketData={data || []}
                        typeNames={typeNames}
                        onCopyPrice={(price, itemName) => {
                          copyToClipboard(String(price), `Price for ${itemName} copied!`);
                        }}
                      />

                      {/* ISK/Hour Estimator */}
                      <ISKPerHourEstimator
                        transactions={walletTransactions}
                        activeSession={{
                          startTime: session.startTime || Date.now(),
                        }}
                      />

                      {/* Inventory Value Tracker */}
                      <InventoryValueTracker
                        orders={orders}
                        typeNames={typeNames}
                        invTypes={invTypes}
                        walletBalance={walletBalance}
                      />
                    </div>
                  )}

                  {/* Order Management Tab */}
                  {activeToolTab === 'orders' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Order Update Priority Queue */}
                      <OrderUpdatePriorityQueue
                        orders={orders}
                        marketData={data || []}
                        typeNames={typeNames}
                        onCopyPrice={(price, itemName) => {
                          copyToClipboard(String(price), `Price for ${itemName} copied!`);
                        }}
                      />

                      {/* Order Update Reminder */}
                      <OrderUpdateReminder
                        orders={orders}
                        typeNames={typeNames}
                        marketData={data || []}
                        staleThresholdHours={4}
                        onCopyPrice={(price, itemName) => {
                          copyToClipboard(String(price), `Recommended price for ${itemName} copied!`);
                        }}
                      />

                      {/* Order Expiry Tracker */}
                      <OrderExpiryTracker
                        orders={orders}
                        typeNames={typeNames}
                        warningDays={3}
                        criticalDays={1}
                      />
                    </div>
                  )}

                  {/* Market Analysis Tab */}
                  {activeToolTab === 'analysis' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Volume Velocity Analysis */}
                      <VolumeVelocityAnalysis
                        orders={orders}
                        marketData={data || []}
                        typeNames={typeNames}
                      />

                      {/* Market Manipulation Alert */}
                      <MarketManipulationAlert
                        marketData={data || []}
                      />

                      {/* Competition Counter - placeholder, needs market orders data */}
                      <div className="p-4 bg-white/5 rounded-xl border border-accent-cyan/10">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xl">👥</span>
                          <div>
                            <h4 className="text-text-primary font-medium">Competition Analysis</h4>
                            <p className="text-xs text-text-secondary">Coming soon - requires market orders API</p>
                          </div>
                        </div>
                        <p className="text-xs text-text-secondary">
                          This feature will analyze how many competitors are trading the same items
                          and help you identify less crowded markets.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Smart Tools Tab */}
                  {activeToolTab === 'tools' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Smart Multibuy Budget */}
                      <SmartMultibuyBudget
                        trades={data || []}
                        walletBalance={walletBalance || 0}
                        onCopyMultibuy={(text) => {
                          copyToClipboard(text, 'Smart multibuy list copied!');
                        }}
                      />

                      {/* Quick Tips */}
                      <div className="p-4 bg-accent-cyan/10 border border-accent-cyan/20 rounded-xl">
                        <h4 className="text-accent-cyan font-medium mb-3 flex items-center gap-2">
                          <span>💡</span> Station Trading Tips
                        </h4>
                        <ul className="space-y-2 text-sm text-text-secondary">
                          <li className="flex items-start gap-2">
                            <span className="text-accent-cyan">•</span>
                            Update orders every 4-6 hours for best results
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-accent-cyan">•</span>
                            Focus on items with &gt;10% margin and &gt;100 daily volume
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-accent-cyan">•</span>
                            Diversify across 10-20 items to reduce risk
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-accent-cyan">•</span>
                            Train Accounting and Broker Relations to reduce fees
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-accent-cyan">•</span>
                            Avoid items with extremely high margins (&gt;50%) - often traps
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </GlassmorphicCard>
        )}

        {/* Error Display */}
        {error && (
          <ActionableError
            error={error}
            onRetry={() => handleSubmit({ preventDefault: () => { } })}
            className="mb-8"
          />
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
          const trades = Array.isArray(sortedData) ? sortedData : (sortedData && typeof sortedData === 'object' ? [sortedData] : []);

          if (allTrades.length === 0) {
            return (
              <EmptyState
                icon={<SearchX className="w-10 h-10" />}
                title="No trades found"
                description="Try adjusting your filters or try different parameters to find more opportunities."
                variant="search"
              />
            );
          }

          if (trades.length === 0 && allTrades.length > 0) {
            return (
              <EmptyState
                icon={<SearchX className="w-10 h-10" />}
                title="No trades found for this category"
                description="Try selecting a different category or 'All Items' to see results."
                variant="search"
              />
            );
          }

          return (
            <>
              {/* Dashboard Toggle and At-A-Glance View */}
              <div className="mb-6 flex items-center justify-between">
                <Button
                  onClick={() => setShowDashboard(!showDashboard)}
                  variant={showDashboard ? 'secondary' : 'ghost'}
                  className={`border ${showDashboard ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan' : 'bg-white/5 border-accent-cyan/20 text-text-secondary hover:bg-white/10'}`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  <span className="font-medium">Dashboard</span>
                  <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-xs font-mono bg-space-dark/80 border border-accent-cyan/30 rounded">d</kbd>
                </Button>
              </div>

              {/* At-A-Glance Trading Dashboard */}
              {showDashboard && (
                <>
                  <TradingDashboard
                    data={trades}
                    onItemClick={handleRowClick}
                    walletBalance={walletBalance}
                    className="mb-6"
                  />

                  {/* Profit Summary & Activity Feed - EVE Tycoon style */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                    <div className="lg:col-span-2">
                      <ProfitSummaryCard
                        trades={trades}
                        period="30d"
                        walletBalance={walletBalance}
                      />
                    </div>
                    <div className="lg:col-span-1">
                      <TradeActivityFeed
                        trades={trades}
                        maxItems={5}
                        className="h-full"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Quick Filters Bar */}
              <QuickFiltersBar
                onFilterChange={setQuickFilterIds}
                activeFilters={quickFilterIds}
                data={allTrades}
                className="mb-6 p-4 bg-space-dark/30 border border-accent-cyan/10 rounded-xl"
              />

              {/* Smart Filters */}
              <SmartFilters
                onChange={setSmartFilters}
                initialFilters={smartFilters}
                data={allTrades}
              />

              {/* Advanced Sort Panel */}
              <AdvancedSortPanel
                currentSort={advancedSorts}
                onChange={setAdvancedSorts}
                className="mb-6"
              />

              {/* Action Bar */}
              <div className="mb-6 flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                  <div className="text-text-secondary text-sm">
                    Found <span className="text-accent-cyan font-medium">{trades.length}</span> profitable trades
                    {categoryFilter !== 'all' && allTrades.length !== trades.length && (
                      <span className="ml-2 text-text-secondary/70">
                        (filtered from {allTrades.length} total)
                      </span>
                    )}
                  </div>
                  <DataFreshnessIndicator
                    lastUpdated={lastUpdated}
                    onRefresh={() => handleSubmit({ preventDefault: () => { } })}
                    isLoading={loading}
                    compact
                  />
                  {favorites.length > 0 && (
                    <button
                      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${showFavoritesOnly
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
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${highQualityOnly
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
                <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => copyAllResults(trades)}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg hover:bg-accent-cyan/30 transition-colors text-xs md:text-sm min-h-[44px]"
                    title="Copy all results as table"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="hidden sm:inline">Copy All</span>
                    <span className="sm:hidden">Copy</span>
                  </button>
                  <button
                    onClick={() => copyMultibuyFormat(trades)}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-xs md:text-sm min-h-[44px]"
                    title="Copy in EVE Online multibuy format"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Multibuy
                  </button>
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
                tableId="station-trading-table"
                data={trades}
                columns={tableColumns}
                onRowClick={handleRowClick}
                defaultSort={{ column: 'Net Profit', direction: 'desc' }}
                emptyMessage="No trades found matching your criteria"
                showQualityIndicators={true}
                searchInputRef={searchInputRef}
                selectedRowIndex={selectedRowIndex}
                onClearFilters={() => {
                  setSmartFilters({
                    hideScams: false,
                    hideLowVolume: false,
                    highQualityOnly: false,
                    verifiedOnly: false,
                    minVolume: 0,
                    maxVolume: null,
                    minMargin: 0,
                    maxMargin: 100,
                    minProfit: 0,
                    maxProfit: null,
                    riskLevels: ['low', 'medium', 'high', 'extreme'],
                  });
                  setQuickFilterIds([]);
                }}
                expandableRowContent={(row) => {
                  const itemId = row['Item ID'] || row.itemId;
                  const stationData = getStationData(form.station, universeList);
                  const regionId = stationData?.region;
                  const stationId = stationData?.station;

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {/* Quick Price Copy Panel - Most Important! */}
                      <div className="lg:col-span-1">
                        <QuickPricePanel
                          buyPrice={row['Buy Price']}
                          sellPrice={row['Sell Price']}
                          itemName={row['Item']}
                          onCopy={(msg) => toast.success(msg)}
                        />
                      </div>

                      {/* Quick Calculator */}
                      <div className="lg:col-span-1">
                        <QuickTradeCalculator
                          buyPrice={row['Buy Price']}
                          sellPrice={row['Sell Price']}
                          initialQuantity={row['Volume'] || 1}
                          brokerFee={characterTaxes?.brokerFee || form.brokerFee / 100}
                          salesTax={characterTaxes?.salesTax || form.tax}
                          itemName={row['Item']}
                        />
                      </div>

                      {/* Trade Decision Card */}
                      <div className="lg:col-span-1">
                        <TradeDecisionCard
                          trade={row}
                          allTrades={Array.isArray(sortedData) ? sortedData : []}
                        />
                        {/* Affordability Card (if logged in) */}
                        {walletBalance !== null && (
                          <AffordabilityCard
                            cost={row['Buy Price'] || 0}
                            walletBalance={walletBalance}
                            itemName={row['Item']}
                            className="mt-4"
                          />
                        )}
                      </div>

                      {/* Order Book Preview */}
                      <div className="lg:col-span-1">
                        {regionId && itemId && (
                          <OrderBookCard
                            regionId={regionId}
                            typeId={itemId}
                            stationId={stationId}
                            itemName={row['Item']}
                          />
                        )}
                      </div>
                    </div>
                  );
                }}
              />
            </>
          );
        })()}
        </div>
      </PullToRefresh>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        items={Array.isArray(sortedData) ? sortedData : []}
        selectedIds={selectedItems}
        onSelectionChange={setSelectedItems}
        onBulkFavorite={(items) => {
          items.forEach(item => {
            const itemId = item['Item ID'] || item.itemId;
            if (!isFavorite(itemId)) {
              toggleFavorite(itemId);
            }
          });
          toast.success(`Added ${items.length} items to favorites`);
        }}
        onBulkAddToShoppingList={(items) => {
          items.forEach(item => addToShoppingList(item));
          toast.success(`Added ${items.length} items to shopping list`);
        }}
        onBulkCopy={(items) => {
          toast.success(`Copied ${items.length} items`);
        }}
        onExport={(items) => {
          toast.success(`Exported ${items.length} items`);
        }}
      />

      {/* Session Summary */}
      <SessionSummary
        sessionDuration={sessionDuration}
        viewedCount={viewedCount}
        shoppingListCount={shoppingListCount}
        totalPotentialProfit={totalPotentialProfit}
        shoppingList={session.shoppingList}
        onClearSession={clearSession}
        onExportShoppingList={exportShoppingList}
        onRemoveFromShoppingList={removeFromShoppingList}
      />

      {/* Mobile Quick Actions Bar */}
      {data !== null && !loading && (
        <MobileQuickActions
          onRefresh={() => handleSubmit({ preventDefault: () => {} })}
          onCopyAll={() => {
            const trades = Array.isArray(sortedData) ? sortedData : [];
            if (trades.length > 0) copyAllResults(trades);
          }}
          onMultibuy={() => {
            const trades = Array.isArray(sortedData) ? sortedData : [];
            if (trades.length > 0) copyMultibuyFormat(trades);
          }}
          onSaveRoute={() => setShowSaveModal(true)}
          onToggleFavorites={() => setShowFavoritesOnly(prev => !prev)}
          onToggleHighQuality={() => setHighQualityOnly(prev => !prev)}
          showFavoritesOnly={showFavoritesOnly}
          highQualityOnly={highQualityOnly}
          isLoading={loading}
          tradesCount={Array.isArray(sortedData) ? sortedData.length : 0}
        />
      )}

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
              <Button
                onClick={() => setShowSaveModal(false)}
                variant="ghost"
                className="flex-1 border border-accent-cyan/20 text-text-secondary hover:bg-white/5 min-h-[44px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveRoute}
                variant="primary"
                className="flex-1 min-h-[44px]"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </PageLayout>
  );
}

export default StationTradingPage;
