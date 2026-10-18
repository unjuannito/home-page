import { useState, useEffect } from 'react';
import type { LayoutConfig, SearchSettings } from '../../types';
import { useI18n, type Language } from '../../i18n';

interface GeneralSettingsProps {
  layout: LayoutConfig;
  onLayoutChange: (newLayout: LayoutConfig) => void;
  searchSettings: SearchSettings;
  onSearchSettingsChange: (settings: SearchSettings) => void;
}

const SEARCH_ENGINES = [
  { name: 'Google', url: 'https://www.google.com/search?q=' },
  { name: 'Bing', url: 'https://www.bing.com/search?q=' },
  { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
];

const AI_ENGINES = [
  { name: 'ChatGPT', url: 'https://chatgpt.com/?q=' },
  { name: 'Claude', url: 'https://claude.ai/new?q=' },
  { name: 'Perplexity', url: 'https://www.perplexity.ai/?q=' },
  { name: 'Google AI', url: 'https://www.google.com/ai?q=' },
];

function GridInput({ value, onChange }: { value: number, onChange: (val: number) => void }) {
  const [localValue, setLocalValue] = useState(value.toString());

  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    
    const parsed = parseInt(val);
    if (!isNaN(parsed) && parsed > 0) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    const parsed = parseInt(localValue);
    if (isNaN(parsed) || parsed <= 0) {
      setLocalValue(value.toString());
    }
  };

  return (
    <input
      type="number"
      min="1"
      step="1"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className="w-16 bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-center"
    />
  );
}

export default function GeneralSettings({
  layout,
  onLayoutChange,
  searchSettings,
  onSearchSettingsChange
}: GeneralSettingsProps) {
  const { t } = useI18n();
  const { language, setLanguage } = useI18n();
  return (
    <main className="p-4 md:p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start content-start custom-scrollbar">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl">
          <span className="font-medium">{t('language')}</span>
          <select
            aria-label={t('language')}
            value={language}
            onChange={(event) => setLanguage(event.target.value as Language)}
            className="bg-black/20 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none"
          >
            <option value="es" className="text-black">{t('spanish')}</option>
            <option value="en" className="text-black">{t('english')}</option>
          </select>
        </div>
        <h3 className="text-lg font-semibold">{t('searchAndAi')}</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl">
            <span className="font-medium">{t('searchEngine')}</span>
            <select
              value={searchSettings.searchEngine}
              onChange={(e) => onSearchSettingsChange({ ...searchSettings, searchEngine: e.target.value })}
              className="bg-black/20 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none"
            >
              {SEARCH_ENGINES.map(engine => (
                <option key={engine.name} value={engine.url}>{engine.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl">
            <span className="font-medium">{t('aiEngine')}</span>
            <select
              value={searchSettings.aiEngine}
              onChange={(e) => onSearchSettingsChange({ ...searchSettings, aiEngine: e.target.value })}
              className="bg-black/20 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none"
            >
              {AI_ENGINES.map(ai => (
                <option key={ai.name} value={ai.url}>{ai.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl">
            <span className="font-medium">{t('blurredBackground')}</span>
            <button
              onClick={() => onSearchSettingsChange({ ...searchSettings, showBlur: !searchSettings.showBlur })}
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${searchSettings.showBlur ? 'bg-blue-500' : 'bg-zinc-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${searchSettings.showBlur ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">{t('gridConfiguration')}</h3>
        <div className="flex flex-col gap-3">
          {(['pc', 'tablet', 'mobile'] as const).map(device => (
            <div key={device} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl">
              <span className="font-medium capitalize">{device}</span>
              <div className="flex gap-4">
                <label className="flex flex-col items-center">
                  <span className="text-[10px] text-white/40 uppercase mb-1">{t('maxCols')}</span>
                  <GridInput
                    value={layout[device].cols}
                    onChange={val => onLayoutChange({ ...layout, [device]: { ...layout[device], cols: val } })}
                  />
                </label>
                <label className="flex flex-col items-center">
                  <span className="text-[10px] text-white/40 uppercase mb-1">{t('maxRows')}</span>
                  <GridInput
                    value={layout[device].rows}
                    onChange={val => onLayoutChange({ ...layout, [device]: { ...layout[device], rows: val } })}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
