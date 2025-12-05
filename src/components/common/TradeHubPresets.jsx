
/**
 * Major EVE Online Trade Hubs
 * These are the most active market stations in New Eden
 */
const TRADE_HUBS = [
  {
    id: 'jita',
    name: 'Jita 4-4',
    fullName: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
    region: 'The Forge',
    description: 'Largest trade hub in New Eden',
    icon: '1',
    color: 'from-blue-500 to-blue-600',
    volume: 'Highest',
  },
  {
    id: 'amarr',
    name: 'Amarr',
    fullName: 'Amarr VIII (Oris) - Emperor Family Academy',
    region: 'Domain',
    description: 'Second largest, Amarr space center',
    icon: '2',
    color: 'from-yellow-500 to-amber-600',
    volume: 'Very High',
  },
  {
    id: 'dodixie',
    name: 'Dodixie',
    fullName: 'Dodixie IX - Moon 20 - Federation Navy Assembly Plant',
    region: 'Sinq Laison',
    description: 'Gallente main trade hub',
    icon: '3',
    color: 'from-green-500 to-emerald-600',
    volume: 'High',
  },
  {
    id: 'rens',
    name: 'Rens',
    fullName: 'Rens VI - Moon 8 - Brutor Tribe Treasury',
    region: 'Heimatar',
    description: 'Minmatar main trade hub',
    icon: '4',
    color: 'from-red-500 to-orange-600',
    volume: 'High',
  },
  {
    id: 'hek',
    name: 'Hek',
    fullName: 'Hek VIII - Moon 12 - Boundless Creation Factory',
    region: 'Metropolis',
    description: 'Secondary Minmatar hub',
    icon: '5',
    color: 'from-purple-500 to-pink-600',
    volume: 'Medium',
  },
];

/**
 * Common Trade Routes
 * Popular hauling routes between major hubs
 */
const TRADE_ROUTES = [
  {
    id: 'jita-amarr',
    from: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
    to: 'Amarr VIII (Oris) - Emperor Family Academy',
    name: 'Jita to Amarr',
    description: 'Most profitable route, 9 jumps',
    jumps: 9,
    icon: '1',
    color: 'from-blue-500 to-yellow-500',
  },
  {
    id: 'jita-dodixie',
    from: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
    to: 'Dodixie IX - Moon 20 - Federation Navy Assembly Plant',
    name: 'Jita to Dodixie',
    description: 'Caldari to Gallente, 15 jumps',
    jumps: 15,
    icon: '2',
    color: 'from-blue-500 to-green-500',
  },
  {
    id: 'amarr-dodixie',
    from: 'Amarr VIII (Oris) - Emperor Family Academy',
    to: 'Dodixie IX - Moon 20 - Federation Navy Assembly Plant',
    name: 'Amarr to Dodixie',
    description: 'Amarr to Gallente, 21 jumps',
    jumps: 21,
    icon: '3',
    color: 'from-yellow-500 to-green-500',
  },
  {
    id: 'jita-rens',
    from: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
    to: 'Rens VI - Moon 8 - Brutor Tribe Treasury',
    name: 'Jita to Rens',
    description: 'Caldari to Minmatar, 16 jumps',
    jumps: 16,
    icon: '4',
    color: 'from-blue-500 to-red-500',
  },
];

/**
 * Trade Hub Quick Select Button
 */
function HubButton({ hub, isSelected, onClick, compact = false }) {
  return (
    <button
      type="button"
      onClick={() => onClick(hub.fullName)}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200
        ${isSelected
          ? 'bg-gradient-to-r ' + hub.color + ' border-transparent text-white shadow-lg'
          : 'bg-space-dark/50 border-accent-cyan/20 text-text-secondary hover:border-accent-cyan/40 hover:text-text-primary'
        }
        ${compact ? 'text-xs' : 'text-sm'}
      `}
      title={`${hub.fullName} (${hub.region}) - ${hub.description}`}
    >
      <span className={`
        w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
        ${isSelected ? 'bg-white/20' : 'bg-accent-cyan/20 text-accent-cyan'}
      `}>
        {hub.icon}
      </span>
      <span className="font-medium">{hub.name}</span>
      {!compact && (
        <span className={`text-xs ${isSelected ? 'text-white/70' : 'text-text-secondary/70'}`}>
          {hub.volume}
        </span>
      )}
    </button>
  );
}

/**
 * Trade Route Quick Select Button
 */
function RouteButton({ route, isSelected, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(route)}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200 w-full text-left
        ${isSelected
          ? 'bg-gradient-to-r ' + route.color + ' border-transparent text-white shadow-lg'
          : 'bg-space-dark/50 border-accent-cyan/20 text-text-secondary hover:border-accent-cyan/40 hover:text-text-primary'
        }
      `}
      title={route.description}
    >
      <span className={`
        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
        ${isSelected ? 'bg-white/20' : 'bg-accent-cyan/20 text-accent-cyan'}
      `}>
        {route.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{route.name}</div>
        <div className={`text-xs ${isSelected ? 'text-white/70' : 'text-text-secondary/70'}`}>
          {route.jumps} jumps
        </div>
      </div>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </button>
  );
}

/**
 * Trade Hub Presets Component
 * Quick selection of major trade hubs for station trading
 */
export function TradeHubPresets({
  selectedStation,
  onStationSelect,
  compact = false,
  className = '',
}) {
  const isSelected = (hubName) => selectedStation === hubName;

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span className="text-sm font-medium text-text-secondary">Major Trade Hubs</span>
      </div>

      <div className={`flex ${compact ? 'gap-1.5' : 'gap-2'} flex-wrap`}>
        {TRADE_HUBS.map(hub => (
          <HubButton
            key={hub.id}
            hub={hub}
            isSelected={isSelected(hub.fullName)}
            onClick={onStationSelect}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Trade Route Presets Component
 * Quick selection of popular hauling routes
 */
export function TradeRoutePresets({
  fromStation,
  toStation,
  onRouteSelect,
  className = '',
}) {
  const isSelected = (route) =>
    fromStation === route.from && toStation === route.to;

  const handleRouteClick = (route) => {
    onRouteSelect?.(route.from, route.to);
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <span className="text-sm font-medium text-text-secondary">Popular Routes</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {TRADE_ROUTES.map(route => (
          <RouteButton
            key={route.id}
            route={route}
            isSelected={isSelected(route)}
            onClick={handleRouteClick}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Region Presets for Region Hauling
 */
const POPULAR_REGIONS = [
  { id: 'the-forge', name: 'The Forge', description: 'Jita, highest volume', icon: '1', color: 'from-blue-500 to-blue-600' },
  { id: 'domain', name: 'Domain', description: 'Amarr hub', icon: '2', color: 'from-yellow-500 to-amber-600' },
  { id: 'sinq-laison', name: 'Sinq Laison', description: 'Dodixie hub', icon: '3', color: 'from-green-500 to-emerald-600' },
  { id: 'heimatar', name: 'Heimatar', description: 'Rens hub', icon: '4', color: 'from-red-500 to-orange-600' },
  { id: 'metropolis', name: 'Metropolis', description: 'Hek hub', icon: '5', color: 'from-purple-500 to-pink-600' },
  { id: 'essence', name: 'Essence', description: 'Near Dodixie', icon: '6', color: 'from-teal-500 to-cyan-600' },
];

/**
 * Region Presets Component
 * Quick selection of popular regions for region hauling
 */
export function RegionPresets({
  selectedRegion,
  onRegionSelect,
  compact = false,
  className = '',
}) {
  const isSelected = (regionName) => selectedRegion === regionName;

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-medium text-text-secondary">Popular Regions</span>
      </div>

      <div className={`flex ${compact ? 'gap-1.5' : 'gap-2'} flex-wrap`}>
        {POPULAR_REGIONS.map(region => (
          <button
            key={region.id}
            type="button"
            onClick={() => onRegionSelect(region.name)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200
              ${isSelected(region.name)
                ? 'bg-gradient-to-r ' + region.color + ' border-transparent text-white shadow-lg'
                : 'bg-space-dark/50 border-accent-cyan/20 text-text-secondary hover:border-accent-cyan/40 hover:text-text-primary'
              }
              ${compact ? 'text-xs' : 'text-sm'}
            `}
            title={region.description}
          >
            <span className={`
              w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
              ${isSelected(region.name) ? 'bg-white/20' : 'bg-accent-cyan/20 text-accent-cyan'}
            `}>
              {region.icon}
            </span>
            <span className="font-medium">{region.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export { TRADE_HUBS, TRADE_ROUTES, POPULAR_REGIONS };
export default TradeHubPresets;
