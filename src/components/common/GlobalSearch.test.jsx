import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import GlobalSearch from './GlobalSearch';

describe('GlobalSearch', () => {
  const onSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderComponent = () => render(
    <GlobalSearch onSelect={onSelect} />
  );

  it('renders with placeholder', () => {
    renderComponent();
    expect(screen.getByPlaceholderText(/search items, stations, or features/i)).toBeInTheDocument();
  });

  it('searches across multiple categories', async () => {
    renderComponent();
    const input = screen.getByPlaceholderText(/search items, stations, or features/i);
    fireEvent.change(input, { target: { value: 'ita' } });

    await waitFor(() => {
      expect(screen.getByText(/Tritanium/i)).toBeInTheDocument();
      expect(screen.getByText(/Jita IV-4/i)).toBeInTheDocument();
    });
  });

  it('shows recent searches on focus', () => {
    localStorage.setItem('evetrade_recent_searches', JSON.stringify([{ id: 1, name: 'Tritanium', category: 'items' }]));
    renderComponent();
    const input = screen.getByPlaceholderText(/search items, stations, or features/i);
    fireEvent.focus(input);
    expect(screen.getByText('Recent Searches')).toBeInTheDocument();
    expect(screen.getByText('Tritanium')).toBeInTheDocument();
  });

  it('handles keyboard navigation', async () => {
    renderComponent();
    const input = screen.getByPlaceholderText(/search items, stations, or features/i);
    fireEvent.change(input, { target: { value: 'ita' } });

    await screen.findByText('Tritanium');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'Tritanium' }));
  });

  it('opens with Ctrl+K shortcut', () => {
    renderComponent();
    const input = screen.getByPlaceholderText(/search items, stations, or features/i);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(document.activeElement).toBe(input);
  });
});
