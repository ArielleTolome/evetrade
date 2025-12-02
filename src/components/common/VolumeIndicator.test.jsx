import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { VolumeIndicator, VolumeTrendIndicator, VolumeStats } from './VolumeIndicator';
import * as esiApi from '../../api/esi';
import * as useCache from '../../hooks/useCache';

// Mock the API and cache
vi.mock('../../api/esi', () => ({
  getMarketHistory: vi.fn(),
}));

vi.mock('../../hooks/useCache', () => ({
  getCached: vi.fn(),
  setCached: vi.fn(),
}));

describe('VolumeIndicator', () => {
  it('should render volume with correct tier label', () => {
    render(<VolumeIndicator volume={10} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Slow')).toBeInTheDocument();
  });

  it('should render as Dead tier for low volume', () => {
    render(<VolumeIndicator volume={3} />);
    expect(screen.getByText('Dead')).toBeInTheDocument();
  });

  it('should render as Hot tier for high volume', () => {
    render(<VolumeIndicator volume={1000} />);
    expect(screen.getByText('Hot')).toBeInTheDocument();
  });

  it('should render in compact mode', () => {
    render(<VolumeIndicator volume={100} compact={true} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should handle zero volume', () => {
    render(<VolumeIndicator volume={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});

describe('VolumeTrendIndicator', () => {
  const mockHistoryData = [
    { date: '2024-01-07', volume: 1000 },
    { date: '2024-01-06', volume: 950 },
    { date: '2024-01-05', volume: 900 },
    { date: '2024-01-04', volume: 800 },
    { date: '2024-01-03', volume: 750 },
    { date: '2024-01-02', volume: 700 },
    { date: '2024-01-01', volume: 650 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', () => {
    useCache.getCached.mockResolvedValue(null);
    esiApi.getMarketHistory.mockResolvedValue(mockHistoryData);

    render(
      <VolumeTrendIndicator
        typeId={34}
        regionId={10000002}
        currentVolume={1000}
        compact={true}
      />
    );

    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('should render trend data when loaded', async () => {
    useCache.getCached.mockResolvedValue(mockHistoryData);

    render(
      <VolumeTrendIndicator
        typeId={34}
        regionId={10000002}
        currentVolume={1000}
        compact={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('1.0K')).toBeInTheDocument();
    });
  });

  it('should use cached data if available', async () => {
    useCache.getCached.mockResolvedValue(mockHistoryData);

    render(
      <VolumeTrendIndicator
        typeId={34}
        regionId={10000002}
        currentVolume={1000}
        compact={true}
      />
    );

    await waitFor(() => {
      expect(useCache.getCached).toHaveBeenCalledWith('volume_history_10000002_34');
      expect(esiApi.getMarketHistory).not.toHaveBeenCalled();
    });
  });

  it('should fetch from API if cache miss', async () => {
    useCache.getCached.mockResolvedValue(null);
    esiApi.getMarketHistory.mockResolvedValue(mockHistoryData);

    render(
      <VolumeTrendIndicator
        typeId={34}
        regionId={10000002}
        currentVolume={1000}
        compact={true}
      />
    );

    await waitFor(() => {
      expect(esiApi.getMarketHistory).toHaveBeenCalledWith(10000002, 34);
      expect(useCache.setCached).toHaveBeenCalledWith(
        'volume_history_10000002_34',
        mockHistoryData
      );
    });
  });

  it('should handle API errors gracefully', async () => {
    useCache.getCached.mockResolvedValue(null);
    esiApi.getMarketHistory.mockRejectedValue(new Error('API Error'));

    render(
      <VolumeTrendIndicator
        typeId={34}
        regionId={10000002}
        currentVolume={1000}
        compact={true}
      />
    );

    await waitFor(() => {
      // Should fall back to showing just the volume without trend
      expect(screen.getByText('1.0K')).toBeInTheDocument();
    });
  });

  it('should not fetch data if typeId or regionId is missing', () => {
    render(
      <VolumeTrendIndicator
        typeId={null}
        regionId={10000002}
        currentVolume={1000}
        compact={true}
      />
    );

    expect(useCache.getCached).not.toHaveBeenCalled();
    expect(esiApi.getMarketHistory).not.toHaveBeenCalled();
  });
});

describe('VolumeStats', () => {
  const mockData = [
    { volume: 10 },
    { volume: 50 },
    { volume: 150 },
    { volume: 300 },
    { volume: 800 },
  ];

  it('should render volume statistics', () => {
    render(<VolumeStats data={mockData} />);

    expect(screen.getByText('Volume Statistics')).toBeInTheDocument();
    expect(screen.getByText('Total Volume')).toBeInTheDocument();
    expect(screen.getByText('Avg Volume')).toBeInTheDocument();
    expect(screen.getByText('Max Volume')).toBeInTheDocument();
  });

  it('should calculate correct statistics', () => {
    render(<VolumeStats data={mockData} />);

    // Total: 10 + 50 + 150 + 300 + 800 = 1310
    expect(screen.getByText('1,310')).toBeInTheDocument();

    // Average: 1310 / 5 = 262
    expect(screen.getByText('262')).toBeInTheDocument();

    // Max: 800
    expect(screen.getByText('800')).toBeInTheDocument();
  });

  it('should show distribution across tiers', () => {
    render(<VolumeStats data={mockData} />);

    expect(screen.getByText('Dead')).toBeInTheDocument();
    expect(screen.getByText('Slow')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Busy')).toBeInTheDocument();
    expect(screen.getByText('Hot')).toBeInTheDocument();
  });

  it('should handle empty data', () => {
    render(<VolumeStats data={[]} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Analyzing 0 items')).toBeInTheDocument();
  });

  it('should use custom volume key', () => {
    const customData = [
      { customVol: 100 },
      { customVol: 200 },
    ];

    render(<VolumeStats data={customData} volumeKey="customVol" />);

    // Total: 300
    expect(screen.getByText('300')).toBeInTheDocument();
  });
});
