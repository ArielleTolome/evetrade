import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Modal, useModal } from './Modal';

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
    // Mock IntersectionObserver
    const IntersectionObserverMock = vi.fn(() => ({
      disconnect: vi.fn(),
      observe: vi.fn(),
      unobserve: vi.fn(),
    }));
    window.IntersectionObserver = IntersectionObserverMock;
  });

  afterEach(() => {
    cleanup();
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

    it('should render when isOpen is true', async () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          Content
        </Modal>
      );
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('should render with title', async () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          Content
        </Modal>
      );
      expect(await screen.findByText('Test Modal')).toBeInTheDocument();
    });

    it('should render children', async () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <div data-testid="test-content">Test Content</div>
        </Modal>
      );
      expect(await screen.findByTestId('test-content')).toBeInTheDocument();
    });
  });

  describe('Close Behavior', () => {
    it('should call onClose when close button is clicked', async () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose} title="Test">
          Content
        </Modal>
      );
      const closeButton = await screen.findByLabelText('Close modal');
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Escape key is pressed', async () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          Content
        </Modal>
      );
      await screen.findByRole('dialog');
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should hide close button when showCloseButton is false', async () => {
        render(
          <Modal isOpen={true} onClose={vi.fn()} showCloseButton={false} title="Test">
            Content
          </Modal>
        );
        await screen.findByRole('dialog');
        expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
      });
  });

  describe('Sub-components', () => {
    it('should render Modal.Header, Modal.Title, Modal.Body, and Modal.Footer', async () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Header>
            <Modal.Title>Test Title</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div data-testid="body-content">Body Content</div>
          </Modal.Body>
          <Modal.Footer>
            <div data-testid="footer-content">Footer</div>
          </Modal.Footer>
        </Modal>
      );
      expect(await screen.findByText('Test Title')).toBeInTheDocument();
      expect(screen.getByTestId('body-content')).toBeInTheDocument();
      expect(screen.getByTestId('footer-content')).toBeInTheDocument();
    });
  });

  describe('useModal Hook', () => {
    it('should initialize with closed state by default', () => {
      render(<TestModalComponent />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should open modal when open is called', async () => {
      render(<TestModalComponent />);
      const openButton = screen.getByTestId('open-button');
      fireEvent.click(openButton);
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('should close modal when close is called', async () => {
      render(<TestModalComponent />);

      const openButton = screen.getByTestId('open-button');
      fireEvent.click(openButton);
      await screen.findByRole('dialog');

      const closeButton = screen.getByTestId('close-button');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should toggle modal state', async () => {
      render(<TestModalComponent />);
      const toggleButton = screen.getByTestId('toggle-button');

      fireEvent.click(toggleButton);
      await screen.findByRole('dialog');

      fireEvent.click(toggleButton);
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Title>Test Modal</Modal.Title>
          Content
        </Modal>
      );
      const dialog = await screen.findByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');

      const title = screen.getByText('Test Modal');
      expect(dialog).toHaveAttribute('aria-labelledby', title.id);
    });
  });
});
