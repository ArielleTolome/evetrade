import { useState, useCallback } from 'react';

/**
 * Reusable hook for trade form state management and validation
 *
 * This hook centralizes the common patterns found across StationTradingPage,
 * StationHaulingPage, and RegionHaulingPage to reduce code duplication.
 *
 * @param {object} initialFormState - Initial form values
 * @param {object} options - Configuration options
 * @param {Function} options.onSubmit - Callback when form is submitted (receives form data)
 * @param {Function} options.customValidation - Optional custom validation function (receives form state, returns errors object)
 * @param {Function} options.transformData - Optional function to transform form data before submission
 * @returns {object} Form state and handlers
 */
export function useTradeForm(initialFormState, options = {}) {
  const { onSubmit, customValidation, transformData } = options;

  // Form state
  const [form, setForm] = useState(initialFormState);

  // Validation errors
  const [errors, setErrors] = useState({});

  /**
   * Update a single form field
   * Clears any existing error for that field
   */
  const updateForm = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    // Clear error for this field when it's updated
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * Update multiple form fields at once
   */
  const updateFormFields = useCallback((updates) => {
    setForm((prev) => ({ ...prev, ...updates }));

    // Clear errors for updated fields
    const updatedKeys = Object.keys(updates);
    if (updatedKeys.some(key => errors[key])) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        updatedKeys.forEach(key => delete newErrors[key]);
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setForm(initialFormState);
    setErrors({});
  }, [initialFormState]);

  /**
   * Common validation rules
   */
  const validateCommonFields = useCallback((formData) => {
    const newErrors = {};

    // Validate positive numbers
    const positiveNumberFields = [
      { key: 'profit', label: 'Minimum profit' },
      { key: 'minProfit', label: 'Minimum profit' },
      { key: 'minVolume', label: 'Minimum volume' },
      { key: 'maxWeight', label: 'Max cargo weight' },
      { key: 'maxBudget', label: 'Max budget' },
    ];

    positiveNumberFields.forEach(({ key, label }) => {
      if (formData[key] !== undefined && formData[key] < 0) {
        newErrors[key] = `${label} must be positive`;
      }
    });

    // Validate percentage fields (0-100)
    const percentageFields = [
      { key: 'brokerFee', label: 'Broker fee' },
      { key: 'marginAbove', label: 'Margin above' },
      { key: 'marginBelow', label: 'Margin below' },
      { key: 'minROI', label: 'Minimum ROI' },
    ];

    percentageFields.forEach(({ key, label }) => {
      if (formData[key] !== undefined) {
        if (formData[key] < 0 || formData[key] > 100) {
          newErrors[key] = `${label} must be between 0 and 100`;
        }
      }
    });

    return newErrors;
  }, []);

  /**
   * Validate form data
   */
  const validateForm = useCallback((formData = form) => {
    // Start with common validation
    let newErrors = validateCommonFields(formData);

    // Apply custom validation if provided
    if (customValidation) {
      const customErrors = customValidation(formData);
      newErrors = { ...newErrors, ...customErrors };
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, validateCommonFields, customValidation]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault();

      // Validate form
      if (!validateForm()) {
        return false;
      }

      // Transform data if needed
      const dataToSubmit = transformData ? transformData(form) : form;

      // Call onSubmit callback if provided
      if (onSubmit) {
        try {
          await onSubmit(dataToSubmit);
          return true;
        } catch (err) {
          console.error('Form submission failed:', err);
          return false;
        }
      }

      return true;
    },
    [form, validateForm, transformData, onSubmit]
  );

  /**
   * Set a specific error
   */
  const setFieldError = useCallback((field, error) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  /**
   * Clear a specific error
   */
  const clearFieldError = useCallback((field) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    // State
    form,
    errors,

    // Form updaters
    updateForm,
    updateFormFields,
    resetForm,

    // Validation
    validateForm,

    // Submission
    handleSubmit,

    // Error management
    setFieldError,
    clearFieldError,
    clearErrors,
  };
}
