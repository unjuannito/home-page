import { useState, useEffect, useRef } from 'react';
import { saveWallpaper, getAllWallpapers, deleteWallpaper } from '../../db';
import SortableContainer from '../dnd/SortableContainer';
import imageIcon from '../../assets/image.svg';
import xmarkIcon from '../../assets/xmark.svg';
import { useI18n } from '../../i18n';
import { parseStoredJson } from '../../utils/security';

interface BackgroundSettingsProps {
  background: string;
  onBgChange: (bg: string) => void;
  dialogRef?: React.RefObject<HTMLDialogElement | null>;
}

interface CustomWallpaper {
  id: string;
  blob: Blob;
  url: string;
}

export default function BackgroundSettings({ background, onBgChange, dialogRef }: BackgroundSettingsProps) {
  const { t } = useI18n();
  const presetColors = ['#1a1a1a', '#2d3436', '#0f172a', '#1e1b4b', '#451a03', '#064e3b', '#171717'];
  const [customWallpapers, setCustomWallpapers] = useState<CustomWallpaper[]>([]);
  const wallpapersRef = useRef<CustomWallpaper[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const isCustomColor = background.startsWith('#') && !presetColors.includes(background);

  const saveWallpaperOrder = (wallpapers: CustomWallpaper[]) => {
    const order = wallpapers.map(wp => wp.id);
    localStorage.setItem('wallpaperOrder', JSON.stringify(order));
  };

  const loadCustomWallpapers = async () => {
    const saved = await getAllWallpapers();
    const order = parseStoredJson<string[]>('wallpaperOrder', []);

    // Sort based on saved order
    const sorted = [...saved].sort((a, b) => {
      const indexA = order.indexOf(a.id);
      const indexB = order.indexOf(b.id);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    const withUrls = sorted.map(wp => ({
      ...wp,
      url: URL.createObjectURL(wp.blob)
    }));
    wallpapersRef.current.forEach(wp => URL.revokeObjectURL(wp.url));
    wallpapersRef.current = withUrls;
    setCustomWallpapers(withUrls);
  };

  useEffect(() => {
    loadCustomWallpapers();
    return () => {
      wallpapersRef.current.forEach(wp => URL.revokeObjectURL(wp.url));
    };
  }, []);

  const handleFiles = async (files: FileList) => {
    const maxFileSize = 10 * 1024 * 1024;
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/') && f.size <= maxFileSize);
    if (imageFiles.length === 0) return;

    let lastId = '';
    for (const file of imageFiles) {
      const id = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      await saveWallpaper(id, file);
      lastId = id;
    }

    await loadCustomWallpapers();
    if (lastId) {
      onBgChange(`custom:${lastId}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteWallpaper(id);

    // Remove from saved order
    const savedOrder = localStorage.getItem('wallpaperOrder');
    if (savedOrder) {
      const order = parseStoredJson<string[]>('wallpaperOrder', []);
      const newOrder = order.filter(itemId => itemId !== id);
      localStorage.setItem('wallpaperOrder', JSON.stringify(newOrder));
    }

    await loadCustomWallpapers();
    if (background === `custom:${id}`) {
      onBgChange('#1a1a1a');
    }
  };

  const handleReorder = (newWallpapers: CustomWallpaper[]) => {
    setCustomWallpapers(newWallpapers);
    saveWallpaperOrder(newWallpapers);
  };

  return (
    <main className="flex flex-col h-[800px] overflow-hidden">
      <section className="px-12 pt-8 pb-4 space-y-4">
        <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{t('colors')}</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
          {presetColors.map(color => (
            <button
              key={color}
              onClick={() => onBgChange(color)}
              className={`h-10 rounded-xl border-2 transition-all hover:scale-105 ${background === color ? 'border-blue-500 scale-105' : 'border-white/10'
                }`}
              style={{ backgroundColor: color }}
            />
          ))}

          {/* Custom Color Selector integrated into the grid */}
          <button
            onClick={() => colorInputRef.current?.click()}
            className={`h-10 rounded-xl border-2 transition-all hover:scale-105 relative overflow-hidden flex items-center justify-center ${isCustomColor ? 'border-blue-500 scale-105' : 'border-white/10'
              }`}
            style={{ backgroundColor: isCustomColor ? background : '#333' }}
          >
            <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white to-transparent" />
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-tighter leading-none text-center">
              {isCustomColor ? background : 'Custom'}
            </span>
            <input
              type="color"
              ref={colorInputRef}
              value={isCustomColor ? background : '#1a1a1a'}
              onChange={e => onBgChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </button>
        </div>
      </section>

      <section className="flex-1 flex flex-col min-h-0">
        <h3 className="px-12 pt-4 pb-6 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{t('customWallpapers')}</h3>
        <div id="background-scroll-container" className="flex-1 overflow-y-auto px-12 pb-10 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {/* Upload Button / Drop Zone */}
            <button
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`aspect-video bg-white/5 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group ${isDragging
                  ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
                  : 'border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
            >
              <img
                src={imageIcon}
                alt="Upload"
                className={`w-8 h-8 transition-all ${isDragging ? 'scale-110 opacity-100' : 'opacity-40 group-hover:opacity-100'}`}
              />
              <span className={`text-xs font-medium transition-colors ${isDragging ? 'text-blue-400' : 'text-white/40 group-hover:text-white/80'}`}>
                {isDragging ? t('dropToUpload') : t('uploadOrDrag')}
              </span>
            </button>

            {/* Custom Gallery */}
            <SortableContainer
              items={customWallpapers}
              onReorder={handleReorder}
              className="contents"
              portalContainer={dialogRef?.current}
              renderItem={(wp, _, isDragging) => (
                <section
                  onClick={() => !isDragging && onBgChange(`custom:${wp.id}`)}
                  className={`relative aspect-video rounded-2xl overflow-hidden cursor-pointer border-2 transition-all hover:scale-[1.02] group ${background === `custom:${wp.id}` ? 'border-blue-500' : 'border-transparent'
                    } ${isDragging ? 'opacity-50 scale-105' : ''}`}
                >
                  <img src={wp.url} alt="Custom" className="w-full h-full object-cover pointer-events-none" />
                  <button
                    onClick={(e) => handleDelete(e, wp.id)}
                    className="absolute top-2 right-2 p-2 bg-black/40 hover:bg-red-500 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-10"
                  >
                    <img src={xmarkIcon} alt="Delete" className="w-3 h-3 invert" />
                  </button>
                  <div className={`absolute inset-0 bg-blue-500/10 transition-opacity ${background === `custom:${wp.id}` ? 'opacity-100' : 'opacity-0'}`} />
                </section>
              )}
            />
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
        />
      </section>
    </main>
  );
}
