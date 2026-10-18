import { useState, useEffect, useCallback } from 'react';
import type { ShortcutData } from '../../types';
import DialogComponent from '../DialogComponent';
import { fetchIcon } from '../../utils/iconFetcher';
import { fetchWebName } from '../../utils/nameFetcher';
import imagePlaceholder from '../../assets/image.svg';
import { useI18n } from '../../i18n';
import { normalizeHttpUrl } from '../../utils/security';

interface EditShortcutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shortcut: ShortcutData | null;
  onSave: (updatedShortcut: ShortcutData) => void;
}

export default function EditShortcutDialog({ isOpen, onClose, shortcut, onSave }: EditShortcutDialogProps) {
  const { t } = useI18n();
  const [editedShortcut, setEditedShortcut] = useState<ShortcutData>({ name: '', url: '', imageUrl: '' });
  const [isLoadingIcon, setIsLoadingIcon] = useState(false);
  const [previewIcon, setPreviewIcon] = useState<string>('');

  useEffect(() => {
    if (shortcut) {
      setEditedShortcut(shortcut);
      setPreviewIcon(shortcut.imageUrl);
    } else {
      setEditedShortcut({ name: '', url: '', imageUrl: '' });
      setPreviewIcon('');
    }
  }, [shortcut, isOpen]);

  const handleFetchIcon = useCallback(async (url: string) => {
    if (!url || !url.includes('.')) return;
    
    setIsLoadingIcon(true);
    try {
      const icon = await fetchIcon(url);
      if (icon) {
        setEditedShortcut(prev => ({ ...prev, imageUrl: icon }));
        setPreviewIcon(icon);
      }
    } catch (error) {
      console.error('Error fetching icon:', error);
    } finally {
      setIsLoadingIcon(false);
    }
  }, []);

  const handleUrlBlur = async () => {
    if (!editedShortcut.url) return;
    if (!normalizeHttpUrl(editedShortcut.url)) return;

    // Si el nombre está vacío, intentar obtenerlo
    if (!editedShortcut.name) {
      const fetchedName = await fetchWebName(editedShortcut.url);
      if (fetchedName) {
        setEditedShortcut(prev => ({ ...prev, name: fetchedName }));
      }
    }

    // Si la imagen está vacía, intentar obtener el icono
    if (!editedShortcut.imageUrl) {
      handleFetchIcon(editedShortcut.url);
    }
  };

  const handleSave = () => {
    const safeUrl = normalizeHttpUrl(editedShortcut.url);
    if (editedShortcut.name.trim() && safeUrl) {
      onSave({ ...editedShortcut, name: editedShortcut.name.trim(), url: safeUrl });
      onClose();
    }
  };

  return (
    <DialogComponent isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <header className="p-6 border-b border-white/10">
        <h2 className="text-xl font-semibold">
          {shortcut ? t('editShortcut') : t('newShortcut')}
        </h2>
      </header>

      <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Column 1: Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60 uppercase tracking-wider">{t('name')}</label>
            <input
              placeholder="e.g. Google"
              value={editedShortcut.name}
              onChange={e => setEditedShortcut({ ...editedShortcut, name: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60 uppercase tracking-wider">{t('url')}</label>
            <input
              placeholder="https://google.com"
              value={editedShortcut.url}
              onChange={e => setEditedShortcut({ ...editedShortcut, url: e.target.value })}
              onBlur={handleUrlBlur}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60 uppercase tracking-wider flex justify-between">
              {t('imageUrlOptional')}
              {isLoadingIcon && <span className="text-blue-400 normal-case animate-pulse text-[10px]">{t('searching')}</span>}
            </label>
            <div className="flex gap-2">
              <input
                placeholder="Image URL"
                value={editedShortcut.imageUrl}
                onChange={e => {
                  setEditedShortcut({ ...editedShortcut, imageUrl: e.target.value });
                  setPreviewIcon(e.target.value);
                }}
                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={async () => {
                  if (!editedShortcut.name) {
                    const fetchedName = await fetchWebName(editedShortcut.url);
                    if (fetchedName) {
                      setEditedShortcut(prev => ({ ...prev, name: fetchedName }));
                    }
                  }
                  handleFetchIcon(editedShortcut.url);
                }}
                disabled={isLoadingIcon || !editedShortcut.url}
                className="bg-white/5 hover:bg-white/10 disabled:opacity-50 p-2 rounded-xl transition-colors shrink-0"
                title="Search icon and name"
              >
                <img src={imagePlaceholder} alt="Search" className="w-5 h-5 opacity-60" />
              </button>
            </div>
          </div>
        </div>

        {/* Column 2: Preview */}
        <div className="flex flex-col items-center justify-center bg-white/5 rounded-2xl p-8 border border-white/5 relative group">
          <label className="absolute top-4 left-4 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{t('preview')}</label>
          
          <div className="w-32 h-32 bg-black/40 rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl border border-white/10 relative">
            {isLoadingIcon ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : null}
            
            <img
              src={previewIcon || imagePlaceholder}
              alt="Preview"
              className={`w-20 h-20 object-contain transition-all duration-500 ${!previewIcon ? 'opacity-20 grayscale' : 'opacity-100'}`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = imagePlaceholder;
                (e.target as HTMLImageElement).classList.add('opacity-20', 'grayscale');
              }}
              onLoad={(e) => {
                (e.target as HTMLImageElement).classList.remove('opacity-20', 'grayscale');
              }}
            />
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm font-semibold text-white/90 truncate max-w-[180px]">
              {editedShortcut.name || t('shortcutName')}
            </p>
            <p className="text-[10px] text-white/40 truncate max-w-[180px] mt-1 font-mono">
              {editedShortcut.url || 'https://example.com'}
            </p>
          </div>
        </div>
      </main>

      <footer className="p-6 border-t border-white/10 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="bg-white/5 hover:bg-white/10 text-white font-medium px-4 py-2 rounded-xl transition-colors"
        >
          {t('cancel')}
        </button>
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2 rounded-xl transition-colors disabled:opacity-50"
          disabled={!editedShortcut.name || !editedShortcut.url}
        >
          {shortcut ? t('saveChanges') : t('addShortcut')}
        </button>
      </footer>
    </DialogComponent>
  );
}
