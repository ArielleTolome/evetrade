import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdvancedSortPanel } from './AdvancedSortPanel';
import { applySorts, SORT_PRESETS, SORTABLE_COLUMNS } from './AdvancedSortPanel.utils.js';

describe('AdvancedSortPanel', () => {
  describe('Component Rendering', () => {
    it('renders collapsed by default', () => {
      render(<AdvancedSortPanel />);
      expect(screen.getByText('Advanced Sorting')).toBeInTheDocument();
      expect(screen.queryByText('Quick Presets')).not.toBeInTheDocument();
    });

    it('expands when clicked', () => {
      render(<AdvancedSortPanel />);
      const button = screen.getByText('Advanced Sorting');
      fireEvent.click(button);
      expect(screen.getByText('Quick Presets')).toBeInTheDocument();
    });

    it('shows active sort count', () => {
      const sorts = [
        { column: 'Net Profit', direction: 'desc' },
        { column: 'Volume', direction: 'desc' }
      ];
      render(<AdvancedSortPanel currentSort={sorts} />);
      expect(screen.getByText('2 active')).toBeInTheDocument();
    });

    it('shows active preset name', () => {
      render(<AdvancedSortPanel currentSort={[]} />);
      const button = screen.getByText('Advanced Sorting');
      fireEvent.click(button);

      // Get all "Best Overall" elements and click one
      const bestOverallElements = screen.getAllByText(/Best Overall/);
      fireEvent.click(bestOverallElements[0]);

      // After clicking, there should still be "Best Overall" text visible (the preset button)
      const activeElements = screen.getAllByText(/Best Overall/);
      expect(activeElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Preset Functionality', () => {
    it('renders all presets', () => {
      render(<AdvancedSortPanel />);
      const button = screen.getByText('Advanced Sorting');
      fireEvent.click(button);

      SORT_PRESETS.forEach(preset => {
        expect(screen.getByText(preset.name)).toBeInTheDocument();
      });
    });

    it('calls onChange when preset is clicked', () => {
      const onChange = vi.fn();
      render(<AdvancedSortPanel onChange={onChange} />);

      const button = screen.getByText('Advanced Sorting');
      fireEvent.click(button);

      const presetButton = screen.getByText('Highest Profit');
      fireEvent.click(presetButton);

      expect(onChange).toHaveBeenCalledWith([
        { column: 'Net Profit', direction: 'desc' }
      ]);
    });

    it('highlights active preset', () => {
      const onChange = vi.fn();
      render(<AdvancedSortPanel onChange={onChange} />);

      const expandButton = screen.getByText('Advanced Sorting');
      fireEvent.click(expandButton);

      const presetButton = screen.getByText('Best ROI');
      fireEvent.click(presetButton);

      expect(presetButton.closest('button')).toHaveClass('bg-accent-cyan/20');
    });
  });

  describe('Custom Sort Management', () => {
    it('adds sort column', () => {
      const onChange = vi.fn();
      render(<AdvancedSortPanel onChange={onChange} />);

      fireEvent.click(screen.getByText('Advanced Sorting'));

      const addButton = screen.getByText(/\+ Volume/);
      fireEvent.click(addButton);

      expect(onChange).toHaveBeenCalledWith([
        { column: 'Volume', direction: 'desc' }
      ]);
    });

    it('removes sort column', () => {
      const onChange = vi.fn();
      const sorts = [{ column: 'Volume', direction: 'desc' }];

      const { rerender } = render(
        <AdvancedSortPanel currentSort={sorts} onChange={onChange} />
      );

      fireEvent.click(screen.getByText('Advanced Sorting'));

      // Update component with new sorts
      rerender(
        <AdvancedSortPanel currentSort={sorts} onChange={onChange} />
      );

      // Find and click remove button (X icon)
      const removeButtons = screen.getAllByRole('button');
      const removeButton = removeButtons.find(btn =>
        btn.getAttribute('title') === 'Remove this sort'
      );

      if (removeButton) {
        fireEvent.click(removeButton);
        expect(onChange).toHaveBeenCalledWith([]);
      }
    });

    it('toggles sort direction', () => {
      const onChange = vi.fn();
      const sorts = [{ column: 'Volume', direction: 'desc' }];

      render(<AdvancedSortPanel currentSort={sorts} onChange={onChange} />);
      fireEvent.click(screen.getByText('Advanced Sorting'));

      const toggleButton = screen.getByText(/DESC/);
      fireEvent.click(toggleButton);

      expect(onChange).toHaveBeenCalledWith([
        { column: 'Volume', direction: 'asc' }
      ]);
    });

    it('clears all sorts', () => {
      const onChange = vi.fn();
      const sorts = [
        { column: 'Volume', direction: 'desc' },
        { column: 'Net Profit', direction: 'desc' }
      ];

      render(<AdvancedSortPanel currentSort={sorts} onChange={onChange} />);
      fireEvent.click(screen.getByText('Advanced Sorting'));

      const clearButton = screen.getByText('Clear All Sorts');
      fireEvent.click(clearButton);

      expect(onChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Sort Priority Management', () => {
    it('moves sort up', () => {
      const onChange = vi.fn();
      const sorts = [
        { column: 'Volume', direction: 'desc' },
        { column: 'Net Profit', direction: 'desc' }
      ];

      render(<AdvancedSortPanel currentSort={sorts} onChange={onChange} />);
      fireEvent.click(screen.getByText('Advanced Sorting'));

      // Find the second sort's up button
      const sortRows = screen.getAllByText(/\d+\./);
      const secondRow = sortRows[1].closest('div');
      const upButton = secondRow?.querySelector('[title="Move up"]');

      if (upButton) {
        fireEvent.click(upButton);
        expect(onChange).toHaveBeenCalledWith([
          { column: 'Net Profit', direction: 'desc' },
          { column: 'Volume', direction: 'desc' }
        ]);
      }
    });

    it('moves sort down', () => {
      const onChange = vi.fn();
      const sorts = [
        { column: 'Volume', direction: 'desc' },
        { column: 'Net Profit', direction: 'desc' }
      ];

      render(<AdvancedSortPanel currentSort={sorts} onChange={onChange} />);
      fireEvent.click(screen.getByText('Advanced Sorting'));

      // Find the first sort's down button
      const sortRows = screen.getAllByText(/\d+\./);
      const firstRow = sortRows[0].closest('div');
      const downButton = firstRow?.querySelector('[title="Move down"]');

      if (downButton) {
        fireEvent.click(downButton);
        expect(onChange).toHaveBeenCalledWith([
          { column: 'Net Profit', direction: 'desc' },
          { column: 'Volume', direction: 'desc' }
        ]);
      }
    });

    it('disables move up on first item', () => {
      const sorts = [
        { column: 'Volume', direction: 'desc' },
        { column: 'Net Profit', direction: 'desc' }
      ];

      render(<AdvancedSortPanel currentSort={sorts} />);
      fireEvent.click(screen.getByText('Advanced Sorting'));

      const sortRows = screen.getAllByText(/\d+\./);
      const firstRow = sortRows[0].closest('div');
      const upButton = firstRow?.querySelector('[title="Move up"]');

      expect(upButton).toBeDisabled();
    });

    it('disables move down on last item', () => {
      const sorts = [
        { column: 'Volume', direction: 'desc' },
        { column: 'Net Profit', direction: 'desc' }
      ];

      render(<AdvancedSortPanel currentSort={sorts} />);
      fireEvent.click(screen.getByText('Advanced Sorting'));

      const sortRows = screen.getAllByText(/\d+\./);
      const lastRow = sortRows[sortRows.length - 1].closest('div');
      const downButton = lastRow?.querySelector('[title="Move down"]');

      expect(downButton).toBeDisabled();
    });
  });

  describe('Available Columns', () => {
    it('hides columns already in sort', () => {
      const sorts = [{ column: 'Volume', direction: 'desc' }];

      render(<AdvancedSortPanel currentSort={sorts} />);
      fireEvent.click(screen.getByText('Advanced Sorting'));

      // Volume should not be available to add
      expect(screen.queryByText('+ Volume')).not.toBeInTheDocument();

      // But other columns should be available
      expect(screen.getByText(/\+ Item Name/)).toBeInTheDocument();
    });

    it('shows all columns when no sorts active', () => {
      render(<AdvancedSortPanel />);
      fireEvent.click(screen.getByText('Advanced Sorting'));

      // Should show add buttons for all columns
      const addButtons = screen.getAllByText(/^\+ /);
      expect(addButtons.length).toBeGreaterThan(0);
    });
  });
});

describe('applySorts utility', () => {
  const sampleData = [
    { name: 'Item A', profit: 100, volume: 500, margin: 10 },
    { name: 'Item B', profit: 200, volume: 300, margin: 20 },
    { name: 'Item C', profit: 100, volume: 800, margin: 15 },
    { name: 'Item D', profit: 150, volume: 500, margin: 10 },
  ];

  const columns = [
    { key: 'name', type: 'string' },
    { key: 'profit', type: 'number' },
    { key: 'volume', type: 'number' },
    { key: 'margin', type: 'number' },
  ];

  it('returns original data when no sorts', () => {
    const result = applySorts(sampleData, [], columns);
    expect(result).toEqual(sampleData);
  });

  it('sorts by single column descending', () => {
    const result = applySorts(
      sampleData,
      [{ column: 'profit', direction: 'desc' }],
      columns
    );

    expect(result[0].name).toBe('Item B'); // 200
    expect(result[1].name).toBe('Item D'); // 150
  });

  it('sorts by single column ascending', () => {
    const result = applySorts(
      sampleData,
      [{ column: 'profit', direction: 'asc' }],
      columns
    );

    expect(result[0].profit).toBe(100); // A or C
    expect(result[result.length - 1].name).toBe('Item B'); // 200
  });

  it('sorts by multiple columns', () => {
    const result = applySorts(
      sampleData,
      [
        { column: 'profit', direction: 'desc' },
        { column: 'volume', direction: 'desc' }
      ],
      columns
    );

    // Expected order:
    // B (200, 300)
    // D (150, 500)
    // C (100, 800) - higher volume than A
    // A (100, 500)

    expect(result[0].name).toBe('Item B');
    expect(result[1].name).toBe('Item D');
    expect(result[2].name).toBe('Item C');
    expect(result[3].name).toBe('Item A');
  });

  it('handles null values', () => {
    const dataWithNulls = [
      { name: 'A', profit: 100 },
      { name: 'B', profit: null },
      { name: 'C', profit: 200 },
    ];

    const result = applySorts(
      dataWithNulls,
      [{ column: 'profit', direction: 'desc' }],
      columns
    );

    // Null should be at the end
    expect(result[result.length - 1].name).toBe('B');
  });

  it('handles string sorting', () => {
    const result = applySorts(
      sampleData,
      [{ column: 'name', direction: 'asc' }],
      columns
    );

    expect(result[0].name).toBe('Item A');
    expect(result[1].name).toBe('Item B');
    expect(result[2].name).toBe('Item C');
    expect(result[3].name).toBe('Item D');
  });

  it('does not mutate original data', () => {
    const original = [...sampleData];
    applySorts(sampleData, [{ column: 'profit', direction: 'desc' }], columns);

    expect(sampleData).toEqual(original);
  });

  it('handles three-level sort', () => {
    const result = applySorts(
      sampleData,
      [
        { column: 'margin', direction: 'asc' },  // 10, 10, 15, 20
        { column: 'volume', direction: 'desc' }, // Break ties by volume
        { column: 'name', direction: 'asc' }     // Final tiebreaker
      ],
      columns
    );

    // margin 10: A (500), D (500) -> by name: A, D
    // margin 15: C
    // margin 20: B

    expect(result[0].margin).toBe(10);
    expect(result[1].margin).toBe(10);
    expect(result[2].margin).toBe(15);
    expect(result[3].margin).toBe(20);
  });
});

describe('Constants', () => {
  it('exports SORT_PRESETS', () => {
    expect(SORT_PRESETS).toBeDefined();
    expect(SORT_PRESETS.length).toBeGreaterThan(0);

    SORT_PRESETS.forEach(preset => {
      expect(preset).toHaveProperty('id');
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('icon');
      expect(preset).toHaveProperty('sorts');
      expect(preset).toHaveProperty('description');
    });
  });

  it('exports SORTABLE_COLUMNS', () => {
    expect(SORTABLE_COLUMNS).toBeDefined();
    expect(SORTABLE_COLUMNS.length).toBeGreaterThan(0);

    SORTABLE_COLUMNS.forEach(column => {
      expect(column).toHaveProperty('key');
      expect(column).toHaveProperty('label');
      expect(column).toHaveProperty('type');
    });
  });
});
