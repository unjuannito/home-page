import React, { useState, useEffect } from 'react';
import ContextMenu from './ContextMenu';
import { useI18n } from '../i18n';
import { normalizeHttpUrl } from '../utils/security';

interface ShortcutProps {
  name: string;
  url: string;
  imageUrl: string;
  isDragging?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function Shortcut({
  name,
  url,
  imageUrl,
  isDragging,
  onEdit,
  onDelete
}: ShortcutProps) {
  const { t } = useI18n();
  const safeUrl = normalizeHttpUrl(url);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

  useEffect(() => {
    const handleCloseAll = () => setContextMenu(null);
    window.addEventListener('close-all-menus', handleCloseAll);
    return () => window.removeEventListener('close-all-menus', handleCloseAll);
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (isDragging) return;
    e.preventDefault();
    // Notificar a otros menús que se cierren
    window.dispatchEvent(new Event('close-all-menus'));
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(safeUrl ?? url);
    } catch (err) {
      console.error('Failed to copy link: ', err);
    }
  };

  const menuItems = [
    { label: t('open'), onClick: () => safeUrl && (window.location.href = safeUrl) },
    { label: t('openNewTab'), onClick: () => safeUrl && window.open(safeUrl, '_blank', 'noopener,noreferrer') },
    { label: t('copyLink'), onClick: handleCopyLink },
    { label: 'Separator', onClick: () => { }, isSeparator: true },
    { label: t('editShortcut'), onClick: () => onEdit?.() },
    { label: t('deleteShortcut'), onClick: () => onDelete?.(), className: 'text-red-400 hover:bg-red-500/10' },
  ];

  return (
    <>
      <a
        href={safeUrl ?? '#'}
        rel="noopener noreferrer"
        draggable="false"
        onClick={(e) => {
          if (isDragging) {
            e.preventDefault();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.stopPropagation();
            if (e.ctrlKey) {
              e.preventDefault();
              if (safeUrl) window.open(safeUrl, '_blank', 'noopener,noreferrer');
            }
            // Let the default behavior of <a> handle the navigation for Enter without Ctrl
          }
        }}
        onContextMenu={handleContextMenu}
        className={`flex flex-col items-center justify-center p-[var(--shortcut-padding)] rounded-2xl hover:bg-white/15 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 group
                    ${isDragging ? 'cursor-grabbing' : 'cursor-pointer'}`}
      >
        <div
          className="p-[var(--shortcut-icon-padding)] flex items-center justify-center bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors duration-200 pointer-events-none"
        >
          <img
            src={imageUrl.trim().replace(/^`|`$/g, '')}
            alt={name}
            className="rounded-xl object-contain transition-all duration-200 w-[var(--shortcut-icon-size)] h-[var(--shortcut-icon-size)]"
            onError={(e) => {
              if (safeUrl) (e.target as HTMLImageElement).src = 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(new URL(safeUrl).hostname) + '&sz=128';
            }}
          />
        </div>
        <span className="text-[10px] md:text-xs lg:text-sm text-white/80 text-center truncate w-full group-hover:text-white pointer-events-none h-[var(--shortcut-text-height)] flex items-center justify-center">
          {name}
        </span>
      </a>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={menuItems}
        />
      )}
    </>
  );
}
