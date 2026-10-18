import plusIcon from '../assets/plus.svg';
import { useI18n } from '../i18n';

export default function NewShortcut({ onClick }: { onClick: () => void }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center p-[var(--shortcut-padding)] rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 focus:border-white/20 bg-white/5 hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 group cursor-pointer w-[var(--shortcut-total-width)]"
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/10 rounded-full group-hover:bg-white/20 group-hover:scale-125 transition-all duration-300"
        >
          <img
            src={plusIcon}
            alt={t('add')}
            className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-all duration-300 invert"
          />
        </div>
        <span className="text-[8px] md:text-[10px] h-[var(--shortcut-text-height)] flex items-center justify-center font-bold text-white/40 uppercase tracking-widest group-hover:text-white/70 transition-colors">
          {t('addShortcut')}
        </span>
      </div>
      {/* Spacer to match Shortcut.tsx text height if necessary, 
          but here we want it centered like the image */}
    </button>
  );
}
