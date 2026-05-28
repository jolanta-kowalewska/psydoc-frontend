import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { getClientCategory, sortByCategory, CATEGORIES } from '../utils/clientCategories'

const FILTERS = [
  { id: null,           label: 'Wszyscy' },
  { id: 'regularny',   label: 'Regularni' },
  { id: 'konsultacje', label: 'Konsultacje' },
  { id: 'archiwalny',  label: 'Archiwalni' },
]

export default function ClientList() {
  const [clients, setClients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([api.get('/clients'), api.get('/appointments')])
      .then(([cRes, aRes]) => {
        const all = cRes.data.clients ?? []
        const seen = new Set()
        const valid = all.filter((c) => {
          if (!c.clientId || !c.firstName || !c.lastName) return false
          if (seen.has(c.clientId)) return false
          seen.add(c.clientId)
          return true
        })
        setClients(valid)
        setAppointments(aRes.data.appointments ?? [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const categoryMap = useMemo(() => {
    const map = {}
    clients.forEach(c => { map[c.clientId] = getClientCategory(c.clientId, appointments) })
    return map
  }, [clients, appointments])

  const counts = useMemo(() => {
    const c = { regularny: 0, konsultacje: 0, archiwalny: 0 }
    Object.values(categoryMap).forEach(cat => { if (cat) c[cat] = (c[cat] ?? 0) + 1 })
    return c
  }, [categoryMap])

  const displayed = useMemo(() => {
    const filtered = activeFilter
      ? clients.filter(c => categoryMap[c.clientId] === activeFilter)
      : clients
    return sortByCategory(filtered, categoryMap)
  }, [clients, categoryMap, activeFilter])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium text-[var(--text-h)]">Klienci</h1>
        <button
          onClick={() => navigate('/clients/new')}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          Dodaj klienta
        </button>
      </div>

      {/* Filtry */}
      {!loading && !error && clients.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTERS.map(f => {
            const count = f.id ? counts[f.id] : clients.length
            const isActive = activeFilter === f.id
            return (
              <button
                key={String(f.id)}
                onClick={() => setActiveFilter(f.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors border ${
                  isActive
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                    : 'border-[var(--border)] text-[var(--text-h)] hover:bg-[var(--code-bg)]'
                }`}
              >
                {f.label}
                <span className={`text-xs tabular-nums ${isActive ? 'opacity-80' : 'text-[var(--text)]'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {loading && <p className="text-[var(--text)]">Ładowanie…</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && !error && displayed.length === 0 && (
        <p className="text-[var(--text)]">
          {activeFilter ? `Brak klientów w kategorii "${FILTERS.find(f => f.id === activeFilter)?.label}".` : 'Brak klientów.'}
        </p>
      )}

      {!loading && !error && displayed.length > 0 && (
        <ul className="divide-y divide-[var(--border)]">
          {displayed.map((client) => {
            const cat = categoryMap[client.clientId]
            const catDef = cat ? CATEGORIES[cat] : null
            return (
              <li key={client.clientId}>
                <Link
                  to={`/clients/${client.clientId}`}
                  className="flex items-center justify-between py-4 gap-3 group"
                >
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="font-medium text-[var(--text-h)] group-hover:text-[var(--accent)] transition-colors truncate">
                      {client.firstName} {client.lastName}
                    </span>
                    {client.birthDate && (
                      <span className="text-sm text-[var(--text)] shrink-0">
                        ur. {client.birthDate}
                      </span>
                    )}
                  </div>
                  {catDef && (
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${catDef.color}`}>
                      {catDef.label}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
