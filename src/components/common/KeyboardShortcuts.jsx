import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';

const shortcuts = {
  Navigation: [
    { key: 'g h', description: 'Go to Home' },
    { key: 'g s', description: 'Go to Station Trading' },
  ],
  Actions: [
    { key: 'Cmd/Ctrl + K', description: 'Open global search' },
    { key: 'Cmd/Ctrl + /', description: 'Open keyboard shortcuts' },
    { key: '?', description: 'Open keyboard shortcuts' },
    { key: 'Escape', description: 'Close modals/dropdowns' },
  ],
  Forms: [
    { key: 'Enter', description: 'Submit form' },
    { key: 'Escape', description: 'Clear field / close dropdown' },
  ],
};

const KeyboardShortcuts = ({ isOpen, onClose }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-space-dark/80 p-6 text-left align-middle shadow-xl transition-all border border-white/10">
                <DialogTitle as="h3" className="text-lg font-medium leading-6 text-white">
                  Keyboard Shortcuts
                </DialogTitle>
                <div className="mt-4 space-y-4">
                  {Object.entries(shortcuts).map(([category, shortcuts]) => (
                    <div key={category}>
                      <h4 className="font-semibold text-accent-cyan">{category}</h4>
                      <ul className="mt-2 space-y-1 text-sm text-gray-300">
                        {shortcuts.map((shortcut) => (
                          <li key={shortcut.key} className="flex justify-between">
                            <span>{shortcut.description}</span>
                            <kbd className="font-mono rounded-md bg-gray-600 px-2 py-1 text-xs">
                              {shortcut.key}
                            </kbd>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-accent-cyan/20 px-4 py-2 text-sm font-medium text-accent-cyan hover:bg-accent-cyan/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-space-dark"
                    onClick={onClose}
                  >
                    Got it, thanks!
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default KeyboardShortcuts;
