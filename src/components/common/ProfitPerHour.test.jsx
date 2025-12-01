import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfitPerHour } from './ProfitPerHour';

describe('ProfitPerHour', () => {
  const mockTrade = {
    Volume: 100,
    'Profit per Unit': 10000,
    'Buy Price': 100000,
    'Net Profit': 1000000,
  };

  it('renders inline mode by default', () => {
    render(<ProfitPerHour trade={mockTrade} />);
    expect(screen.getByText(/\/h/)).toBeInTheDocument();
  });

  it('shows details when clicked in inline mode', () => {
    render(<ProfitPerHour trade={mockTrade} inline={true} />);
    const container = screen.getByText(/\/h/).closest('div');
    fireEvent.click(container);
    expect(screen.getByText('ROI:')).toBeInTheDocument();
  });

  it('renders expanded mode with all metrics', () => {
    render(<ProfitPerHour trade={mockTrade} inline={false} />);
    expect(screen.getByText('Profit Efficiency')).toBeInTheDocument();
    expect(screen.getByText('Estimated Profit/Hour')).toBeInTheDocument();
    expect(screen.getByText('ROI')).toBeInTheDocument();
    expect(screen.getByText('Capital Required')).toBeInTheDocument();
  });

  it('displays star rating', () => {
    render(<ProfitPerHour trade={mockTrade} />);
    const stars = screen.getAllByText('★');
    expect(stars.length).toBe(5);
  });

  it('handles zero values gracefully', () => {
    const zeroTrade = {
      Volume: 0,
      'Profit per Unit': 0,
      'Buy Price': 0,
      'Net Profit': 0,
    };
    render(<ProfitPerHour trade={zeroTrade} />);
    expect(screen.getByText(/0.*\/h/)).toBeInTheDocument();
  });

  it('respects custom options', () => {
    const options = {
      assumedTurnover: 0.3,
      hoursPerDay: 24,
    };
    render(<ProfitPerHour trade={mockTrade} inline={false} options={options} />);
    expect(screen.getByText(/30%/)).toBeInTheDocument();
  });
});
