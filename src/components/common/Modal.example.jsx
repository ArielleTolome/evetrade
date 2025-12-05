import React from 'react';
import { Modal, useModal } from './Modal';
import { Button } from './Button';

/**
 * Modal Component Examples
 * Demonstrates various modal configurations and use cases
 */
export function ModalExamples() {
  const simpleModal = useModal();
  const confirmModal = useModal();
  const formModal = useModal();
  const largeModal = useModal();
  const fullModal = useModal();
  const nestedModal = useModal();
  const noBackdropModal = useModal();
  const customModal = useModal();

  return (
    <div className="p-8 space-y-6 bg-space-black min-h-screen">
      <h1 className="text-3xl font-display font-bold text-text-primary mb-8">
        Modal Component Examples
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Simple Modal */}
        <Button onClick={simpleModal.open}>
          Simple Modal
        </Button>

        {/* Confirm Modal */}
        <Button onClick={confirmModal.open} variant="secondary">
          Confirm Dialog
        </Button>

        {/* Form Modal */}
        <Button onClick={formModal.open} variant="secondary">
          Form Modal
        </Button>

        {/* Large Modal */}
        <Button onClick={largeModal.open}>
          Large Modal
        </Button>

        {/* Full Screen Modal */}
        <Button onClick={fullModal.open}>
          Full Screen Modal
        </Button>

        {/* Nested Modal */}
        <Button onClick={nestedModal.open} variant="secondary">
          Nested Modal
        </Button>

        {/* No Backdrop Close */}
        <Button onClick={noBackdropModal.open}>
          No Backdrop Close
        </Button>

        {/* Custom Styled */}
        <Button onClick={customModal.open} variant="secondary">
          Custom Styled
        </Button>
      </div>

      {/* Simple Modal with Title */}
      <Modal
        isOpen={simpleModal.isOpen}
        onClose={simpleModal.close}
        title="Simple Modal"
        size="md"
      >
        <p className="text-text-secondary">
          This is a simple modal with automatic header and body layout.
          Just pass a title prop and your content!
        </p>
      </Modal>

      {/* Confirm Dialog */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.close}
        size="sm"
      >
        <Modal.Header>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-text-secondary">
            Are you sure you want to proceed with this action? This cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="ghost" onClick={confirmModal.close}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              alert('Action confirmed!');
              confirmModal.close();
            }}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Form Modal */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        title="Create New Trade"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert('Form submitted!');
            formModal.close();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Item Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-space-mid border border-white/10 rounded-lg text-text-primary focus:outline-none focus-visible:ring-2 focus:ring-accent-cyan"
              placeholder="Enter item name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Quantity
            </label>
            <input
              type="number"
              className="w-full px-4 py-2 bg-space-mid border border-white/10 rounded-lg text-text-primary focus:outline-none focus-visible:ring-2 focus:ring-accent-cyan"
              placeholder="Enter quantity"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Price per Unit
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full px-4 py-2 bg-space-mid border border-white/10 rounded-lg text-text-primary focus:outline-none focus-visible:ring-2 focus:ring-accent-cyan"
              placeholder="Enter price"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={formModal.close}>
              Cancel
            </Button>
            <Button type="submit">
              Create Trade
            </Button>
          </div>
        </form>
      </Modal>

      {/* Large Modal */}
      <Modal
        isOpen={largeModal.isOpen}
        onClose={largeModal.close}
        size="xl"
      >
        <Modal.Header>
          <Modal.Title>Large Modal with Scrollable Content</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p className="text-text-secondary">
              This is a large modal with plenty of content to demonstrate scrolling behavior.
            </p>
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="p-4 bg-space-mid rounded-lg border border-white/10"
              >
                <h3 className="font-display font-semibold text-text-primary mb-2">
                  Content Block {i + 1}
                </h3>
                <p className="text-text-secondary text-sm">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                  tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={largeModal.close}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Full Screen Modal */}
      <Modal
        isOpen={fullModal.isOpen}
        onClose={fullModal.close}
        size="full"
      >
        <Modal.Header>
          <Modal.Title>Full Screen Modal</Modal.Title>
        </Modal.Header>
        <Modal.Body className="flex-1">
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-2xl font-display font-bold text-text-primary mb-4">
                Full Screen Experience
              </h3>
              <p className="text-text-secondary max-w-md mx-auto">
                This modal takes up most of the screen, perfect for complex interfaces
                or data-heavy displays.
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={fullModal.close}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Nested Modal Demo */}
      <Modal
        isOpen={nestedModal.isOpen}
        onClose={nestedModal.close}
        title="First Modal"
        size="md"
      >
        <p className="text-text-secondary mb-4">
          This demonstrates modal stacking. Click the button below to open another modal.
        </p>
        <Button
          onClick={() => {
            alert('Nested modal opened! (Demonstration - implement a second modal for full effect)');
          }}
        >
          Open Second Modal
        </Button>
      </Modal>

      {/* No Backdrop Close Modal */}
      <Modal
        isOpen={noBackdropModal.isOpen}
        onClose={noBackdropModal.close}
        title="Important Notice"
        size="md"
        closeOnBackdrop={false}
        closeOnEscape={false}
      >
        <p className="text-text-secondary mb-4">
          This modal cannot be closed by clicking outside or pressing Escape.
          You must use the buttons below.
        </p>
        <div className="flex justify-end gap-3 pt-4">
          <Button onClick={noBackdropModal.close}>
            I Understand
          </Button>
        </div>
      </Modal>

      {/* Custom Styled Modal */}
      <Modal
        isOpen={customModal.isOpen}
        onClose={customModal.close}
        size="md"
        className="bg-gradient-to-br from-accent-purple/20 to-accent-cyan/20"
        backdropClassName="backdrop-blur-md"
        showCloseButton={false}
      >
        <Modal.Header className="bg-gradient-to-r from-accent-purple to-accent-cyan">
          <Modal.Title className="text-white">Custom Styled Modal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-text-secondary">
            This modal has custom styling with gradient backgrounds and custom colors.
            You can fully customize the appearance using className props.
          </p>
        </Modal.Body>
        <Modal.Footer className="bg-space-black/50">
          <Button onClick={customModal.close} variant="ghost">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

/**
 * Simple usage example
 */
export function SimpleModalExample() {
  const { isOpen, open, close } = useModal();

  return (
    <div className="p-8">
      <Button onClick={open}>Open Modal</Button>

      <Modal isOpen={isOpen} onClose={close} title="Hello World">
        <p className="text-text-secondary">
          This is the simplest way to use the Modal component!
        </p>
      </Modal>
    </div>
  );
}

/**
 * Programmatic control example
 */
export function ProgrammaticModalExample() {
  const modal = useModal();

  const handleAsyncAction = async () => {
    modal.open();
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Action completed!');
      modal.close();
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  return (
    <div className="p-8">
      <Button onClick={handleAsyncAction}>
        Perform Async Action
      </Button>

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Processing"
        closeOnBackdrop={false}
        closeOnEscape={false}
        showCloseButton={false}
      >
        <div className="text-center py-8">
          <div className="animate-spin w-12 h-12 border-4 border-accent-cyan/30 border-t-accent-cyan rounded-full mx-auto mb-4" />
          <p className="text-text-secondary">Please wait...</p>
        </div>
      </Modal>
    </div>
  );
}

export default ModalExamples;
