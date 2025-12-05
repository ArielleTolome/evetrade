import { useState } from 'react';
import { useContracts } from '../../hooks/useContracts';
import { useResources } from '../../hooks/useResources';

/**
 * Contract Finder Component
 * Find profitable courier and item exchange contracts
 */
export function ContractFinder() {
  const {
    loading,
    error,
    fetchAllRegionContracts,
    analyzeCourierContracts,
    getContractTypeLabel,
    formatISK,
    formatVolume,
  } = useContracts();

  const { regionList: _regionList } = useResources();

  const [selectedRegion, setSelectedRegion] = useState('10000002'); // The Forge (Jita)
  const [contractType, setContractType] = useState('courier');
  const [contracts, setContracts] = useState([]);
  const [analyzedContracts, setAnalyzedContracts] = useState([]);
  const [filters, setFilters] = useState({
    minReward: 1000000,
    maxCollateral: 2000000000,
    maxVolume: 400000,
    minIskPerJump: 50000,
  });
  const [sortBy, setSortBy] = useState('iskPerJump');
  const [sortOrder, setSortOrder] = useState('desc');

  // Popular regions for trading
  const popularRegions = [
    { id: '10000002', name: 'The Forge (Jita)' },
    { id: '10000043', name: 'Domain (Amarr)' },
    { id: '10000032', name: 'Sinq Laison (Dodixie)' },
    { id: '10000030', name: 'Heimatar (Rens)' },
    { id: '10000042', name: 'Metropolis (Hek)' },
  ];

  const handleSearch = async () => {
    const allContracts = await fetchAllRegionContracts(selectedRegion, 3);
    setContracts(allContracts);

    if (contractType === 'courier') {
      const analyzed = analyzeCourierContracts(allContracts, filters);
      setAnalyzedContracts(analyzed);
    } else {
      // Filter item exchange contracts
      const itemExchanges = allContracts
        .filter(c => c.type === 'item_exchange')
        .slice(0, 100);
      setAnalyzedContracts(itemExchanges);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedContracts = [...analyzedContracts].sort((a, b) => {
    const aVal = a[sortBy] || 0;
    const bVal = b[sortBy] || 0;
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const getTimeRemaining = (dateExpired) => {
    const expires = new Date(dateExpired);
    const now = new Date();
    const diff = expires - now;

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getProfitabilityColor = (score) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    if (score >= 30) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Contract Finder
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">
            {contracts.length} contracts loaded
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Region Selection */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Region</label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            {popularRegions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>

        {/* Contract Type */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Contract Type</label>
          <select
            value={contractType}
            onChange={(e) => setContractType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="courier">Courier</option>
            <option value="item_exchange">Item Exchange</option>
          </select>
        </div>

        {contractType === 'courier' && (
          <>
            {/* Min Reward */}
            <div>
              <label className="block text-xs text-slate-500 mb-1">Min Reward (ISK)</label>
              <input
                type="number"
                value={filters.minReward}
                onChange={(e) => setFilters(f => ({ ...f, minReward: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Max Collateral */}
            <div>
              <label className="block text-xs text-slate-500 mb-1">Max Collateral (ISK)</label>
              <input
                type="number"
                value={filters.maxCollateral}
                onChange={(e) => setFilters(f => ({ ...f, maxCollateral: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Max Volume */}
            <div>
              <label className="block text-xs text-slate-500 mb-1">Max Volume (m³)</label>
              <input
                type="number"
                value={filters.maxVolume}
                onChange={(e) => setFilters(f => ({ ...f, maxVolume: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Min ISK/Jump */}
            <div>
              <label className="block text-xs text-slate-500 mb-1">Min ISK/Jump</label>
              <input
                type="number"
                value={filters.minIskPerJump}
                onChange={(e) => setFilters(f => ({ ...f, minIskPerJump: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </>
        )}
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        disabled={loading}
        className="w-full mb-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            Searching...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Find Contracts
          </>
        )}
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {sortedContracts.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                {contractType === 'courier' ? (
                  <>
                    <th className="pb-2 px-2">Contract</th>
                    <th
                      className="pb-2 px-2 cursor-pointer hover:text-white"
                      onClick={() => handleSort('reward')}
                    >
                      Reward {sortBy === 'reward' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="pb-2 px-2 cursor-pointer hover:text-white"
                      onClick={() => handleSort('collateral')}
                    >
                      Collateral {sortBy === 'collateral' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="pb-2 px-2 cursor-pointer hover:text-white"
                      onClick={() => handleSort('volume')}
                    >
                      Volume {sortBy === 'volume' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="pb-2 px-2 cursor-pointer hover:text-white"
                      onClick={() => handleSort('iskPerJump')}
                    >
                      ISK/Jump {sortBy === 'iskPerJump' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="pb-2 px-2 cursor-pointer hover:text-white"
                      onClick={() => handleSort('profitability')}
                    >
                      Score {sortBy === 'profitability' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="pb-2 px-2">Expires</th>
                  </>
                ) : (
                  <>
                    <th className="pb-2 px-2">Contract</th>
                    <th
                      className="pb-2 px-2 cursor-pointer hover:text-white"
                      onClick={() => handleSort('price')}
                    >
                      Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="pb-2 px-2">Type</th>
                    <th className="pb-2 px-2">Expires</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedContracts.slice(0, 50).map((contract) => (
                <tr
                  key={contract.contract_id}
                  className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                >
                  {contractType === 'courier' ? (
                    <>
                      <td className="py-2 px-2">
                        <div className="text-white">#{contract.contract_id}</div>
                        <div className="text-xs text-slate-500">
                          {contract.days_to_complete || 3} days to complete
                        </div>
                      </td>
                      <td className="py-2 px-2 text-green-400 font-medium">
                        {formatISK(contract.reward)}
                      </td>
                      <td className="py-2 px-2 text-amber-400">
                        {formatISK(contract.collateral)}
                      </td>
                      <td className="py-2 px-2 text-blue-400">
                        {formatVolume(contract.volume)}
                      </td>
                      <td className="py-2 px-2 text-purple-400 font-medium">
                        {formatISK(contract.iskPerJump)}/j
                      </td>
                      <td className="py-2 px-2">
                        <span className={`font-medium ${getProfitabilityColor(contract.profitability)}`}>
                          {contract.profitability}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-slate-400">
                        {getTimeRemaining(contract.date_expired)}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2 px-2">
                        <div className="text-white">#{contract.contract_id}</div>
                        <div className="text-xs text-slate-500">{contract.title || 'Item Exchange'}</div>
                      </td>
                      <td className="py-2 px-2 text-green-400 font-medium">
                        {formatISK(contract.price)}
                      </td>
                      <td className="py-2 px-2 text-slate-400">
                        {getContractTypeLabel(contract.type)}
                      </td>
                      <td className="py-2 px-2 text-slate-400">
                        {getTimeRemaining(contract.date_expired)}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {sortedContracts.length > 50 && (
            <div className="mt-2 text-center text-sm text-slate-500">
              Showing 50 of {sortedContracts.length} contracts
            </div>
          )}
        </div>
      )}

      {!loading && sortedContracts.length === 0 && contracts.length > 0 && (
        <div className="text-center py-8 text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No contracts match your filters</p>
          <p className="text-sm mt-1">Try adjusting your filter settings</p>
        </div>
      )}

      {!loading && contracts.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>Click "Find Contracts" to search</p>
        </div>
      )}

      {/* Tips */}
      <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
        <h4 className="text-sm font-medium text-slate-300 mb-2">Tips for Courier Contracts</h4>
        <ul className="text-xs text-slate-400 space-y-1">
          <li>• Higher ISK/Jump means better pay for the distance traveled</li>
          <li>• Watch collateral carefully - you pay this upfront and get it back on delivery</li>
          <li>• Small volume contracts can be done in interceptors or blockade runners</li>
          <li>• Check the route safety before accepting low-sec or null-sec deliveries</li>
          <li>• Score combines reward, collateral, volume, and time factors</li>
        </ul>
      </div>
    </div>
  );
}

export default ContractFinder;
