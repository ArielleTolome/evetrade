import { useState, cloneElement, useRef } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  arrow,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
} from '@floating-ui/react';
import { Transition } from '@headlessui/react';
import PropTypes from 'prop-types';
import { Info } from 'lucide-react';

export function InfoTooltip({ content, position = 'top', className = '' }) {
  return (
    <Tooltip content={content} position={position}>
      <button
        type="button"
        className={`
          inline-flex items-center justify-center
          w-4 h-4
          text-text-secondary hover:text-accent-cyan
          transition-colors
          focus:outline-none focus-visible:ring-2 focus:ring-accent-cyan/50 rounded-full
          ${className}
        `}
        aria-label="More information"
      >
        <Info className="w-full h-full" />
      </button>
    </Tooltip>
  );
}

InfoTooltip.propTypes = {
  content: PropTypes.node.isRequired,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  className: PropTypes.string,
};

export function Tooltip({
  children,
  content,
  position = 'top',
  delay = 300,
  maxWidth = '250px',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef(null);

  const {
    x,
    y,
    strategy,
    refs,
    context,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} },
    placement,
  } = useFloating({
    placement: position,
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(10),
      flip(),
      shift({ padding: 8 }),
      arrow({ element: arrowRef }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, { move: false, delay: { open: delay, close: 0 } });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  const staticSide = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
  }[placement.split('-')[0]];

  return (
    <>
      {cloneElement(children, getReferenceProps({ ref: refs.setReference, ...children.props }))}
      <FloatingPortal>
        <Transition
          show={isOpen}
          enter="transition-opacity duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            ref={refs.setFloating}
            className={`
              z-[9999]
              px-3 py-2
              bg-space-black/50 backdrop-blur-sm
              text-white text-sm leading-relaxed
              rounded-lg
              border border-white/10
              shadow-lg
              ${className}
            `}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              maxWidth: maxWidth,
            }}
            {...getFloatingProps()}
          >
            {content}
            <div
              ref={arrowRef}
              className="absolute h-2 w-2 bg-space-black/50"
              style={{
                left: arrowX != null ? `${arrowX}px` : '',
                top: arrowY != null ? `${arrowY}px` : '',
                [staticSide]: '-4px',
                transform: 'rotate(45deg)',
              }}
            />
          </div>
        </Transition>
      </FloatingPortal>
    </>
  );
}

Tooltip.propTypes = {
  children: PropTypes.element.isRequired,
  content: PropTypes.node.isRequired,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  delay: PropTypes.number,
  maxWidth: PropTypes.string,
  className: PropTypes.string,
};

export default Tooltip;
