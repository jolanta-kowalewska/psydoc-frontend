import { Link, NavLink } from 'react-router-dom'

export default function MainApp({ user, signOut, children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--border)]">
        <Link to="/clients" className="text-[var(--text-h)] font-medium text-lg">
          MindData
        </Link>
        <div className="flex items-center gap-4 text-sm text-[var(--text)]">
          <span>{user?.signInDetails?.loginId}</span>
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
