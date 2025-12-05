import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FormattedNumber from './FormattedNumber';

vi.mock('../../utils/numberFormat', async () => {
  const actual = await vi.importActual('../../utils/numberFormat');
  return { ...actual };
});

describe('FormattedNumber Component', () => {
  it('renders a standard number correctly', () => {
    render(<FormattedNumber value={12345} format="number" decimals={0} />);
    expect(screen.getByText('12,345')).toBeInTheDocument();
  });

  it('renders ISK format correctly', () => {
    render(<FormattedNumber value={50000000} format="isk" decimals={2} />);
    expect(screen.getByText('50,000,000.00')).toBeInTheDocument();
    expect(screen.getByText(/ISK/)).toBeInTheDocument();
  });

  it('renders compact ISK format with ISK suffix', () => {
    render(<FormattedNumber value={1230000000} format="isk" compact decimals={2} />);
    expect(screen.getByText('1.23')).toBeInTheDocument();
    expect(screen.getByText(/B ISK/)).toBeInTheDocument();
  });

  it('honors the custom suffix prop for ISK format', () => {
    render(<FormattedNumber value={1230000000} format="isk" compact decimals={2} suffix=" Credits" />);
    expect(screen.getByText('1.23')).toBeInTheDocument();
    expect(screen.getByText(/B Credits/)).toBeInTheDocument();
    expect(screen.queryByText(/ISK/)).not.toBeInTheDocument();
  });


  it('renders percentage format correctly', () => {
    render(<FormattedNumber value={0.456} format="percent" decimals={1} />);
    expect(screen.getByText('45.6%')).toBeInTheDocument();
  });

  it('renders percentage with a sign', () => {
    render(<FormattedNumber value={0.456} format="percent" decimals={1} showSign />);
    expect(screen.getByText('+45.6%')).toBeInTheDocument();
  });

  it('applies colorization for positive values', () => {
    const { container } = render(<FormattedNumber value={100} colorize />);
    expect(container.firstChild).toHaveStyle('color: rgb(0, 255, 157)');
  });

  it('applies colorization for negative values', () => {
    const { container } = render(<FormattedNumber value={-100} colorize />);
    expect(container.firstChild).toHaveStyle('color: rgb(215, 48, 0)');
  });

  it('handles null values gracefully', () => {
    render(<FormattedNumber value={null} />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('handles NaN values gracefully', () => {
    render(<FormattedNumber value={NaN} />);
    expect(screen.getByText('Invalid')).toBeInTheDocument();
  });
});
