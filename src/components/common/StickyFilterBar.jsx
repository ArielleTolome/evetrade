import React, { useState, useRef, useEffect } from 'react';
import { useScroll } from '../../hooks/useScroll';
import { ChevronDown, Filter } from 'lucide-react';

export function StickyFilterBar({
  children,
  offset = 0,
  showShadow = true,
  summary,
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [height, setHeight] = useState(0);
  const ref = useRef(null);
  const { scrollPosition } = useScroll();

  useEffect(() => {
    if (ref.current) {
      const observer = new ResizeObserver(entries => {
        for (let entry of entries) {
          setHeight(entry.contentRect.height);
        }
      });
      observer.observe(ref.current);
      return () => observer.disconnect();
    }
  }, []);

  const [originalTop, setOriginalTop] = useState(0);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    if (ref.current) {
      setOriginalTop(ref.current.offsetTop);
    }
  }, []);

  useEffect(() => {
    setIsSticky(scrollPosition.y > originalTop - offset);
  }, [scrollPosition, offset, originalTop]);


  return (
    <div style={{ minHeight: isSticky ? height : 'auto' }}>
      <div
        ref={ref}
        className={`
          transition-all duration-300
          ${isSticky
            ? `fixed top-0 left-0 right-0 z-40 bg-space-dark/80 backdrop-blur-lg border-b border-white/10`
            : 'relative'
          }
          ${isSticky && showShadow ? 'shadow-2xl shadow-black/50' : ''}
        `}
        style={{ top: isSticky ? offset : 'auto' }}
      >
        {/* Mobile Header */}
        <div className="md:hidden p-2 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-accent-cyan" />
            <span className="text-sm font-medium text-text-primary">Filters</span>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1 text-sm text-accent-cyan"
          >
            {isCollapsed ? 'Show' : 'Hide'}
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${!isCollapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Filter Content */}
        <div
          className={`
            transition-all duration-300 ease-in-out overflow-hidden
            md:block
            ${isCollapsed ? 'max-h-0 md:max-h-full' : 'max-h-96 md:max-h-full'}
          `}
        >
          <div className="p-4">
            {children}
          </div>
        </div>

        {/* Collapsed Summary */}
        <div
          className={`
            md:hidden transition-all duration-300 ease-in-out overflow-hidden
            ${isCollapsed ? 'max-h-20' : 'max-h-0'}
          `}
        >
          <div className="px-4 pb-3 text-xs text-text-secondary truncate">
            Active: {summary || 'None'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StickyFilterBar;
