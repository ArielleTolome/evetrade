
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StationAutocomplete } from './StationAutocomplete';
import { useResources, useLocationLookup } from '../../hooks/useResources';

// Mock the hooks
vi.mock('../../hooks/useResources', () => ({
  useResources: vi.fn(),
  useLocationLookup: vi.fn(),
}));

// Mock SecurityBadge component
vi.mock('../common/SecurityBadge', () => ({
  SecurityBadge: ({ security, isCitadel }) => (
    <span data-testid="security-badge" data-security={security} data-citadel={isCitadel}>
      {security.toFixed(1)}
    </span>
  ),
}));

describe('StationAutocomplete', () => {
  const mockStations = [
    'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
    'Amarr VIII (Oris) - Emperor Family Academy',
    'Dodixie IX - Moon 20 - Federation Navy Assembly Plant',
    'Perimeter - IChooseYou Trade Hub*',
  ];

  const mockUniverseList = {
    'jita iv - moon 4 - caldari navy assembly plant': { security: 0.9 },
    'amarr viii (oris) - emperor family academy': { security: 1.0 },
    'dodixie ix - moon 20 - federation navy assembly plant': { security: 0.9 },
    'perimeter - ichooseyou trade hub': { security: 0.9 },
  };

  const mockSearchStations = vi.fn((query, limit) => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return mockStations
      .filter((station) => station.toLowerCase().includes(lowerQuery))
      .slice(0, limit);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    useResources.mockReturnValue({
      stationList: mockStations,
      universeList: mockUniverseList,
      loading: false,
    });
    useLocationLookup.mockReturnValue({
      searchStations: mockSearchStations,
    });
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<StationAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('combobox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Search stations...');
    });

    it('renders with custom placeholder', () => {
      render(<StationAutocomplete value="" onChange={vi.fn()} placeholder="Select a station" />);
      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('placeholder', 'Select a station');
    });

    it('renders with label and required indicator', () => {
      render(<StationAutocomplete value="" onChange={vi.fn()} label="Station" required={true} />);
      expect(screen.getByText('Station')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('renders with error message', () => {
      render(<StationAutocomplete value="" onChange={vi.fn()} error="Station is required" />);
      expect(screen.getByText('Station is required')).toBeInTheDocument();
    });

    it('shows loading state when resources are loading', () => {
      useResources.mockReturnValue({ stationList: null, universeList: null, loading: true });
      render(<StationAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('combobox');
      expect(input).toBeDisabled();
      expect(input).toHaveAttribute('placeholder', 'Loading stations...');
    });

    it('shows loading spinner when loading prop is true', () => {
      useResources.mockReturnValue({ stationList: [], universeList: {}, loading: false });
      render(<StationAutocomplete value="" onChange={vi.fn()} loading />);
      const input = screen.getByRole('combobox');
      expect(input).toBeDisabled();
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
    });

    it('displays initial value when provided', () => {
      render(<StationAutocomplete value="Jita IV - Moon 4 - Caldari Navy Assembly Plant" onChange={vi.fn()} />);
      const input = screen.getByRole('combobox');
      expect(input).toHaveValue('Jita IV - Moon 4 - Caldari Navy Assembly Plant');
    });
  });

  describe('Filtering and Search', () => {
    it('filters stations based on input', async () => {
      const user = userEvent.setup();
      render(<StationAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('combobox');
      await user.type(input, 'Jita');
      await waitFor(() => {
        expect(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant')).toBeInTheDocument();
      });
    });

    it('finds citadels marked with asterisk', async () => {
      const user = userEvent.setup();
      render(<StationAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('combobox');
      await user.type(input, 'Perimeter');
      await waitFor(() => {
        expect(screen.getByText('Perimeter - IChooseYou Trade Hub*')).toBeInTheDocument();
      });
    });

    it('respects maxResults limit', async () => {
      const user = userEvent.setup();
      render(<StationAutocomplete value="" onChange={vi.fn()} maxResults={2} />);
      const input = screen.getByRole('combobox');
      await user.type(input, 'i');
      await waitFor(() => {
        const listItems = screen.getAllByRole('option');
        expect(listItems.length).toBeLessThanOrEqual(2);
      });
    });

    it('handles no matches gracefully', async () => {
      const user = userEvent.setup();
      render(<StationAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('combobox');
      await user.type(input, 'NonExistent');
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Selection Handling', () => {
    it('calls onChange when station is selected', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<StationAutocomplete value="" onChange={handleChange} />);
      const input = screen.getByRole('combobox');
      await user.type(input, 'Jita');
      await waitFor(() => expect(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant')).toBeInTheDocument());
      await user.click(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant'));
      expect(handleChange).toHaveBeenCalledWith('Jita IV - Moon 4 - Caldari Navy Assembly Plant');
    });

    it('closes dropdown after selection', async () => {
      const user = userEvent.setup();
      render(<StationAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('combobox');
      await user.type(input, 'Amarr');
      await waitFor(() => expect(screen.getByText('Amarr VIII (Oris) - Emperor Family Academy')).toBeInTheDocument());
      await user.click(screen.getByText('Amarr VIII (Oris) - Emperor Family Academy'));
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Security Badge Display', () => {
    it('displays security badge for each station', async () => {
      const user = userEvent.setup();
      render(<StationAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('combobox');
      await user.type(input, 'Jita');
      await waitFor(() => {
        const badges = screen.getAllByTestId('security-badge');
        expect(badges.length).toBeGreaterThan(0);
      });
    });

    it('marks citadels appropriately in security badge', async () => {
      const user = userEvent.setup();
      render(<StationAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('combobox');
      await user.type(input, 'Perimeter');
      await waitFor(() => {
        const badges = screen.getAllByTestId('security-badge');
        const citadelBadge = badges.find(badge => badge.getAttribute('data-citadel') === 'true');
        expect(citadelBadge).toBeInTheDocument();
      });
    });
  });

  describe('Citadel Styling', () => {
    it('applies gold color to citadel names', async () => {
      const user = userEvent.setup();
      render(<StationAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('combobox');
      await user.type(input, 'Perimeter');
      await waitFor(() => {
        const citadelElement = screen.getByText('Perimeter - IChooseYou Trade Hub*');
        expect(citadelElement).toHaveClass('text-accent-gold');
      });
    });

    it('applies normal color to NPC stations', async () => {
      const user = userEvent.setup();
      render(<StationAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('combobox');
      await user.type(input, 'Jita IV');
      await waitFor(() => {
        const stationElement = screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant');
        expect(stationElement).toHaveClass('text-text-primary');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates down with ArrowDown key', async () => {
      const user = userEvent.setup();
      render(<StationAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('combobox');
      await user.type(input, 'Jita');
      await waitFor(() => expect(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant')).toBeInTheDocument());
      await user.keyboard('{ArrowDown}');
      await waitFor(() => {
        const items = screen.getAllByRole('option');
        expect(items[0]).toHaveClass('bg-accent-cyan/20');
      });
    });

    it('selects highlighted item with Enter key', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<StationAutocomplete value="" onChange={handleChange} />);
      const input = screen.getByRole('combobox');
      await user.type(input, 'Jita');
      await waitFor(() => expect(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant')).toBeInTheDocument());
      await user.keyboard('{ArrowDown}');
      await waitFor(() => {
        const items = screen.getAllByRole('option');
        expect(items[0]).toHaveClass('bg-accent-cyan/20');
      });
      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith('Jita IV - Moon 4 - Caldari Navy Assembly Plant');
      });
    });

    it('closes dropdown with Escape key', async () => {
      const user = userEvent.setup();
      render(<StationAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('combobox');
      await user.type(input, 'Jita');
      await waitFor(() => expect(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant')).toBeInTheDocument());
      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty station list', () => {
      useResources.mockReturnValue({ stationList: [], universeList: mockUniverseList, loading: false });
      render(<StationAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('combobox');
      expect(input).toBeInTheDocument();
    });

    it('handles onChange being undefined', async () => {
      const user = userEvent.setup();
      render(<StationAutocomplete value="" />);
      const input = screen.getByRole('combobox');
      await user.type(input, 'Jita');
      await waitFor(() => expect(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant')).toBeInTheDocument());
      await user.click(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant'));
      expect(input).toHaveValue('Jita IV - Moon 4 - Caldari Navy Assembly Plant');
    });

    it('updates when value prop changes', async () => {
      const { rerender } = render(<StationAutocomplete value="Jita IV - Moon 4 - Caldari Navy Assembly Plant" onChange={vi.fn()} />);
      const input = screen.getByRole('combobox');
      expect(input).toHaveValue('Jita IV - Moon 4 - Caldari Navy Assembly Plant');
      rerender(<StationAutocomplete value="Amarr VIII (Oris) - Emperor Family Academy" onChange={vi.fn()} />);
      await waitFor(() => {
        expect(input).toHaveValue('Amarr VIII (Oris) - Emperor Family Academy');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper input type', () => {
      render(<StationAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('supports required attribute', () => {
      render(<StationAutocomplete value="" onChange={vi.fn()} required={true} />);
      const input = screen.getByRole('combobox');
      expect(input).toBeRequired();
    });
  });
});
