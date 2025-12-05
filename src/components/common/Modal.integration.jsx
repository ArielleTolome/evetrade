import React, { useState } from 'react';
import { Modal, useModal } from './Modal';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';
import { SecurityBadge } from './SecurityBadge';

/**
 * Integration Examples - Modal with EVETrade Components
 * Shows how to use Modal with other common components
 */

/**
 * Example 1: Trade Confirmation Modal
 */
export function TradeConfirmationModal({ trade, onConfirm }) {
  const { isOpen, open, close } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(trade);
      close();
    } catch (error) {
      console.error('Trade confirmation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button onClick={open} size="sm">
        Execute Trade
      </Button>

      <Modal isOpen={isOpen} onClose={close} size="md">
        <Modal.Header>
          <Modal.Title>Confirm Trade Execution</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="space-y-4">
            <div className="bg-space-mid rounded-lg p-4 border border-accent-cyan/20">
              <h3 className="font-display font-semibold text-text-primary mb-3">
                Trade Details
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Item:</span>
                  <span className="text-text-primary font-medium">{trade?.itemName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-text-secondary">Quantity:</span>
                  <span className="text-text-primary">{trade?.quantity?.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-text-secondary">Buy Price:</span>
                  <span className="text-accent-cyan">{trade?.buyPrice?.toLocaleString()} ISK</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-text-secondary">Sell Price:</span>
                  <span className="text-accent-green">{trade?.sellPrice?.toLocaleString()} ISK</span>
                </div>

                <div className="flex justify-between pt-2 border-t border-white/10">
                  <span className="text-text-secondary font-semibold">Profit:</span>
                  <span className="text-accent-gold font-bold">
                    {trade?.profit?.toLocaleString()} ISK
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-accent-cyan/10 rounded-lg border border-accent-cyan/20">
              <svg
                className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-text-secondary text-sm">
                Make sure you have sufficient ISK and cargo space before executing this trade.
              </p>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="ghost" onClick={close} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} loading={isSubmitting} disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Confirm Trade'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

/**
 * Example 2: Station Details Modal
 */
export function StationDetailsModal({ station }) {
  const { isOpen, open, close } = useModal();

  return (
    <>
      <Button onClick={open} variant="secondary" size="sm">
        View Details
      </Button>

      <Modal isOpen={isOpen} onClose={close} title={station?.name} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-space-mid rounded-lg p-4">
              <p className="text-text-secondary text-sm mb-1">System</p>
              <p className="text-text-primary font-medium">{station?.systemName}</p>
            </div>

            <div className="bg-space-mid rounded-lg p-4">
              <p className="text-text-secondary text-sm mb-1">Region</p>
              <p className="text-text-primary font-medium">{station?.regionName}</p>
            </div>

            <div className="bg-space-mid rounded-lg p-4">
              <p className="text-text-secondary text-sm mb-1">Security</p>
              <SecurityBadge security={station?.security} />
            </div>

            <div className="bg-space-mid rounded-lg p-4">
              <p className="text-text-secondary text-sm mb-1">Market Activity</p>
              <p className="text-accent-green font-medium">{station?.marketActivity || 'High'}</p>
            </div>
          </div>

          <div className="bg-space-mid rounded-lg p-4">
            <h4 className="font-display font-semibold text-text-primary mb-3">
              Available Services
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {station?.services?.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-text-secondary"
                >
                  <svg
                    className="w-4 h-4 text-accent-green"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {service}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

/**
 * Example 3: Filter Settings Modal
 */
export function FilterSettingsModal({ filters, onApply }) {
  const { isOpen, open, close } = useModal();
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onApply(localFilters);
    close();
  };

  const handleReset = () => {
    setLocalFilters({
      minProfit: 0,
      maxRisk: 100,
      securityMin: 0,
      securityMax: 1.0,
    });
  };

  return (
    <>
      <Button onClick={open} variant="secondary" icon="⚙️">
        Filters
      </Button>

      <Modal isOpen={isOpen} onClose={close} size="md">
        <Modal.Header>
          <Modal.Title>Filter Settings</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Minimum Profit (ISK)
              </label>
              <input
                type="number"
                value={localFilters.minProfit}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, minProfit: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 bg-space-mid border border-white/10 rounded-lg text-text-primary focus:outline-none focus-visible:ring-2 focus:ring-accent-cyan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Maximum Risk (%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={localFilters.maxRisk}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, maxRisk: parseInt(e.target.value) })
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>Low Risk</span>
                <span>{localFilters.maxRisk}%</span>
                <span>High Risk</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Security Range
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Min</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={localFilters.securityMin}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        securityMin: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-space-mid border border-white/10 rounded-lg text-text-primary focus:outline-none focus-visible:ring-2 focus:ring-accent-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Max</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={localFilters.securityMax}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        securityMax: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-space-mid border border-white/10 rounded-lg text-text-primary focus:outline-none focus-visible:ring-2 focus:ring-accent-cyan"
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="ghost" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

/**
 * Example 4: Loading Modal (API Call)
 */
export function LoadingModalExample() {
  const { isOpen, open, close } = useModal();

  const handleFetchData = async () => {
    open();
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Handle success
      close();
    } catch (error) {
      console.error('Failed to fetch data:', error);
      close();
    }
  };

  return (
    <>
      <Button onClick={handleFetchData}>Fetch Market Data</Button>

      <Modal
        isOpen={isOpen}
        onClose={close}
        closeOnBackdrop={false}
        closeOnEscape={false}
        showCloseButton={false}
        size="sm"
      >
        <div className="text-center py-8">
          <LoadingSpinner size="xl" className="mx-auto mb-4" />
          <h3 className="text-lg font-display font-semibold text-text-primary mb-2">
            Loading Market Data
          </h3>
          <p className="text-text-secondary text-sm">Please wait...</p>
        </div>
      </Modal>
    </>
  );
}

/**
 * Example 5: Multi-Step Wizard Modal
 */
export function WizardModal() {
  const { isOpen, open, close } = useModal();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Complete wizard
      close();
      setStep(1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleClose = () => {
    close();
    setStep(1);
  };

  return (
    <>
      <Button onClick={open}>Start Setup Wizard</Button>

      <Modal isOpen={isOpen} onClose={handleClose} size="lg">
        <Modal.Header>
          <Modal.Title>Setup Wizard - Step {step} of {totalSteps}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 mx-1 rounded-full transition-colors ${
                    i + 1 <= step ? 'bg-accent-cyan' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step content */}
          <div className="min-h-[200px]">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-display font-semibold text-text-primary">
                  Welcome to EVETrade
                </h3>
                <p className="text-text-secondary">
                  Let's get your trading setup configured. This will only take a minute.
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-display font-semibold text-text-primary">
                  Select Your Trading Style
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 bg-space-mid rounded-lg border border-white/10 hover:border-accent-cyan/50 transition-colors">
                    <p className="font-semibold text-text-primary">Station Trading</p>
                    <p className="text-sm text-text-secondary">Buy and sell in one station</p>
                  </button>
                  <button className="p-4 bg-space-mid rounded-lg border border-white/10 hover:border-accent-cyan/50 transition-colors">
                    <p className="font-semibold text-text-primary">Hauling</p>
                    <p className="text-sm text-text-secondary">Transport goods between stations</p>
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-display font-semibold text-text-primary">
                  All Set!
                </h3>
                <p className="text-text-secondary">
                  Your EVETrade account is now configured. You're ready to start trading!
                </p>
              </div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <div className="flex gap-3">
            {step > 1 && (
              <Button variant="ghost" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button onClick={handleNext}>
              {step === totalSteps ? 'Finish' : 'Next'}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default {
  TradeConfirmationModal,
  StationDetailsModal,
  FilterSettingsModal,
  LoadingModalExample,
  WizardModal,
};
