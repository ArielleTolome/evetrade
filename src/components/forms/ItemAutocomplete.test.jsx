
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemAutocomplete } from './ItemAutocomplete';
import { useResources } from '../../hooks/useResources';

// Mock the useResources hook
vi.mock('../../hooks/useResources', () => ({
  useResources: vi.fn(),
}));

describe('ItemAutocomplete', () => {
  const mockInvTypes = [
    { typeId: '34', name: 'Tritanium' },
    { typeId: '35', name: 'Pyerite' },
    { typeId: '36', name: 'Mexallon' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useResources.mockReturnValue({
      invTypes: mockInvTypes,
      loadInvTypes: vi.fn().mockResolvedValue(mockInvTypes),
    });
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<ItemAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('combobox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Search items...');
    });

    it('shows skeleton when resources are loading', () => {
      useResources.mockReturnValue({ invTypes: null, loadInvTypes: vi.fn(), loading: true });
      render(<ItemAutocomplete value="" onChange={vi.fn()} />);
      expect(screen.getByTestId('autocomplete-skeleton')).toBeInTheDocument();
    });

    it('shows loading spinner when loading prop is true', () => {
      render(<ItemAutocomplete value="" onChange={vi.fn()} loading />);
      const input = screen.getByRole('combobox');
      expect(input).toBeDisabled();
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
    });
  });

  describe('Filtering and Search', () => {
    it('filters items based on input', async () => {
      const user = userEvent.setup();
      render(<ItemAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('combobox');
      await user.type(input, 'Tri');
      await waitFor(() => {
        expect(screen.getByText('Tritanium')).toBeInTheDocument();
      });
    });
  });

  describe('Selection Handling', () => {
    it('calls onChange when item is selected', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<ItemAutocomplete value="" onChange={handleChange} />);
      const input = screen.getByRole('combobox');
      await user.type(input, 'Tri');
      await waitFor(() => expect(screen.getByText('Tritanium')).toBeInTheDocument());
      await user.click(screen.getByText('Tritanium'));
      expect(handleChange).toHaveBeenCalledWith({ typeId: '34', name: 'Tritanium' });
    });
  });
});
