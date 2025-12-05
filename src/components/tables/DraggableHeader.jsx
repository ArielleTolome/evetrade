import React from 'react';
import { GripVertical } from 'lucide-react';
import { DraggableHeaderCell } from './DraggableHeaderCell';

export function DraggableHeader({ column, onSort, sortConfig, attributes, listeners }) {
  return (
    <DraggableHeaderCell
      id={`header-${column.key}`}
      column={column}
      sortConfig={sortConfig}
      onClick={() => onSort(column.key)}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none p-1 -ml-1 text-[#778DA9] hover:text-accent-cyan"
        onClick={(e) => e.stopPropagation()} // Prevent sort on drag handle click
        aria-label={`Drag to reorder ${column.label} column`}
      >
        <GripVertical size={14} />
      </div>
      <span className="truncate">{column.label}</span>
    </DraggableHeaderCell>
  );
}
