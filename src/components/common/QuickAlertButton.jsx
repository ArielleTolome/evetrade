import { useState, useRef, useEffect } from 'react';
import { formatNumber } from '../../utils/formatters';

/**
 * Quick Alert Button Component
 * Allows users to quickly create alerts directly from trade rows
 */
export function QuickAlertButton({
  item,
  onCreateAlert,
  onCreateFromPreset,
  ALERT_TYPES,
  PRIORITY_LEVELS,
  ALERT_PRESETS,
  historicalData: _historicalData = null,
  className = '',
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const menuRef = useRef(null);

  const itemName = item?.['Item'] || item?.item || '';
  const itemId = item?.['Item ID'] || item?.itemId || null;
  const buyPrice = item?.['Buy Price'] || item?.buyPrice || 0;
  const sellPrice = item?.['Sell Price'] || item?.sellPrice || 0;
  const margin = item?.['Gross Margin'] || item?.margin || 0;
  const netProfit = item?.['Net Profit'] || item?.netProfit || 0;
  const volume = item?.['Volume'] || item?.volume || 0;

  // Custom alert form state
  const [customAlert, setCustomAlert] = useState({
    type: ALERT_TYPES?.MARGIN_THRESHOLD || 'marginReaches',
    condition: 'above',
    threshold: '',
    priority: PRIORITY_LEVELS?.MEDIUM || 'medium',
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
        setShowCustomForm(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMenu]);

  const handlePresetClick = (preset) => {
    if (onCreateFromPreset) {
      onCreateFromPreset(preset.id, itemName, itemId);
    }
    setShowMenu(false);
  };

  const handleCustomAlertSubmit = () => {
    if (!customAlert.threshold || customAlert.threshold <= 0) {
      alert('Please enter a valid threshold');
      return;
    }

    const alertConfig = {
      itemName,
      itemId,
      type: customAlert.type,
      condition: customAlert.condition,
      threshold: Number(customAlert.threshold),
      priority: customAlert.priority,
      oneTime: true,
    };

    // Add baseline values for spike/drop detection
    if (customAlert.type === (ALERT_TYPES?.VOLUME_SPIKE || 'volumeSpike')) {
      alertConfig.baselineVolume = volume;
    }
    if (customAlert.type === (ALERT_TYPES?.PRICE_DROP || 'priceDropBelow')) {
      alertConfig.baselinePrice = buyPrice;
    }
    if (customAlert.type === (ALERT_TYPES?.PRICE_RISE || 'priceRiseAbove')) {
      alertConfig.baselinePrice = sellPrice;
    }
    if (customAlert.type === (ALERT_TYPES?.COMPETITION_UNDERCUT || 'competitionUndercut')) {
      alertConfig.baselineMargin = margin;
    }

    onCreateAlert?.(alertConfig);
    setShowMenu(false);
    setShowCustomForm(false);
    setCustomAlert({
      type: ALERT_TYPES?.MARGIN_THRESHOLD || 'marginReaches',
      condition: 'above',
      threshold: '',
      priority: PRIORITY_LEVELS?.MEDIUM || 'medium',
    });
  };

  const getSuggestedThreshold = (alertType) => {
    switch (alertType) {
      case ALERT_TYPES?.MARGIN_THRESHOLD || 'marginReaches':
        // Suggest 20% margin
        return margin >= 15 ? margin + 5 : 20;
      case ALERT_TYPES?.NET_PROFIT_ABOVE || 'netProfitAbove':
        // Suggest 50% more than current profit
        return Math.round(netProfit * 1.5);
      case ALERT_TYPES?.BUY_PRICE_BELOW || 'buyPriceBelow':
        // Suggest 10% below current buy price
        return Math.round(buyPrice * 0.9);
      case ALERT_TYPES?.SELL_PRICE_ABOVE || 'sellPriceAbove':
        // Suggest 10% above current sell price
        return Math.round(sellPrice * 1.1);
      case ALERT_TYPES?.VOLUME_SPIKE || 'volumeSpike':
        // Suggest 2x current volume
        return 2;
      case ALERT_TYPES?.PRICE_DROP || 'priceDropBelow':
        // Suggest 50% drop
        return 0.5;
      case ALERT_TYPES?.PRICE_RISE || 'priceRiseAbove':
        // Suggest 50% rise
        return 1.5;
      default:
        return '';
    }
  };

  const getAlertTypeLabel = (type) => {
    const labels = {
      priceDropBelow: 'Price Drop',
      priceRiseAbove: 'Price Rise',
      marginReaches: 'Margin',
      volumeSpike: 'Volume Spike',
      competitionUndercut: 'Competition Undercut',
      buyPriceBelow: 'Buy Price',
      sellPriceAbove: 'Sell Price',
      netProfitAbove: 'Net Profit',
    };
    return labels[type] || type;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      critical: { icon: '🚨', label: 'Critical' },
      high: { icon: '⚠️', label: 'High' },
      medium: { icon: '📢', label: 'Medium' },
      low: { icon: 'ℹ️', label: 'Low' },
    };
    return badges[priority] || badges.medium;
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="p-1.5 rounded-lg bg-accent-gold/10 border border-accent-gold/30 text-accent-gold transition-all hover:bg-accent-gold/20 hover:border-accent-gold/50"
        title="Set alert for this item"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-80 bg-space-mid/95 backdrop-blur-sm rounded-lg border border-accent-cyan/20 shadow-xl z-50 overflow-hidden">
          {!showCustomForm ? (
            <>
              {/* Header */}
              <div className="px-4 py-3 bg-space-dark/50 border-b border-accent-cyan/10">
                <h3 className="text-sm font-semibold text-text-primary">
                  Create Alert for {itemName}
                </h3>
                <div className="mt-2 text-xs text-text-secondary space-y-1">
                  <p>Current Margin: <span className="text-green-400 font-mono">{margin.toFixed(2)}%</span></p>
                  <p>Net Profit: <span className="text-accent-gold font-mono">{formatNumber(netProfit)} ISK</span></p>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                <p className="text-xs text-text-secondary mb-2">Quick Presets:</p>
                {ALERT_PRESETS?.map(preset => {
                  const badge = getPriorityBadge(preset.priority);
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetClick(preset)}
                      className="w-full p-2.5 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-left transition-all hover:bg-space-dark hover:border-accent-cyan/40 text-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-text-primary font-medium">{preset.name}</span>
                            <span className="text-xs">
                              {badge.icon}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary">{preset.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Alert Button */}
              <div className="p-3 border-t border-accent-cyan/10">
                <button
                  type="button"
                  onClick={() => setShowCustomForm(true)}
                  className="w-full px-4 py-2 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-sm font-medium transition-all hover:bg-accent-cyan/20"
                >
                  Create Custom Alert
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Custom Alert Form */}
              <div className="px-4 py-3 bg-space-dark/50 border-b border-accent-cyan/10">
                <h3 className="text-sm font-semibold text-text-primary">
                  Custom Alert for {itemName}
                </h3>
              </div>

              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {/* Alert Type */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Alert Type
                  </label>
                  <select
                    value={customAlert.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setCustomAlert(prev => ({
                        ...prev,
                        type: newType,
                        threshold: getSuggestedThreshold(newType),
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary text-sm focus:outline-none focus:border-accent-cyan"
                  >
                    {ALERT_TYPES && Object.entries(ALERT_TYPES).map(([_key, value]) => (
                      <option key={value} value={value}>{getAlertTypeLabel(value)}</option>
                    ))}
                  </select>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Condition
                  </label>
                  <select
                    value={customAlert.condition}
                    onChange={(e) => setCustomAlert(prev => ({ ...prev, condition: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary text-sm focus:outline-none focus:border-accent-cyan"
                  >
                    <option value="above">Above</option>
                    <option value="below">Below</option>
                    <option value="equals">Equals</option>
                  </select>
                </div>

                {/* Threshold */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Threshold
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={customAlert.threshold}
                    onChange={(e) => setCustomAlert(prev => ({ ...prev, threshold: e.target.value }))}
                    placeholder={`Suggested: ${getSuggestedThreshold(customAlert.type)}`}
                    className="w-full px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary text-sm focus:outline-none focus:border-accent-cyan"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomAlert(prev => ({ ...prev, threshold: getSuggestedThreshold(customAlert.type) }))}
                    className="mt-1 text-xs text-accent-cyan hover:underline"
                  >
                    Use suggested value
                  </button>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Priority
                  </label>
                  <select
                    value={customAlert.priority}
                    onChange={(e) => setCustomAlert(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary text-sm focus:outline-none focus:border-accent-cyan"
                  >
                    {PRIORITY_LEVELS && Object.entries(PRIORITY_LEVELS).map(([_key, value]) => {
                      const badge = getPriorityBadge(value);
                      return (
                        <option key={value} value={value}>
                          {badge.icon} {badge.label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="p-3 border-t border-accent-cyan/10 flex gap-2">
                <button
                  type="button"
                  onClick={handleCustomAlertSubmit}
                  className="flex-1 px-4 py-2 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-sm font-medium transition-all hover:bg-accent-cyan/20"
                >
                  Create Alert
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomForm(false)}
                  className="px-4 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-secondary text-sm transition-all hover:bg-space-mid"
                >
                  Back
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default QuickAlertButton;
