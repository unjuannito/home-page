import { useState, useEffect, useRef } from 'react'
import SearchBar from './components/SearchBar'
import ShortcutsNav from './components/ShortcutsNav'
import gearIcon from './assets/gear.svg'
import SettingsDialog from './components/SettingsDialog'
import { getWallpaper } from './db'
import { useI18n } from './i18n'

function App() {
  const { t } = useI18n()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [bgStyle, setBgStyle] = useState<React.CSSProperties>({ backgroundColor: '#1a1a1a' })
  const backgroundUrlRef = useRef<string | null>(null)

  const updateBackground = async () => {
    if (backgroundUrlRef.current) {
      URL.revokeObjectURL(backgroundUrlRef.current)
      backgroundUrlRef.current = null
    }

    const savedBg = localStorage.getItem('appBackground') || '#1a1a1a'

    if (savedBg.startsWith('custom:')) {
      const id = savedBg.split(':')[1]
      const blob = await getWallpaper(id)
      if (blob) {
        const url = URL.createObjectURL(blob)
        backgroundUrlRef.current = url
        setBgStyle({
          backgroundImage: `url(${url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        })
      }
    } else {
      setBgStyle({ backgroundColor: savedBg })
    }
  }

  const [isSearchVisible, setIsSearchVisible] = useState(true)
  const [isShortcutsVisible, setIsShortcutsVisible] = useState(true)

  useEffect(() => {
    const updateVH = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    const handleStorageUpdate = () => {
      updateBackground()
      updateVH()
    }

    void updateBackground()
    window.addEventListener('storage-update', handleStorageUpdate)

    updateVH()
    window.addEventListener('resize', updateVH)

    // Detección automática de visibilidad
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.getAttribute('data-id') === 'search-bar') {
            setIsSearchVisible(entry.isIntersecting)
          }
          if (entry.target.getAttribute('data-id') === 'shortcuts-nav') {
            setIsShortcutsVisible(entry.isIntersecting)
          }
        })
      },
      { threshold: [0, 1] }
    )

    const searchEl = document.querySelector('[data-id="search-bar"]')
    const shortcutsEl = document.querySelector('[data-id="shortcuts-nav"]')

    if (searchEl) observer.observe(searchEl)
    if (shortcutsEl) observer.observe(shortcutsEl)

    return () => {
      if (backgroundUrlRef.current) {
        URL.revokeObjectURL(backgroundUrlRef.current)
      }
      window.removeEventListener('storage-update', handleStorageUpdate)
      window.removeEventListener('resize', updateVH)
      observer.disconnect()
    }
  }, [])

  return (
    <main
      className={`min-h-screen w-full flex flex-col items-center justify-center gap-6 md:gap-12 text-white px-4 md:px-8 transition-all duration-500 overflow-hidden ${!isSearchVisible || !isShortcutsVisible ? 'justify-start' : 'justify-center'
        }`}
      style={{
        ...bgStyle,
        minHeight: 'calc(var(--vh, 1vh) * 100)',
        height: 'calc(var(--vh, 1vh) * 100)'
      }}
    >
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-7xl flex flex-col items-center gap-6 md:gap-12 max-h-full py-4 scroll-smooth">
        <SearchBar />
        <div data-id="shortcuts-nav" className="w-full overflow-y-auto scrollbar-hide max-h-full px-8 md:px-4 lg:px-8">
          <ShortcutsNav />
        </div>
      </div>

      <button
        id="settings-button"
        type='button'
        onClick={() => setIsSettingsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            document.getElementById('search-input')?.focus();
          }
        }}
        className="fixed right-[1vw] bottom-[1vw] p-2 bg-transparent rounded-full hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
      >
        <img
          className="h-8 w-8 invert"
          src={gearIcon}
          alt={t('settings')}
        />
      </button>

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </main>
  )
}

export default App

