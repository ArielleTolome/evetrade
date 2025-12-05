import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Breadcrumb } from './Breadcrumb';
import '@testing-library/jest-dom';

describe('Breadcrumb', () => {
  it('renders the breadcrumb items', () => {
    const items = [
      { label: 'Category', href: '/category' },
      { label: 'Subcategory' },
    ];
    render(
      <MemoryRouter>
        <Breadcrumb items={items} />
      </MemoryRouter>
    );

    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Subcategory')).toBeInTheDocument();
  });

  it('collapses items when they exceed maxItems', () => {
    const items = [
      { label: 'Item 1', href: '/item1' },
      { label: 'Item 2', href: '/item2' },
      { label: 'Item 3', href: '/item3' },
      { label: 'Item 4', href: '/item4' },
      { label: 'Current' },
    ];
    render(
      <MemoryRouter>
        <Breadcrumb items={items} maxItems={4} />
      </MemoryRouter>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.queryByText('Item 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Item 3')).not.toBeInTheDocument();
    expect(screen.getByText('Item 4')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('does not render a leading separator when homeIcon is not present', () => {
    const items = [{ label: 'First' }];
    const { container } = render(
      <MemoryRouter>
        <Breadcrumb items={items} homeIcon={null} separator=">" />
      </MemoryRouter>
    );
    const separator = container.querySelector('.text-sea-separator');
    expect(separator).not.toBeInTheDocument();
  });
});
