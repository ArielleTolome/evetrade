import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Badge, StatusBadge, BadgeGroup } from './Badge';

describe('Badge Component', () => {
  it('renders badge with text', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('applies correct color classes', () => {
    const { container } = render(<Badge color="green">Green Badge</Badge>);
    const badge = container.firstChild;
    expect(badge.className).toContain('text-green-400');
  });

  it('applies correct variant classes', () => {
    const { container } = render(<Badge variant="outline">Outline Badge</Badge>);
    const badge = container.firstChild;
    expect(badge.className).toContain('bg-transparent');
  });

  it('applies correct size classes', () => {
    const { container } = render(<Badge size="lg">Large Badge</Badge>);
    const badge = container.firstChild;
    expect(badge.className).toContain('px-3');
  });

  it('shows dot indicator when dot prop is true', () => {
    const { container } = render(<Badge dot>With Dot</Badge>);
    const dot = container.querySelector('.rounded-full');
    expect(dot).toBeInTheDocument();
  });

  it('applies pulse animation when pulse prop is true', () => {
    const { container } = render(<Badge dot pulse>Pulsing</Badge>);
    const dot = container.querySelector('.animate-pulse');
    expect(dot).toBeInTheDocument();
  });

  it('renders icon on left by default', () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>;
    render(
      <Badge icon={<TestIcon />} iconPosition="left">
        With Icon
      </Badge>
    );
    const badge = screen.getByText('With Icon').parentElement;
    const icon = screen.getByTestId('test-icon');
    expect(badge.children[0]).toContain(icon);
  });

  it('renders icon on right when specified', () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>;
    render(
      <Badge icon={<TestIcon />} iconPosition="right">
        With Icon
      </Badge>
    );
    const badge = screen.getByText('With Icon').parentElement;
    const icon = screen.getByTestId('test-icon');
    // Icon should be after the text
    const children = Array.from(badge.children);
    const textIndex = children.findIndex((child) => child.textContent === 'With Icon');
    const iconIndex = children.findIndex((child) => child.contains(icon));
    expect(iconIndex).toBeGreaterThan(textIndex);
  });

  it('calls onRemove when close button is clicked', () => {
    const handleRemove = vi.fn();
    render(<Badge onRemove={handleRemove}>Removable</Badge>);
    const closeButton = screen.getByLabelText('Remove');
    fireEvent.click(closeButton);
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });

  it('applies pill class when pill prop is true', () => {
    const { container } = render(<Badge pill>Pill Badge</Badge>);
    const badge = container.firstChild;
    expect(badge.className).toContain('rounded-full');
  });

  it('applies custom className', () => {
    const { container } = render(<Badge className="custom-class">Custom</Badge>);
    const badge = container.firstChild;
    expect(badge.className).toContain('custom-class');
  });

  it('sets title attribute when provided', () => {
    const { container } = render(<Badge title="Custom Title">Badge</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveAttribute('title', 'Custom Title');
  });
});

describe('StatusBadge Component', () => {
  it('renders active status correctly', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders pending status correctly', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders completed status correctly', () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders failed status correctly', () => {
    render(<StatusBadge status="failed" />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('renders expired status correctly', () => {
    render(<StatusBadge status="expired" />);
    expect(screen.getByText('Expired')).toBeInTheDocument();
  });

  it('hides label when showLabel is false', () => {
    render(<StatusBadge status="active" showLabel={false} />);
    expect(screen.queryByText('Active')).not.toBeInTheDocument();
  });

  it('applies correct color for active status', () => {
    const { container } = render(<StatusBadge status="active" />);
    const badge = container.firstChild;
    expect(badge.className).toContain('text-green-400');
  });

  it('applies pulse animation for active status', () => {
    const { container } = render(<StatusBadge status="active" />);
    const dot = container.querySelector('.animate-pulse');
    expect(dot).toBeInTheDocument();
  });

  it('applies correct size', () => {
    const { container } = render(<StatusBadge status="active" size="lg" />);
    const badge = container.firstChild;
    expect(badge.className).toContain('px-3');
  });
});

describe('BadgeGroup Component', () => {
  it('renders multiple badges', () => {
    render(
      <BadgeGroup>
        <Badge>Badge 1</Badge>
        <Badge>Badge 2</Badge>
        <Badge>Badge 3</Badge>
      </BadgeGroup>
    );
    expect(screen.getByText('Badge 1')).toBeInTheDocument();
    expect(screen.getByText('Badge 2')).toBeInTheDocument();
    expect(screen.getByText('Badge 3')).toBeInTheDocument();
  });

  it('applies wrap class by default', () => {
    const { container } = render(
      <BadgeGroup>
        <Badge>Badge 1</Badge>
      </BadgeGroup>
    );
    const group = container.firstChild;
    expect(group.className).toContain('flex-wrap');
  });

  it('removes wrap class when wrap is false', () => {
    const { container } = render(
      <BadgeGroup wrap={false}>
        <Badge>Badge 1</Badge>
      </BadgeGroup>
    );
    const group = container.firstChild;
    expect(group.className).not.toContain('flex-wrap');
  });

  it('applies custom className', () => {
    const { container } = render(
      <BadgeGroup className="custom-group">
        <Badge>Badge 1</Badge>
      </BadgeGroup>
    );
    const group = container.firstChild;
    expect(group.className).toContain('custom-group');
  });
});
