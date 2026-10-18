import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  items: {
    label: string;
    onClick: () => void;
    className?: string;
    isSeparator?: boolean;
  }[];
}

export default function ContextMenu({ x, y, onClose, items }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: x, top: y, opacity: 0 });

  useLayoutEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const margin = 10;
      let newLeft = x;
      let newTop = y;

      // Ajuste horizontal
      if (x + rect.width > window.innerWidth - margin) {
        newLeft = window.innerWidth - rect.width - margin;
      }

      // Ajuste vertical
      if (y + rect.height > window.innerHeight - margin) {
        newTop = window.innerHeight - rect.height - margin;
      }

      // Evitar que salga por la izquierda o arriba si la pantalla es muy pequeña
      newLeft = Math.max(margin, newLeft);
      newTop = Math.max(margin, newTop);

      setPos({ left: newLeft, top: newTop, opacity: 1 });
    }
  }, [x, y]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Delay adding the event listener to prevent immediate closing
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-[2000] min-w-[220px] bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1.5 animate-in fade-in zoom-in duration-100 p-1"
      style={{ 
        left: pos.left, 
        top: pos.top,
        opacity: pos.opacity 
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, index) => (
        item.isSeparator ? (
          <div key={index} className="my-1.5 border-t border-white/10" />
        ) : (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              item.onClick();
              onClose();
            }}
            className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors duration-200 hover:bg-white/15 ${item.className || 'text-white/90'}`}
          >
            {item.label}
          </button>
        )
      ))}
    </div>,
    document.body
  );
}
