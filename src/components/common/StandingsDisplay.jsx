import { useState, useEffect } from 'react';
import { useEveAuth } from '../../hooks/useEveAuth';
import { getCharacterStandings, getTypeNames } from '../../api/esi';
import { formatPercent } from '../../utils/formatters';
import { GlassmorphicCard } from './GlassmorphicCard';

/**
 * Get standing color based on value
 */
function getStandingColor(standing) {
  if (standing >= 0.5) return 'text-green-400';
  if (standing <= -0.5) return 'text-red-400';
  return 'text-yellow-400';
}

/**
 * Get standing color for background
 */
function getStandingBgColor(standing) {
  if (standing >= 0.5) return 'bg-green-500/10 border-green-500/30';
  if (standing <= -0.5) return 'bg-red-500/10 border-red-500/30';
  return 'bg-yellow-500/10 border-yellow-500/30';
}

/**
 * Calculate broker fee reduction from standings
 */
function calculateBrokerFeeReduction(standings) {
  // Find the best NPC corp and faction standings
  const corpStandings = standings.filter(s => s.from_type === 'npc_corp');
  const factionStandings = standings.filter(s => s.from_type === 'faction');

  const bestCorpStanding = corpStandings.length > 0
    ? Math.max(...corpStandings.map(s => Math.max(0, s.standing)))
    : 0;

  const bestFactionStanding = factionStandings.length > 0
    ? Math.max(...factionStandings.map(s => Math.max(0, s.standing)))
    : 0;

  // Base broker fee is 3%
  // Corp standing reduces by 0.03% per point
  // Faction standing reduces by 0.02% per point
  const corpReduction = bestCorpStanding * 0.0003;
  const factionReduction = bestFactionStanding * 0.0002;
  const totalReduction = corpReduction + factionReduction;

  return {
    corpReduction,
    factionReduction,
    totalReduction,
    baseFee: 0.03,
    reducedFee: Math.max(0.01, 0.03 - totalReduction), // Min 1%
  };
}

/**
 * Standings Display Component
 * Shows NPC corporation and faction standings with their effects on broker fees
 */
export function StandingsDisplay() {
  const { isAuthenticated, character, getAccessToken } = useEveAuth();
  const [standings, setStandings] = useState([]);
  const [standingsWithNames, setStandingsWithNames] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load standings when authenticated
  useEffect(() => {
    if (isAuthenticated && character?.id) {
      loadStandings();
    }
  }, [isAuthenticated, character?.id]);

  const loadStandings = async () => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      // Fetch character standings
      const standingsData = await getCharacterStandings(character.id, accessToken);

      // Filter for NPC corps, factions, and agents only
      const npcStandings = standingsData.filter(
        s => s.from_type === 'npc_corp' || s.from_type === 'faction' || s.from_type === 'agent'
      );

      setStandings(npcStandings);

      // Fetch names for all entities
      if (npcStandings.length > 0) {
        const entityIds = npcStandings.map(s => s.from_id);
        const names = await getTypeNames(entityIds);

        // Create a map of ID to name
        const nameMap = {};
        names.forEach(n => {
          nameMap[n.id] = n.name;
        });

        // Group standings by type with names
        const grouped = {
          factions: npcStandings
            .filter(s => s.from_type === 'faction')
            .map(s => ({ ...s, name: nameMap[s.from_id] || 'Unknown' }))
            .sort((a, b) => b.standing - a.standing),
          corporations: npcStandings
            .filter(s => s.from_type === 'npc_corp')
            .map(s => ({ ...s, name: nameMap[s.from_id] || 'Unknown' }))
            .sort((a, b) => b.standing - a.standing),
          agents: npcStandings
            .filter(s => s.from_type === 'agent')
            .map(s => ({ ...s, name: nameMap[s.from_id] || 'Unknown' }))
            .sort((a, b) => b.standing - a.standing),
        };

        setStandingsWithNames(grouped);
      } else {
        setStandingsWithNames({ factions: [], corporations: [], agents: [] });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <GlassmorphicCard className="mb-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
          <span className="ml-3 text-text-secondary">Loading standings...</span>
        </div>
      </GlassmorphicCard>
    );
  }

  // Error state
  if (error) {
    return (
      <GlassmorphicCard className="mb-8">
        <div className="text-center py-8">
          <div className="text-red-400 mb-4">{error}</div>
          <button
            onClick={loadStandings}
            className="px-4 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg hover:bg-accent-cyan/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </GlassmorphicCard>
    );
  }

  // No standings data loaded yet
  if (!standingsWithNames) {
    return null;
  }

  const brokerFeeInfo = calculateBrokerFeeReduction(standings);
  const hasStandings = standings.length > 0;

  return (
    <GlassmorphicCard className="mb-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl text-text-primary mb-1">NPC Standings</h3>
          <p className="text-sm text-text-secondary">
            Your standings with NPC entities affect broker fees and market access
          </p>
        </div>
        <button
          onClick={loadStandings}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-accent-cyan transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Broker Fee Impact */}
      <div className="mb-6 p-4 rounded-lg bg-space-dark/50 border border-accent-cyan/20">
        <h4 className="text-sm font-medium text-text-primary mb-3">Broker Fee Impact</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-text-secondary mb-1">Base Fee</div>
            <div className="text-lg font-bold text-text-primary">{formatPercent(brokerFeeInfo.baseFee, 2)}</div>
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1">Corp Reduction</div>
            <div className="text-lg font-bold text-green-400">-{formatPercent(brokerFeeInfo.corpReduction, 3)}</div>
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1">Faction Reduction</div>
            <div className="text-lg font-bold text-green-400">-{formatPercent(brokerFeeInfo.factionReduction, 3)}</div>
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1">Final Fee</div>
            <div className="text-lg font-bold text-accent-cyan">{formatPercent(brokerFeeInfo.reducedFee, 2)}</div>
          </div>
        </div>
        <p className="mt-3 text-xs text-text-secondary/70">
          Note: This is the minimum broker fee. Actual fees may be higher in player-owned structures or based on Broker Relations skill.
        </p>
      </div>

      {!hasStandings && (
        <div className="text-center py-8 text-text-secondary">
          No NPC standings found. Complete missions or sell tags to gain standings.
        </div>
      )}

      {/* Factions */}
      {standingsWithNames.factions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-accent-purple" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            Factions
            <span className="text-xs text-text-secondary">({standingsWithNames.factions.length})</span>
          </h4>
          <div className="space-y-2">
            {standingsWithNames.factions.map((standing) => (
              <div
                key={standing.from_id}
                className={`flex items-center justify-between p-3 rounded-lg border ${getStandingBgColor(standing.standing)}`}
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-primary">{standing.name}</div>
                  <div className="text-xs text-text-secondary">Faction</div>
                </div>
                <div className={`text-right`}>
                  <div className={`text-lg font-bold ${getStandingColor(standing.standing)}`}>
                    {standing.standing.toFixed(2)}
                  </div>
                  <div className="text-xs text-text-secondary">
                    -{formatPercent(Math.max(0, standing.standing) * 0.0002, 3)} fee
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Corporations */}
      {standingsWithNames.corporations.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-accent-cyan" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
            NPC Corporations
            <span className="text-xs text-text-secondary">({standingsWithNames.corporations.length})</span>
          </h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {standingsWithNames.corporations.map((standing) => (
              <div
                key={standing.from_id}
                className={`flex items-center justify-between p-3 rounded-lg border ${getStandingBgColor(standing.standing)}`}
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-primary">{standing.name}</div>
                  <div className="text-xs text-text-secondary">Corporation</div>
                </div>
                <div className={`text-right`}>
                  <div className={`text-lg font-bold ${getStandingColor(standing.standing)}`}>
                    {standing.standing.toFixed(2)}
                  </div>
                  <div className="text-xs text-text-secondary">
                    -{formatPercent(Math.max(0, standing.standing) * 0.0003, 3)} fee
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agents */}
      {standingsWithNames.agents.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-accent-gold" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Agents
            <span className="text-xs text-text-secondary">({standingsWithNames.agents.length})</span>
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {standingsWithNames.agents.map((standing) => (
              <div
                key={standing.from_id}
                className={`flex items-center justify-between p-2 rounded-lg border ${getStandingBgColor(standing.standing)}`}
              >
                <div className="flex-1">
                  <div className="text-xs font-medium text-text-primary">{standing.name}</div>
                  <div className="text-xs text-text-secondary">Agent</div>
                </div>
                <div className={`text-right`}>
                  <div className={`text-sm font-bold ${getStandingColor(standing.standing)}`}>
                    {standing.standing.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassmorphicCard>
  );
}

export default StandingsDisplay;
