import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ItemAutocomplete } from './ItemAutocomplete';
import * as useResourcesHook from '../../hooks/useResources';

// Mock useResources
vi.mock('../../hooks/useResources', () => ({
  useResources: vi.fn(),
}));

describe('ItemAutocomplete', () => {
  const mockLoadInvTypes = vi.fn();
  const mockOnChange = vi.fn();
  const mockInvTypes = {
    18: { typeName: 'Plagioclase' },
    19: { typeName: 'Spodumain' },
    34: { typeName: 'Tritanium' },
    35: { typeName: 'Pyerite' },
    123: { typeName: 'Veldspar' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useResourcesHook.useResources.mockReturnValue({
      invTypes: mockInvTypes,
      loadInvTypes: mockLoadInvTypes,
    });
  });

  it('renders with default props', () => {
    render(<ItemAutocomplete />);
    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Search items...');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('renders with label and required indicator', () => {
    render(<ItemAutocomplete label="Select Item" required />);
    expect(screen.getByText('Select Item')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeRequired();
  });

  it('displays error message', () => {
    render(<ItemAutocomplete error="Invalid item" />);
    expect(screen.getByText('Invalid item')).toBeInTheDocument();
  });

  it('handles load error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    useResourcesHook.useResources.mockReturnValue({
      invTypes: null,
      loadInvTypes: vi.fn().mockRejectedValue(new Error('Load failed')),
    });

    render(<ItemAutocomplete />);

    // Initial state
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('placeholder', 'Loading items...');
    expect(input).toBeDisabled();

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Failed to load item list. Please try again later.')).toBeInTheDocument();
    });

    expect(input).toHaveAttribute('placeholder', 'Failed to load items');
    expect(input).toBeDisabled();

    consoleSpy.mockRestore();
  });

  it('filters items based on input', async () => {
    render(<ItemAutocomplete onChange={mockOnChange} />);
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'par' } });

    // Should find Veldspar and Plagioclase (via "pla" match? No "par")
    // "Veldspar" contains "par"
    // "Spodumain" -> no
    // "Plagioclase" -> no

    // Let's use 'ite'
    // Pyerite (contains ite)
    // Tritanium (no)

    fireEvent.change(input, { target: { value: 'ite' } });

    await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(1);
        expect(options[0]).toHaveTextContent('Pyerite');
    });
  });

  it('selects item on click', async () => {
    render(<ItemAutocomplete onChange={mockOnChange} />);
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'Veld' } });
    fireEvent.focus(input);

    await waitFor(() => {
        expect(screen.getByText('Veldspar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Veldspar'));

    expect(mockOnChange).toHaveBeenCalledWith({ typeId: '123', name: 'Veldspar' });
    expect(input).toHaveValue('Veldspar');
  });

});
