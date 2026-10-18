/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type Language = 'es' | 'en';

const messages = {
  es: {
    settings: 'Ajustes', search: 'Buscar', ai: 'IA', searchOrAsk: 'Busca o pregunta a la IA…',
    searchEngine: 'Buscador', aiEngine: 'Motor de IA', blurredBackground: 'Fondo desenfocado',
    searchWithEngine: 'Buscar con el buscador (Ctrl + clic o clic central para abrir una pestaña nueva)',
    searchWithAi: 'Buscar con IA (Ctrl + clic o clic central para abrir una pestaña nueva)',
    enterSearch: 'Intro: Buscar', altAi: 'Alt + Intro: IA', ctrlNewTab: 'Ctrl: Pestaña nueva',
    add: 'Añadir', addShortcut: 'Añadir acceso', editShortcut: 'Editar acceso', deleteShortcut: 'Eliminar acceso',
    open: 'Abrir', openNewTab: 'Abrir en una pestaña nueva', copyLink: 'Copiar enlace',
    general: 'General', links: 'Enlaces', background: 'Fondo', close: 'Cerrar',
    searchAndAi: 'Búsqueda e IA', gridConfiguration: 'Configuración de cuadrícula',
    maxCols: 'Máx. columnas', maxRows: 'Máx. filas', currentShortcuts: 'Accesos actuales', dragToReorder: '(Arrastra para ordenar)',
    addNewShortcut: 'Añadir nuevo acceso', edit: 'Editar', delete: 'Eliminar',
    colors: 'Colores', customWallpapers: 'Fondos personalizados', uploadOrDrag: 'Subir o arrastrar imagen', dropToUpload: 'Suelta para subir',
    newShortcut: 'Añadir nuevo acceso', name: 'Nombre', url: 'URL', imageUrlOptional: 'URL de imagen (opcional)',
    searching: 'Buscando…', preview: 'Vista previa', shortcutName: 'Nombre del acceso', cancel: 'Cancelar', saveChanges: 'Guardar cambios',
    language: 'Idioma', spanish: 'Castellano', english: 'Inglés',
  },
  en: {
    settings: 'Settings', search: 'Search', ai: 'AI', searchOrAsk: 'Search or ask AI…',
    searchEngine: 'Search engine', aiEngine: 'AI engine', blurredBackground: 'Blurred background',
    searchWithEngine: 'Search with the search engine (Ctrl + click or middle click for a new tab)',
    searchWithAi: 'Search with AI (Ctrl + click or middle click for a new tab)',
    enterSearch: 'Enter: Search', altAi: 'Alt + Enter: AI', ctrlNewTab: 'Ctrl: New tab',
    add: 'Add', addShortcut: 'Add shortcut', editShortcut: 'Edit shortcut', deleteShortcut: 'Delete shortcut',
    open: 'Open', openNewTab: 'Open in new tab', copyLink: 'Copy link',
    general: 'General', links: 'Links', background: 'Background', close: 'Close',
    searchAndAi: 'Search & AI', gridConfiguration: 'Grid configuration',
    maxCols: 'Max cols', maxRows: 'Max rows', currentShortcuts: 'Current shortcuts', dragToReorder: '(Drag to reorder)',
    addNewShortcut: 'Add new shortcut', edit: 'Edit', delete: 'Delete',
    colors: 'Colors', customWallpapers: 'Custom wallpapers', uploadOrDrag: 'Upload or drag image', dropToUpload: 'Drop to upload',
    newShortcut: 'Add new shortcut', name: 'Name', url: 'URL', imageUrlOptional: 'Image URL (optional)',
    searching: 'Searching…', preview: 'Preview', shortcutName: 'Shortcut name', cancel: 'Cancel', saveChanges: 'Save changes',
    language: 'Language', spanish: 'Spanish', english: 'English',
  },
} as const;

type TranslationKey = keyof typeof messages.en;
const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void; t: (key: TranslationKey) => string } | null>(null);

function getInitialLanguage(): Language {
  const saved = localStorage.getItem('language');
  if (saved === 'en' || saved === 'es') return saved;
  return navigator.language.toLowerCase().startsWith('en') ? 'en' : 'es';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const value = useMemo(() => ({
    language,
    setLanguage: (next: Language) => { localStorage.setItem('language', next); setLanguageState(next); },
    t: (key: TranslationKey) => messages[language][key],
  }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
}
