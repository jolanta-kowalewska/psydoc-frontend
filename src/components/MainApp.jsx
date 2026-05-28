import { Link, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'

const ZOOM_LEVELS = [
  { label: 'A',   size: 16 },
  { label: 'A+',  size: 20 },
  { label: 'A++', size: 24 },
]

const NAV_LINKS = [
  { to: '/',         label: 'Przegląd',      exact: true },
  { to: '/clients',  label: 'Klienci' },
  { to: '/calendar', label: 'Kalendarz' },
  { to: '/profile',  label: 'Profil' },
  { to: '/start',    label: 'Pierwsze kroki' },
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
      <header className="border-b border-[var(--border)] bg-[var(--bg)]">
        {/* top bar */}
        <div className="flex items-center justify-between px-6 py-3">
          <Link to="/" className="font-semibold text-lg text-[var(--text-h)] tracking-tight">
            MindData
          </Link>
          <div className="flex items-center gap-4 text-sm text-[var(--text)]">
            <div className="flex items-center gap-px border border-[var(--border)] rounded-lg overflow-hidden">
              {ZOOM_LEVELS.map(({ label, size }) => (
                <button
                  key={size}
                  onClick={() => setZoom(size)}
                  className={`px-2.5 py-1.5 transition-colors ${
                    zoom === size
                      ? 'bg-[var(--accent)] text-white'
                      : 'hover:bg-[var(--code-bg)] text-[var(--text)]'
                  }`}
                  style={{ fontSize: `${size * 0.7}px` }}
                  title={`Rozmiar tekstu: ${label}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="text-[var(--text)] text-xs hidden md:block">
              {user?.signInDetails?.loginId}
            </span>
            <button
              onClick={signOut}
              className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              Wyloguj
            </button>
          </div>
        </div>

        {/* nav bar */}
        <nav className="flex gap-1 px-5 pb-0">
          {NAV_LINKS.map(({ to, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-[var(--accent)] text-[var(--accent)]'
                    : 'border-transparent text-[var(--text)] hover:text-[var(--text-h)] hover:border-[var(--border)]'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  )
}
