import { useState } from 'react';
import type { ShortcutData } from '../../types';
import SortableContainer from '../dnd/SortableContainer';
import EditShortcutDialog from './EditShortcutDialog';
import plusIcon from '../../assets/plus.svg';
import { useI18n } from '../../i18n';

interface LinksSettingsProps {
  shortcuts: ShortcutData[];
  onDeleteShortcut: (index: number) => void;
  onReorderShortcuts: (newShortcuts: ShortcutData[]) => void;
  onEditShortcut: (index: number, updatedShortcut: ShortcutData) => void;
  onAddShortcut: (newShortcut: ShortcutData) => void;
  dialogRef?: React.RefObject<HTMLDialogElement | null>;
}

export default function LinksSettings({
  shortcuts,
  onDeleteShortcut,
  onReorderShortcuts,
  onEditShortcut,
  onAddShortcut,
  dialogRef
}: LinksSettingsProps) {
  const { t } = useI18n();
  const [editingIndex, setEditingIndex] = useState<number | 'new' | null>(null);

  const handleEditClick = (index: number) => {
    setEditingIndex(index);
  };

  const handleAddNewClick = () => {
    setEditingIndex('new');
  };

  const handleSaveEdit = (updatedShortcut: ShortcutData) => {
    if (editingIndex === 'new') {
      onAddShortcut(updatedShortcut);
    } else if (editingIndex !== null) {
      onEditShortcut(editingIndex, updatedShortcut);
    }
    setEditingIndex(null);
  };

  return (
    <>
      <main className="flex flex-col max-h-[800px] overflow-hidden">
        <h3 className="px-12 pt-4 pb-6 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] flex items-center flex-wrap gap-1 text-center items-center justify-center">
          <span className='text-white'>{t('currentShortcuts')}</span>  <span className="text-white/40">{t('dragToReorder')}</span>
        </h3>

        <div id="shortcuts-scroll-container" className="flex-1 overflow-y-auto px-12 pb-10 custom-scrollbar">
          <section className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 mx-auto w-full">
            <SortableContainer
              items={shortcuts}
              onReorder={onReorderShortcuts}
              className="contents"
              portalContainer={dialogRef?.current}
              renderItem={(s, i, isDragging) => (
                <section className={`flex items-center justify-center bg-white/5 p-2 md:p-4 rounded-2xl gap-4 md:gap-6 h-full transition-all hover:bg-white/[0.08] border border-white/5 ${isDragging ? 'opacity-50' : ''}`}>
                  <div className="flex flex-col items-center gap-3 min-w-0">
                    <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-white/5 rounded-2xl transition-colors pointer-events-none border border-white/5">
                      <img
                        src={s.imageUrl.trim().replace(/^`|`$/g, '')}
                        alt={s.name}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://www.google.com/s2/favicons?domain=' + s.url + '&sz=128';
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-white/70 text-center truncate w-full pointer-events-none uppercase tracking-tight">
                      {s.name}
                    </span>
                  </div>
                  <menu className='flex flex-col gap-2'>
                    <button
                      onClick={() => handleEditClick(i)}
                      className="text-blue-400 hover:text-blue-300 px-4 py-2 text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-blue-400/10 rounded-lg transition-all border border-white/5"
                    >
                      {t('edit')}
                    </button>
                    <button
                      onClick={() => onDeleteShortcut(i)}
                      className="text-red-400 hover:text-red-300 px-4 py-2 text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-red-400/10 rounded-lg transition-all border border-white/5"
                    >
                      {t('delete')}
                    </button>
                  </menu>
                </section>
              )}
            />

            {/* Botón para añadir nuevo */}
            <button
              onClick={handleAddNewClick}
              className="flex flex-col items-center justify-center bg-white/5 border-2 border-dashed border-white/10 p-6 rounded-2xl gap-3 h-full hover:bg-white/10 hover:border-white/20 transition-all group min-h-[160px]"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-full group-hover:scale-110 transition-transform border border-white/5">
                <img src={plusIcon} alt="Add new" className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-[10px] font-bold text-white/30 group-hover:text-white/60 transition-colors uppercase tracking-widest">
                {t('addNewShortcut')}
              </span>
            </button>
          </section>
        </div>

      </main>
      <EditShortcutDialog
        isOpen={editingIndex !== null}
        onClose={() => setEditingIndex(null)}
        shortcut={editingIndex !== null && editingIndex !== 'new' ? shortcuts[editingIndex] : null}
        onSave={handleSaveEdit}
      />
    </>

  );
}
