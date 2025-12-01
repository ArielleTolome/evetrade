import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { StationTradingPage } from './StationTradingPage';
import { useResources, useLocationLookup } from '../hooks/useResources';
import { ThemeProvider } from '../store/ThemeContext';
import * as trading from '../api/trading';

// Mock the hooks and API
vi.mock('../hooks/useResources', () => ({
  useResources: vi.fn(),
  useLocationLookup: vi.fn(),
}));

vi.mock('../api/trading', () => ({
  fetchStationTrading: vi.fn(),
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper to render with router and theme provider
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('StationTradingPage Integration Tests', () => {
  const mockStations = [
    'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
    'Amarr VIII (Oris) - Emperor Family Academy',
  ];

  const mockUniverseList = {
    'jita iv - moon 4 - caldari navy assembly plant': {
      region: 10000002,
      station: 60003760,
      security: 0.9,
    },
    'amarr viii (oris) - emperor family academy': {
      region: 10000043,
      station: 60008494,
      security: 1.0,
    },
  };

  const mockSearchStations = vi.fn((query, limit) => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return mockStations
      .filter((station) => station.toLowerCase().includes(lowerQuery))
      .slice(0, limit);
  });

  const mockTradingData = [
    {
      Item: 'Tritanium',
      'Item ID': 34,
      'Buy Price': 5.5,
      'Sell Price': 6.0,
      Volume: 1000,
      'Profit per Unit': 0.4,
      'Net Profit': 400000,
      'Gross Margin': 7.27,
    },
    {
      Item: 'PLEX',
      'Item ID': 44992,
      'Buy Price': 4500000,
      'Sell Price': 5000000,
      Volume: 10,
      'Profit per Unit': 450000,
      'Net Profit': 4500000,
      'Gross Margin': 10.0,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    useResources.mockReturnValue({
      stationList: mockStations,
      universeList: mockUniverseList,
      loading: false,
    });

    useLocationLookup.mockReturnValue({
      searchStations: mockSearchStations,
    });

    trading.fetchStationTrading.mockResolvedValue(mockTradingData);
  });

  describe('Page Rendering', () => {
    it('renders the page with title and form', () => {
      renderWithRouter(<StationTradingPage />);

      expect(screen.getByRole('heading', { name: /Station Trading/i })).toBeInTheDocument();
      expect(screen.getByText(/Find profitable buy\/sell margins within a single station/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Find Trades/i })).toBeInTheDocument();
    });

    it('renders all form fields', () => {
      renderWithRouter(<StationTradingPage />);

      expect(screen.getByPlaceholderText('Jita IV - Moon 4 - Caldari Navy Assembly Plant')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1000000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('100')).toBeInTheDocument();
      expect(screen.getByDisplayValue('3')).toBeInTheDocument();
      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
      expect(screen.getByDisplayValue('50')).toBeInTheDocument();
    });

    it('disables submit button while resources are loading', () => {
      useResources.mockReturnValue({
        stationList: null,
        universeList: null,
        loading: true,
      });

      renderWithRouter(<StationTradingPage />);

      const submitButton = screen.getByRole('button', { name: /Find Trades/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Validation', () => {
    it('validates that a station must be selected', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StationTradingPage />);

      const submitButton = screen.getByRole('button', { name: /Find Trades/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please select a station')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(trading.fetchStationTrading).not.toHaveBeenCalled();
    });
  });

  describe('Complete User Journey', () => {
    it('allows user to select a station and submit the form', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StationTradingPage />);

      const stationInput = screen.getByPlaceholderText('Jita IV - Moon 4 - Caldari Navy Assembly Plant');
      await user.type(stationInput, 'Jita');

      await waitFor(() => {
        expect(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant'));

      const submitButton = screen.getByRole('button', { name: /Find Trades/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(trading.fetchStationTrading).toHaveBeenCalledWith({
          stationId: 60003760,
          minProfit: 1000000,
          tax: 0.0375,
          minVolume: 100,
          brokerFee: 0.03,
          marginAbove: 0.1,
          marginBelow: 0.5,
        });
      });
    });

    it('updates form fields and submits with custom values', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StationTradingPage />);

      const stationInput = screen.getByPlaceholderText('Jita IV - Moon 4 - Caldari Navy Assembly Plant');
      await user.type(stationInput, 'Amarr');
      await waitFor(() => {
        expect(screen.getByText('Amarr VIII (Oris) - Emperor Family Academy')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Amarr VIII (Oris) - Emperor Family Academy'));

      const profitInput = screen.getByDisplayValue('1000000');
      await user.clear(profitInput);
      await user.type(profitInput, '5000000');

      const volumeInput = screen.getByDisplayValue('100');
      await user.clear(volumeInput);
      await user.type(volumeInput, '500');

      const submitButton = screen.getByRole('button', { name: /Find Trades/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(trading.fetchStationTrading).toHaveBeenCalledWith({
          stationId: 60008494,
          minProfit: 5000000,
          tax: 0.0375,
          minVolume: 500,
          brokerFee: 0.03,
          marginAbove: 0.1,
          marginBelow: 0.5,
        });
      });
    });
  });

  describe('Results Display', () => {
    it('displays results table after successful submission', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StationTradingPage />);

      const stationInput = screen.getByPlaceholderText('Jita IV - Moon 4 - Caldari Navy Assembly Plant');
      await user.type(stationInput, 'Jita');
      await waitFor(() => {
        expect(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant'));
      await user.click(screen.getByRole('button', { name: /Find Trades/i }));

      await waitFor(() => {
        expect(screen.getByText('Tritanium')).toBeInTheDocument();
        expect(screen.getByText('PLEX')).toBeInTheDocument();
      });
    });

    it('displays empty state when no trades found', async () => {
      const user = userEvent.setup();
      trading.fetchStationTrading.mockResolvedValue([]);

      renderWithRouter(<StationTradingPage />);

      const stationInput = screen.getByPlaceholderText('Jita IV - Moon 4 - Caldari Navy Assembly Plant');
      await user.type(stationInput, 'Jita');
      await waitFor(() => {
        expect(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant'));
      await user.click(screen.getByRole('button', { name: /Find Trades/i }));

      await waitFor(() => {
        expect(screen.getByText('No trades found matching your criteria.')).toBeInTheDocument();
        expect(screen.getByText(/Try lowering your minimum profit/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when API call fails', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Failed to fetch trading data';
      trading.fetchStationTrading.mockRejectedValue(new Error(errorMessage));

      renderWithRouter(<StationTradingPage />);

      const stationInput = screen.getByPlaceholderText('Jita IV - Moon 4 - Caldari Navy Assembly Plant');
      await user.type(stationInput, 'Jita');
      await waitFor(() => {
        expect(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant'));
      await user.click(screen.getByRole('button', { name: /Find Trades/i }));

      await waitFor(() => {
        expect(screen.getByText(/Error:/i)).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });
});
