import { useState, useEffect } from 'react';
import { ItemAutocomplete } from '../forms/ItemAutocomplete';
import { Button } from './Button';

/**
 * Price Alert Modal Component
 * Create or edit price alerts with mobile-friendly form
 */
export function PriceAlertModal({ isOpen, onClose, onSave, initialAlert = null }) {
  const [formData, setFormData] = useState({
    itemName: '',
    typeId: '',
    alertType: 'price_below',
    threshold: '',
    regionId: 10000002, // The Forge
  });

  const [errors, setErrors] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);

  // Initialize form with alert data if editing
  useEffect(() => {
    if (initialAlert) {
      setFormData({
        itemName: initialAlert.itemName || '',
        typeId: initialAlert.typeId || '',
        alertType: initialAlert.alertType || 'price_below',
        threshold: initialAlert.threshold || '',
        regionId: initialAlert.regionId || 10000002,
      });
    } else {
      setFormData({
        itemName: '',
        typeId: '',
        alertType: 'price_below',
        threshold: '',
        regionId: 10000002,
      });
    }
  }, [initialAlert, isOpen]);

  // Handle item selection from autocomplete
  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setFormData(prev => ({
      ...prev,
      itemName: item.name,
      typeId: item.typeId,
    }));
    setErrors(prev => ({ ...prev, itemName: '', typeId: '' }));
  };

  // Handle input change
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.itemName.trim()) {
      newErrors.itemName = 'Please select an item';
    }

    if (!formData.typeId) {
      newErrors.typeId = 'Item type ID is required';
    }

    if (!formData.threshold || parseFloat(formData.threshold) <= 0) {
      newErrors.threshold = 'Please enter a valid threshold price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSave({
      ...formData,
      threshold: parseFloat(formData.threshold),
      typeId: parseInt(formData.typeId),
    });

    // Reset form
    setFormData({
      itemName: '',
      typeId: '',
      alertType: 'price_below',
      threshold: '',
      regionId: 10000002,
    });
    setSelectedItem(null);
  };

  // Handle close
  const handleClose = () => {
    setFormData({
      itemName: '',
      typeId: '',
      alertType: 'price_below',
      threshold: '',
      regionId: 10000002,
    });
    setSelectedItem(null);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="bg-space-dark border border-accent-cyan/20 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-accent-cyan/10 to-accent-purple/10 border-b border-accent-cyan/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h2 className="text-xl font-display font-semibold text-text-primary">
                {initialAlert ? 'Edit Alert' : 'Create Price Alert'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Item Selection */}
          <div>
            <ItemAutocomplete
              value={formData.itemName}
              onChange={handleItemSelect}
              placeholder="Search for an item..."
              label="Item"
              error={errors.itemName || errors.typeId}
              required
            />
            {selectedItem && (
              <p className="mt-1 text-xs text-text-secondary">
                Type ID: {selectedItem.typeId}
              </p>
            )}
          </div>

          {/* Alert Type */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Alert Type <span className="text-red-400 ml-1">*</span>
            </label>
            <select
              value={formData.alertType}
              onChange={(e) => handleChange('alertType', e.target.value)}
              className="w-full px-4 py-3 min-h-[44px] rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan focus-visible:ring-2 focus:ring-accent-cyan/20 transition-all"
            >
              <option value="price_below">Price Drops Below</option>
              <option value="price_above">Price Rises Above</option>
              <option value="undercut">Undercut Alert (Coming Soon)</option>
              <option value="order_expiry">Order Expiry (Coming Soon)</option>
            </select>
          </div>

          {/* Threshold Price */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Threshold Price (ISK) <span className="text-red-400 ml-1">*</span>
            </label>
            <input
              type="number"
              value={formData.threshold}
              onChange={(e) => handleChange('threshold', e.target.value)}
              placeholder="Enter price threshold..."
              step="0.01"
              min="0"
              className={`
                w-full px-4 py-3 min-h-[44px] rounded-lg
                bg-space-dark/50 border ${errors.threshold ? 'border-red-500' : 'border-accent-cyan/20'}
                text-text-primary placeholder-text-secondary/50
                focus:outline-none focus:border-accent-cyan focus-visible:ring-2 focus:ring-accent-cyan/20
                transition-all font-mono
              `}
            />
            {errors.threshold && (
              <p className="mt-1 text-sm text-red-400">{errors.threshold}</p>
            )}
          </div>

          {/* Alert Info */}
          <div className="p-4 rounded-lg bg-accent-cyan/5 border border-accent-cyan/10">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-text-secondary leading-relaxed">
                  {formData.alertType === 'price_below' && 'You will be notified when the market price drops below your threshold.'}
                  {formData.alertType === 'price_above' && 'You will be notified when the market price rises above your threshold.'}
                  {formData.alertType === 'undercut' && 'This feature will notify you when someone undercuts your market order. (Requires authentication)'}
                  {formData.alertType === 'order_expiry' && 'This feature will notify you when your market orders are about to expire. (Requires authentication)'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              onClick={handleClose}
              variant="ghost"
              className="flex-1 border border-accent-cyan/20 text-text-secondary hover:bg-white/5 min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 min-h-[44px]"
              disabled={!formData.itemName || !formData.threshold}
            >
              {initialAlert ? 'Update Alert' : 'Create Alert'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PriceAlertModal;
