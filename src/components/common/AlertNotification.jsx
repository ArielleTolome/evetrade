import { formatNumber } from "../../utils/formatters";

/**
 * Alert Notification Component
 * Displays a triggered price alert with details
 */
export function AlertNotification({ alert, onDismiss, onViewItem }) {
  if (!alert) return null;

  const getAlertTypeLabel = (type) => {
    const labels = {
      buyPrice: "Buy Price",
      sellPrice: "Sell Price",
      margin: "Margin",
      volume: "Volume",
      profit: "Net Profit",
    };
    return labels[type] || type;
  };

  const getConditionLabel = (condition) => {
    const labels = {
      above: "above",
      below: "below",
      equals: "equals",
    };
    return labels[condition] || condition;
  };

  const formatValue = (value, type) => {
    if (type === "margin") {
      return `${value.toFixed(2)}%`;
    }
    if (type === "volume") {
      return formatNumber(value);
    }
    return `${formatNumber(value)} ISK`;
  };

  const itemName = alert.itemName || alert.trade?.["Item"] || alert.trade?.item || "Unknown Item";
  const alertType = getAlertTypeLabel(alert.type);
  const condition = getConditionLabel(alert.condition);
  const thresholdDisplay = formatValue(alert.threshold, alert.type);
  const currentDisplay = formatValue(alert.currentValue, alert.type);

  return (
    <div className="bg-space-dark/95 border-2 border-accent-gold/50 rounded-lg p-4 shadow-xl backdrop-blur-sm animate-slide-in-right">
      <div className="flex items-start gap-3">
        {/* Bell Icon */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>

        {/* Alert Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-accent-gold font-display font-semibold text-lg">
                Price Alert Triggered
              </h3>
              <p className="text-text-secondary text-sm mt-1">
                {alert.triggeredAt && new Date(alert.triggeredAt).toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss?.(alert.id)}
              className="text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Dismiss alert"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Alert Details */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-accent-cyan font-medium">{itemName}</span>
            </div>

            <div className="text-text-primary">
              <span className="text-text-secondary">{alertType}</span>
              {" "}
              <span className="text-accent-gold font-semibold">{condition}</span>
              {" "}
              <span className="text-text-secondary">{thresholdDisplay}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-secondary">Current value:</span>
              <span className="text-accent-cyan font-mono font-semibold">{currentDisplay}</span>
            </div>
          </div>

          {/* Actions */}
          {onViewItem && (
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => onViewItem?.(alert)}
                className="px-4 py-2 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-sm font-medium transition-all hover:bg-accent-cyan/20 hover:border-accent-cyan/50"
              >
                View Item
              </button>
              <button
                type="button"
                onClick={() => onDismiss?.(alert.id)}
                className="px-4 py-2 rounded-lg bg-space-mid/50 border border-accent-cyan/20 text-text-secondary text-sm font-medium transition-all hover:bg-space-mid hover:text-text-primary"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AlertNotification;
