import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Carousel from './Carousel';
import { useMediaQuery } from 'react-responsive';

// Mock react-responsive
vi.mock('react-responsive', () => ({
  useMediaQuery: vi.fn(),
}));

describe('Carousel', () => {
  const items = [
    <div key={1}>Slide 1</div>,
    <div key={2}>Slide 2</div>,
    <div key={3}>Slide 3</div>,
    <div key={4}>Slide 4</div>,
    <div key={5}>Slide 5</div>,
  ];

  // Mock scrollTo
  window.HTMLElement.prototype.scrollTo = vi.fn();

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    useMediaQuery.mockReturnValue(true); // Default to desktop
  });

  it('renders children correctly', () => {
    render(<Carousel>{items}</Carousel>);
    expect(screen.getByText('Slide 1')).toBeInTheDocument();
    expect(screen.getByText('Slide 5')).toBeInTheDocument();
  });

  it('shows the correct number of dots for desktop', () => {
    render(<Carousel slidesToShow={{ mobile: 1, tablet: 2, desktop: 3 }}>{items}</Carousel>);
    const dots = screen.getAllByRole('button', { name: /go to slide/i });
    // 5 slides / 3 per page = 2 pages
    expect(dots.length).toBe(2);
  });

  it('changes slide on dot click', () => {
    render(<Carousel slidesToShow={{ mobile: 1, tablet: 2, desktop: 3 }}>{items}</Carousel>);
    const dot2 = screen.getByRole('button', { name: /go to slide 2/i });
    fireEvent.click(dot2);
    expect(window.HTMLElement.prototype.scrollTo).toHaveBeenCalled();
  });

  it('hides arrows on mobile', () => {
    useMediaQuery.mockReturnValue(false); // mobile
    render(<Carousel showArrows={true}>{items}</Carousel>);
    const prevButton = screen.queryByLabelText('Previous slide');
    const nextButton = screen.queryByLabelText('Next slide');
    expect(prevButton).not.toBeInTheDocument();
    expect(nextButton).not.toBeInTheDocument();
  });
});
