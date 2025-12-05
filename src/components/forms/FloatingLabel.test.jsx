import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';
import { describe, it, expect } from 'vitest';

describe('FormInput with floating label', () => {
  const user = userEvent.setup();

  it('should render with non-floating label styles by default', () => {
    render(<FormInput id="test" label="Test Label" />);
    const label = screen.getByText('Test Label');
    expect(label).toHaveClass('absolute', 'top-1/2', '-translate-y-1/2', 'text-sm');
    expect(label).not.toHaveClass('top-1', 'text-xs');
  });

  it('should float the label on focus', async () => {
    render(<FormInput id="test" label="Test Label" />);
    const input = screen.getByLabelText('Test Label');
    const label = screen.getByText('Test Label');

    await user.click(input);

    expect(label).toHaveClass('top-1', 'text-xs');
    expect(label).not.toHaveClass('top-1/2', '-translate-y-1/2', 'text-sm');
  });

  it('should float the label when a value is present', () => {
    render(<FormInput id="test" label="Test Label" value="test" />);
    const label = screen.getByText('Test Label');
    expect(label).toHaveClass('top-1', 'text-xs');
    expect(label).not.toHaveClass('top-1/2', '-translate-y-1/2', 'text-sm');
  });
});

describe('FormSelect with floating label', () => {
  const user = userEvent.setup();
  const options = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
  ];

  it('should render with non-floating label styles by default', () => {
    render(
      <FormSelect
        id="test"
        label="Test Label"
        options={options}
      />
    );
    const label = screen.getByText('Test Label');
    expect(label).toHaveClass('absolute', 'top-1/2', '-translate-y-1/2', 'text-sm');
    expect(label).not.toHaveClass('top-1', 'text-xs');
  });

  it('should float the label on focus (when opened)', async () => {
    render(
      <FormSelect
        id="test"
        label="Test Label"
        options={options}
      />
    );
    const select = screen.getByLabelText('Test Label');
    const label = screen.getByText('Test Label');

    await user.click(select);

    expect(label).toHaveClass('top-1', 'text-xs');
    expect(label).not.toHaveClass('top-1/2', '-translate-y-1/2', 'text-sm');
  });

  it('should float the label when a value is selected', () => {
    render(
      <FormSelect
        id="test"
        label="Test Label"
        options={options}
        value="1"
      />
    );
    const label = screen.getByText('Test Label');
    expect(label).toHaveClass('top-1', 'text-xs');
    expect(label).not.toHaveClass('top-1/2', '-translate-y-1/2', 'text-sm');
  });
});
