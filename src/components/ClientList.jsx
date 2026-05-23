import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function ClientList() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/clients')
      .then((res) => {
        const all = res.data.clients ?? []
        const seen = new Set()
        const valid = all.filter((c) => {
          if (!c.clientId || !c.firstName || !c.lastName) return false
          if (seen.has(c.clientId)) return false
          seen.add(c.clientId)
          return true
        })
        setClients(valid)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-medium text-[var(--text-h)]">Klienci</h1>
        <button
          onClick={() => navigate('/clients/new')}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          Dodaj klienta
        </button>
      </div>

      {loading && <p className="text-[var(--text)]">Ładowanie…</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && !error && clients.length === 0 && (
        <p className="text-[var(--text)]">Brak klientów.</p>
      )}

      {!loading && !error && clients.length > 0 && (
        <ul className="divide-y divide-[var(--border)]">
          {clients.map((client) => (
            <li key={client.clientId}>
              <Link
                to={`/clients/${client.clientId}`}
                className="flex items-baseline py-4 gap-2 hover:text-[var(--accent)] transition-colors group"
              >
                <span className="font-medium text-[var(--text-h)] group-hover:text-[var(--accent)]">
                  {client.firstName} {client.lastName}
                </span>
                {client.birthDate && (
                  <span className="text-sm text-[var(--text)]">
                    ur. {client.birthDate}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
