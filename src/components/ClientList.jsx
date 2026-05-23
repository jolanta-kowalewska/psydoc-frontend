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
      .then((res) => setClients(res.data.clients ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

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

      {loading && (
        <p className="text-[var(--text)]">Ładowanie…</p>
      )}

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {!loading && !error && clients.length === 0 && (
        <p className="text-[var(--text)]">Brak klientów.</p>
      )}

      {!loading && !error && clients.length > 0 && (
        <ul className="divide-y divide-[var(--border)]">
          {clients.map((client) => (
            <li key={client.clientId}>
              <Link
                to={`/clients/${client.clientId}`}
                className="flex items-baseline py-4 hover:text-[var(--accent)] transition-colors"
              >
                <span className="font-medium text-[var(--text-h)]">
                  {client.firstName} {client.lastName}
                </span>
                {client.birthDate && (
                  <span className="text-sm text-[var(--text)] ml-2">
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
