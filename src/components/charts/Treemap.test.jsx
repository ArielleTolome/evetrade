import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Treemap from './Treemap';

const mockData = {
  name: 'Portfolio',
  children: [
    { name: 'Ships', value: 5000000000 },
    { name: 'Modules', value: 2000000000 },
    {
      name: 'Materials',
      value: 1500000000,
      children: [
        { name: 'Minerals', value: 1000000000 },
        { name: 'PI', value: 500000000 },
      ],
    },
  ],
};

const mockDataWithCustomLabel = {
  category: 'Portfolio',
  items: [
    { category: 'Ships', amount: 5000000000 },
    { category: 'Modules', amount: 2000000000 },
    {
      category: 'Materials',
      amount: 1500000000,
      items: [
        { category: 'Minerals', amount: 1000000000 },
        { category: 'PI', amount: 500000000 },
      ],
    },
  ],
};

// Update mock data to use the same structure as the component expects
const mockDataWithCustomLabelFixed = {
  category: 'Portfolio',
  children: mockDataWithCustomLabel.items.map(item => ({ ...item, value: item.amount, children: item.items?.map(i => ({...i, value: i.amount})) }))
};


describe('Treemap', () => {
  it('renders the correct number of initial cells', () => {
    render(<Treemap data={mockData} width={800} height={600} />);
    const cells = screen.getAllByRole('button');
    expect(cells).toHaveLength(mockData.children.length);
  });

  it('displays the correct labels for each cell', () => {
    render(<Treemap data={mockData} width={800} height={600} />);
    expect(screen.getByText('Ships')).toBeInTheDocument();
    expect(screen.getByText('Modules')).toBeInTheDocument();
    expect(screen.getByText('Materials')).toBeInTheDocument();
  });

  it('drills down when a cell with children is clicked', () => {
    render(<Treemap data={mockData} width={800} height={600} />);
    const materialsCell = screen.getByText('Materials');
    fireEvent.click(materialsCell);

    // After clicking, we should see the children of "Materials"
    expect(screen.getByText('Minerals')).toBeInTheDocument();
    expect(screen.getByText('PI')).toBeInTheDocument();

    // The original top-level items should no longer be visible
    expect(screen.queryByText('Ships')).not.toBeInTheDocument();
    expect(screen.queryByText('Modules')).not.toBeInTheDocument();
  });

  it('displays breadcrumbs after drilling down', () => {
    render(<Treemap data={mockData} width={800} height={600} />);
    const materialsCell = screen.getByText('Materials');
    fireEvent.click(materialsCell);

    const breadcrumb = screen.getByRole('navigation');
    expect(breadcrumb).toHaveTextContent('Portfolio');
    expect(breadcrumb).toHaveTextContent('Materials');
  });

  it('navigates up when a breadcrumb is clicked', () => {
    render(<Treemap data={mockData} width={800} height={600} />);
    const materialsCell = screen.getByText('Materials');
    fireEvent.click(materialsCell);

    const portfolioBreadcrumb = screen.getByText('Portfolio');
    fireEvent.click(portfolioBreadcrumb);

    // After navigating up, we should see the original top-level items again
    expect(screen.getByText('Ships')).toBeInTheDocument();
    expect(screen.getByText('Modules')).toBeInTheDocument();
    expect(screen.getByText('Materials')).toBeInTheDocument();
  });

  it('calls onSelect when a cell is clicked', () => {
    const onSelect = vi.fn();
    render(<Treemap data={mockData} width={800} height={600} onSelect={onSelect} />);
    const shipsCell = screen.getByText('Ships');
    fireEvent.click(shipsCell);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'Ships' }));
  });

  it('uses the custom labelField prop for labels and navigation', () => {
    const onSelect = vi.fn();
    render(
      <Treemap
        data={mockDataWithCustomLabelFixed}
        width={800}
        height={600}
        labelField="category"
        onSelect={onSelect}
      />
    );

    // Check for custom labels
    expect(screen.getByText('Ships')).toBeInTheDocument();
    expect(screen.getByText('Modules')).toBeInTheDocument();
    expect(screen.getByText('Materials')).toBeInTheDocument();

    // Test drill-down with custom labels
    const materialsCell = screen.getByText('Materials');
    fireEvent.click(materialsCell);
    expect(screen.getByText('Minerals')).toBeInTheDocument();
    expect(screen.getByText('PI')).toBeInTheDocument();

    // Test breadcrumbs with custom labels
    const breadcrumb = screen.getByRole('navigation');
    expect(breadcrumb).toHaveTextContent('Portfolio');
    expect(breadcrumb).toHaveTextContent('Materials');

    // Test navigating up with breadcrumbs and custom labels
    const portfolioBreadcrumb = screen.getByText('Portfolio');
    fireEvent.click(portfolioBreadcrumb);
    expect(screen.getByText('Ships')).toBeInTheDocument();
  });
});
