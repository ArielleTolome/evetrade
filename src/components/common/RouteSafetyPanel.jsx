import { useState, useEffect } from 'react';
import { useZkillboard } from '../../hooks/useZkillboard';

/**
 * Route Safety Panel
 * Displays Zkillboard-based safety analysis for trade routes
 */
export function RouteSafetyPanel({ systemIds = [], systemNames = {}, onClose }) {
  const {
    loading,
    error,
    analyzeRoute,
    getDangerColor,
    formatISK,
  } = useZkillboard();

  const [analysis, setAnalysis] = useState(null);
  const [timeframe, setTimeframe] = useState(24); // Hours
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (systemIds.length > 0) {
      analyzeRoute(systemIds, { hours: timeframe }).then(setAnalysis);
    }
  }, [systemIds, timeframe, analyzeRoute]);

  const toggleExpanded = (systemId) => {
    setExpanded(prev => ({ ...prev, [systemId]: !prev[systemId] }));
  };

  const colors = getDangerColor(analysis?.overallDanger || 'unknown');

  if (systemIds.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-2">Route Safety</h3>
        <p className="text-slate-400 text-sm">Select a route to analyze safety</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Route Safety Analysis
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Timeframe selector */}
      <div className="flex gap-2 mb-4">
        {[1, 6, 12, 24, 48].map((hours) => (
          <button
            key={hours}
            onClick={() => setTimeframe(hours)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              timeframe === hours
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            {hours}h
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <span className="ml-3 text-slate-400">Analyzing route safety...</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {analysis && !loading && (
        <>
          {/* Overall Summary */}
          <div className={`p-4 rounded-lg ${colors.bg} border ${colors.border} mb-4`}>
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-lg font-bold ${colors.text} uppercase`}>
                  {analysis.overallDanger}
                </span>
                <p className="text-sm text-slate-400 mt-1">
                  {analysis.totalKills} kills in {systemIds.length} systems (last {timeframe}h)
                </p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${colors.text}`}>
                  {analysis.overallScore}
                </div>
                <div className="text-xs text-slate-500">Danger Score</div>
              </div>
            </div>

            {analysis.dangerousSystems > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-600/50">
                <span className="text-red-400 text-sm font-medium">
                  {analysis.dangerousSystems} dangerous system{analysis.dangerousSystems > 1 ? 's' : ''} detected
                </span>
              </div>
            )}
          </div>

          {/* System List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-300">System Breakdown</h4>
            {analysis.systems.map((system) => {
              const sysColors = getDangerColor(system.dangerLevel);
              const isExpanded = expanded[system.systemId];

              return (
                <div
                  key={system.systemId}
                  className="bg-slate-900/50 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpanded(system.systemId)}
                    className="w-full p-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${sysColors.bg.replace('/20', '')}`}></div>
                      <span className="text-white">
                        {systemNames[system.systemId] || `System ${system.systemId}`}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${sysColors.bg} ${sysColors.text}`}>
                        {system.dangerLevel}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-400">
                        {system.killCount} kills
                      </span>
                      <svg
                        className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-slate-700/50">
                      <div className="grid grid-cols-3 gap-3 mt-3 text-center">
                        <div>
                          <div className="text-lg font-semibold text-white">{system.shipKills}</div>
                          <div className="text-xs text-slate-500">Ship Kills</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-white">{system.podKills}</div>
                          <div className="text-xs text-slate-500">Pod Kills</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-white">{formatISK(system.avgValue)}</div>
                          <div className="text-xs text-slate-500">Avg Value</div>
                        </div>
                      </div>

                      {/* Warnings */}
                      <div className="mt-3 space-y-1">
                        {system.gateCamps && (
                          <div className="flex items-center gap-2 text-xs text-red-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Possible gate camp activity
                          </div>
                        )}
                        {system.smartbombers && (
                          <div className="flex items-center gap-2 text-xs text-orange-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Smartbomber activity detected
                          </div>
                        )}
                      </div>

                      {/* Active hours */}
                      {system.activeHours.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs text-slate-500 mb-1">Most dangerous hours (EVE time)</div>
                          <div className="flex gap-1">
                            {system.activeHours.map(({ hour, count }) => (
                              <span
                                key={hour}
                                className="text-xs px-2 py-1 bg-slate-800 rounded text-slate-300"
                              >
                                {hour.toString().padStart(2, '0')}:00 ({count})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Safety Tips */}
          <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Safety Tips</h4>
            <ul className="text-xs text-slate-400 space-y-1">
              {analysis.overallDanger === 'deadly' && (
                <>
                  <li>• Consider using a scout alt before jumping</li>
                  <li>• Use insta-dock/undock bookmarks</li>
                  <li>• Consider alternative routes through safer space</li>
                </>
              )}
              {analysis.overallDanger === 'dangerous' && (
                <>
                  <li>• Stay aligned and ready to warp</li>
                  <li>• Check local for known hostiles</li>
                  <li>• Consider using a cloak if available</li>
                </>
              )}
              {analysis.overallDanger === 'risky' && (
                <>
                  <li>• Keep an eye on local chat</li>
                  <li>• Don't AFK on gates</li>
                </>
              )}
              {(analysis.overallDanger === 'safe' || analysis.overallDanger === 'caution') && (
                <li>• Route appears relatively safe, but stay vigilant</li>
              )}
              <li>• Data from Zkillboard (last {timeframe} hours)</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Compact route safety indicator for inline use
 */
export function RouteSafetyBadge({ systemId, systemName, onClick }) {
  const { getSystemSafety, getDangerColor } = useZkillboard();
  const [safety, setSafety] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (systemId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- loading state for async data fetch is standard pattern
      setLoading(true);
      getSystemSafety(systemId, { hours: 24 })
        .then(setSafety)
        .finally(() => setLoading(false));
    }
  }, [systemId, getSystemSafety]);

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-400">
        <span className="animate-pulse">...</span>
      </span>
    );
  }

  if (!safety) return null;

  const colors = getDangerColor(safety.dangerLevel);

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${colors.bg} ${colors.text} hover:opacity-80 transition-opacity`}
      title={`${safety.killCount} kills in 24h - Click for details`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.bg.replace('/20', '')}`}></span>
      {systemName || systemId}
      {safety.killCount > 0 && (
        <span className="opacity-75">({safety.killCount})</span>
      )}
    </button>
  );
}

export default RouteSafetyPanel;
