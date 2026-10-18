import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  TouchSensor,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import SortableItem from './SortableItem';

interface SortableContainerProps<T> {
  items: T[];
  onReorder: (newItems: T[]) => void;
  renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode;
  className?: string;
  strategy?: any;
  portalContainer?: HTMLElement | null;
}

export default function SortableContainer<T extends Record<string, any>>({
  items,
  onReorder,
  renderItem,
  className = "",
  strategy = rectSortingStrategy,
  portalContainer = typeof document !== 'undefined' ? document.body : null
}: SortableContainerProps<T>) {
  const [activeId, setActiveId] = useState<string | number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 500, // Aumentado para permitir menú contextual
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getItemId = (item: T, index: number): string | number => {
    if (item && typeof item === 'object') {
      if ('id' in item && (typeof item.id === 'string' || typeof item.id === 'number')) {
        return item.id;
      }
      if ('url' in item && typeof item.url === 'string') {
        return item.url + (item.name || '');
      }
    }
    return index;
  };

  const itemIds = useMemo(() => items.map((item, index) => getItemId(item, index)), [items]);

  const activeItem = useMemo(() => {
    if (activeId === null) return null;
    const index = itemIds.indexOf(activeId);
    return items[index];
  }, [activeId, items, itemIds]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string | number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = itemIds.indexOf(active.id as string | number);
      const newIndex = itemIds.indexOf(over.id as string | number);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }

    setActiveId(null);
  };

  const dropAnimationConfig = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={strategy}>
        <div className={className}>
          {items.map((item, index) => {
            const id = getItemId(item, index);
            return (
              <SortableItem key={id} id={id.toString()}>
                {renderItem(item, index, activeId === id)}
              </SortableItem>
            );
          })}
        </div>
      </SortableContext>
      {portalContainer && createPortal(
        <DragOverlay 
          dropAnimation={dropAnimationConfig}
          zIndex={1000}
          adjustScale={true}
        >
          {activeId !== null && activeItem ? (
            <div className="cursor-grabbing shadow-2xl scale-105 transition-transform duration-200 origin-center pointer-events-none m-0 p-0">
              {renderItem(activeItem, itemIds.indexOf(activeId), true)}
            </div>
          ) : null}
        </DragOverlay>,
        portalContainer
      )}
    </DndContext>
  );
}
