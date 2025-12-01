import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SmartFilters } from './SmartFilters';

describe('SmartFilters', () => {
  const mockData = [
    { 'Volume': 100, 'Gross Margin': 15, 'Net Profit': 5000000 },
    { 'Volume': 1, 'Gross Margin': 50, 'Net Profit': 100000 },
    { 'Volume': 50, 'Gross Margin': 8, 'Net Profit': 2000000 },
  ];

  it('renders without crashing', () => {
    render(<SmartFilters onChange={vi.fn()} data={mockData} />);
    expect(screen.getByText('Smart Filters')).toBeInTheDocument();
  });

  it('displays quick filter toggles', () => {
    render(<SmartFilters onChange={vi.fn()} data={mockData} />);
    expect(screen.getByText('Hide Scams')).toBeInTheDocument();
    expect(screen.getByText('Hide Low Volume')).toBeInTheDocument();
    expect(screen.getByText('High Quality')).toBeInTheDocument();
    expect(screen.getByText('Verified Only')).toBeInTheDocument();
  });

  it('shows active filter count badge', () => {
    const onChange = vi.fn();
    render(<SmartFilters onChange={onChange} data={mockData} />);

    // Click Hide Scams toggle
    const hideScamsButton = screen.getByText('Hide Scams');
    fireEvent.click(hideScamsButton);

    // Should show "1 active" badge
    expect(screen.getByText('1 active')).toBeInTheDocument();
  });

  it('calls onChange when filter is toggled', () => {
    const onChange = vi.fn();
    render(<SmartFilters onChange={onChange} data={mockData} />);

    // Click Hide Scams toggle
    const hideScamsButton = screen.getByText('Hide Scams');
    fireEvent.click(hideScamsButton);

    // Should have called onChange with hideScams: true
    expect(onChange).toHaveBeenCalled();
    const filterObject = onChange.mock.calls[0][0];
    expect(filterObject.hideScams).toBe(true);
  });

  it('expands when header is clicked', () => {
    render(<SmartFilters onChange={vi.fn()} data={mockData} />);

    // Preset filters should not be visible initially
    expect(screen.queryByText('Safe Trades')).not.toBeInTheDocument();

    // Click the header
    const header = screen.getByText('Smart Filters');
    fireEvent.click(header);

    // Preset filters should now be visible
    expect(screen.getByText('Safe Trades')).toBeInTheDocument();
    expect(screen.getByText('High Profit')).toBeInTheDocument();
    expect(screen.getByText('Quick Flips')).toBeInTheDocument();
    expect(screen.getByText('Hidden Gems')).toBeInTheDocument();
  });

  it('resets all filters when Reset All is clicked', () => {
    const onChange = vi.fn();
    render(<SmartFilters onChange={onChange} data={mockData} />);

    // Toggle a filter first
    const hideScamsButton = screen.getByText('Hide Scams');
    fireEvent.click(hideScamsButton);

    // Clear the mock
    onChange.mockClear();

    // Click Reset All
    const resetButton = screen.getByText('Reset All');
    fireEvent.click(resetButton);

    // Should have called onChange with default filters
    expect(onChange).toHaveBeenCalled();
    const filterObject = onChange.mock.calls[0][0];
    expect(filterObject.hideScams).toBe(false);
    expect(filterObject.hideLowVolume).toBe(false);
    expect(filterObject.highQualityOnly).toBe(false);
    expect(filterObject.verifiedOnly).toBe(false);
  });

  it('applies preset filters correctly', () => {
    const onChange = vi.fn();
    render(<SmartFilters onChange={onChange} data={mockData} />);

    // Expand the filters
    const header = screen.getByText('Smart Filters');
    fireEvent.click(header);

    // Click Safe Trades preset
    const safeTradesButton = screen.getByText('Safe Trades');
    fireEvent.click(safeTradesButton);

    // Should have applied the safe trades preset
    expect(onChange).toHaveBeenCalled();
    const filterObject = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(filterObject.minVolume).toBe(50);
    expect(filterObject.maxMargin).toBe(30);
    expect(filterObject.minMargin).toBe(10);
    expect(filterObject.hideScams).toBe(true);
    expect(filterObject.riskLevels).toEqual(['low', 'medium']);
  });

  it('respects initial filters', () => {
    const initialFilters = {
      hideScams: true,
      minVolume: 25,
      minMargin: 5,
    };

    render(
      <SmartFilters
        onChange={vi.fn()}
        initialFilters={initialFilters}
        data={mockData}
      />
    );

    // Should show 3 active filters
    expect(screen.getByText('3 active')).toBeInTheDocument();
  });

  it('calculates data stats correctly', () => {
    const onChange = vi.fn();
    render(<SmartFilters onChange={onChange} data={mockData} />);

    // Expand filters to see sliders
    const header = screen.getByText('Smart Filters');
    fireEvent.click(header);

    // The max volume should be based on data (100 from mockData)
    // Check that volume range label exists
    expect(screen.getByText('Volume Range')).toBeInTheDocument();
  });
});
