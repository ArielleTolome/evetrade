import { Modal, useModal } from './Modal';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export function SettingsModal() {
  const { isOpen, open, close } = useModal();
  const { motionPreference, setMotionPreference } = useReducedMotion();

  const options = [
    { id: 'system', label: 'System Default' },
    { id: 'allow', label: 'Allow Motion' },
    { id: 'reduce', label: 'Reduce Motion' },
  ];

  return (
    <>
      <button
        onClick={open}
        className="text-text-secondary hover:text-accent-cyan transition-colors p-2 rounded-lg hover:bg-white/5"
        aria-label="Open settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings-2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
      </button>

      <Modal isOpen={isOpen} onClose={close} title="Settings">
        <Modal.Body>
          <div className="space-y-4">
            <h3 className="font-display text-lg text-text-primary">Animation & Motion</h3>
            <p className="text-sm text-text-secondary">
              Control animations and motion effects throughout the application.
            </p>
            <div className="flex flex-col space-y-2">
              {options.map((option) => (
                <label key={option.id} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-white/5 transition-colors">
                  <input
                    type="radio"
                    name="motion-preference"
                    value={option.id}
                    checked={motionPreference === option.id}
                    onChange={() => setMotionPreference(option.id)}
                    className="h-4 w-4 rounded-full border-gray-300 text-accent-cyan focus:ring-accent-cyan"
                  />
                  <span className="text-text-primary">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button onClick={close} className="btn-secondary">Done</button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
