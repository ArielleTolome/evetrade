import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StockAlertPanel } from './StockAlertPanel';

describe('StockAlertPanel', () => {
  const mockInventory = [
    { itemId: 34, itemName: 'Tritanium', quantity: 15000 },
    { itemId: 35, itemName: 'Pyerite', quantity: 8000 },
    { itemId: 36, itemName: 'Mexallon', quantity: 2500 },
  ];

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders empty state with no inventory', () => {
    render(<StockAlertPanel inventory={[]} />);
    expect(screen.getByText(/no inventory data available/i)).toBeInTheDocument();
  });

  it('renders with inventory items', () => {
    render(<StockAlertPanel inventory={mockInventory} />);
    expect(screen.getByText('Stock Alerts')).toBeInTheDocument();
    expect(screen.getByText(/get notified when inventory drops/i)).toBeInTheDocument();
  });

  it('shows add alert button', () => {
    render(<StockAlertPanel inventory={mockInventory} />);
    expect(screen.getByText('Add Alert')).toBeInTheDocument();
  });

  it('displays add alert form when button clicked', () => {
    render(<StockAlertPanel inventory={mockInventory} />);

    const addButton = screen.getByText('Add Alert');
    fireEvent.click(addButton);

    expect(screen.getByText('Select an item...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Min quantity')).toBeInTheDocument();
  });

  it('shows notification permission button when not granted', () => {
    // Mock Notification API
    global.Notification = {
      permission: 'default',
      requestPermission: vi.fn(),
    };

    render(<StockAlertPanel inventory={mockInventory} />);
    expect(screen.getByText('Enable Notifications')).toBeInTheDocument();
  });

  it('displays configured alerts count', () => {
    render(<StockAlertPanel inventory={mockInventory} />);
    expect(screen.getByText(/configured alerts \(0\)/i)).toBeInTheDocument();
  });

  it('persists alerts to localStorage', async () => {
    const { rerender } = render(<StockAlertPanel inventory={mockInventory} />);

    // Open form
    fireEvent.click(screen.getByText('Add Alert'));

    // Fill form
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '34' } });

    const input = screen.getByPlaceholderText('Min quantity');
    fireEvent.change(input, { target: { value: '10000' } });

    // Submit
    const submitButton = screen.getByText('Add');
    fireEvent.click(submitButton);

    // Wait for state update
    await waitFor(() => {
      const saved = localStorage.getItem('evetrade_stock_alerts');
      expect(saved).toBeTruthy();

      if (saved) {
        const alerts = JSON.parse(saved);
        expect(alerts['34']).toBeDefined();
        expect(alerts['34'].threshold).toBe(10000);
      }
    });
  });

  it('shows low stock warning for items below threshold', () => {
    // Pre-configure an alert
    localStorage.setItem(
      'evetrade_stock_alerts',
      JSON.stringify({
        34: {
          itemId: 34,
          itemName: 'Tritanium',
          threshold: 20000, // Higher than current quantity
          lastAlerted: null,
        },
      })
    );

    render(<StockAlertPanel inventory={mockInventory} />);

    expect(screen.getByText(/low stock items/i)).toBeInTheDocument();
    expect(screen.getByText(/tritanium/i)).toBeInTheDocument();
  });

  it('displays empty message when no alerts configured', () => {
    render(<StockAlertPanel inventory={mockInventory} />);
    expect(screen.getByText(/no alerts configured/i)).toBeInTheDocument();
  });

  it('handles remove alert', async () => {
    // Pre-configure an alert
    localStorage.setItem(
      'evetrade_stock_alerts',
      JSON.stringify({
        34: {
          itemId: 34,
          itemName: 'Tritanium',
          threshold: 10000,
          lastAlerted: null,
        },
      })
    );

    render(<StockAlertPanel inventory={mockInventory} />);

    // Find and click remove button
    const removeButton = screen.getAllByTitle('Remove alert')[0];
    fireEvent.click(removeButton);

    await waitFor(() => {
      const saved = localStorage.getItem('evetrade_stock_alerts');
      const alerts = JSON.parse(saved || '{}');
      expect(alerts['34']).toBeUndefined();
    });
  });

  it('shows info footer about notifications', () => {
    render(<StockAlertPanel inventory={mockInventory} />);
    expect(
      screen.getByText(/enable browser notifications to receive alerts/i)
    ).toBeInTheDocument();
  });

  it('filters out items that already have alerts from dropdown', () => {
    // Pre-configure an alert for Tritanium
    localStorage.setItem(
      'evetrade_stock_alerts',
      JSON.stringify({
        34: {
          itemId: 34,
          itemName: 'Tritanium',
          threshold: 10000,
          lastAlerted: null,
        },
      })
    );

    render(<StockAlertPanel inventory={mockInventory} />);

    // Open form
    fireEvent.click(screen.getByText('Add Alert'));

    // Tritanium should not be in the dropdown
    const options = screen.getAllByRole('option');
    const tritaniumOption = options.find(opt => opt.textContent.includes('Tritanium'));
    expect(tritaniumOption).toBeUndefined();

    // But Pyerite should be
    const pyeriteOption = options.find(opt => opt.textContent.includes('Pyerite'));
    expect(pyeriteOption).toBeDefined();
  });
});

describe('StockAlertPanel - Edge Cases', () => {
  it('handles invalid threshold gracefully', () => {
    const mockInventory = [{ itemId: 34, itemName: 'Tritanium', quantity: 15000 }];

    // Mock alert to prevent actual alert dialog
    global.alert = vi.fn();

    render(<StockAlertPanel inventory={mockInventory} />);

    fireEvent.click(screen.getByText('Add Alert'));

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '34' } });

    const input = screen.getByPlaceholderText('Min quantity');
    fireEvent.change(input, { target: { value: '-100' } });

    const submitButton = screen.getByText('Add');
    fireEvent.click(submitButton);

    // Should show validation error
    expect(global.alert).toHaveBeenCalledWith(expect.stringMatching(/valid threshold/i));
  });

  it('handles corrupt localStorage data', () => {
    // Set invalid JSON
    localStorage.setItem('evetrade_stock_alerts', 'invalid json');

    // Should not crash
    expect(() => {
      render(<StockAlertPanel inventory={[]} />);
    }).not.toThrow();
  });

  it('handles missing Notification API', () => {
    global.Notification = undefined;

    const mockInventory = [{ itemId: 34, itemName: 'Tritanium', quantity: 15000 }];

    // Should render without crashing
    render(<StockAlertPanel inventory={mockInventory} />);
    expect(screen.getByText('Stock Alerts')).toBeInTheDocument();
  });
});
