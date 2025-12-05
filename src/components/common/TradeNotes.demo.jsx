import { useState } from 'react';
import TradeNotes from './TradeNotes';
import useTradeNotes from '../../hooks/useTradeNotes';

/**
 * Demo component showing TradeNotes usage
 * This is for development/testing purposes only
 * Usage: Import and render in a test page to see all features
 */
export default function TradeNotesDemo() {
  const { stats, exportNotes, importNotes: _importNotes, notes } = useTradeNotes();
  const [showStats, setShowStats] = useState(true);

  // Sample trade items for demonstration
  const sampleItems = [
    { id: '34', name: 'Tritanium', category: 'Materials' },
    { id: '35', name: 'Pyerite', category: 'Materials' },
    { id: '36', name: 'Mexallon', category: 'Materials' },
    { id: '37', name: 'Isogen', category: 'Materials' },
    { id: '38', name: 'Nocxium', category: 'Materials' },
    { id: '39', name: 'Zydrine', category: 'Materials' },
    { id: '40', name: 'Megacyte', category: 'Materials' },
    { id: '41', name: 'Morphite', category: 'Materials' },
  ];

  const handleClearAll = () => {
    if (confirm('Clear all demo notes? This will remove all notes from localStorage.')) {
      localStorage.removeItem('evetrade_trade_notes');
      window.location.reload();
    }
  };

  const handleExportDemo = () => {
    const exported = exportNotes();
    console.log('Exported notes:', exported);
    alert('Check console for exported notes JSON');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          TradeNotes Component Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Interactive demonstration of the TradeNotes component features
        </p>
      </div>

      {/* Stats Panel */}
      {showStats && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Current Stats
            </h2>
            <button
              onClick={() => setShowStats(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalNotes}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Notes</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.withText}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">With Text</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded p-4">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.withTags}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">With Tags</div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
        <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
          How to Use This Demo
        </h3>
        <ol className="list-decimal list-inside space-y-1 text-yellow-800 dark:text-yellow-300 text-sm">
          <li>Click the note icon next to any item below</li>
          <li>Add tags by clicking the quick tag buttons</li>
          <li>Type notes in the text area (auto-saves)</li>
          <li>Notice the indicator updates when notes are added</li>
          <li>Visit the /notes page to see all notes</li>
        </ol>
      </div>

      {/* Demo Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Demo Controls</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportDemo}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export to Console
          </button>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear All Notes
          </button>
          <button
            onClick={() => window.location.href = '/notes'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Notes Manager
          </button>
          {!showStats && (
            <button
              onClick={() => setShowStats(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Show Stats
            </button>
          )}
        </div>
      </div>

      {/* Sample Items Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Item ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Item Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sampleItems.map(item => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">
                  {item.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {item.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <TradeNotes itemId={item.id} itemName={item.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Current Notes Display */}
      {Object.keys(notes).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Current Notes in LocalStorage
          </h3>
          <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded text-xs overflow-x-auto">
            {JSON.stringify(notes, null, 2)}
          </pre>
        </div>
      )}

      {/* Feature List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Features Demonstrated
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Inline note indicator
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                8 quick tag options
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Free-form text notes
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Auto-save functionality
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Modal editor interface
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                LocalStorage persistence
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Dark mode support
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Delete with confirmation
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
