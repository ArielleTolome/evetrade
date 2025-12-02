import { useMemo, useState } from 'react';
import { formatISK, formatPercent } from '../../utils/formatters';

/**
 * MarketManipulationAlert - Detects potential market manipulation patterns
 * Identifies unusually large price swings, suspicious volume spikes, etc.
 */
export function MarketManipulationAlert({
  marketData = [],
  priceHistory = {},
  volumeHistory = {},
  onDismiss,
  className = '',
}) {
  const [dismissed, setDismissed] = useState(new Set());

  // Analyze market data for manipulation indicators
  const alerts = useMemo(() => {
    if (!marketData.length) return [];

    const detected = [];

    marketData.forEach(item => {
      const itemId = item['Item ID'] || item.itemId;
      const itemName = item['Item'] || item.name;
      const currentPrice = item['Buy Price'] || 0;
      const margin = item['Gross Margin'] || 0;
      const volume = item['Volume'] || 0;

      // Check price history for unusual swings
      const history = priceHistory[itemId];
      if (history && history.length > 0) {
        const avgPrice = history.reduce((sum, h) => sum + h.price, 0) / history.length;
        const priceDeviation = Math.abs(currentPrice - avgPrice) / avgPrice;

        // Flag if price deviates more than 30% from average
        if (priceDeviation > 0.3) {
          detected.push({
            id: `price-${itemId}`,
            type: 'price_spike',
            itemId,
            itemName,
            severity: priceDeviation > 0.5 ? 'high' : 'medium',
            message: `Price ${currentPrice > avgPrice ? 'increased' : 'decreased'} ${formatPercent(priceDeviation, 0)} from average`,
            details: {
              currentPrice,
              avgPrice,
              deviation: priceDeviation,
            },
          });
        }
      }

      // Check for suspiciously high margins (potential buy order manipulation)
      if (margin > 50) {
        detected.push({
          id: `margin-${itemId}`,
          type: 'high_margin',
          itemId,
          itemName,
          severity: margin > 80 ? 'high' : 'medium',
          message: `Unusually high margin of ${formatPercent(margin / 100, 0)}`,
          details: {
            margin,
          },
        });
      }

      // Check for thin volume combined with high profit (potential trap)
      if (volume < 10 && (item['Net Profit'] || 0) > 10000000) {
        detected.push({
          id: `trap-${itemId}`,
          type: 'potential_trap',
          itemId,
          itemName,
          severity: 'high',
          message: 'Low volume with high profit - potential trap',
          details: {
            volume,
            profit: item['Net Profit'],
          },
        });
      }

      // Check volume history for unusual spikes
      const volHistory = volumeHistory[itemId];
      if (volHistory && volHistory.length > 0) {
        const avgVolume = volHistory.reduce((sum, h) => sum + h.volume, 0) / volHistory.length;
        const volumeRatio = volume / avgVolume;

        // Flag if volume is 3x above normal
        if (volumeRatio > 3) {
          detected.push({
            id: `volume-${itemId}`,
            type: 'volume_spike',
            itemId,
            itemName,
            severity: volumeRatio > 5 ? 'high' : 'medium',
            message: `Volume ${volumeRatio.toFixed(1)}x above normal`,
            details: {
              currentVolume: volume,
              avgVolume,
              ratio: volumeRatio,
            },
          });
        }
      }
    });

    // Filter out dismissed alerts
    return detected.filter(a => !dismissed.has(a.id));
  }, [marketData, priceHistory, volumeHistory, dismissed]);

  const handleDismiss = (alertId) => {
    setDismissed(prev => new Set([...prev, alertId]));
    onDismiss?.(alertId);
  };

  if (alerts.length === 0) return null;

  const highSeverity = alerts.filter(a => a.severity === 'high').length;

  return (
    <div className={`bg-space-dark/60 border border-accent-pink/30 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-accent-pink/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-pink/20 rounded-lg">
            <svg className="w-5 h-5 text-accent-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-accent-pink font-medium">Market Anomaly Detection</h3>
            <p className="text-xs text-text-secondary">
              {alerts.length} potential issue{alerts.length !== 1 ? 's' : ''} detected
            </p>
          </div>
        </div>

        {highSeverity > 0 && (
          <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full animate-pulse">
            {highSeverity} high severity
          </span>
        )}
      </div>

      {/* Alerts List */}
      <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
        {alerts.map(alert => (
          <ManipulationAlertCard
            key={alert.id}
            alert={alert}
            onDismiss={() => handleDismiss(alert.id)}
          />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="px-4 py-2 bg-space-dark/50 border-t border-accent-pink/10">
        <p className="text-[10px] text-text-secondary/70 text-center">
          These are automated detections based on statistical anomalies. Always verify before trading.
        </p>
      </div>
    </div>
  );
}

/**
 * Individual manipulation alert card
 */
function ManipulationAlertCard({ alert, onDismiss }) {
  const typeConfig = {
    price_spike: {
      icon: '📈',
      color: 'border-orange-500/30 bg-orange-500/10',
    },
    high_margin: {
      icon: '⚠️',
      color: 'border-yellow-500/30 bg-yellow-500/10',
    },
    potential_trap: {
      icon: '🪤',
      color: 'border-red-500/30 bg-red-500/10',
    },
    volume_spike: {
      icon: '📊',
      color: 'border-accent-purple/30 bg-accent-purple/10',
    },
  };

  const config = typeConfig[alert.type] || typeConfig.price_spike;

  return (
    <div className={`p-3 rounded-lg border ${config.color} transition-all`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <span className="text-lg">{config.icon}</span>
          <div className="min-w-0">
            <div className="text-sm text-text-primary font-medium truncate">
              {alert.itemName}
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              {alert.message}
            </p>
            {alert.severity === 'high' && (
              <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] bg-red-500/30 text-red-300 rounded">
                HIGH RISK
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1 text-text-secondary hover:text-text-primary"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Details */}
      {alert.details && (
        <div className="mt-2 p-2 bg-space-dark/50 rounded text-xs text-text-secondary">
          {alert.type === 'price_spike' && (
            <div className="flex justify-between">
              <span>Current: {formatISK(alert.details.currentPrice, true)}</span>
              <span>Avg: {formatISK(alert.details.avgPrice, true)}</span>
            </div>
          )}
          {alert.type === 'potential_trap' && (
            <div className="flex justify-between">
              <span>Volume: {alert.details.volume}</span>
              <span>Profit: {formatISK(alert.details.profit, true)}</span>
            </div>
          )}
          {alert.type === 'volume_spike' && (
            <div className="flex justify-between">
              <span>Current: {alert.details.currentVolume}</span>
              <span>Avg: {Math.round(alert.details.avgVolume)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MarketManipulationAlert;
