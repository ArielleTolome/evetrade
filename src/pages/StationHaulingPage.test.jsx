import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { StationHaulingPage } from './StationHaulingPage';
import { useResources, useLocationLookup } from '../hooks/useResources';
import { ThemeProvider } from '../store/ThemeContext';
import * as trading from '../api/trading';

// Mock the hooks and API
vi.mock('../hooks/useResources', () => ({
  useResources: vi.fn(),
  useLocationLookup: vi.fn(),
}));

vi.mock('../api/trading', () => ({
  fetchStationHauling: vi.fn(),
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

// Mock security utilities
vi.mock('../utils/security', () => ({
  isCitadel: (station) => station.includes('*'),
}));

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

describe('StationHaulingPage Integration Tests', () => {
  const mockStations = [
    'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
    'Amarr VIII (Oris) - Emperor Family Academy',
    'Dodixie IX - Moon 20 - Federation Navy Assembly Plant',
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
    'dodixie ix - moon 20 - federation navy assembly plant': {
      region: 10000032,
      station: 60011866,
      security: 0.9,
    },
  };

  const mockSearchStations = vi.fn((query, limit) => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return mockStations
      .filter((station) => station.toLowerCase().includes(lowerQuery))
      .slice(0, limit);
  });

  const mockHaulingData = [
    {
      Item: 'Tritanium',
      'Item ID': 34,
      From: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
      'Take To': 'Amarr VIII (Oris) - Emperor Family Academy',
      Quantity: 50000,
      Profit: 2500000,
      ROI: 15.5,
      Jumps: 25,
      fromLocation: '10000002:60003760',
      toLocation: '10000043:60008494',
      itemId: 34,
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

    trading.fetchStationHauling.mockResolvedValue(mockHaulingData);
  });

  describe('Page Rendering', () => {
    it('renders the page with title and form', () => {
      renderWithRouter(<StationHaulingPage />);

      expect(screen.getByRole('heading', { name: /Station Hauling/i })).toBeInTheDocument();
      expect(screen.getByText(/Find profitable trades between specific stations/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Find Trades/i })).toBeInTheDocument();
    });

    it('renders origin and destination station sections', () => {
      renderWithRouter(<StationHaulingPage />);

      expect(screen.getByText('Origin Stations')).toBeInTheDocument();
      expect(screen.getByText('Destination Stations')).toBeInTheDocument();
    });

    it('renders all form parameter fields', () => {
      renderWithRouter(<StationHaulingPage />);

      expect(screen.getByDisplayValue('1000000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('30000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1000000000')).toBeInTheDocument();
    });
  });

  describe('Station Management', () => {
    it('allows adding an origin station', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StationHaulingPage />);

      const originInputs = screen.getAllByPlaceholderText(/Add origin station/i);
      const originInput = originInputs[0];
      await user.type(originInput, 'Jita');

      await waitFor(() => {
        expect(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant'));

      const addButtons = screen.getAllByRole('button', { name: /Add/i });
      await user.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Jita IV - Moon 4 - Caldari Navy Assembly Plant/)).toBeInTheDocument();
      });
    });

    it('allows adding a destination station', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StationHaulingPage />);

      const destInputs = screen.getAllByPlaceholderText(/Add destination station/i);
      const destInput = destInputs[0];
      await user.type(destInput, 'Amarr');

      await waitFor(() => {
        expect(screen.getByText('Amarr VIII (Oris) - Emperor Family Academy')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Amarr VIII (Oris) - Emperor Family Academy'));

      const addButtons = screen.getAllByRole('button', { name: /Add/i });
      await user.click(addButtons[1]);

      await waitFor(() => {
        expect(screen.getByText(/Amarr VIII \(Oris\) - Emperor Family Academy/)).toBeInTheDocument();
      });
    });
  });

  describe('Complete User Journey', () => {
    it('allows user to add stations and submit the form', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StationHaulingPage />);

      // Add origin station
      const originInput = screen.getAllByPlaceholderText(/Add origin station/i)[0];
      await user.type(originInput, 'Jita');
      await waitFor(() => {
        expect(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant'));
      const addButtons = screen.getAllByRole('button', { name: /Add/i });
      await user.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Jita IV - Moon 4/)).toBeInTheDocument();
      });

      // Add destination station
      const destInput = screen.getAllByPlaceholderText(/Add destination station/i)[0];
      await user.type(destInput, 'Amarr');
      await waitFor(() => {
        expect(screen.getByText('Amarr VIII (Oris) - Emperor Family Academy')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Amarr VIII (Oris) - Emperor Family Academy'));
      await user.click(addButtons[1]);

      await waitFor(() => {
        expect(screen.getByText(/Amarr VIII/)).toBeInTheDocument();
      });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /Find Trades/i });
      await user.click(submitButton);

      // Verify API was called with correct parameters
      await waitFor(() => {
        expect(trading.fetchStationHauling).toHaveBeenCalledWith({
          from: 'sell-10000002:60003760',
          to: 'buy-10000043:60008494',
          minProfit: 1000000,
          maxWeight: 30000,
          minROI: 5,
          maxBudget: 1000000000,
          tax: 0.0375,
          systemSecurity: 'all',
          routeSafety: 'shortest',
        });
      });
    });

    it('handles multiple origin and destination stations', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StationHaulingPage />);

      // Add two origin stations
      const originInput = screen.getAllByPlaceholderText(/Add origin station/i)[0];
      await user.type(originInput, 'Jita');
      await waitFor(() => {
        expect(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant'));
      const addButtons = screen.getAllByRole('button', { name: /Add/i });
      await user.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Jita IV - Moon 4/)).toBeInTheDocument();
      });

      await user.clear(originInput);
      await user.type(originInput, 'Dodixie');
      await waitFor(() => {
        expect(screen.getByText('Dodixie IX - Moon 20 - Federation Navy Assembly Plant')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Dodixie IX - Moon 20 - Federation Navy Assembly Plant'));
      await user.click(addButtons[0]);

      // Add destination
      const destInput = screen.getAllByPlaceholderText(/Add destination station/i)[0];
      await user.type(destInput, 'Amarr');
      await waitFor(() => {
        expect(screen.getByText('Amarr VIII (Oris) - Emperor Family Academy')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Amarr VIII (Oris) - Emperor Family Academy'));
      await user.click(addButtons[1]);

      // Submit
      const submitButton = screen.getByRole('button', { name: /Find Trades/i });
      await user.click(submitButton);

      // Verify multiple stations in location string
      await waitFor(() => {
        expect(trading.fetchStationHauling).toHaveBeenCalledWith(
          expect.objectContaining({
            from: 'sell-10000002:60003760,10000032:60011866',
            to: 'buy-10000043:60008494',
          })
        );
      });
    });
  });

  describe('Results Display', () => {
    it('displays results table after successful submission', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StationHaulingPage />);

      const originInput = screen.getAllByPlaceholderText(/Add origin station/i)[0];
      await user.type(originInput, 'Jita');
      await waitFor(() => {
        expect(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant'));
      const addButtons = screen.getAllByRole('button', { name: /Add/i });
      await user.click(addButtons[0]);

      const destInput = screen.getAllByPlaceholderText(/Add destination station/i)[0];
      await user.type(destInput, 'Amarr');
      await waitFor(() => {
        expect(screen.getByText('Amarr VIII (Oris) - Emperor Family Academy')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Amarr VIII (Oris) - Emperor Family Academy'));
      await user.click(addButtons[1]);

      await user.click(screen.getByRole('button', { name: /Find Trades/i }));

      await waitFor(() => {
        const results = screen.getAllByText('Tritanium');
        expect(results.length).toBeGreaterThan(0);
      });
    });

    it('displays empty state when no trades found', async () => {
      const user = userEvent.setup();
      trading.fetchStationHauling.mockResolvedValue([]);

      renderWithRouter(<StationHaulingPage />);

      const originInput = screen.getAllByPlaceholderText(/Add origin station/i)[0];
      await user.type(originInput, 'Jita');
      await waitFor(() => {
        expect(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant'));
      const addButtons = screen.getAllByRole('button', { name: /Add/i });
      await user.click(addButtons[0]);

      const destInput = screen.getAllByPlaceholderText(/Add destination station/i)[0];
      await user.type(destInput, 'Amarr');
      await waitFor(() => {
        expect(screen.getByText('Amarr VIII (Oris) - Emperor Family Academy')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Amarr VIII (Oris) - Emperor Family Academy'));
      await user.click(addButtons[1]);

      await user.click(screen.getByRole('button', { name: /Find Trades/i }));

      await waitFor(() => {
        expect(screen.getByText('No trades found matching your criteria.')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when API call fails', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Failed to fetch hauling data';
      trading.fetchStationHauling.mockRejectedValue(new Error(errorMessage));

      renderWithRouter(<StationHaulingPage />);

      const originInput = screen.getAllByPlaceholderText(/Add origin station/i)[0];
      await user.type(originInput, 'Jita');
      await waitFor(() => {
        expect(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Jita IV - Moon 4 - Caldari Navy Assembly Plant'));
      const addButtons = screen.getAllByRole('button', { name: /Add/i });
      await user.click(addButtons[0]);

      const destInput = screen.getAllByPlaceholderText(/Add destination station/i)[0];
      await user.type(destInput, 'Amarr');
      await waitFor(() => {
        expect(screen.getByText('Amarr VIII (Oris) - Emperor Family Academy')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Amarr VIII (Oris) - Emperor Family Academy'));
      await user.click(addButtons[1]);

      await user.click(screen.getByRole('button', { name: /Find Trades/i }));

      await waitFor(() => {
        expect(screen.getByText(/Error:/i)).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });
});
