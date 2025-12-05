import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DraggableHeader } from './DraggableHeader';

export function SortableHeader({ column, onSort, sortConfig }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isOver,
  } = useSortable({ id: column.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      className="relative"
    >
      <DraggableHeader
        column={column}
        onSort={onSort}
        sortConfig={sortConfig}
        attributes={attributes}
        listeners={listeners}
      />
      {isOver && <div className="drop-indicator" style={{ left: 0 }} />}
    </th>
  );
}
