import { useState, useMemo } from 'react';
import { Button } from './Button';
import useTradeNotes from '../../hooks/useTradeNotes';

export default function NotesManager() {
  const {
    notes,
    searchNotes,
    getItemsByTag,
    exportNotes,
    importNotes,
    deleteNote,
    stats,
    QUICK_TAGS,
  } = useTradeNotes();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  // Filter notes based on search and tag
  const filteredNotes = useMemo(() => {
    let result = Object.entries(notes).map(([itemId, note]) => ({
      itemId,
      ...note,
    }));

    if (searchQuery) {
      result = result.filter(note =>
        note.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.itemId.includes(searchQuery)
      );
    }

    if (selectedTag) {
      result = result.filter(note => note.tags?.includes(selectedTag));
    }

    // Sort by most recently updated
    result.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

    return result;
  }, [notes, searchQuery, selectedTag]);

  const handleExport = () => {
    const exported = exportNotes();
    const blob = new Blob([exported], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evetrade-notes-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setImportError('');
    const success = importNotes(importText);
    if (success) {
      setShowImport(false);
      setImportText('');
    } else {
      setImportError('Invalid JSON format. Please check your file and try again.');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTagColor = (tagId) => {
    const tag = QUICK_TAGS.find(t => t.id === tagId);
    return tag?.color || 'gray';
  };

  const TAG_COLORS = {
    green: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    red: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    gold: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    orange: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
    gray: 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200',
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Trade Notes Manager
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage all your personal trade notes and tags
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalNotes}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Items with Notes</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.withText}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Items with Text Notes</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.withTags}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Items with Tags</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-6">
        {/* Search */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search Notes
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by item ID or note text..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
              bg-white dark:bg-gray-900 text-gray-900 dark:text-white
              focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Tag Filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by Tag
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setSelectedTag(null)}
              variant={!selectedTag ? 'primary' : 'ghost'}
              size="sm"
              className={`px-3 py-1.5 text-sm font-medium
                ${!selectedTag
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              All Tags
            </Button>
            {QUICK_TAGS.map(tag => (
              <Button
                key={tag.id}
                onClick={() => setSelectedTag(tag.id)}
                variant={selectedTag === tag.id ? 'primary' : 'ghost'}
                size="sm"
                className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium
                  ${selectedTag === tag.id
                    ? TAG_COLORS[tag.color] + ' ring-2 ring-blue-500'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                <span>{tag.icon}</span>
                <span>{tag.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Export/Import */}
        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            disabled={stats.totalNotes === 0}
            variant="primary"
            className="px-4 py-2 bg-green-600 hover:bg-green-700"
          >
            Export Notes
          </Button>
          <Button
            onClick={() => setShowImport(true)}
            variant="primary"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700"
          >
            Import Notes
          </Button>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || selectedTag ? 'No notes match your filters' : 'No notes yet. Start adding notes to your trades!'}
            </p>
          </div>
        ) : (
          filteredNotes.map(note => (
            <div
              key={note.itemId}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-mono text-sm text-gray-600 dark:text-gray-400">
                    Item ID: {note.itemId}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Updated: {formatDate(note.updatedAt)}
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if (confirm('Delete this note?')) {
                      deleteNote(note.itemId);
                    }
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 h-auto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>

              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {note.tags.map(tagId => {
                    const tag = QUICK_TAGS.find(t => t.id === tagId);
                    if (!tag) return null;
                    const color = getTagColor(tagId);
                    return (
                      <span
                        key={tagId}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${TAG_COLORS[color]}`}
                      >
                        <span>{tag.icon}</span>
                        <span>{tag.label}</span>
                      </span>
                    );
                  })}
                </div>
              )}

              {note.text && (
                <div className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 rounded p-3">
                  {note.text}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowImport(false)}>
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Import Notes
              </h3>
            </div>
            <div className="px-6 py-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paste JSON content
              </label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='{"12345": {"text": "Good trade", "tags": ["favorite"]}}'
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                  bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {importError && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2">{importError}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Note: Imported notes will be merged with existing notes. Duplicate item IDs will be overwritten.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <Button
                onClick={() => {
                  setShowImport(false);
                  setImportText('');
                  setImportError('');
                }}
                variant="secondary"
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!importText.trim()}
                variant="primary"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700"
              >
                Import
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
