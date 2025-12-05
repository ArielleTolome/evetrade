import { useState, useMemo } from 'react';
import { useIndustry } from '../../hooks/useIndustry';

/**
 * Industry Calculator Component
 * Calculate manufacturing costs and profits for EVE Online items
 */
export function IndustryCalculator() {
  const {
    calculateManufacturingProfit,
    calculateInvention,
    compareBuildVsBuy: _compareBuildVsBuy,
    formatISK,
    formatTime: _formatTime,
  } = useIndustry();

  const [activeTab, setActiveTab] = useState('manufacturing');

  // Manufacturing state
  const [mfgParams, setMfgParams] = useState({
    runs: 1,
    materialEfficiency: 10,
    timeEfficiency: 20,
    systemIndex: 0.05,
    facilityTax: 0.1,
    facilityBonus: 0,
    rigBonus: 0,
    structureRoleBonus: 0,
    sellPrice: 0,
    salesTax: 3.6,
    brokerFee: 3.0,
    baseTime: 3600,
    productQuantity: 1,
  });

  const [materials, setMaterials] = useState([
    { name: 'Tritanium', typeId: 34, quantity: 1000, price: 5 },
    { name: 'Pyerite', typeId: 35, quantity: 500, price: 8 },
    { name: 'Mexallon', typeId: 36, quantity: 200, price: 40 },
  ]);

  // Invention state
  const [invParams, setInvParams] = useState({
    baseChance: 30,
    encryptionSkill: 4,
    datacore1Skill: 4,
    datacore2Skill: 4,
    decryptor: 'none',
    runs: 10,
    datacore1Cost: 100000,
    datacore2Cost: 100000,
    decryptorCost: 0,
  });

  // Build vs Buy state
  const [bvbParams, setBvbParams] = useState({
    buyPrice: 10000000,
    quantity: 10,
  });

  // Calculate manufacturing results
  const mfgResult = useMemo(() => {
    const marketPrices = {};
    materials.forEach(m => {
      marketPrices[m.typeId] = m.price;
    });

    return calculateManufacturingProfit({
      materials,
      marketPrices,
      runs: mfgParams.runs,
      materialEfficiency: mfgParams.materialEfficiency,
      timeEfficiency: mfgParams.timeEfficiency,
      systemIndex: mfgParams.systemIndex,
      facilityTax: mfgParams.facilityTax / 100,
      facilityBonus: mfgParams.facilityBonus,
      rigBonus: mfgParams.rigBonus,
      structureRoleBonus: mfgParams.structureRoleBonus,
      sellPrice: mfgParams.sellPrice,
      salesTax: mfgParams.salesTax / 100,
      brokerFee: mfgParams.brokerFee / 100,
      baseTime: mfgParams.baseTime,
      productQuantity: mfgParams.productQuantity,
    });
  }, [mfgParams, materials, calculateManufacturingProfit]);

  // Calculate invention results
  const invResult = useMemo(() => {
    return calculateInvention({
      baseChance: invParams.baseChance / 100,
      encryptionSkill: invParams.encryptionSkill,
      datacore1Skill: invParams.datacore1Skill,
      datacore2Skill: invParams.datacore2Skill,
      decryptor: invParams.decryptor,
      runs: invParams.runs,
      datacoreCosts: {
        datacore1: invParams.datacore1Cost,
        datacore2: invParams.datacore2Cost,
        decryptor: invParams.decryptorCost,
      },
    });
  }, [invParams, calculateInvention]);

  // Add material
  const addMaterial = () => {
    setMaterials([...materials, { name: '', typeId: 0, quantity: 0, price: 0 }]);
  };

  // Remove material
  const removeMaterial = (index) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  // Update material
  const updateMaterial = (index, field, value) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], [field]: value };
    setMaterials(updated);
  };

  const tabs = [
    { id: 'manufacturing', label: 'Manufacturing' },
    { id: 'invention', label: 'Invention' },
    { id: 'buildvsbuy', label: 'Build vs Buy' },
  ];

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          Industry Calculator
        </h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[2px] ${
              activeTab === tab.id
                ? 'text-indigo-400 border-indigo-400'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Manufacturing Tab */}
      {activeTab === 'manufacturing' && (
        <div className="space-y-4">
          {/* Blueprint Settings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Runs</label>
              <input
                type="number"
                value={mfgParams.runs}
                onChange={(e) => setMfgParams(p => ({ ...p, runs: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                min="1"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">ME Level (%)</label>
              <input
                type="number"
                value={mfgParams.materialEfficiency}
                onChange={(e) => setMfgParams(p => ({ ...p, materialEfficiency: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                min="0"
                max="10"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">TE Level (%)</label>
              <input
                type="number"
                value={mfgParams.timeEfficiency}
                onChange={(e) => setMfgParams(p => ({ ...p, timeEfficiency: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                min="0"
                max="20"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Base Time (sec)</label>
              <input
                type="number"
                value={mfgParams.baseTime}
                onChange={(e) => setMfgParams(p => ({ ...p, baseTime: parseInt(e.target.value) || 3600 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
              />
            </div>
          </div>

          {/* Facility Settings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">System Index</label>
              <input
                type="number"
                value={mfgParams.systemIndex}
                onChange={(e) => setMfgParams(p => ({ ...p, systemIndex: parseFloat(e.target.value) || 0.05 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Facility Tax (%)</label>
              <input
                type="number"
                value={mfgParams.facilityTax}
                onChange={(e) => setMfgParams(p => ({ ...p, facilityTax: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Structure ME Bonus (%)</label>
              <input
                type="number"
                value={mfgParams.facilityBonus}
                onChange={(e) => setMfgParams(p => ({ ...p, facilityBonus: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Rig ME Bonus (%)</label>
              <input
                type="number"
                value={mfgParams.rigBonus}
                onChange={(e) => setMfgParams(p => ({ ...p, rigBonus: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
              />
            </div>
          </div>

          {/* Materials */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-300">Materials</label>
              <button
                onClick={addMaterial}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                + Add Material
              </button>
            </div>
            <div className="space-y-2">
              {materials.map((mat, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={mat.name}
                    onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                    placeholder="Material name"
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                  />
                  <input
                    type="number"
                    value={mat.quantity}
                    onChange={(e) => updateMaterial(index, 'quantity', parseInt(e.target.value) || 0)}
                    placeholder="Qty"
                    className="w-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                  />
                  <input
                    type="number"
                    value={mat.price}
                    onChange={(e) => updateMaterial(index, 'price', parseFloat(e.target.value) || 0)}
                    placeholder="Price"
                    className="w-28 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                  />
                  <button
                    onClick={() => removeMaterial(index)}
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sell Price & Taxes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Sell Price (per unit)</label>
              <input
                type="number"
                value={mfgParams.sellPrice}
                onChange={(e) => setMfgParams(p => ({ ...p, sellPrice: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Units per Run</label>
              <input
                type="number"
                value={mfgParams.productQuantity}
                onChange={(e) => setMfgParams(p => ({ ...p, productQuantity: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                min="1"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Sales Tax (%)</label>
              <input
                type="number"
                value={mfgParams.salesTax}
                onChange={(e) => setMfgParams(p => ({ ...p, salesTax: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Broker Fee (%)</label>
              <input
                type="number"
                value={mfgParams.brokerFee}
                onChange={(e) => setMfgParams(p => ({ ...p, brokerFee: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                step="0.1"
              />
            </div>
          </div>

          {/* Results */}
          <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Results</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-slate-500">Material Cost</div>
                <div className="text-lg font-semibold text-white">{formatISK(mfgResult.totalMaterialCost)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Job Cost</div>
                <div className="text-lg font-semibold text-white">{formatISK(mfgResult.jobCost + mfgResult.facilityFee)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Total Cost</div>
                <div className="text-lg font-semibold text-amber-400">{formatISK(mfgResult.totalCost)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Cost per Unit</div>
                <div className="text-lg font-semibold text-white">{formatISK(mfgResult.costPerUnit)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Gross Revenue</div>
                <div className="text-lg font-semibold text-white">{formatISK(mfgResult.grossRevenue)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Net Revenue</div>
                <div className="text-lg font-semibold text-white">{formatISK(mfgResult.netRevenue)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Profit</div>
                <div className={`text-lg font-semibold ${mfgResult.isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                  {formatISK(mfgResult.profit)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Profit Margin</div>
                <div className={`text-lg font-semibold ${mfgResult.profitMargin > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {mfgResult.profitMargin.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">ROI</div>
                <div className={`text-lg font-semibold ${mfgResult.roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {mfgResult.roi.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Production Time</div>
                <div className="text-lg font-semibold text-blue-400">{mfgResult.productionTimeFormatted}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">ISK/Hour</div>
                <div className={`text-lg font-semibold ${mfgResult.iskPerHour > 0 ? 'text-purple-400' : 'text-red-400'}`}>
                  {formatISK(mfgResult.iskPerHour)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Units Produced</div>
                <div className="text-lg font-semibold text-white">{mfgResult.productQuantity}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invention Tab */}
      {activeTab === 'invention' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Base Chance (%)</label>
              <input
                type="number"
                value={invParams.baseChance}
                onChange={(e) => setInvParams(p => ({ ...p, baseChance: parseFloat(e.target.value) || 30 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                step="1"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Encryption Skill</label>
              <input
                type="number"
                value={invParams.encryptionSkill}
                onChange={(e) => setInvParams(p => ({ ...p, encryptionSkill: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                min="0"
                max="5"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Datacore Skill 1</label>
              <input
                type="number"
                value={invParams.datacore1Skill}
                onChange={(e) => setInvParams(p => ({ ...p, datacore1Skill: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                min="0"
                max="5"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Datacore Skill 2</label>
              <input
                type="number"
                value={invParams.datacore2Skill}
                onChange={(e) => setInvParams(p => ({ ...p, datacore2Skill: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                min="0"
                max="5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Decryptor</label>
              <select
                value={invParams.decryptor}
                onChange={(e) => setInvParams(p => ({ ...p, decryptor: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
              >
                <option value="none">None</option>
                <option value="accelerant">Accelerant (+20% chance, +2 ME)</option>
                <option value="attainment">Attainment (+80% chance, -1 ME)</option>
                <option value="augmentation">Augmentation (-40% chance, +9 ME)</option>
                <option value="optimized">Optimized Attainment (+0%, +2 ME)</option>
                <option value="parity">Parity (+50% chance, +1 ME)</option>
                <option value="process">Process (-10% chance, +3 ME)</option>
                <option value="symmetry">Symmetry (+0%, +1 ME)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Attempts</label>
              <input
                type="number"
                value={invParams.runs}
                onChange={(e) => setInvParams(p => ({ ...p, runs: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                min="1"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Datacore 1 Cost</label>
              <input
                type="number"
                value={invParams.datacore1Cost}
                onChange={(e) => setInvParams(p => ({ ...p, datacore1Cost: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Datacore 2 Cost</label>
              <input
                type="number"
                value={invParams.datacore2Cost}
                onChange={(e) => setInvParams(p => ({ ...p, datacore2Cost: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
              />
            </div>
          </div>

          {/* Invention Results */}
          <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Invention Results</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-slate-500">Success Chance</div>
                <div className="text-lg font-semibold text-green-400">{invResult.successChancePercent}%</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Expected Successes</div>
                <div className="text-lg font-semibold text-white">{invResult.expectedSuccesses.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Result ME</div>
                <div className="text-lg font-semibold text-blue-400">{invResult.resultME}%</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Result TE</div>
                <div className="text-lg font-semibold text-blue-400">{invResult.resultTE}%</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">BPC Runs</div>
                <div className="text-lg font-semibold text-white">{invResult.expectedRuns}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Cost per Attempt</div>
                <div className="text-lg font-semibold text-amber-400">{formatISK(invResult.costPerAttempt)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Total Cost</div>
                <div className="text-lg font-semibold text-amber-400">{formatISK(invResult.totalCost)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Cost per Success</div>
                <div className="text-lg font-semibold text-white">{formatISK(invResult.expectedCostPerSuccess)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Build vs Buy Tab */}
      {activeTab === 'buildvsbuy' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <p className="text-sm text-slate-400">
              Compare the cost of building an item yourself vs buying it on the market.
              Configure your manufacturing settings in the Manufacturing tab first.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Market Buy Price (per unit)</label>
              <input
                type="number"
                value={bvbParams.buyPrice}
                onChange={(e) => setBvbParams(p => ({ ...p, buyPrice: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Quantity Needed</label>
              <input
                type="number"
                value={bvbParams.quantity}
                onChange={(e) => setBvbParams(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                min="1"
              />
            </div>
          </div>

          {/* Comparison Results */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/50 rounded-lg border-2 border-slate-700">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Buy from Market</h4>
              <div className="text-2xl font-bold text-white mb-1">
                {formatISK(bvbParams.buyPrice * bvbParams.quantity)}
              </div>
              <div className="text-xs text-slate-500">
                {bvbParams.quantity} units @ {formatISK(bvbParams.buyPrice)} each
              </div>
            </div>

            <div className="p-4 bg-slate-900/50 rounded-lg border-2 border-slate-700">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Build Yourself</h4>
              <div className="text-2xl font-bold text-white mb-1">
                {formatISK(mfgResult.costPerUnit * bvbParams.quantity)}
              </div>
              <div className="text-xs text-slate-500">
                {bvbParams.quantity} units @ {formatISK(mfgResult.costPerUnit)} each
              </div>
            </div>
          </div>

          {/* Recommendation */}
          {bvbParams.buyPrice > 0 && (
            <div className={`p-4 rounded-lg ${
              mfgResult.costPerUnit < bvbParams.buyPrice
                ? 'bg-green-900/20 border border-green-500/30'
                : 'bg-amber-900/20 border border-amber-500/30'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <svg className={`w-5 h-5 ${mfgResult.costPerUnit < bvbParams.buyPrice ? 'text-green-400' : 'text-amber-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`font-medium ${mfgResult.costPerUnit < bvbParams.buyPrice ? 'text-green-400' : 'text-amber-400'}`}>
                  {mfgResult.costPerUnit < bvbParams.buyPrice ? 'Building is cheaper!' : 'Buying is cheaper'}
                </span>
              </div>
              <p className="text-sm text-slate-300">
                {mfgResult.costPerUnit < bvbParams.buyPrice
                  ? `You save ${formatISK((bvbParams.buyPrice - mfgResult.costPerUnit) * bvbParams.quantity)} (${(((bvbParams.buyPrice - mfgResult.costPerUnit) / bvbParams.buyPrice) * 100).toFixed(1)}%) by building`
                  : `Buying saves ${formatISK((mfgResult.costPerUnit - bvbParams.buyPrice) * bvbParams.quantity)} compared to building`
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default IndustryCalculator;
