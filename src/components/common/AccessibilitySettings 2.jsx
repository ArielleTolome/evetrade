import React from 'react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import Modal from './Modal';
import Button from './Button'; // Assuming a generic Button component exists

const SettingRow = ({ label, children }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 border-b border-white/10 last:border-b-0">
    <p className="text-text-secondary mb-2 sm:mb-0">{label}</p>
    <div className="flex items-center gap-2 flex-wrap">{children}</div>
  </div>
);

const OptionButton = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-sm rounded-md transition-colors duration-200 ${
      isActive
        ? 'bg-accent-cyan text-space-black font-semibold'
        : 'bg-space-light/50 hover:bg-space-light'
    }`}
  >
    {children}
  </button>
);

const ToggleSwitch = ({ checked, onChange, label }) => (
    <label htmlFor="reduced-motion-toggle" className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          id="reduced-motion-toggle"
          className="sr-only"
          checked={checked}
          onChange={onChange}
        />
        <div className="block bg-space-light w-14 h-8 rounded-full"></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'transform translate-x-6 bg-accent-cyan' : ''}`}></div>
      </div>
      <div className="ml-3 text-text-secondary">{label}</div>
    </label>
);


export function AccessibilitySettings({ isOpen, onClose }) {
  const { settings, updateSetting, resetSettings } = useAccessibility();

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Accessibility Settings" size="lg">
      <Modal.Body>
        <SettingRow label="Font Size">
          <OptionButton onClick={() => updateSetting('fontSize', 0.8)} isActive={settings.fontSize === 0.8}>80%</OptionButton>
          <OptionButton onClick={() => updateSetting('fontSize', 1)} isActive={settings.fontSize === 1}>100%</OptionButton>
          <OptionButton onClick={() => updateSetting('fontSize', 1.2)} isActive={settings.fontSize === 1.2}>120%</OptionButton>
          <OptionButton onClick={() => updateSetting('fontSize', 1.5)} isActive={settings.fontSize === 1.5}>150%</OptionButton>
        </SettingRow>

        <SettingRow label="Line Height">
          <OptionButton onClick={() => updateSetting('lineHeight', 'normal')} isActive={settings.lineHeight === 'normal'}>Normal</OptionButton>
          <OptionButton onClick={() => updateSetting('lineHeight', 'relaxed')} isActive={settings.lineHeight === 'relaxed'}>Relaxed</OptionButton>
          <OptionButton onClick={() => updateSetting('lineHeight', 'loose')} isActive={settings.lineHeight === 'loose'}>Loose</OptionButton>
        </SettingRow>

        <SettingRow label="Letter Spacing">
          <OptionButton onClick={() => updateSetting('letterSpacing', 'normal')} isActive={settings.letterSpacing === 'normal'}>Normal</OptionButton>
          <OptionButton onClick={() => updateSetting('letterSpacing', 'wide')} isActive={settings.letterSpacing === 'wide'}>Wide</OptionButton>
          <OptionButton onClick={() => updateSetting('letterSpacing', 'wider')} isActive={settings.letterSpacing === 'wider'}>Wider</OptionButton>
        </SettingRow>

        <SettingRow label="Animations">
            <ToggleSwitch
                checked={settings.reducedMotion}
                onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                label="Reduce Motion"
            />
        </SettingRow>

      </Modal.Body>
      <Modal.Footer>
        <div className="w-full flex justify-between">
            <Button onClick={resetSettings} variant="secondary" className="mr-auto">
                Reset to Defaults
            </Button>
            <Button onClick={onClose} variant="primary">
                Done
            </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default AccessibilitySettings;
