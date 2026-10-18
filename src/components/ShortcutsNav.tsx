import { useEffect, useState, useRef } from 'react';
import Shortcut from './Shortcut';
import SortableContainer from './dnd/SortableContainer';
import EditShortcutDialog from './settings/EditShortcutDialog';
import type { ShortcutData, LayoutConfig } from '../types';
import NewShortcut from './NewShortCut';
import { migrateShortcuts, parseStoredJson } from '../utils/security';

export default function ShortcutsNav() {
  const [shortcuts, setShortcuts] = useState<ShortcutData[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | 'new' | null>(null);
  const [showBlur, setShowBlur] = useState(true);
  const [layout, setLayout] = useState<LayoutConfig>({
    pc: { rows: 2, cols: 7 },
    tablet: { rows: 3, cols: 4 },
    mobile: { rows: 4, cols: 2 }
  });
  const [currentLayoutType, setCurrentLayoutType] = useState<'pc' | 'tablet' | 'mobile'>('pc');
  const navRef = useRef<HTMLElement>(null);
  const [effectiveCols, setEffectiveCols] = useState(7);

  const loadData = () => {
    const storedShortcuts = parseStoredJson<unknown>('shortcuts', []);
    setShortcuts(migrateShortcuts(storedShortcuts));

    const storedLayout = parseStoredJson<LayoutConfig | null>('layoutConfig', null);
    if (storedLayout) setLayout(storedLayout);

    const parsedSearch = parseStoredJson<{ showBlur?: boolean } | null>('searchSettings', null);
    if (parsedSearch?.showBlur !== undefined) setShowBlur(parsedSearch.showBlur);
  };

  useEffect(() => {
    loadData();

    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setCurrentLayoutType('pc');
      } else if (width >= 600) {
        setCurrentLayoutType('tablet');
      } else {
        setCurrentLayoutType('mobile');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('storage-update', loadData);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('storage-update', loadData);
    };
  }, []);

  useEffect(() => {
    const calculateLayout = () => {
      if (!navRef.current) return;

      const parent = navRef.current.parentElement;
      if (!parent) return;

      const parentWidth = parent.clientWidth;

      // Get padding of nav
      const style = window.getComputedStyle(navRef.current);
      const paddingLeft = parseFloat(style.paddingLeft) || 0;
      const paddingRight = parseFloat(style.paddingRight) || 0;

      const availableWidth = parentWidth - paddingLeft - paddingRight;

      // Determine item width based on currentLayoutType
      let itemSize = 80; // mobile default
      let itemPadding = 8;

      if (currentLayoutType === 'pc') {
        itemSize = 128;
        itemPadding = 16;
      } else if (currentLayoutType === 'tablet') {
        itemSize = 96;
        itemPadding = 8;
      }

      const itemTotalWidth = itemSize + (itemPadding * 2);
      const gap = 8; // --shortcut-gap

      const targetCols = layout[currentLayoutType].cols;

      // Calculate max columns that fit
      // N * (w + gap) - gap <= available
      const maxFit = Math.floor((availableWidth + gap) / (itemTotalWidth + gap));

      const finalCols = Math.min(targetCols, Math.max(1, maxFit));
      setEffectiveCols(finalCols);
    };

    calculateLayout();
    window.addEventListener('resize', calculateLayout);

    const observer = new ResizeObserver(calculateLayout);
    if (navRef.current?.parentElement) {
      observer.observe(navRef.current.parentElement);
    }

    return () => {
      window.removeEventListener('resize', calculateLayout);
      observer.disconnect();
    };
  }, [currentLayoutType, layout]);

  const handleReorder = (newShortcuts: ShortcutData[]) => {
    setShortcuts(newShortcuts);
    localStorage.setItem('shortcuts', JSON.stringify(newShortcuts));
    window.dispatchEvent(new Event('storage-update'));
  };

  const handleEditShortcut = (index: number | 'new', updatedShortcut: ShortcutData) => {
    let updated: ShortcutData[];
    if (index === 'new') {
      updated = [...shortcuts, updatedShortcut];
    } else {
      updated = [...shortcuts];
      updated[index] = updatedShortcut;
    }
    setShortcuts(updated);
    localStorage.setItem('shortcuts', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage-update'));
    setEditingIndex(null);
  };

  const handleDeleteShortcut = (index: number) => {
    const updated = shortcuts.filter((_, i) => i !== index);
    setShortcuts(updated);
    localStorage.setItem('shortcuts', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage-update'));
  };

  // Generar clases de grid dinámicas
  const gridStyle = {
    '--cols-pc': layout.pc.cols,
    '--rows-pc': layout.pc.rows,
    '--cols-tablet': layout.tablet.cols,
    '--rows-tablet': layout.tablet.rows,
    '--cols-mobile': layout.mobile.cols,
    '--rows-mobile': layout.mobile.rows,
    '--current-cols': effectiveCols,
    '--current-rows': layout[currentLayoutType].rows,
    gap: 'var(--shortcut-gap, 16px)',
    display: 'grid',
    gridTemplateColumns: `repeat(var(--current-cols), max-content)`,
    justifyContent: 'center',
    justifyItems: 'center',
  } as React.CSSProperties;

  const maxItems = layout[currentLayoutType].rows * effectiveCols;
  const visibleShortcuts = shortcuts.slice(0, maxItems);

  return (
    <>
      <nav
        ref={navRef}
        className={`p-4 md:p-6 bg-black/20 rounded-3xl transition-all duration-300 ${showBlur ? 'backdrop-blur-sm' : ''}`}
        style={gridStyle}
      >
        <SortableContainer
          items={visibleShortcuts}
          onReorder={(newVisible) => {
            // Combinar los reordenados visibles con los que están ocultos
            const hiddenShortcuts = shortcuts.slice(maxItems);
            handleReorder([...newVisible, ...hiddenShortcuts]);
          }}
          className="contents"
          renderItem={(shortcut, index, isDragging) => (
            <Shortcut
              name={shortcut.name}
              url={shortcut.url}
              imageUrl={shortcut.imageUrl}
              isDragging={isDragging}
              onEdit={() => setEditingIndex(index)}
              onDelete={() => handleDeleteShortcut(index)}
            />
          )}
        />

        {/* Add new shortcut button only if there's space */}
        {shortcuts.length < maxItems && (
          <NewShortcut onClick={() => setEditingIndex('new')} />
        )}

      </nav>
      <EditShortcutDialog
        isOpen={editingIndex !== null}
        onClose={() => setEditingIndex(null)}
        shortcut={editingIndex !== null && editingIndex !== 'new' ? shortcuts[editingIndex] : null}
        onSave={(updated) => editingIndex !== null && handleEditShortcut(editingIndex, updated)}
      />
    </>
  );
}
