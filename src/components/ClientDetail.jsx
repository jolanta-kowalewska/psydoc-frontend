import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../api/client'

export default function ClientDetail() {
  const { clientId } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`/clients/${clientId}`)
      .then((res) => setClient(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [clientId])

  if (loading) return <p className="text-[var(--text)]">Ładowanie…</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!client) return <p className="text-[var(--text)]">Klient nie znaleziony.</p>

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/clients')} className="text-[var(--accent)] text-sm mb-4">
        ← Wróć do listy
      </button>

      <div className="border border-[var(--border)] rounded-lg p-6 space-y-4">
        <h1 className="text-2xl font-medium text-[var(--text-h)]">
          {client.firstName} {client.lastName}
        </h1>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[var(--text)]">PESEL:</span>
            <p className="font-medium text-[var(--text-h)]">{client.pesel}</p>
          </div>
          <div>
            <span className="text-[var(--text)]">Data urodzenia:</span>
            <p className="font-medium text-[var(--text-h)]">{client.birthDate}</p>
          </div>
          {client.email && (
            <div>
              <span className="text-[var(--text)]">Email:</span>
              <p className="font-medium text-[var(--text-h)]">{client.email}</p>
            </div>
          )}
          {client.phone && (
            <div>
              <span className="text-[var(--text)]">Telefon:</span>
              <p className="font-medium text-[var(--text-h)]">{client.phone}</p>
            </div>
          )}
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-medium text-[var(--text-h)] mb-4">Sesje</h2>
        <p className="text-[var(--text)]">Lista sesji — do implementacji.</p>
      </section>
    </div>
  )
}
