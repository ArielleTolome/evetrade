import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PriceAlertPanel } from './PriceAlertPanel';

describe('PriceAlertPanel', () => {
  const mockAlerts = [
    {
      id: '1',
      itemName: 'Tritanium',
      itemId: '34',
      type: 'margin',
      condition: 'above',
      threshold: 10,
      oneTime: true,
      triggered: false,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      itemName: 'Pyerite',
      itemId: '35',
      type: 'sellPrice',
      condition: 'below',
      threshold: 5000,
      oneTime: false,
      triggered: true,
      triggeredAt: '2024-01-02T12:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
    },
  ];

  const defaultProps = {
    alerts: [],
    onCreateAlert: vi.fn(),
    onRemoveAlert: vi.fn(),
    onResetAlert: vi.fn(),
    onClearAll: vi.fn(),
    settings: {
      browserNotifications: false,
      soundEnabled: true,
      soundVolume: 0.5,
    },
    notificationPermission: 'default',
    onUpdateSettings: vi.fn(),
    onRequestNotificationPermission: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state with no alerts', () => {
    render(<PriceAlertPanel {...defaultProps} />);
    expect(screen.getByText(/no alerts configured/i)).toBeInTheDocument();
    expect(screen.getByText(/create an alert to get notified/i)).toBeInTheDocument();
  });

  it('renders the header with title', () => {
    render(<PriceAlertPanel {...defaultProps} />);
    expect(screen.getByText('Price Alerts')).toBeInTheDocument();
  });

  it('shows active alerts count', () => {
    render(<PriceAlertPanel {...defaultProps} alerts={mockAlerts} />);
    expect(screen.getByText('1 Active')).toBeInTheDocument();
  });

  it('shows triggered alerts count when present', () => {
    render(<PriceAlertPanel {...defaultProps} alerts={mockAlerts} />);
    expect(screen.getByText('1 Triggered')).toBeInTheDocument();
  });

  it('displays new alert button', () => {
    render(<PriceAlertPanel {...defaultProps} />);
    expect(screen.getByText('+ New Alert')).toBeInTheDocument();
  });

  it('opens create alert form when button clicked', () => {
    render(<PriceAlertPanel {...defaultProps} />);

    const newAlertButton = screen.getByText('+ New Alert');
    fireEvent.click(newAlertButton);

    expect(screen.getByText('Create New Alert')).toBeInTheDocument();
    expect(screen.getByLabelText(/item name/i)).toBeInTheDocument();
  });

  it('closes form when cancel button clicked', () => {
    render(<PriceAlertPanel {...defaultProps} />);

    // Open form
    fireEvent.click(screen.getByText('+ New Alert'));
    expect(screen.getByText('Create New Alert')).toBeInTheDocument();

    // Click the Cancel button in the form (not in header)
    const cancelButtons = screen.getAllByText('Cancel');
    fireEvent.click(cancelButtons[cancelButtons.length - 1]); // Last cancel button is in the form
    expect(screen.queryByText('Create New Alert')).not.toBeInTheDocument();
  });

  it('renders alerts list when alerts exist', () => {
    render(<PriceAlertPanel {...defaultProps} alerts={mockAlerts} />);

    expect(screen.getByText('Tritanium')).toBeInTheDocument();
  });

  it('shows triggered badge for triggered alerts', () => {
    render(<PriceAlertPanel {...defaultProps} alerts={mockAlerts} />);

    // Toggle to show triggered
    const toggleButton = screen.getByText('Show Triggered');
    fireEvent.click(toggleButton);

    expect(screen.getByText('Triggered')).toBeInTheDocument();
  });

  it('shows one-time badge for one-time alerts', () => {
    render(<PriceAlertPanel {...defaultProps} alerts={mockAlerts} />);

    expect(screen.getByText('One-time')).toBeInTheDocument();
  });

  it('calls onRemoveAlert when delete button clicked', () => {
    const onRemoveAlert = vi.fn();
    render(<PriceAlertPanel {...defaultProps} alerts={mockAlerts} onRemoveAlert={onRemoveAlert} />);

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(onRemoveAlert).toHaveBeenCalledWith('1');
  });

  it('calls onResetAlert for triggered alerts', () => {
    const onResetAlert = vi.fn();
    render(<PriceAlertPanel {...defaultProps} alerts={mockAlerts} onResetAlert={onResetAlert} />);

    // Toggle to show triggered alerts
    fireEvent.click(screen.getByText('Show Triggered'));

    // Find reset button
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(onResetAlert).toHaveBeenCalledWith('2');
  });

  it('calls onClearAll when clear all clicked', () => {
    const onClearAll = vi.fn();
    render(<PriceAlertPanel {...defaultProps} alerts={mockAlerts} onClearAll={onClearAll} />);

    const clearAllButton = screen.getByText('Clear All Alerts');
    fireEvent.click(clearAllButton);

    expect(onClearAll).toHaveBeenCalled();
  });

  it('displays total alerts count', () => {
    render(<PriceAlertPanel {...defaultProps} alerts={mockAlerts} />);

    expect(screen.getByText('Total: 2 alerts')).toBeInTheDocument();
  });

  it('handles singular alert count', () => {
    const singleAlert = [mockAlerts[0]];
    render(<PriceAlertPanel {...defaultProps} alerts={singleAlert} />);

    expect(screen.getByText('Total: 1 alert')).toBeInTheDocument();
  });

  it('shows settings panel when settings button clicked', () => {
    render(<PriceAlertPanel {...defaultProps} />);

    // Find settings button by its parent or icon
    const buttons = screen.getAllByRole('button');
    const settingsButton = buttons.find(btn => btn.getAttribute('title') === 'Alert Settings');
    fireEvent.click(settingsButton);

    expect(screen.getByText('Alert Settings')).toBeInTheDocument();
  });

  it('displays browser notification toggle in settings', () => {
    render(<PriceAlertPanel {...defaultProps} />);

    // Open settings
    const settingsButton = screen.getByTitle('Alert Settings');
    fireEvent.click(settingsButton);

    expect(screen.getByText('Browser Notifications')).toBeInTheDocument();
  });

  it('shows enable notification button when permission is default', () => {
    render(<PriceAlertPanel {...defaultProps} notificationPermission="default" />);

    const settingsButton = screen.getByTitle('Alert Settings');
    fireEvent.click(settingsButton);

    expect(screen.getByText('Enable')).toBeInTheDocument();
  });

  it('shows enabled badge when permission is granted', () => {
    render(<PriceAlertPanel {...defaultProps} notificationPermission="granted" />);

    const settingsButton = screen.getByTitle('Alert Settings');
    fireEvent.click(settingsButton);

    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });

  it('shows blocked badge when permission is denied', () => {
    render(<PriceAlertPanel {...defaultProps} notificationPermission="denied" />);

    const settingsButton = screen.getByTitle('Alert Settings');
    fireEvent.click(settingsButton);

    expect(screen.getByText('Blocked')).toBeInTheDocument();
  });

  it('calls onRequestNotificationPermission when enable clicked', () => {
    const onRequestNotificationPermission = vi.fn();
    render(<PriceAlertPanel {...defaultProps} onRequestNotificationPermission={onRequestNotificationPermission} />);

    const settingsButton = screen.getByTitle('Alert Settings');
    fireEvent.click(settingsButton);

    const enableButton = screen.getByText('Enable');
    fireEvent.click(enableButton);

    expect(onRequestNotificationPermission).toHaveBeenCalled();
  });

  it('displays sound notifications toggle', () => {
    render(<PriceAlertPanel {...defaultProps} />);

    const settingsButton = screen.getByTitle('Alert Settings');
    fireEvent.click(settingsButton);

    expect(screen.getByText('Sound Notifications')).toBeInTheDocument();
  });

  it('shows volume slider when sound is enabled', () => {
    render(<PriceAlertPanel {...defaultProps} settings={{ soundEnabled: true, soundVolume: 0.5 }} />);

    const settingsButton = screen.getByTitle('Alert Settings');
    fireEvent.click(settingsButton);

    expect(screen.getByText(/volume: 50%/i)).toBeInTheDocument();
  });

  it('calls onUpdateSettings when sound toggle changed', () => {
    const onUpdateSettings = vi.fn();
    render(<PriceAlertPanel {...defaultProps} onUpdateSettings={onUpdateSettings} />);

    const settingsButton = screen.getByTitle('Alert Settings');
    fireEvent.click(settingsButton);

    // Find sound checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    const soundCheckbox = checkboxes.find(cb => cb.checked === true);
    if (soundCheckbox) {
      fireEvent.click(soundCheckbox);
      expect(onUpdateSettings).toHaveBeenCalled();
    }
  });
});

describe('PriceAlertPanel - Form Validation', () => {
  const defaultProps = {
    alerts: [],
    onCreateAlert: vi.fn(),
    onRemoveAlert: vi.fn(),
    onResetAlert: vi.fn(),
    onClearAll: vi.fn(),
    settings: {},
    notificationPermission: 'default',
    onUpdateSettings: vi.fn(),
    onRequestNotificationPermission: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates required item name', () => {
    render(<PriceAlertPanel {...defaultProps} />);

    // Open form
    fireEvent.click(screen.getByText('+ New Alert'));

    // Try to submit without item name
    const submitButton = screen.getByText('Create Alert');
    fireEvent.click(submitButton);

    // Form should still be open (validation failed)
    expect(screen.getByText('Create New Alert')).toBeInTheDocument();
  });

  it('validates threshold is positive', () => {
    render(<PriceAlertPanel {...defaultProps} />);

    fireEvent.click(screen.getByText('+ New Alert'));

    // Fill item name
    const itemNameInput = screen.getByLabelText(/item name/i);
    fireEvent.change(itemNameInput, { target: { value: 'Test Item' } });

    // Leave threshold empty or 0
    const thresholdInput = screen.getByLabelText(/threshold/i);
    fireEvent.change(thresholdInput, { target: { value: '0' } });

    const submitButton = screen.getByText('Create Alert');
    fireEvent.click(submitButton);

    // Form should still be open
    expect(screen.getByText('Create New Alert')).toBeInTheDocument();
  });

  it('creates alert with valid data', () => {
    const onCreateAlert = vi.fn();
    render(<PriceAlertPanel {...defaultProps} onCreateAlert={onCreateAlert} />);

    fireEvent.click(screen.getByText('+ New Alert'));

    // Fill form
    const itemNameInput = screen.getByLabelText(/item name/i);
    fireEvent.change(itemNameInput, { target: { value: 'Test Item' } });

    const thresholdInput = screen.getByLabelText(/threshold/i);
    fireEvent.change(thresholdInput, { target: { value: '100' } });

    const submitButton = screen.getByText('Create Alert');
    fireEvent.click(submitButton);

    expect(onCreateAlert).toHaveBeenCalledWith(expect.objectContaining({
      itemName: 'Test Item',
      threshold: 100,
    }));
  });

  it('resets form after successful submission', () => {
    const onCreateAlert = vi.fn();
    render(<PriceAlertPanel {...defaultProps} onCreateAlert={onCreateAlert} />);

    fireEvent.click(screen.getByText('+ New Alert'));

    const itemNameInput = screen.getByLabelText(/item name/i);
    fireEvent.change(itemNameInput, { target: { value: 'Test Item' } });

    const thresholdInput = screen.getByLabelText(/threshold/i);
    fireEvent.change(thresholdInput, { target: { value: '100' } });

    fireEvent.click(screen.getByText('Create Alert'));

    // Form should be closed
    expect(screen.queryByText('Create New Alert')).not.toBeInTheDocument();
  });
});

describe('PriceAlertPanel - Alert Type Display', () => {
  const defaultProps = {
    alerts: [],
    onCreateAlert: vi.fn(),
    onRemoveAlert: vi.fn(),
    onResetAlert: vi.fn(),
    onClearAll: vi.fn(),
    settings: {},
    notificationPermission: 'default',
    onUpdateSettings: vi.fn(),
    onRequestNotificationPermission: vi.fn(),
  };

  it('displays margin type correctly', () => {
    const alerts = [{
      id: '1',
      itemName: 'Test',
      type: 'margin',
      condition: 'above',
      threshold: 15.5,
      triggered: false,
      createdAt: new Date().toISOString(),
    }];

    render(<PriceAlertPanel {...defaultProps} alerts={alerts} />);

    expect(screen.getByText('Margin')).toBeInTheDocument();
    expect(screen.getByText('15.50%')).toBeInTheDocument();
  });

  it('displays sell price type correctly', () => {
    const alerts = [{
      id: '1',
      itemName: 'Test',
      type: 'sellPrice',
      condition: 'below',
      threshold: 10000,
      triggered: false,
      createdAt: new Date().toISOString(),
    }];

    render(<PriceAlertPanel {...defaultProps} alerts={alerts} />);

    expect(screen.getByText('Sell Price')).toBeInTheDocument();
  });

  it('displays buy price type correctly', () => {
    const alerts = [{
      id: '1',
      itemName: 'Test',
      type: 'buyPrice',
      condition: 'above',
      threshold: 5000,
      triggered: false,
      createdAt: new Date().toISOString(),
    }];

    render(<PriceAlertPanel {...defaultProps} alerts={alerts} />);

    expect(screen.getByText('Buy Price')).toBeInTheDocument();
  });

  it('displays volume type correctly', () => {
    const alerts = [{
      id: '1',
      itemName: 'Test',
      type: 'volume',
      condition: 'below',
      threshold: 1000000,
      triggered: false,
      createdAt: new Date().toISOString(),
    }];

    render(<PriceAlertPanel {...defaultProps} alerts={alerts} />);

    expect(screen.getByText('Volume')).toBeInTheDocument();
  });

  it('displays condition correctly', () => {
    const alerts = [{
      id: '1',
      itemName: 'Test',
      type: 'margin',
      condition: 'above',
      threshold: 10,
      triggered: false,
      createdAt: new Date().toISOString(),
    }];

    render(<PriceAlertPanel {...defaultProps} alerts={alerts} />);

    expect(screen.getByText(/above/i)).toBeInTheDocument();
  });
});
