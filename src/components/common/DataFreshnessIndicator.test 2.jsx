import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DataFreshnessIndicator } from './DataFreshnessIndicator';

describe('DataFreshnessIndicator', () => {
  it('renders without crashing', () => {
    render(<DataFreshnessIndicator lastUpdated={new Date()} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays "just now" for a recent date', () => {
    render(<DataFreshnessIndicator lastUpdated={new Date()} />);
    expect(screen.getByText('Updated just now')).toBeInTheDocument();
  });

  it('displays a warning icon for stale data', () => {
    const staleDate = new Date(Date.now() - 20 * 60 * 1000);
    render(<DataFreshnessIndicator lastUpdated={staleDate} />);
    expect(screen.getByText('Updated 20 minutes ago')).toBeInTheDocument();
  });

  it('shows a refreshing state', () => {
    const onRefresh = vi.fn();
    render(<DataFreshnessIndicator lastUpdated={new Date()} isRefreshing onRefresh={onRefresh} />);
    expect(screen.getByRole('status')).toBeDisabled();
  });

  it('calls onRefresh when clicked', () => {
    const onRefresh = vi.fn();
    render(<DataFreshnessIndicator lastUpdated={new Date()} onRefresh={onRefresh} />);
    fireEvent.click(screen.getByRole('status'));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('does not call onRefresh when refreshing', () => {
    const onRefresh = vi.fn();
    render(<DataFreshnessIndicator lastUpdated={new Date()} onRefresh={onRefresh} isRefreshing />);
    fireEvent.click(screen.getByRole('status'));
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('displays countdown when auto-refreshing', () => {
    render(<DataFreshnessIndicator lastUpdated={new Date()} autoRefresh refreshInterval={15000} />);
    expect(screen.getByText('Refreshing in 15s')).toBeInTheDocument();
  });

  it('calls onRefresh after countdown', () => {
    vi.useFakeTimers();
    const onRefresh = vi.fn();
    render(<DataFreshnessIndicator lastUpdated={new Date()} autoRefresh refreshInterval={15000} onRefresh={onRefresh} />);
    act(() => {
      vi.advanceTimersByTime(15000);
    });
    expect(onRefresh).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('renders in compact mode', () => {
    render(<DataFreshnessIndicator lastUpdated={new Date()} compact />);
    expect(screen.queryByText(/Updated/)).not.toBeInTheDocument();
  });
});