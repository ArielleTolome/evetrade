import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegionAutocomplete } from './RegionAutocomplete';
import { useResources, useLocationLookup } from '../../hooks/useResources';

// Mock the hooks
vi.mock('../../hooks/useResources', () => ({
  useResources: vi.fn(),
  useLocationLookup: vi.fn(),
}));

describe('RegionAutocomplete', () => {
  const mockRegions = [
    'The Forge',
    'The Citadel',
    'Domain',
    'Heimatar',
    'Metropolis',
    'Sinq Laison',
    'The Bleak Lands',
  ];

  const mockSearchRegions = vi.fn((query, limit) => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return mockRegions
      .filter((region) => region.toLowerCase().includes(lowerQuery))
      .slice(0, limit);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    useResources.mockReturnValue({
      regionList: mockRegions,
      loading: false,
    });
    useLocationLookup.mockReturnValue({
      searchRegions: mockSearchRegions,
    });
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<RegionAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Search regions...');
    });

    it('renders with custom placeholder', () => {
      render(<RegionAutocomplete value="" onChange={vi.fn()} placeholder="Select a region" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Select a region');
    });

    it('renders with label and required indicator', () => {
      render(<RegionAutocomplete value="" onChange={vi.fn()} label="Region" required={true} />);
      expect(screen.getByText('Region')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('renders with error message', () => {
      render(<RegionAutocomplete value="" onChange={vi.fn()} error="Region is required" />);
      expect(screen.getByText('Region is required')).toBeInTheDocument();
    });

    it('shows loading placeholder when resources are loading', () => {
      useResources.mockReturnValue({ regionList: null, loading: true });
      render(<RegionAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Loading regions...');
      expect(input).toBeDisabled();
    });

    it('is disabled when disabled prop is true', () => {
      render(<RegionAutocomplete value="" onChange={vi.fn()} disabled={true} />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('displays initial value when provided', () => {
      render(<RegionAutocomplete value="The Forge" onChange={vi.fn()} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('The Forge');
    });
  });

  describe('Filtering and Search', () => {
    it('filters regions based on input', async () => {
      const user = userEvent.setup();
      render(<RegionAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'The');
      await waitFor(() => {
        expect(screen.getByText('The Forge')).toBeInTheDocument();
        expect(screen.getByText('The Citadel')).toBeInTheDocument();
      });
    });

    it('does not show dropdown when input is empty', async () => {
      const user = userEvent.setup();
      render(<RegionAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('textbox');
      await user.click(input);
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('respects maxResults limit', async () => {
      const user = userEvent.setup();
      render(<RegionAutocomplete value="" onChange={vi.fn()} maxResults={2} />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'e');
      await waitFor(() => {
        const listItems = screen.getAllByRole('listitem');
        expect(listItems.length).toBeLessThanOrEqual(2);
      });
    });

    it('excludes regions from results', async () => {
      const user = userEvent.setup();
      render(<RegionAutocomplete value="" onChange={vi.fn()} excludeRegions={['The Forge']} />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'The');
      await waitFor(() => {
        expect(screen.queryByText('The Forge')).not.toBeInTheDocument();
        expect(screen.getByText('The Citadel')).toBeInTheDocument();
      });
    });

    it('handles no matches gracefully', async () => {
      const user = userEvent.setup();
      render(<RegionAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'NonExistent');
      await waitFor(() => {
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
      });
    });
  });

  describe('Selection Handling', () => {
    it('calls onChange when region is selected', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<RegionAutocomplete value="" onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'The Forge');
      await waitFor(() => expect(screen.getByText('The Forge')).toBeInTheDocument());
      await user.click(screen.getByText('The Forge'));
      expect(handleChange).toHaveBeenCalledWith('The Forge');
    });

    it('closes dropdown after selection', async () => {
      const user = userEvent.setup();
      render(<RegionAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'Domain');
      await waitFor(() => expect(screen.getByText('Domain')).toBeInTheDocument());
      await user.click(screen.getByText('Domain'));
      await waitFor(() => {
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates down with ArrowDown key', async () => {
      const user = userEvent.setup();
      render(<RegionAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'The');
      await waitFor(() => expect(screen.getByText('The Forge')).toBeInTheDocument());
      await user.keyboard('{ArrowDown}');
      await waitFor(() => {
        const items = screen.getAllByRole('listitem');
        expect(items[0]).toHaveClass('bg-accent-cyan/20');
      });
    });

    it('selects highlighted item with Enter key', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<RegionAutocomplete value="" onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'The');
      await waitFor(() => expect(screen.getByText('The Forge')).toBeInTheDocument());
      await user.keyboard('{ArrowDown}');
      await waitFor(() => {
        const items = screen.getAllByRole('listitem');
        expect(items[0]).toHaveClass('bg-accent-cyan/20');
      });
      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith('The Forge');
      });
    });

    it('closes dropdown with Escape key', async () => {
      const user = userEvent.setup();
      render(<RegionAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'The');
      await waitFor(() => expect(screen.getByText('The Forge')).toBeInTheDocument());
      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty region list', () => {
      useResources.mockReturnValue({ regionList: [], loading: false });
      render(<RegionAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('handles onChange being undefined', async () => {
      const user = userEvent.setup();
      render(<RegionAutocomplete value="" />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'The Forge');
      await waitFor(() => expect(screen.getByText('The Forge')).toBeInTheDocument());
      await user.click(screen.getByText('The Forge'));
      expect(input).toHaveValue('The Forge');
    });

    it('updates when value prop changes', async () => {
      const { rerender } = render(<RegionAutocomplete value="The Forge" onChange={vi.fn()} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('The Forge');
      rerender(<RegionAutocomplete value="Domain" onChange={vi.fn()} />);
      await waitFor(() => {
        expect(input).toHaveValue('Domain');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper input type', () => {
      render(<RegionAutocomplete value="" onChange={vi.fn()} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('supports required attribute', () => {
      render(<RegionAutocomplete value="" onChange={vi.fn()} required={true} />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });
  });
});
