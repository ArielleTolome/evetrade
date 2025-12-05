import { render, screen } from '@testing-library/react';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';
import { describe, it, expect } from 'vitest';

describe('FormInput with floatingLabel', () => {
  it('should render with floating label styles', () => {
    render(<FormInput id="test" label="Test Label" floatingLabel />);
    const label = screen.getByText('Test Label');
    expect(label).toHaveClass('absolute');
  });

  it('should have classes to float the label on focus', () => {
    render(<FormInput id="test" label="Test Label" floatingLabel />);
    const label = screen.getByText('Test Label');
    expect(label).toHaveClass('peer-focus:scale-85', 'peer-focus:-translate-y-[120%]');
  });

  it('should float the label when a value is present', () => {
    render(<FormInput id="test" label="Test Label" value="test" floatingLabel />);
    const label = screen.getByText('Test Label');
    expect(label).toHaveClass('scale-85', '-translate-y-[120%]');
  });
});

describe('FormSelect with floatingLabel', () => {
  const options = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
  ];

  it('should render with floating label styles', () => {
    render(
      <FormSelect
        id="test"
        label="Test Label"
        options={options}
        floatingLabel
      />
    );
    const label = screen.getByText('Test Label');
    expect(label).toHaveClass('absolute');
  });

  it('should have classes to float the label on focus', () => {
    render(
      <FormSelect
        id="test"
        label="Test Label"
        options={options}
        floatingLabel
      />
    );
    const label = screen.getByText('Test Label');
    expect(label).toHaveClass('peer-focus:scale-85', 'peer-focus:-translate-y-[120%]');
  });

  it('should float the label when a value is selected', () => {
    render(
      <FormSelect
        id="test"
        label="Test Label"
        options={options}
        value="1"
        floatingLabel
      />
    );
    const label = screen.getByText('Test Label');
    expect(label).toHaveClass('scale-85', '-translate-y-[120%]');
  });
});
