import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  isDragging?: boolean;
}

export default function SortableItem({
  id,
  children,
  className = "",
  isDragging: isDraggingProp
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragging = isDraggingProp ?? isDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      tabIndex={-1}
      {...listeners}
      className={`cursor-move select-none touch-none focus:outline-none ${
        dragging ? 'opacity-0' : 'opacity-100'
      } ${className}`}
    >
      {children}
    </div>
  );
}
