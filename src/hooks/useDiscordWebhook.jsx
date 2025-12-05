import { useState, useCallback, useEffect, useMemo } from 'react';

const STORAGE_KEY = 'evetrade_discord_webhooks';
const SETTINGS_KEY = 'evetrade_discord_settings';

/**
 * Discord Webhook integration for EVETrade
 * Sends trading alerts, price notifications, and trade summaries to Discord channels
 */
export function useDiscordWebhook() {
  const [webhooks, setWebhooks] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Failed to load webhooks from localStorage:', e);
      return [];
    }
  });

  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      return stored ? JSON.parse(stored) : {
        enabled: true,
        sendPriceAlerts: true,
        sendTradeSummaries: true,
        sendScamWarnings: true,
        sendRouteAlerts: true,
        mentionOnHighValue: false,
        highValueThreshold: 100000000, // 100M ISK
        cooldownMinutes: 5,
        embedColor: 0x00ff00, // Green
      };
    } catch (e) {
      return {
        enabled: true,
        sendPriceAlerts: true,
        sendTradeSummaries: true,
        sendScamWarnings: true,
        sendRouteAlerts: true,
        mentionOnHighValue: false,
        highValueThreshold: 100000000,
        cooldownMinutes: 5,
        embedColor: 0x00ff00,
      };
    }
  });

  const [lastSent, setLastSent] = useState({});
  const [sendHistory, setSendHistory] = useState([]);

  // Persist webhooks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(webhooks));
    } catch (e) {
      console.warn('Failed to save webhooks to localStorage:', e);
    }
  }, [webhooks]);

  // Persist settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage:', e);
    }
  }, [settings]);

  /**
   * Add a new webhook
   */
  const addWebhook = useCallback((webhook) => {
    const newWebhook = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      enabled: true,
      name: 'Discord Webhook',
      ...webhook,
    };
    setWebhooks(prev => [...prev, newWebhook]);
    return newWebhook.id;
  }, []);

  /**
   * Remove a webhook
   */
  const removeWebhook = useCallback((webhookId) => {
    setWebhooks(prev => prev.filter(w => w.id !== webhookId));
  }, []);

  /**
   * Update a webhook
   */
  const updateWebhook = useCallback((webhookId, updates) => {
    setWebhooks(prev => prev.map(w =>
      w.id === webhookId ? { ...w, ...updates } : w
    ));
  }, []);

  /**
   * Update settings
   */
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  /**
   * Check if we're within cooldown period
   */
  const isOnCooldown = useCallback((key) => {
    const lastTime = lastSent[key];
    if (!lastTime) return false;
    const cooldownMs = settings.cooldownMinutes * 60 * 1000;
    return Date.now() - lastTime < cooldownMs;
  }, [lastSent, settings.cooldownMinutes]);

  /**
   * Format ISK value for display
   */
  const formatISK = (value) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)}B ISK`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M ISK`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K ISK`;
    }
    return `${value.toLocaleString()} ISK`;
  };

  /**
   * Send message to all enabled webhooks
   */
  const sendToWebhooks = useCallback(async (payload) => {
    if (!settings.enabled) return { success: false, error: 'Webhooks disabled' };

    const enabledWebhooks = webhooks.filter(w => w.enabled);
    if (enabledWebhooks.length === 0) {
      return { success: false, error: 'No enabled webhooks' };
    }

    const results = await Promise.allSettled(
      enabledWebhooks.map(async (webhook) => {
        try {
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          return { webhookId: webhook.id, success: true };
        } catch (error) {
          return { webhookId: webhook.id, success: false, error: error.message };
        }
      })
    );

    const historyEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: payload.embeds?.[0]?.title || 'Message',
      results: results.map(r => r.value || r.reason),
    };
    setSendHistory(prev => [historyEntry, ...prev].slice(0, 50));

    const successCount = results.filter(r => r.value?.success).length;
    return {
      success: successCount > 0,
      sent: successCount,
      total: enabledWebhooks.length,
    };
  }, [webhooks, settings.enabled]);

  /**
   * Send a price alert notification
   */
  const sendPriceAlert = useCallback(async (alert, currentValue) => {
    if (!settings.sendPriceAlerts) {
      return { success: false, skipped: true, reason: 'Price alerts disabled in settings' };
    }

    const cooldownKey = `price_${alert.itemId || alert.itemName}`;
    if (isOnCooldown(cooldownKey)) {
      return { success: false, skipped: true, reason: 'On cooldown' };
    }

    const isHighValue = currentValue >= settings.highValueThreshold;
    const mention = settings.mentionOnHighValue && isHighValue ? '@everyone ' : '';

    const embed = {
      title: `${mention}Price Alert: ${alert.itemName}`,
      description: `${alert.type} is now ${alert.condition} your threshold`,
      color: isHighValue ? 0xff0000 : settings.embedColor,
      fields: [
        {
          name: 'Alert Type',
          value: alert.type,
          inline: true,
        },
        {
          name: 'Condition',
          value: `${alert.condition} ${formatISK(alert.threshold)}`,
          inline: true,
        },
        {
          name: 'Current Value',
          value: formatISK(currentValue),
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'EVETrade Price Alert',
      },
    };

    setLastSent(prev => ({ ...prev, [cooldownKey]: Date.now() }));
    return sendToWebhooks({ embeds: [embed] });
  }, [settings, isOnCooldown, sendToWebhooks]);

  /**
   * Send a trade opportunity notification
   */
  const sendTradeOpportunity = useCallback(async (trade) => {
    if (!settings.sendTradeSummaries) {
      return { success: false, skipped: true, reason: 'Trade summaries disabled in settings' };
    }

    const profit = trade['Net Profit'] || trade.netProfit || 0;
    const cooldownKey = `trade_${trade['Item ID'] || trade.itemId}`;
    if (isOnCooldown(cooldownKey)) {
      return { success: false, skipped: true, reason: 'On cooldown' };
    }

    const isHighValue = profit >= settings.highValueThreshold;
    const mention = settings.mentionOnHighValue && isHighValue ? '@everyone ' : '';

    const embed = {
      title: `${mention}Trade Opportunity: ${trade['Item'] || trade.item}`,
      description: 'A profitable trade has been found!',
      color: isHighValue ? 0xffd700 : settings.embedColor,
      fields: [
        {
          name: 'Buy Price',
          value: formatISK(trade['Buy Price'] || trade.buyPrice || 0),
          inline: true,
        },
        {
          name: 'Sell Price',
          value: formatISK(trade['Sell Price'] || trade.sellPrice || 0),
          inline: true,
        },
        {
          name: 'Net Profit',
          value: formatISK(profit),
          inline: true,
        },
        {
          name: 'Margin',
          value: `${(trade['Gross Margin'] || trade.margin || 0).toFixed(2)}%`,
          inline: true,
        },
        {
          name: 'Volume',
          value: (trade['Volume'] || trade.volume || 0).toLocaleString(),
          inline: true,
        },
        {
          name: 'ROI',
          value: `${(trade['ROI'] || trade.roi || 0).toFixed(2)}%`,
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'EVETrade',
      },
    };

    setLastSent(prev => ({ ...prev, [cooldownKey]: Date.now() }));
    return sendToWebhooks({ embeds: [embed] });
  }, [settings, isOnCooldown, sendToWebhooks]);

  /**
   * Send a scam warning notification
   */
  const sendScamWarning = useCallback(async (trade, riskAssessment) => {
    if (!settings.sendScamWarnings) {
      return { success: false, skipped: true, reason: 'Scam warnings disabled in settings' };
    }

    const cooldownKey = `scam_${trade['Item ID'] || trade.itemId}`;
    if (isOnCooldown(cooldownKey)) {
      return { success: false, skipped: true, reason: 'On cooldown' };
    }

    const colorMap = {
      extreme: 0xff0000,
      high: 0xff6600,
      medium: 0xffcc00,
      low: 0x00ff00,
    };

    const embed = {
      title: `Scam Warning: ${trade['Item'] || trade.item}`,
      description: `Risk Level: **${riskAssessment.level.toUpperCase()}** (Score: ${riskAssessment.score})`,
      color: colorMap[riskAssessment.level] || 0xff0000,
      fields: [
        {
          name: 'Reasons',
          value: riskAssessment.reasons.join('\n') || 'Multiple risk factors detected',
          inline: false,
        },
        {
          name: 'Price',
          value: formatISK(trade['Buy Price'] || trade.buyPrice || 0),
          inline: true,
        },
        {
          name: 'Volume',
          value: (trade['Volume'] || trade.volume || 0).toLocaleString(),
          inline: true,
        },
        {
          name: 'Margin',
          value: `${(trade['Gross Margin'] || trade.margin || 0).toFixed(2)}%`,
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'EVETrade Scam Detection',
      },
    };

    setLastSent(prev => ({ ...prev, [cooldownKey]: Date.now() }));
    return sendToWebhooks({ embeds: [embed] });
  }, [settings, isOnCooldown, sendToWebhooks]);

  /**
   * Send a route alert (for hauling)
   */
  const sendRouteAlert = useCallback(async (route, trades) => {
    if (!settings.sendRouteAlerts) {
      return { success: false, skipped: true, reason: 'Route alerts disabled in settings' };
    }

    const cooldownKey = `route_${route.from}_${route.to}`;
    if (isOnCooldown(cooldownKey)) {
      return { success: false, skipped: true, reason: 'On cooldown' };
    }

    const totalProfit = trades.reduce((sum, t) => sum + (t['Net Profit'] || t.netProfit || 0), 0);
    const isHighValue = totalProfit >= settings.highValueThreshold;
    const mention = settings.mentionOnHighValue && isHighValue ? '@everyone ' : '';

    const topTrades = trades
      .sort((a, b) => (b['Net Profit'] || b.netProfit || 0) - (a['Net Profit'] || a.netProfit || 0))
      .slice(0, 5);

    const embed = {
      title: `${mention}Route Alert: ${route.from} → ${route.to}`,
      description: `${trades.length} profitable trades found!`,
      color: isHighValue ? 0xffd700 : settings.embedColor,
      fields: [
        {
          name: 'Total Potential Profit',
          value: formatISK(totalProfit),
          inline: true,
        },
        {
          name: 'Trade Count',
          value: trades.length.toString(),
          inline: true,
        },
        {
          name: 'Top 5 Trades',
          value: topTrades.map(t =>
            `• ${t['Item'] || t.item}: ${formatISK(t['Net Profit'] || t.netProfit || 0)}`
          ).join('\n') || 'No trades',
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'EVETrade Route Alert',
      },
    };

    setLastSent(prev => ({ ...prev, [cooldownKey]: Date.now() }));
    return sendToWebhooks({ embeds: [embed] });
  }, [settings, isOnCooldown, sendToWebhooks]);

  /**
   * Send a daily/session summary
   */
  const sendTradingSummary = useCallback(async (summary) => {
    if (!settings.sendTradeSummaries) {
      return { success: false, skipped: true, reason: 'Trade summaries disabled in settings' };
    }

    const cooldownKey = 'summary';
    if (isOnCooldown(cooldownKey)) {
      return { success: false, skipped: true, reason: 'On cooldown' };
    }

    const embed = {
      title: 'Trading Session Summary',
      description: `Session ended at ${new Date().toLocaleTimeString()}`,
      color: settings.embedColor,
      fields: [
        {
          name: 'Total Trades',
          value: summary.tradeCount?.toString() || '0',
          inline: true,
        },
        {
          name: 'Total Profit',
          value: formatISK(summary.totalProfit || 0),
          inline: true,
        },
        {
          name: 'Session Duration',
          value: summary.duration || 'N/A',
          inline: true,
        },
        {
          name: 'Best Trade',
          value: summary.bestTrade
            ? `${summary.bestTrade.item}: ${formatISK(summary.bestTrade.profit)}`
            : 'N/A',
          inline: false,
        },
        {
          name: 'ISK/Hour',
          value: formatISK(summary.iskPerHour || 0),
          inline: true,
        },
        {
          name: 'Avg Margin',
          value: `${(summary.avgMargin || 0).toFixed(2)}%`,
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'EVETrade Session Summary',
      },
    };

    setLastSent(prev => ({ ...prev, [cooldownKey]: Date.now() }));
    return sendToWebhooks({ embeds: [embed] });
  }, [settings, isOnCooldown, sendToWebhooks]);

  /**
   * Send a custom message
   */
  const sendCustomMessage = useCallback(async (content, embed = null) => {
    const payload = {};
    if (content) payload.content = content;
    if (embed) payload.embeds = [embed];

    return sendToWebhooks(payload);
  }, [sendToWebhooks]);

  /**
   * Test webhook connection
   */
  const testWebhook = useCallback(async (webhookUrl) => {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: 'EVETrade Webhook Test',
            description: 'If you see this message, your webhook is configured correctly!',
            color: 0x00ff00,
            timestamp: new Date().toISOString(),
            footer: {
              text: 'EVETrade',
            },
          }],
        }),
      });

      return { success: response.ok, status: response.status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Validate webhook URL format
   */
  const validateWebhookUrl = useCallback((url) => {
    const discordWebhookRegex = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;
    const discordCanaryRegex = /^https:\/\/canary\.discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;
    const discordPtbRegex = /^https:\/\/ptb\.discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;

    return discordWebhookRegex.test(url) ||
           discordCanaryRegex.test(url) ||
           discordPtbRegex.test(url);
  }, []);

  // Count active webhooks
  const activeCount = useMemo(() =>
    webhooks.filter(w => w.enabled).length
  , [webhooks]);

  return {
    // Webhook management
    webhooks,
    addWebhook,
    removeWebhook,
    updateWebhook,
    activeCount,

    // Settings
    settings,
    updateSettings,

    // Send methods
    sendPriceAlert,
    sendTradeOpportunity,
    sendScamWarning,
    sendRouteAlert,
    sendTradingSummary,
    sendCustomMessage,

    // Utilities
    testWebhook,
    validateWebhookUrl,
    sendHistory,
    isOnCooldown,
  };
}

export default useDiscordWebhook;
