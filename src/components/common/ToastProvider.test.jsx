import { render, screen, act } from '@testing-library/react';
import { useToast, ToastProvider } from './ToastProvider';
import { vi } from 'vitest';

// Mock Toast component to simplify testing
vi.mock('./Toast', () => ({
  Toast: ({ message, onDismiss, id }) => (
    <div data-testid={`toast-${id}`} onClick={() => onDismiss(id)}>
      {message}
    </div>
  ),
}));

// A helper component to use the toast context
const ToastConsumer = ({ children }) => {
  const toast = useToast();
  return children(toast);
};

describe('ToastProvider', () => {
  it('should add and remove a toast', async () => {
    render(
      <ToastProvider>
        <ToastConsumer>
          {(toast) => (
            <button onClick={() => toast.success('Success!')}>Add Toast</button>
          )}
        </ToastConsumer>
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Add Toast').click();
    });

    const toastElement = await screen.findByText('Success!');
    expect(toastElement).toBeInTheDocument();

    act(() => {
      toastElement.click();
    });

    expect(screen.queryByText('Success!')).not.toBeInTheDocument();
  });

  it('should queue toasts when the max limit is reached', async () => {
    render(
      <ToastProvider>
        <ToastConsumer>
          {(toast) => (
            <button onClick={() => {
              for (let i = 0; i < 7; i++) {
                toast.info(`Toast ${i + 1}`);
              }
            }}>Add Toasts</button>
          )}
        </ToastConsumer>
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Add Toasts').click();
    });

    // Only 5 toasts should be visible initially
    for (let i = 0; i < 5; i++) {
      expect(await screen.findByText(`Toast ${i + 1}`)).toBeInTheDocument();
    }

    // Toasts 6 and 7 should be in the queue
    expect(screen.queryByText('Toast 6')).not.toBeInTheDocument();
    expect(screen.queryByText('Toast 7')).not.toBeInTheDocument();

    // Dismiss one toast
    act(() => {
      const firstToast = screen.getByText('Toast 1');
      firstToast.click();
    });

    // Toast 6 should now be visible
    expect(await screen.findByText('Toast 6')).toBeInTheDocument();
    expect(screen.queryByText('Toast 7')).not.toBeInTheDocument();

    // Dismiss another toast
    act(() => {
      const secondToast = screen.getByText('Toast 2');
      secondToast.click();
    });

    // Toast 7 should now be visible
    expect(await screen.findByText('Toast 7')).toBeInTheDocument();
  });

  it('should dismiss all toasts', async () => {
    render(
      <ToastProvider>
        <ToastConsumer>
          {(toast) => (
            <>
              <button onClick={() => {
                toast.info('Toast 1');
                toast.info('Toast 2');
              }}>Add Toasts</button>
              <button onClick={() => toast.dismissAll()}>Dismiss All</button>
            </>
          )}
        </ToastConsumer>
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Add Toasts').click();
    });

    expect(await screen.findByText('Toast 1')).toBeInTheDocument();
    expect(await screen.findByText('Toast 2')).toBeInTheDocument();

    act(() => {
      screen.getByText('Dismiss All').click();
    });

    expect(screen.queryByText('Toast 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Toast 2')).not.toBeInTheDocument();
  });
});
