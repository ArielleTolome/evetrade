import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Modal, useModal } from './Modal';
import { Button } from './Button';

// Mock IntersectionObserver for JSDOM environment
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
vi.stubGlobal('IntersectionObserver', mockIntersectionObserver);

// Test component using useModal hook
function TestModalComponent({ onClose, ...modalProps }) {
  const { isOpen, open, close, toggle } = useModal();

  const handleClose = () => {
    close();
    onClose?.();
  };

  return (
    <div>
      <button onClick={open} data-testid="open-button">
        Open Modal
      </button>
      <button onClick={close} data-testid="close-button">
        Close Modal
      </button>
      <button onClick={toggle} data-testid="toggle-button">
        Toggle Modal
      </button>
      <Modal isOpen={isOpen} onClose={handleClose} {...modalProps}>
        <div data-testid="modal-content">Modal Content</div>
      </Modal>
    </div>
  );
}

describe('Modal Component', () => {

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={vi.fn()}>
          Content
        </Modal>
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          Content
        </Modal>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should render with title', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          Content
        </Modal>
      );
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('should render children', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <div data-testid="test-content">Test Content</div>
        </Modal>
      );
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });
  });

  describe('Modal Sizes', () => {
    const sizeMap = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-[95vw]',
    };

    Object.entries(sizeMap).forEach(([size, className]) => {
      it(`should apply ${size} size classes`, () => {
        render(
          <Modal isOpen={true} onClose={vi.fn()} size={size}>
            Content
          </Modal>
        );
        expect(screen.getByTestId('modal-container')).toHaveClass(className);
      });
    });
  });

  describe('Animation Prop', () => {
    const animations = ['fade', 'slide-up', 'slide-down', 'slide-right', 'scale'];
    const animationMap = {
      fade: 'animate-modal-fade-in',
      'slide-up': 'animate-modal-slide-up-in',
      'slide-down': 'animate-modal-slide-down-in',
      'slide-right': 'animate-modal-slide-right-in',
      scale: 'animate-modal-scale-in',
    };
    animations.forEach((animation) => {
      it(`should apply correct enter animation for '${animation}'`, () => {
        render(<Modal isOpen={true} onClose={() => {}} animation={animation}>Content</Modal>);
        expect(screen.getByTestId('modal-container')).toHaveClass(animationMap[animation]);
      });
    });
  });

  describe('Fullscreen Prop', () => {
    it('should apply fullscreen classes when fullscreen is true', () => {
      render(<Modal isOpen={true} onClose={() => {}} fullscreen={true}>Content</Modal>);
      expect(screen.getByTestId('modal-container')).toHaveClass('h-full', 'w-full', 'max-w-full');
    });
  });

  describe('Exit Animations', () => {
    it('should apply exit animation and unmount after delay', () => {
      const { rerender } = render(<Modal isOpen={true} onClose={() => {}} animation="fade">Content</Modal>);
      expect(screen.getByTestId('modal-container')).toHaveClass('animate-modal-fade-in');

      rerender(<Modal isOpen={false} onClose={() => {}} animation="fade">Content</Modal>);

      expect(screen.getByTestId('modal-container')).toHaveClass('animate-modal-fade-out');

      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Close Behavior', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose} title="Test">
          Content
        </Modal>
      );
      fireEvent.click(screen.getByLabelText('Close modal'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', () => {
      const onClose = vi.fn();
      render(<Modal isOpen={true} onClose={onClose}>Content</Modal>);
      fireEvent.click(screen.getByRole('dialog'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not close on backdrop click when closeOnBackdrop is false', () => {
      const onClose = vi.fn();
      render(<Modal isOpen={true} onClose={onClose} closeOnBackdrop={false}>Content</Modal>);
      fireEvent.click(screen.getByRole('dialog'));
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should call onClose when Escape key is pressed', () => {
      const onClose = vi.fn();
      render(<Modal isOpen={true} onClose={onClose}>Content</Modal>);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not close on Escape when closeOnEscape is false', () => {
      const onClose = vi.fn();
      render(<Modal isOpen={true} onClose={onClose} closeOnEscape={false}>Content</Modal>);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should hide close button when showCloseButton is false', () => {
      render(<Modal isOpen={true} onClose={vi.fn()} showCloseButton={false}>Content</Modal>);
      expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
    });
  });

  describe('Sub-components', () => {
    it('should render Modal.Header', () => {
      render(<Modal isOpen={true} onClose={vi.fn()}><Modal.Header><div data-testid="header-content">Header</div></Modal.Header></Modal>);
      expect(screen.getByTestId('header-content')).toBeInTheDocument();
    });

    it('should render Modal.Title', () => {
      render(<Modal isOpen={true} onClose={vi.fn()}><Modal.Header><Modal.Title>Test Title</Modal.Title></Modal.Header></Modal>);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should render Modal.Body', () => {
      render(<Modal isOpen={true} onClose={vi.fn()}><Modal.Body><div data-testid="body-content">Body Content</div></Modal.Body></Modal>);
      expect(screen.getByTestId('body-content')).toBeInTheDocument();
    });

    it('should render Modal.Footer', () => {
      render(<Modal isOpen={true} onClose={vi.fn()}><Modal.Footer><div data-testid="footer-content">Footer</div></Modal.Footer></Modal>);
      expect(screen.getByTestId('footer-content')).toBeInTheDocument();
    });
  });

  describe('Body Scroll Lock', () => {
    it('should lock body scroll when modal opens', () => {
      const { rerender } = render(<Modal isOpen={false} onClose={vi.fn()}>Content</Modal>);
      expect(document.body.style.overflow).toBe('');
      rerender(<Modal isOpen={true} onClose={vi.fn()}>Content</Modal>);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should unlock body scroll when modal closes', () => {
      const { rerender } = render(<Modal isOpen={true} onClose={vi.fn()}>Content</Modal>);
      expect(document.body.style.overflow).toBe('hidden');
      rerender(<Modal isOpen={false} onClose={vi.fn()}>Content</Modal>);
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('useModal Hook', () => {
    it('should initialize with closed state by default', () => {
      render(<TestModalComponent />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should open modal when open is called', () => {
      render(<TestModalComponent />);
      act(() => {
        fireEvent.click(screen.getByTestId('open-button'));
      });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should close modal when close is called', () => {
      render(<TestModalComponent />);
      act(() => {
        fireEvent.click(screen.getByTestId('open-button'));
      });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      act(() => {
        fireEvent.click(screen.getByTestId('close-button'));
      });
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should toggle modal state', () => {
      render(<TestModalComponent />);
      const toggleButton = screen.getByTestId('toggle-button');
      act(() => {
        fireEvent.click(toggleButton);
      });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      act(() => {
        fireEvent.click(toggleButton);
      });
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should accept initial state', () => {
      const TestWithInitialState = () => {
        const { isOpen, close } = useModal(true);
        return <Modal isOpen={isOpen} onClose={close}>Content</Modal>;
      };
      render(<TestWithInitialState />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Modal isOpen={true} onClose={vi.fn()} title="Test Modal">Content</Modal>);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('should trap focus within modal', async () => {
        vi.useRealTimers();
        render(
            <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
            <Modal.Body>
                <button>Button 1</button>
                <input />
            </Modal.Body>
            </Modal>
        );
        await waitFor(() => {
            expect(screen.getByRole('dialog')).toContainElement(document.activeElement);
        });
        vi.useFakeTimers();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      render(<Modal isOpen={true} onClose={vi.fn()} className="custom-class">Content</Modal>);
      expect(screen.getByTestId('modal-container')).toHaveClass('custom-class');
    });

    it('should apply custom backdropClassName', () => {
      render(<Modal isOpen={true} onClose={vi.fn()} backdropClassName="custom-backdrop">Content</Modal>);
      expect(screen.getByRole('dialog')).toHaveClass('custom-backdrop');
    });
  });

  describe('Complex Usage', () => {
    it('should work with form submission', () => {
      const onSubmit = vi.fn((e) => e.preventDefault());
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <form onSubmit={onSubmit}>
            <input type="text" />
            <button type="submit">Submit</button>
          </form>
        </Modal>
      );
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
      expect(onSubmit).toHaveBeenCalled();
    });

    it('should handle multiple buttons in footer', () => {
      const onCancel = vi.fn();
      const onConfirm = vi.fn();
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Footer>
            <button onClick={onCancel}>Cancel</button>
            <button onClick={onConfirm}>Confirm</button>
          </Modal.Footer>
        </Modal>
      );
      fireEvent.click(screen.getByText('Cancel'));
      expect(onCancel).toHaveBeenCalled();
      fireEvent.click(screen.getByText('Confirm'));
      expect(onConfirm).toHaveBeenCalled();
    });
  });
});
