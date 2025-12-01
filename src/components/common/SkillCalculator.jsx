import { useState, useMemo } from 'react';
import { useEveAuth } from '../../hooks/useEveAuth';
import { getCharacterSkills, getCharacterStandings, calculateTradingTaxes } from '../../api/esi';
import { GlassmorphicCard } from './GlassmorphicCard';
import { formatISK, formatPercent } from '../../utils/formatters';

/**
 * EVE Online tax and fee calculations
 *
 * Sales Tax: 8% base, reduced by Accounting skill (11% per level)
 * - Level 0: 8.00%
 * - Level 5: 3.6% (8% * (1 - 0.11 * 5))
 *
 * Broker Fee: 3% base in NPC stations, reduced by Broker Relations and standings
 * - Base fee reduced by 0.3% per level of Broker Relations
 * - Further reduced by NPC corp standings
 */

const ACCOUNTING_REDUCTION_PER_LEVEL = 0.11; // 11% reduction per level
const BROKER_RELATIONS_REDUCTION_PER_LEVEL = 0.003; // 0.3% reduction per level
const BASE_SALES_TAX = 0.08; // 8%
const BASE_BROKER_FEE = 0.03; // 3%

/**
 * Calculate sales tax based on accounting level
 */
function calculateSalesTax(accountingLevel) {
  return BASE_SALES_TAX * (1 - ACCOUNTING_REDUCTION_PER_LEVEL * accountingLevel);
}

/**
 * Calculate broker fee based on broker relations and standings
 */
function calculateBrokerFee(brokerRelationsLevel, corpStanding = 0, factionStanding = 0) {
  // Base fee reduction from skill
  let fee = BASE_BROKER_FEE - (BROKER_RELATIONS_REDUCTION_PER_LEVEL * brokerRelationsLevel);

  // Standing reduction (simplified formula)
  // Real formula is more complex, but this gives a good approximation
  const standingBonus = (0.0003 * corpStanding + 0.0002 * factionStanding);
  fee = Math.max(0.01, fee - standingBonus); // Minimum 1%

  return fee;
}

/**
 * Skill level slider component
 */
function SkillSlider({ label, value, onChange, description }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm text-text-secondary">{label}</label>
        <span className="text-lg font-bold text-accent-cyan">Level {value}</span>
      </div>
      <input
        type="range"
        min="0"
        max="5"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-space-dark rounded-lg appearance-none cursor-pointer accent-accent-cyan"
      />
      <div className="flex justify-between text-xs text-text-secondary/50">
        <span>0</span>
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
      {description && (
        <p className="text-xs text-text-secondary/70">{description}</p>
      )}
    </div>
  );
}

/**
 * Standing slider component
 */
function StandingSlider({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm text-text-secondary">{label}</label>
        <span className={`text-lg font-bold ${value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {value.toFixed(1)}
        </span>
      </div>
      <input
        type="range"
        min="-10"
        max="10"
        step="0.5"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-space-dark rounded-lg appearance-none cursor-pointer accent-accent-cyan"
      />
      <div className="flex justify-between text-xs text-text-secondary/50">
        <span>-10</span>
        <span>0</span>
        <span>+10</span>
      </div>
    </div>
  );
}

/**
 * Skill Calculator Component
 */
export function SkillCalculator({ tradeValue = 100000000, onSettingsChange }) {
  const { isAuthenticated, character, getAccessToken } = useEveAuth();
  const [accounting, setAccounting] = useState(5);
  const [brokerRelations, setBrokerRelations] = useState(5);
  const [corpStanding, setCorpStanding] = useState(0);
  const [factionStanding, setFactionStanding] = useState(0);
  const [customTradeValue, setCustomTradeValue] = useState(tradeValue);
  const [usingCharacterData, setUsingCharacterData] = useState(false);
  const [importingData, setImportingData] = useState(false);
  const [importError, setImportError] = useState(null);

  // Import character data from EVE API
  const importCharacterData = async () => {
    if (!isAuthenticated || !character?.id) return;

    setImportingData(true);
    setImportError(null);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error('Failed to get access token');
      }

      // Fetch skills and standings
      const [skills, standings] = await Promise.all([
        getCharacterSkills(character.id, accessToken),
        getCharacterStandings(character.id, accessToken).catch(() => null),
      ]);

      // Calculate taxes using the same method as CharacterProfile
      const taxInfo = calculateTradingTaxes(skills, null);

      // Update skill levels
      setAccounting(taxInfo.accountingLevel);
      setBrokerRelations(taxInfo.brokerRelationsLevel);

      // Update standings if available
      if (standings) {
        // Find corp and faction standings for the station/system
        // For now, we'll just use the best positive standings
        const corpStandings = standings.filter(s => s.from_type === 'npc_corp');
        const factionStandings = standings.filter(s => s.from_type === 'faction');

        if (corpStandings.length > 0) {
          const bestCorpStanding = Math.max(...corpStandings.map(s => s.standing));
          setCorpStanding(Math.max(0, bestCorpStanding));
        }

        if (factionStandings.length > 0) {
          const bestFactionStanding = Math.max(...factionStandings.map(s => s.standing));
          setFactionStanding(Math.max(0, bestFactionStanding));
        }
      }

      setUsingCharacterData(true);
    } catch (err) {
      setImportError(err.message || 'Failed to import character data');
      console.error('Error importing character data:', err);
    } finally {
      setImportingData(false);
    }
  };

  // Calculate current taxes
  const calculations = useMemo(() => {
    const salesTax = calculateSalesTax(accounting);
    const brokerFee = calculateBrokerFee(brokerRelations, corpStanding, factionStanding);
    const totalFees = salesTax + brokerFee * 2; // Broker fee paid twice (buy + sell)

    const salesTaxAmount = customTradeValue * salesTax;
    const brokerFeeAmount = customTradeValue * brokerFee * 2;
    const totalFeesAmount = customTradeValue * totalFees;

    // Compare to no skills
    const noSkillSalesTax = calculateSalesTax(0);
    const noSkillBrokerFee = calculateBrokerFee(0);
    const noSkillTotal = noSkillSalesTax + noSkillBrokerFee * 2;
    const savings = (noSkillTotal - totalFees) * customTradeValue;

    // Training recommendations
    const nextAccountingLevel = Math.min(5, accounting + 1);
    const nextBrokerLevel = Math.min(5, brokerRelations + 1);

    const accountingSavings = accounting < 5
      ? (salesTax - calculateSalesTax(nextAccountingLevel)) * customTradeValue
      : 0;
    const brokerSavings = brokerRelations < 5
      ? (brokerFee - calculateBrokerFee(nextBrokerLevel, corpStanding, factionStanding)) * customTradeValue * 2
      : 0;

    return {
      salesTax,
      brokerFee,
      totalFees,
      salesTaxAmount,
      brokerFeeAmount,
      totalFeesAmount,
      savings,
      accountingSavings,
      brokerSavings,
      noSkillTotal,
    };
  }, [accounting, brokerRelations, corpStanding, factionStanding, customTradeValue]);

  return (
    <GlassmorphicCard>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-display text-xl text-text-primary">Skill & Tax Calculator</h3>
          {usingCharacterData && (
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-accent-cyan/20 border border-accent-cyan/40">
              <svg className="w-4 h-4 text-accent-cyan" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium text-accent-cyan">Using character data</span>
            </div>
          )}
        </div>

        {isAuthenticated && (
          <button
            onClick={importCharacterData}
            disabled={importingData}
            className="flex items-center gap-2 px-4 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg hover:bg-accent-cyan/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importingData ? (
              <>
                <div className="w-4 h-4 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
                <span className="text-sm">Importing...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="text-sm">Import from Character</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Import Error */}
      {importError && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {importError}
        </div>
      )}

      {/* Login prompt for non-authenticated users */}
      {!isAuthenticated && (
        <div className="mb-6 p-4 bg-accent-purple/10 border border-accent-purple/30 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-accent-purple flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-text-primary font-medium mb-1">Import your actual skills and standings</p>
              <p className="text-xs text-text-secondary">
                Login with EVE Online to automatically import your Accounting and Broker Relations skill levels, plus your NPC standings for accurate tax calculations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Trade Value Input */}
      <div className="mb-6">
        <label className="block text-sm text-text-secondary mb-2">Trade Value (ISK)</label>
        <input
          type="number"
          value={customTradeValue}
          onChange={(e) => setCustomTradeValue(Math.max(0, parseFloat(e.target.value) || 0))}
          className="w-full px-4 py-3 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono"
          placeholder="100,000,000"
        />
      </div>

      {/* Skills Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-6">
          <h4 className="font-medium text-text-primary">Trade Skills</h4>
          <SkillSlider
            label="Accounting"
            value={accounting}
            onChange={setAccounting}
            description="Reduces sales tax by 11% per level"
          />
          <SkillSlider
            label="Broker Relations"
            value={brokerRelations}
            onChange={setBrokerRelations}
            description="Reduces broker fee by 0.3% per level"
          />
        </div>

        <div className="space-y-6">
          <h4 className="font-medium text-text-primary">NPC Standings</h4>
          <StandingSlider
            label="Corp Standing"
            value={corpStanding}
            onChange={setCorpStanding}
          />
          <StandingSlider
            label="Faction Standing"
            value={factionStanding}
            onChange={setFactionStanding}
          />
        </div>
      </div>

      {/* Results */}
      <div className="border-t border-accent-cyan/20 pt-6">
        <h4 className="font-medium text-text-primary mb-4">Your Fees</h4>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 rounded-lg bg-space-dark/50">
            <div className="text-2xl font-bold text-accent-cyan">
              {formatPercent(calculations.salesTax, 2)}
            </div>
            <div className="text-sm text-text-secondary">Sales Tax</div>
            <div className="text-xs text-text-secondary/70 mt-1">
              {formatISK(calculations.salesTaxAmount, false)}
            </div>
          </div>
          <div className="text-center p-4 rounded-lg bg-space-dark/50">
            <div className="text-2xl font-bold text-accent-purple">
              {formatPercent(calculations.brokerFee, 2)}
            </div>
            <div className="text-sm text-text-secondary">Broker Fee (x2)</div>
            <div className="text-xs text-text-secondary/70 mt-1">
              {formatISK(calculations.brokerFeeAmount, false)}
            </div>
          </div>
          <div className="text-center p-4 rounded-lg bg-space-dark/50">
            <div className="text-2xl font-bold text-accent-gold">
              {formatPercent(calculations.totalFees, 2)}
            </div>
            <div className="text-sm text-text-secondary">Total Fees</div>
            <div className="text-xs text-text-secondary/70 mt-1">
              {formatISK(calculations.totalFeesAmount, false)}
            </div>
          </div>
        </div>

        {/* Savings */}
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Savings vs. no skills:</span>
            <span className="text-xl font-bold text-green-400">
              {formatISK(calculations.savings, false)}
            </span>
          </div>
          <div className="text-xs text-text-secondary/70 mt-1">
            No skills: {formatPercent(calculations.noSkillTotal, 2)} total fees
          </div>
        </div>

        {/* Training Recommendations */}
        {(calculations.accountingSavings > 0 || calculations.brokerSavings > 0) && (
          <div className="space-y-3">
            <h4 className="font-medium text-text-primary">Training Recommendations</h4>

            {calculations.accountingSavings > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-space-dark/50">
                <div>
                  <span className="text-text-primary">Train Accounting to {accounting + 1}</span>
                  <div className="text-xs text-text-secondary">~24 hours training time</div>
                </div>
                <span className="text-green-400 font-mono">
                  +{formatISK(calculations.accountingSavings, false)}/trade
                </span>
              </div>
            )}

            {calculations.brokerSavings > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-space-dark/50">
                <div>
                  <span className="text-text-primary">Train Broker Relations to {brokerRelations + 1}</span>
                  <div className="text-xs text-text-secondary">~16 hours training time</div>
                </div>
                <span className="text-green-400 font-mono">
                  +{formatISK(calculations.brokerSavings, false)}/trade
                </span>
              </div>
            )}
          </div>
        )}

        {/* All skills maxed */}
        {accounting === 5 && brokerRelations === 5 && (
          <div className="p-4 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-center">
            <span className="text-accent-cyan">Trade skills maxed! Consider improving standings for further reductions.</span>
          </div>
        )}
      </div>
    </GlassmorphicCard>
  );
}

export default SkillCalculator;
