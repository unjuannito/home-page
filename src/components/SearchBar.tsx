
import { useState, useEffect, type KeyboardEvent, type MouseEvent } from 'react';
import magnifyingGlass from '../assets/magnifying-glass.svg';
import commentsIcon from '../assets/comments.svg';
import type { SearchSettings } from '../types';
import { useI18n } from '../i18n';

export default function SearchBar() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [settings, setSettings] = useState<SearchSettings>({
    searchEngine: 'https://www.google.com/search?q=',
    aiEngine: 'https://chatgpt.com/?q=',
    showBlur: true
  });

  const loadSettings = () => {
    const saved = localStorage.getItem('searchSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings({
        ...parsed,
        showBlur: parsed.showBlur !== undefined ? parsed.showBlur : true
      });
    }
  };

  useEffect(() => {
    loadSettings();
    window.addEventListener('storage-update', loadSettings);
    return () => window.removeEventListener('storage-update', loadSettings);
  }, []);

  const handleSearch = (type: 'search' | 'ai', newTab: boolean = false) => {
    const trimmedQuery = query.trim();
    const baseUrl = type === 'search' ? settings.searchEngine : settings.aiEngine;
    
    // URL Detection logic
    const isUrl = (text: string) => {
      // Basic URL regex: starts with http/https OR has a dot and no spaces
      const pattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/;
      return pattern.test(text) && !text.includes(' ');
    };

    let url = '';

    if (!trimmedQuery) {
      // If query is empty, open the base URL without query parameter
      url = baseUrl.replace(/[?&][^=]*=$/, '');
    } else if (type === 'search' && isUrl(trimmedQuery)) {
      // If it's a search and looks like a URL, go directly to it
      url = trimmedQuery.startsWith('http') ? trimmedQuery : `https://${trimmedQuery}`;
    } else {
      // Otherwise, use the search/AI engine
      url = baseUrl + encodeURIComponent(trimmedQuery);
    }

    if (newTab) {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      document.getElementById('settings-button')?.focus();
      return;
    }

    if (e.key === 'Enter') {
      const isNewTab = e.ctrlKey;
      const isAI = e.altKey;

      if (isAI) {
        handleSearch('ai', isNewTab);
      } else {
        handleSearch('search', isNewTab);
      }
    }
  };

  const onIconClick = (e: MouseEvent, type: 'search' | 'ai') => {
    // button 1 is the middle click
    const isNewTab = e.ctrlKey || e.button === 1;
    handleSearch(type, isNewTab);
  };

  return (
    <div className="relative w-full max-w-2xl group flex items-center bg-zinc-900/60 backdrop-blur-xl border border-white/20 rounded-2xl px-2 transition-all focus-within:border-blue-500/50 focus-within:bg-zinc-900/80 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      {/* Search Icon (Left) */}
      <button
        onClick={(e) => onIconClick(e, 'search')}
        onAuxClick={(e) => onIconClick(e, 'search')}
        tabIndex={-1}
        className="p-2 hover:bg-white/15 rounded-xl transition-colors duration-200 focus:outline-none"
        title={t('searchWithEngine')}
      >
        <img src={magnifyingGlass} alt={t('search')} className="w-6 h-6 opacity-70 group-focus-within:opacity-100 transition-opacity invert" />
      </button>

      <input
        id="search-input"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('searchOrAsk')}
        className="flex-1 bg-transparent border-none outline-none py-4 px-2 text-lg text-white placeholder:text-white/40 focus:outline-none"
      />

      {/* AI Icon (Right) */}
      <button
        onClick={(e) => onIconClick(e, 'ai')}
        onAuxClick={(e) => onIconClick(e, 'ai')}
        tabIndex={-1}
        className="p-2 hover:bg-white/15 rounded-xl transition-colors duration-200 focus:outline-none"
        title={t('searchWithAi')}
      >
        <img src={commentsIcon} alt={t('ai')} className="w-6 h-6 opacity-70 group-focus-within:opacity-100 transition-opacity invert" />
      </button>

      {/* Shortcuts Hint */}
      <div className="absolute -bottom-12 left-0 right-0 hidden lg:group-focus-within:flex justify-center gap-2 text-[11px] font-medium opacity-0 translate-y-4 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-500 ease-out pointer-events-none">
        <span className="px-2 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-white/70 shadow-lg">{t('enterSearch')}</span>
        <span className="px-2 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-white/70 shadow-lg">{t('altAi')}</span>
        <span className="px-2 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-white/70 shadow-lg">{t('ctrlNewTab')}</span>
      </div>
    </div>
  );
}
