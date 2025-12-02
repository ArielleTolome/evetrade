import { useState } from 'react';
import { useDiscordWebhook } from '../../hooks/useDiscordWebhook';

/**
 * Discord Webhook Configuration Panel
 * Allows users to manage Discord webhook integrations
 */
export function DiscordWebhookPanel() {
  const {
    webhooks,
    addWebhook,
    removeWebhook,
    updateWebhook,
    activeCount,
    settings,
    updateSettings,
    testWebhook,
    validateWebhookUrl,
    sendHistory,
  } = useDiscordWebhook();

  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookName, setNewWebhookName] = useState('');
  const [urlError, setUrlError] = useState('');
  const [testing, setTesting] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleAddWebhook = () => {
    if (!newWebhookUrl.trim()) {
      setUrlError('Webhook URL is required');
      return;
    }

    if (!validateWebhookUrl(newWebhookUrl)) {
      setUrlError('Invalid Discord webhook URL format');
      return;
    }

    addWebhook({
      url: newWebhookUrl.trim(),
      name: newWebhookName.trim() || 'Discord Webhook',
    });

    setNewWebhookUrl('');
    setNewWebhookName('');
    setUrlError('');
  };

  const handleTestWebhook = async (webhook) => {
    setTesting(webhook.id);
    setTestResult(null);

    const result = await testWebhook(webhook.url);
    setTestResult({ id: webhook.id, ...result });
    setTesting(null);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          Discord Webhooks
        </h3>
        <span className={`text-sm px-2 py-1 rounded ${activeCount > 0 ? 'bg-green-600/20 text-green-400' : 'bg-slate-600/20 text-slate-400'}`}>
          {activeCount} active
        </span>
      </div>

      {/* Global Settings */}
      <div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Notification Settings</h4>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => updateSettings({ enabled: e.target.checked })}
              className="rounded bg-slate-700 border-slate-600 text-indigo-500 focus:ring-indigo-500"
            />
            Enable Webhooks
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.sendPriceAlerts}
              onChange={(e) => updateSettings({ sendPriceAlerts: e.target.checked })}
              className="rounded bg-slate-700 border-slate-600 text-indigo-500 focus:ring-indigo-500"
            />
            Price Alerts
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.sendTradeSummaries}
              onChange={(e) => updateSettings({ sendTradeSummaries: e.target.checked })}
              className="rounded bg-slate-700 border-slate-600 text-indigo-500 focus:ring-indigo-500"
            />
            Trade Summaries
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.sendScamWarnings}
              onChange={(e) => updateSettings({ sendScamWarnings: e.target.checked })}
              className="rounded bg-slate-700 border-slate-600 text-indigo-500 focus:ring-indigo-500"
            />
            Scam Warnings
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.sendRouteAlerts}
              onChange={(e) => updateSettings({ sendRouteAlerts: e.target.checked })}
              className="rounded bg-slate-700 border-slate-600 text-indigo-500 focus:ring-indigo-500"
            />
            Route Alerts
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.mentionOnHighValue}
              onChange={(e) => updateSettings({ mentionOnHighValue: e.target.checked })}
              className="rounded bg-slate-700 border-slate-600 text-indigo-500 focus:ring-indigo-500"
            />
            @everyone on High Value
          </label>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">High Value Threshold (ISK)</label>
            <input
              type="number"
              value={settings.highValueThreshold}
              onChange={(e) => updateSettings({ highValueThreshold: parseInt(e.target.value) || 0 })}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="100000000"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Cooldown (minutes)</label>
            <input
              type="number"
              value={settings.cooldownMinutes}
              onChange={(e) => updateSettings({ cooldownMinutes: parseInt(e.target.value) || 5 })}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              min="1"
              max="60"
            />
          </div>
        </div>
      </div>

      {/* Add New Webhook */}
      <div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Add Webhook</h4>
        <div className="space-y-2">
          <input
            type="text"
            value={newWebhookName}
            onChange={(e) => setNewWebhookName(e.target.value)}
            placeholder="Webhook name (optional)"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <div className="flex gap-2">
            <input
              type="url"
              value={newWebhookUrl}
              onChange={(e) => {
                setNewWebhookUrl(e.target.value);
                setUrlError('');
              }}
              placeholder="https://discord.com/api/webhooks/..."
              className={`flex-1 px-3 py-2 bg-slate-700 border rounded text-sm text-white placeholder-slate-500 focus:ring-1 ${
                urlError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-600 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            <button
              onClick={handleAddWebhook}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded transition-colors"
            >
              Add
            </button>
          </div>
          {urlError && (
            <p className="text-xs text-red-400">{urlError}</p>
          )}
          <p className="text-xs text-slate-500">
            Get your webhook URL from Discord: Server Settings → Integrations → Webhooks
          </p>
        </div>
      </div>

      {/* Webhook List */}
      {webhooks.length > 0 && (
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-medium text-slate-300">Configured Webhooks</h4>
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={webhook.enabled}
                  onChange={(e) => updateWebhook(webhook.id, { enabled: e.target.checked })}
                  className="rounded bg-slate-700 border-slate-600 text-indigo-500 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-sm text-white">{webhook.name}</p>
                  <p className="text-xs text-slate-500 truncate max-w-[200px]">
                    {webhook.url.replace(/\/[\w-]+$/, '/***')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {testResult?.id === webhook.id && (
                  <span className={`text-xs ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                    {testResult.success ? 'Success!' : 'Failed'}
                  </span>
                )}
                <button
                  onClick={() => handleTestWebhook(webhook)}
                  disabled={testing === webhook.id}
                  className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded transition-colors disabled:opacity-50"
                >
                  {testing === webhook.id ? 'Testing...' : 'Test'}
                </button>
                <button
                  onClick={() => removeWebhook(webhook.id)}
                  className="px-2 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs rounded transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Send History */}
      {sendHistory.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Recent Activity ({sendHistory.length})
          </button>
          {showHistory && (
            <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
              {sendHistory.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between text-xs p-2 bg-slate-900/30 rounded"
                >
                  <span className="text-slate-400">{entry.type}</span>
                  <span className="text-slate-500">{formatTimestamp(entry.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {webhooks.length === 0 && (
        <div className="text-center py-6 text-slate-500">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          <p className="text-sm">No webhooks configured</p>
          <p className="text-xs mt-1">Add a Discord webhook to receive trading alerts</p>
        </div>
      )}
    </div>
  );
}

export default DiscordWebhookPanel;
