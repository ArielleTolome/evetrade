import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CopyButton } from './CopyButton';

// Mock the useCopyToClipboard hook
vi.mock('@/hooks/useCopyToClipboard', () => ({
  useCopyToClipboard: ({ onSuccess }) => {
    const [copied, setCopied] = React.useState(false);
    const copy = (value, successDuration) => {
      setCopied(true);
      if (onSuccess) onSuccess();
      setTimeout(() => setCopied(false), successDuration);
    };
    return { copy, copied };
  },
}));

describe('CopyButton', () => {
  it('renders with a clipboard icon by default', () => {
    render(<CopyButton value="test" />);
    expect(screen.getByLabelText('Copy')).toBeInTheDocument();
  });

  it('calls the onCopy callback when clicked', () => {
    const onCopy = vi.fn();
    render(<CopyButton value="test" onCopy={onCopy} />);
    fireEvent.click(screen.getByLabelText('Copy'));
    expect(onCopy).toHaveBeenCalledWith('test');
  });

  it('shows a checkmark icon and "Copied!" tooltip after clicking', async () => {
    render(<CopyButton value="test" successDuration={100} />);
    fireEvent.click(screen.getByLabelText('Copy'));

    await waitFor(() => {
      expect(screen.getByLabelText('Copied!')).toBeInTheDocument();
    });
  });

  it('reverts to the clipboard icon after the success duration', async () => {
    render(<CopyButton value="test" successDuration={100} />);
    fireEvent.click(screen.getByLabelText('Copy'));

    await waitFor(() => {
      expect(screen.getByLabelText('Copied!')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Copy')).toBeInTheDocument();
    }, { timeout: 200 });
  });
});
