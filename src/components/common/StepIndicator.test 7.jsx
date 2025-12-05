import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import StepIndicator from './StepIndicator';

describe('StepIndicator', () => {
  const steps = [
    { label: 'Select Station', description: 'Choose source' },
    { label: 'Configure', description: 'Set parameters' },
    { label: 'Analyze', description: 'View results' },
  ];

  it('renders without crashing', () => {
    render(<StepIndicator steps={steps} currentStep={0} />);
    expect(screen.getByText('Select Station')).toBeInTheDocument();
    expect(screen.getByText('Configure')).toBeInTheDocument();
    expect(screen.getByText('Analyze')).toBeInTheDocument();
  });

  it('highlights the current step', () => {
    const { container } = render(<StepIndicator steps={steps} currentStep={1} />);
    const activeStepLabel = screen.getByText('Configure');
    // check if the parent has text-white, which indicates active state
    expect(activeStepLabel).toHaveClass('text-white');
  });

  it('shows completed steps with a checkmark', () => {
    const { container } = render(<StepIndicator steps={steps} currentStep={1} />);
    const completedStep = screen.getByText('Select Station').closest('div[class^="flex items-center"]');
    // This is a bit brittle, but we are looking for an SVG which would be a child
    expect(completedStep.querySelector('svg')).not.toBeNull();
  });
});
