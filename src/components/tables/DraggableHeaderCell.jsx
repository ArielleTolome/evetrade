import React from 'react';

export const DraggableHeaderCell = React.forwardRef(
  ({ id, column, sortConfig, children, ...props }, ref) => (
    <th
      id={id}
      ref={ref}
      {...props}
      className={`
        bg-space-mid/60 text-accent-cyan font-display font-semibold text-[10px] sm:text-xs uppercase tracking-wider
        px-2 sm:px-4 py-3 sm:py-4 border-b border-white/5
        whitespace-nowrap select-none
        transition-colors relative group
        ${sortConfig?.key === column.key ? 'text-accent-cyan' : 'text-text-secondary'}
      `}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-2">
          {children}
        </div>
        {sortConfig?.key === column.key && (
          <span className="text-accent-gold text-xs">
            {sortConfig.direction === 'asc' ? '▲' : '▼'}
          </span>
        )}
      </div>
    </th>
  )
);
