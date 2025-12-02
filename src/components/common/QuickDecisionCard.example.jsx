import { QuickDecisionCard } from './QuickDecisionCard';

/**
 * Example usage of QuickDecisionCard component
 * Demonstrates various trade scenarios and decision outcomes
 */
export function QuickDecisionCardExample() {
  // Example 1: GO - Excellent trade opportunity
  const excellentTrade = {
    item: { name: 'PLEX', typeId: 44992 },
    profit: 125000000,
    margin: 18.5,
    volume: 150,
    roi: 22.3,
    competition: 3,
    dataAge: 2.5,
    userCanAfford: true,
    fromLocation: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
    toLocation: 'Amarr VIII (Oris) - Emperor Family Academy',
  };

  // Example 2: WAIT - Moderate concerns
  const moderateTrade = {
    item: { name: 'Tritanium', typeId: 34 },
    profit: 15000000,
    margin: 8.2,
    volume: 25,
    roi: 12.1,
    competition: 8,
    dataAge: 11,
    userCanAfford: true,
    fromLocation: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
    toLocation: 'Dodixie IX - Moon 20 - Federation Navy Assembly Plant',
  };

  // Example 3: AVOID - High risk trade
  const riskyTrade = {
    item: { name: 'Megathron Blueprint', typeId: 642 },
    profit: 500000000,
    margin: 45.0,
    volume: 2,
    roi: 55.0,
    competition: 1,
    dataAge: 28,
    userCanAfford: true,
    fromLocation: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
    toLocation: 'Amarr VIII (Oris) - Emperor Family Academy',
  };

  // Example 4: AVOID - Can't afford
  const unaffordableTrade = {
    item: { name: 'Titan Blueprint', typeId: 11567 },
    profit: 50000000000,
    margin: 15.0,
    volume: 50,
    roi: 18.5,
    competition: 2,
    dataAge: 5,
    userCanAfford: false,
    fromLocation: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
    toLocation: 'Amarr VIII (Oris) - Emperor Family Academy',
  };

  // Example 5: WAIT - Stale data
  const staleTrade = {
    item: { name: 'Heavy Assault Missile Launcher II', typeId: 2929 },
    profit: 8500000,
    margin: 12.5,
    volume: 75,
    roi: 14.2,
    competition: 5,
    dataAge: 22,
    userCanAfford: true,
    fromLocation: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
    toLocation: 'Dodixie IX - Moon 20 - Federation Navy Assembly Plant',
  };

  // Example 6: AVOID - Low volume scam potential
  const scamTrade = {
    item: { name: 'Rare Mining Module', typeId: 12345 },
    profit: 1000000000,
    margin: 85.0,
    volume: 1,
    roi: 95.0,
    competition: 1,
    dataAge: 3,
    userCanAfford: true,
    fromLocation: 'Random Lowsec Station',
    toLocation: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
  };

  return (
    <div className="min-h-screen bg-space-black p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl text-text-primary mb-2">
            QuickDecisionCard Examples
          </h1>
          <p className="text-text-secondary">
            Various trade scenarios showing different decision outcomes
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-display text-text-primary mb-3">
              1. GO - Excellent Opportunity
            </h2>
            <QuickDecisionCard {...excellentTrade} />
          </div>

          <div>
            <h2 className="text-xl font-display text-text-primary mb-3">
              2. WAIT - Moderate Concerns
            </h2>
            <QuickDecisionCard {...moderateTrade} />
          </div>

          <div>
            <h2 className="text-xl font-display text-text-primary mb-3">
              3. AVOID - Low Volume Scam Risk
            </h2>
            <QuickDecisionCard {...riskyTrade} />
          </div>

          <div>
            <h2 className="text-xl font-display text-text-primary mb-3">
              4. AVOID - Insufficient Funds
            </h2>
            <QuickDecisionCard {...unaffordableTrade} />
          </div>

          <div>
            <h2 className="text-xl font-display text-text-primary mb-3">
              5. WAIT - Stale Data Warning
            </h2>
            <QuickDecisionCard {...staleTrade} />
          </div>

          <div>
            <h2 className="text-xl font-display text-text-primary mb-3">
              6. AVOID - Obvious Scam (High Margin + Low Volume)
            </h2>
            <QuickDecisionCard {...scamTrade} />
          </div>
        </div>

        {/* Usage instructions */}
        <div className="mt-12 p-6 bg-space-dark/30 rounded-lg border border-accent-cyan/10">
          <h3 className="text-lg font-display text-text-primary mb-3">
            Usage
          </h3>
          <pre className="text-sm text-text-secondary overflow-x-auto">
{`import { QuickDecisionCard } from './components/common/QuickDecisionCard';

<QuickDecisionCard
  item={{ name: 'Item Name', typeId: 12345 }}
  profit={125000000}
  margin={18.5}
  volume={150}
  roi={22.3}
  competition={3}
  dataAge={2.5}
  userCanAfford={true}
  fromLocation="Jita IV - Moon 4"
  toLocation="Amarr VIII"
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default QuickDecisionCardExample;
