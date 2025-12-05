import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useModal } from './Modal';
import { Search, X, Command, ChevronsUp, Option } from 'lucide-react';

const Icon = ({ name, platform, ...props }) => {
  switch (name) {
    case 'Mod':
      return platform === 'mac' ? <Command {...props} /> : 'Ctrl';
    case 'Shift':
      return <ChevronsUp {...props} />;
    case 'Alt':
      return platform === 'mac' ? <Option {...props} /> : 'Alt';
    default:
      return null;
  }
};

const shortcutCategories = [
  {
    name: 'Navigation',
    shortcuts: [
      { keys: ['G', 'H'], description: 'Go to Home' },
      { keys: ['G', 'S'], description: 'Go to Station Trading' },
      { keys: ['G', 'R'], description: 'Go to Region Hauling' },
    ],
  },
  {
    name: 'Actions',
    shortcuts: [
      { keys: ['Mod', 'K'], description: 'Quick Search' },
      { keys: ['Mod', 'S'], description: 'Save' },
      { keys: ['Mod', 'Z'], description: 'Undo' },
    ],
  },
  {
    name: 'Table Controls',
    shortcuts: [
      { keys: ['J'], description: 'Navigate down' },
      { keys: ['K'], description: 'Navigate up' },
      { keys: ['Enter'], description: 'Select row' },
      { keys: ['Space'], description: 'Toggle selection' },
    ],
  },
];

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [platform, setPlatform] = useState('windows');

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
    setPlatform(isMac ? 'mac' : 'windows');
    document.body.setAttribute('data-platform', isMac ? 'mac' : 'windows');
  }, []);

  const filteredShortcuts = useMemo(() => {
    if (!searchTerm) {
      return shortcutCategories;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return shortcutCategories
      .map((category) => {
        const filtered = category.shortcuts.filter(
          (shortcut) =>
            shortcut.description.toLowerCase().includes(lowercasedFilter) ||
            shortcut.keys
              .join(' ')
              .toLowerCase()
              .replace('mod', platform === 'mac' ? 'command' : 'ctrl')
              .includes(lowercasedFilter)
        );
        return { ...category, shortcuts: filtered };
      })
      .filter((category) => category.shortcuts.length > 0);
  }, [searchTerm, platform]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-[#0D1B2A] rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="keyboard-shortcuts-title"
      >
        <header className="flex items-center justify-between p-4 border-b border-[#415A77]">
          <h2 id="keyboard-shortcuts-title" className="text-lg font-semibold text-[#E0E1DD]">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="text-[#778DA9] hover:text-[#E0E1DD] transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </header>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#778DA9]" size={20} />
            <input
              type="text"
              placeholder="Search shortcuts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1B263B] border border-[#415A77] rounded-md pl-10 pr-4 py-2 text-[#E0E1DD] focus:outline-none focus:ring-2 focus:ring-[#778DA9]"
            />
          </div>
        </div>

        <main className="overflow-y-auto px-4 pb-4">
          {filteredShortcuts.map((category) => (
            <div key={category.name} className="mb-6 last:mb-0">
              <h3 className="text-sm font-bold text-[#778DA9] uppercase tracking-wider mb-3">
                {category.name}
              </h3>
              <ul className="space-y-2">
                {category.shortcuts.map((shortcut) => (
                  <li key={shortcut.description} className="flex items-center justify-between">
                    <span className="text-[#778DA9]">{shortcut.description}</span>
                    <div className="flex items-center space-x-2">
                      {shortcut.keys.map((key, index) => (
                        <kbd
                          key={index}
                          className="bg-[#1B263B] border border-[#415A77] rounded-md px-2 py-1 text-sm font-mono font-semibold text-[#E0E1DD] shadow-[0_2px_0px_0_rgba(65,90,119,1)] transform transition-transform duration-100 ease-in-out active:translate-y-px active:shadow-[0_1px_0px_0_rgba(65,90,119,1)] inline-flex items-center justify-center h-7 w-auto min-w-[28px]"
                        >
                          {['Mod', 'Shift', 'Alt'].includes(key) ? (
                            <Icon name={key} platform={platform} size={14} />
                          ) : (
                            key
                          )}
                        </kbd>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {filteredShortcuts.length === 0 && (
            <p className="text-center text-[#778DA9] py-8">No shortcuts found for "{searchTerm}"</p>
          )}
        </main>
      </div>
    </div>,
    document.body
  );
};

export default KeyboardShortcutsModal;
