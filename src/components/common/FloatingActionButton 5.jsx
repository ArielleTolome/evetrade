import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

const positionClasses = {
  'bottom-right': 'bottom-6 right-6 pb-safe',
  'bottom-left': 'bottom-6 left-6 pb-safe',
  'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2 pb-safe',
};

export function FloatingActionButton({
  icon,
  onClick,
  label,
  position = 'bottom-right',
  actions,
  withBackdrop = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const fabRef = useRef(null);

  const isSpeedDial = actions && actions.length > 0;

  const toggleOpen = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    if (!isSpeedDial && onClick) {
      onClick();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fabRef.current && !fabRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const mainButton = (
      <button
        onClick={toggleOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            toggleOpen(e);
          }
        }}
        aria-label={label || (isSpeedDial ? 'Open speed dial' : '')}
        aria-haspopup={isSpeedDial}
        aria-expanded={isSpeedDial ? isOpen : undefined}
        className="
          flex items-center justify-center
          w-14 h-14
          rounded-full
          bg-gradient-to-r from-accent-cyan to-accent-purple
          text-white
          shadow-lg shadow-accent-cyan/20
          transition-all duration-300
          hover:shadow-xl hover:shadow-accent-cyan/40 hover:-translate-y-0.5 hover:scale-105
          active:scale-95
          focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-space-dark
        "
      >
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
          {icon}
        </div>
      </button>
  );

  return (
    <>
      {isSpeedDial && withBackdrop && isOpen && createPortal(
        <div className="fixed inset-0 bg-space-black/70 backdrop-blur-sm z-40 animate-fade-in" onClick={() => setIsOpen(false)} />,
        document.body
      )}
      <div ref={fabRef} className={`fixed z-50 ${positionClasses[position]}`}>
        <div className="relative flex flex-col items-center gap-4">
          {isSpeedDial && (
            <div
              className="flex flex-col items-center gap-4 transition-all duration-300"
              aria-hidden={!isOpen}
            >
              {actions.map((action, index) => (
                <div
                  key={index}
                  className="relative group flex items-center transition-all duration-300"
                  style={{
                    transitionDelay: `${isOpen ? index * 50 : 0}ms`,
                    opacity: isOpen ? 1 : 0,
                    transform: `translateY(${isOpen ? 0 : '20px'})`,
                  }}
                >
                  <div className="
                      absolute bottom-1/2 translate-y-1/2 right-full mr-4
                      px-3 py-1.5
                      bg-space-light text-text-primary text-sm font-medium
                      rounded-md shadow-lg
                      opacity-0 group-hover:opacity-100
                      transition-all duration-300
                      whitespace-nowrap
                      pointer-events-none
                    ">
                      {action.label}
                    </div>
                  <button
                    onClick={() => {
                      action.onClick();
                      setIsOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        action.onClick();
                        setIsOpen(false);
                      }
                    }}
                    aria-label={action.label}
                    className="
                      flex items-center justify-center
                      w-12 h-12
                      rounded-full
                      bg-space-light
                      text-white
                      shadow-md
                      transition-all duration-300
                      hover:scale-110 hover:bg-accent-cyan/20
                      focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-space-dark
                    "
                    tabIndex={isOpen ? 0 : -1}
                  >
                    {action.icon}
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="relative group">
            {mainButton}
            {label && !isSpeedDial && (
              <div className="
                absolute bottom-1/2 translate-y-1/2 right-full mr-4
                px-3 py-1.5
                bg-space-light text-text-primary text-sm font-medium
                rounded-md shadow-lg
                opacity-0 group-hover:opacity-100
                transition-all duration-300
                whitespace-nowrap
                pointer-events-none
              ">
                {label}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

FloatingActionButton.propTypes = {
  icon: PropTypes.element.isRequired,
  onClick: PropTypes.func,
  label: PropTypes.string,
  position: PropTypes.oneOf(['bottom-right', 'bottom-left', 'bottom-center']),
  actions: PropTypes.arrayOf(PropTypes.shape({
    icon: PropTypes.element.isRequired,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  })),
  withBackdrop: PropTypes.bool,
};

export default FloatingActionButton;
