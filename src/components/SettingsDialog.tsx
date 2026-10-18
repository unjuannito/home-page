import { useState, useEffect, useRef } from 'react';
import DialogComponent from './DialogComponent';
import type { LayoutConfig, ShortcutData, SearchSettings } from '../types';
import GeneralSettings from './settings/GeneralSettings';
import LinksSettings from './settings/LinksSettings';
import BackgroundSettings from './settings/BackgroundSettings';
import { useI18n } from '../i18n';
import { parseStoredJson } from '../utils/security';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { t } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'links' | 'background'>('general');

  // Layout State
  const [layout, setLayout] = useState<LayoutConfig>({
    pc: { rows: 2, cols: 7 },
    tablet: { rows: 3, cols: 3 },
    mobile: { rows: 4, cols: 2 }
  });

  // Search Settings State
  const [searchSettings, setSearchSettings] = useState<SearchSettings>({
    searchEngine: 'https://www.google.com/search?q=',
    aiEngine: 'https://chatgpt.com/?q=',
    showBlur: true
  });

  // Links State
  const [shortcuts, setShortcuts] = useState<ShortcutData[]>([]);

  // Background State
  const [background, setBackground] = useState<string>('#1a1a1a');

  useEffect(() => {
    const savedLayout = parseStoredJson<LayoutConfig | null>('layoutConfig', null);
    if (savedLayout) setLayout(savedLayout);

    const parsedSearch = parseStoredJson<Partial<SearchSettings> | null>('searchSettings', null);
    if (parsedSearch) {
      setSearchSettings({
        searchEngine: parsedSearch.searchEngine ?? 'https://www.google.com/search?q=',
        aiEngine: parsedSearch.aiEngine ?? 'https://chatgpt.com/?q=',
        showBlur: parsedSearch.showBlur !== undefined ? parsedSearch.showBlur : true
      });
    }

    const savedShortcuts = parseStoredJson<ShortcutData[] | null>('shortcuts', null);
    if (savedShortcuts) setShortcuts(savedShortcuts);

    const savedBg = localStorage.getItem('appBackground');
    if (savedBg) setBackground(savedBg);
  }, [isOpen]);

  const saveLayout = (newLayout: LayoutConfig) => {
    setLayout(newLayout);
    localStorage.setItem('layoutConfig', JSON.stringify(newLayout));
    window.dispatchEvent(new Event('storage-update'));
  };

  const saveSearchSettings = (newSettings: SearchSettings) => {
    setSearchSettings(newSettings);
    localStorage.setItem('searchSettings', JSON.stringify(newSettings));
    window.dispatchEvent(new Event('storage-update'));
  };

  const handleAddShortcut = (newShortcut: ShortcutData) => {
    const updated = [...shortcuts, newShortcut];
    setShortcuts(updated);
    localStorage.setItem('shortcuts', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage-update'));
  };

  const handleDeleteShortcut = (index: number) => {
    const updated = shortcuts.filter((_, i) => i !== index);
    setShortcuts(updated);
    localStorage.setItem('shortcuts', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage-update'));
  };

  const handleReorderShortcuts = (newShortcuts: ShortcutData[]) => {
    setShortcuts(newShortcuts);
    localStorage.setItem('shortcuts', JSON.stringify(newShortcuts));
    window.dispatchEvent(new Event('storage-update'));
  };

  const handleEditShortcut = (index: number, updatedShortcut: ShortcutData) => {
    const updated = [...shortcuts];
    updated[index] = updatedShortcut;
    setShortcuts(updated);
    localStorage.setItem('shortcuts', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage-update'));
  };

  const handleBgChange = (color: string) => {
    setBackground(color);
    localStorage.setItem('appBackground', color);
    window.dispatchEvent(new Event('storage-update'));
  };

  return (
    <DialogComponent isOpen={isOpen} onClose={onClose} dialogRef={dialogRef}>
      {/* Header Tabs */}
      <header className="flex bg-zinc-900 rounded-none">
        {(['general', 'links', 'background'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-sm font-medium transition-colors duration-200 rounded-none hover:bg-zinc-800 ${tab === activeTab ? "bg-blue-900" : ""}`}
          >
            {t(tab)}
          </button>
        ))}
      </header>

      {/* Content */}
        {activeTab === 'general' && (
          <GeneralSettings
            layout={layout}
            onLayoutChange={saveLayout}
            searchSettings={searchSettings}
            onSearchSettingsChange={saveSearchSettings}
          />
        )}

        {activeTab === 'links' && (
          <LinksSettings
            shortcuts={shortcuts}
            onDeleteShortcut={handleDeleteShortcut}
            onReorderShortcuts={handleReorderShortcuts}
            onEditShortcut={handleEditShortcut}
            onAddShortcut={handleAddShortcut}
            dialogRef={dialogRef}
          />
        )}

        {activeTab === 'background' && (
          <BackgroundSettings
            background={background}
            onBgChange={handleBgChange}
            dialogRef={dialogRef}
          />
        )}

      {/* Footer */}
      <menu className="p-6 border-t border-white/10 flex justify-end shrink-0">
        <button
          onClick={onClose}
          className="bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-2 rounded-xl transition-colors"
        >
          {t('close')}
        </button>
      </menu>
    </DialogComponent>
  );
}
