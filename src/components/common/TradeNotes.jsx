import { useState, useEffect } from 'react';
import useTradeNotes from '../../hooks/useTradeNotes';

const TAG_COLORS = {
  green: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700',
  red: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700',
  yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
  gold: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700',
  purple: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700',
  orange: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700',
};

export default function TradeNotes({ itemId, itemName }) {
  const { getNote, setNote, addTag, removeTag, hasNotes, deleteNote, QUICK_TAGS } = useTradeNotes();
  const [isExpanded, setIsExpanded] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const note = getNote(itemId);
  const hasAnyNotes = hasNotes(itemId);

  // Load existing note text when expanded
  useEffect(() => {
    if (isExpanded && note) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync local state with stored note on expand
      setNoteText(note.text || '');
    }
  }, [isExpanded, note]);

  const handleSaveNote = () => {
    if (noteText.trim()) {
      setNote(itemId, noteText.trim());
    } else if (note?.text) {
      // If text is cleared, update to empty
      setNote(itemId, '');
    }
  };

  const handleTagClick = (tagId) => {
    if (note?.tags?.includes(tagId)) {
      removeTag(itemId, tagId);
    } else {
      addTag(itemId, tagId);
    }
  };

  const handleDelete = () => {
    deleteNote(itemId);
    setNoteText('');
    setShowDeleteConfirm(false);
    setIsExpanded(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="inline-flex items-center gap-2">
      {/* Note Indicator Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
          transition-colors duration-200
          ${hasAnyNotes
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }
        `}
        title={hasAnyNotes ? 'View notes' : 'Add note'}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        {hasAnyNotes && <span className="font-semibold">{note?.tags?.length || 0}</span>}
      </button>

      {/* Quick Tag Preview */}
      {!isExpanded && note?.tags?.length > 0 && (
        <div className="inline-flex items-center gap-1">
          {note.tags.slice(0, 3).map(tagId => {
            const tag = QUICK_TAGS.find(t => t.id === tagId);
            if (!tag) return null;
            return (
              <span key={tagId} className="text-xs" title={tag.label}>
                {tag.icon}
              </span>
            );
          })}
          {note.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{note.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Expanded Note Editor */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setIsExpanded(false)}>
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Trade Notes
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {itemName || `Item ID: ${itemId}`}
                  </p>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-4">
              {/* Quick Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quick Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TAGS.map(tag => {
                    const isActive = note?.tags?.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => handleTagClick(tag.id)}
                        className={`
                          inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium
                          border transition-all duration-200
                          ${isActive
                            ? TAG_COLORS[tag.color] + ' ring-2 ring-offset-2 ring-blue-500'
                            : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }
                        `}
                      >
                        <span>{tag.icon}</span>
                        <span>{tag.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Note Text Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Personal Notes
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onBlur={handleSaveNote}
                  placeholder="Add your notes about this trade..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                    bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                    focus-visible:ring-2 focus:ring-blue-500 focus:border-transparent
                    placeholder-gray-400 dark:placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Notes are automatically saved when you click outside the text area
                </p>
              </div>

              {/* Metadata */}
              {note?.updatedAt && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Last updated: {formatDate(note.updatedAt)}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  {showDeleteConfirm ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-red-600 dark:text-red-400">
                        Delete all notes?
                      </span>
                      <button
                        onClick={handleDelete}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3 py-1 text-sm bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={!hasAnyNotes}
                      className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300
                        rounded hover:bg-red-200 dark:hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete All Notes
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
