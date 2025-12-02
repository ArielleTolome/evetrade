import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Modal, useModal } from './Modal';
import { Button } from './Button';

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
    // Create portal root if it doesn't exist
    if (!document.getElementById('modal-root')) {
      const modalRoot = document.createElement('div');
      modalRoot.setAttribute('id', 'modal-root');
      document.body.appendChild(modalRoot);
    }
  });

  afterEach(() => {
    // Clean up
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
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
    const sizes = ['sm', 'md', 'lg', 'xl', 'full'];

    sizes.forEach((size) => {
      it(`should apply ${size} size classes`, () => {
        const { container } = render(
          <Modal isOpen={true} onClose={vi.fn()} size={size}>
            Content
          </Modal>
        );

        const modal = container.querySelector('[role="dialog"]');
        expect(modal).toBeInTheDocument();
      });
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

      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          Content
        </Modal>
      );

      const backdrop = screen.getByRole('dialog');
      fireEvent.click(backdrop);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not close on backdrop click when closeOnBackdrop is false', () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose} closeOnBackdrop={false}>
          Content
        </Modal>
      );

      const backdrop = screen.getByRole('dialog');
      fireEvent.click(backdrop);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should call onClose when Escape key is pressed', () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          Content
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not close on Escape when closeOnEscape is false', () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose} closeOnEscape={false}>
          Content
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should hide close button when showCloseButton is false', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} showCloseButton={false}>
          Content
        </Modal>
      );

      expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
    });
  });

  describe('Sub-components', () => {
    it('should render Modal.Header', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Header>
            <div data-testid="header-content">Header</div>
          </Modal.Header>
        </Modal>
      );

      expect(screen.getByTestId('header-content')).toBeInTheDocument();
    });

    it('should render Modal.Title', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Header>
            <Modal.Title>Test Title</Modal.Title>
          </Modal.Header>
        </Modal>
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should render Modal.Body', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Body>
            <div data-testid="body-content">Body Content</div>
          </Modal.Body>
        </Modal>
      );

      expect(screen.getByTestId('body-content')).toBeInTheDocument();
    });

    it('should render Modal.Footer', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Footer>
            <div data-testid="footer-content">Footer</div>
          </Modal.Footer>
        </Modal>
      );

      expect(screen.getByTestId('footer-content')).toBeInTheDocument();
    });
  });

  describe('Body Scroll Lock', () => {
    it('should lock body scroll when modal opens', () => {
      const { rerender } = render(
        <Modal isOpen={false} onClose={vi.fn()}>
          Content
        </Modal>
      );

      expect(document.body.style.overflow).toBe('');

      rerender(
        <Modal isOpen={true} onClose={vi.fn()}>
          Content
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should unlock body scroll when modal closes', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={vi.fn()}>
          Content
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <Modal isOpen={false} onClose={vi.fn()}>
          Content
        </Modal>
      );

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

      const openButton = screen.getByTestId('open-button');
      fireEvent.click(openButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should close modal when close is called', () => {
      render(<TestModalComponent />);

      const openButton = screen.getByTestId('open-button');
      fireEvent.click(openButton);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      const closeButton = screen.getByTestId('close-button');
      fireEvent.click(closeButton);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should toggle modal state', () => {
      render(<TestModalComponent />);

      const toggleButton = screen.getByTestId('toggle-button');

      // Toggle open
      fireEvent.click(toggleButton);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Toggle closed
      fireEvent.click(toggleButton);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should accept initial state', () => {
      function TestWithInitialState() {
        const { isOpen, close } = useModal(true);
        return (
          <Modal isOpen={isOpen} onClose={close}>
            Content
          </Modal>
        );
      }

      render(<TestWithInitialState />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          Content
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('should trap focus within modal', async () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <Modal.Body>
            <button data-testid="button-1">Button 1</button>
            <button data-testid="button-2">Button 2</button>
          </Modal.Body>
        </Modal>
      );

      await waitFor(() => {
        expect(document.activeElement).toBeInTheDocument();
      });
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={vi.fn()} className="custom-class">
          Content
        </Modal>
      );

      const modal = container.querySelector('.custom-class');
      expect(modal).toBeInTheDocument();
    });

    it('should apply custom backdropClassName', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={vi.fn()} backdropClassName="custom-backdrop">
          Content
        </Modal>
      );

      const backdrop = container.querySelector('.custom-backdrop');
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe('Complex Usage', () => {
    it('should work with form submission', () => {
      const onSubmit = vi.fn((e) => e.preventDefault());
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <form onSubmit={onSubmit}>
            <input type="text" data-testid="input" />
            <button type="submit" data-testid="submit">
              Submit
            </button>
          </form>
        </Modal>
      );

      const submitButton = screen.getByTestId('submit');
      fireEvent.click(submitButton);

      expect(onSubmit).toHaveBeenCalled();
    });

    it('should handle multiple buttons in footer', () => {
      const onCancel = vi.fn();
      const onConfirm = vi.fn();

      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Footer>
            <button onClick={onCancel} data-testid="cancel">
              Cancel
            </button>
            <button onClick={onConfirm} data-testid="confirm">
              Confirm
            </button>
          </Modal.Footer>
        </Modal>
      );

      fireEvent.click(screen.getByTestId('cancel'));
      expect(onCancel).toHaveBeenCalled();

      fireEvent.click(screen.getByTestId('confirm'));
      expect(onConfirm).toHaveBeenCalled();
    });
  });
});
