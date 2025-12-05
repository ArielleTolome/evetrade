import { useState, useCallback } from 'react';

export const useCopyToClipboard = ({ onSuccess, onError } = {}) => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const copy = useCallback(async (value, successDuration = 2000) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = value;
        textArea.style.position = 'absolute';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setError(null);
      if (onSuccess) onSuccess();

      setTimeout(() => setCopied(false), successDuration);
    } catch (err) {
      setCopied(false);
      setError(err.message);
      if (onError) onError(err);
    }
  }, [onSuccess, onError]);

  return { copy, copied, error };
};

export default useCopyToClipboard;
