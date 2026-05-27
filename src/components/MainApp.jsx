import { Link, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'

const ZOOM_LEVELS = [
  { label: 'A',   size: 16 },
  { label: 'A+',  size: 20 },
  { label: 'A++', size: 24 },
]

export default function MainApp({ user, signOut, children }) {
  const [zoom, setZoom] = useState(() => {
    const saved = localStorage.getItem('minddata-zoom')
    return saved ? parseInt(saved) : 16
  })

  useEffect(() => {
    document.documentElement.style.fontSize = `${zoom}px`
    localStorage.setItem('minddata-zoom', zoom)
    window.dispatchEvent(new CustomEvent('zoomchange', { detail: zoom }))
  }, [zoom])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--border)]">
        <Link to="/clients" className="text-[var(--text-h)] font-medium text-lg">
          MindData
        </Link>
        <div className="flex items-center gap-4 text-sm text-[var(--text)]">
          <div className="flex items-center gap-1 border border-[var(--border)] rounded-lg overflow-hidden">
            {ZOOM_LEVELS.map(({ label, size }) => (
              <button
                key={size}
                onClick={() => setZoom(size)}
                className={`px-2 py-1 transition-colors ${zoom === size ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--code-bg)] text-[var(--text)]'}`}
                style={{ fontSize: `${size * 0.7}px` }}
                title={`Rozmiar tekstu: ${label}`}
              >
                {label}
              </button>
            ))}
          </div>
          <span>{user?.signInDetails?.loginId}</span>
          <NavLink
            to="/clients"
            className={({ isActive }) =>
              isActive ? 'text-[var(--accent)]' : 'hover:text-[var(--accent)] transition-colors'
            }
          >
            Klienci
          </NavLink>
          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              isActive ? 'text-[var(--accent)]' : 'hover:text-[var(--accent)] transition-colors'
            }
          >
            Kalendarz
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? 'text-[var(--accent)]' : 'hover:text-[var(--accent)] transition-colors'
            }
          >
            Profil
          </NavLink>
          <button onClick={signOut} className="text-[var(--accent)] hover:underline">
            Wyloguj
          </button>
        </div>
      </header>
      <main className="flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  )
}
