import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as ThemeContext from '../../../contexts/ThemeContext';
import { ThemeToggle } from '../../../components/common/ThemeToggle';

describe('ThemeToggle', () => {
  const mockToggleTheme = vi.fn();

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
    mockToggleTheme.mockClear();
  });

  it('renders the sun icon when the theme is dark', () => {
    vi.spyOn(ThemeContext, 'useTheme').mockReturnValue({
      isDark: true,
      toggleTheme: mockToggleTheme,
    });

    render(<ThemeToggle />);

    const button = screen.getByLabelText('Toggle theme');
    expect(button).toBeInTheDocument();
    expect(button.querySelector('.lucide-sun')).toBeInTheDocument();
    expect(button.querySelector('.lucide-moon')).not.toBeInTheDocument();
  });

  it('renders the moon icon when the theme is light', () => {
    vi.spyOn(ThemeContext, 'useTheme').mockReturnValue({
      isDark: false,
      toggleTheme: mockToggleTheme,
    });

    render(<ThemeToggle />);

    const button = screen.getByLabelText('Toggle theme');
    expect(button).toBeInTheDocument();
    expect(button.querySelector('.lucide-moon')).toBeInTheDocument();
    expect(button.querySelector('.lucide-sun')).not.toBeInTheDocument();
  });

  it('calls toggleTheme when clicked', () => {
    vi.spyOn(ThemeContext, 'useTheme').mockReturnValue({
      isDark: true,
      toggleTheme: mockToggleTheme,
    });

    render(<ThemeToggle />);

    const toggleButton = screen.getByLabelText('Toggle theme');
    fireEvent.click(toggleButton);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});
