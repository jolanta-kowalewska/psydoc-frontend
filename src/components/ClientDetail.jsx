import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../api/client'

const SESSION_TYPES = [
  'indywidualna',
  'diagnostyczna',
  'konsultacja',
  'grupowa',
]

function SessionForm({ clientId, onCreated, onCancel }) {
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({ sessionType: SESSION_TYPES[0], date: today, notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.notes.trim()) { setError('Notatki są wymagane'); return }
    setError(null)
    setLoading(true)
    try {
      await api.post('/sessions', { clientId, ...form })
      onCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-[var(--border)] rounded-lg p-4 space-y-4">
      <h3 className="font-medium text-[var(--text-h)]">Nowa sesja</h3>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[var(--text)] mb-1">Typ sesji</label>
          <select
            name="sessionType"
            value={form.sessionType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--text-h)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            {SESSION_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-[var(--text)] mb-1">Data *</label>
          <input
            name="date"
            type="date"
            required
            value={form.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--text-h)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-[var(--text)] mb-1">Notatki *</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={5}
          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--text-h)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-y"
          placeholder="Przebieg sesji, obserwacje, plan na kolejną wizytę…"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-[var(--border)] text-[var(--text-h)] rounded-lg text-sm hover:bg-[var(--code-bg)] transition-colors"
        >
          Anuluj
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Zapisuję…' : 'Zapisz sesję'}
        </button>
      </div>
    </form>
  )
}

function SessionItem({ session, onSigned }) {
  const [signing, setSigning] = useState(false)
  const [error, setError] = useState(null)

  const sessionId = session.PK?.replace('SESSION#', '') ?? session.id

  const handleSign = async () => {
    setSigning(true)
    setError(null)
    try {
      await api.post(`/sessions/${sessionId}/sign`)
      onSigned()
    } catch (err) {
      setError(err.message)
    } finally {
      setSigning(false)
    }
  }

  const isSigned = session.state === 'signed'

  return (
    <li className="py-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-medium text-[var(--text-h)]">{session.date}</span>
          <span className="text-sm text-[var(--text)] capitalize">{session.sessionType}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${isSigned ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {isSigned ? 'podpisana' : 'szkic'}
          </span>
        </div>
        {!isSigned && (
          <button
            onClick={handleSign}
            disabled={signing}
            className="text-sm px-3 py-1 border border-[var(--border)] text-[var(--text-h)] rounded-lg hover:bg-[var(--code-bg)] disabled:opacity-50 transition-colors"
          >
            {signing ? 'Podpisuję…' : 'Podpisz'}
          </button>
        )}
      </div>
      {isSigned && (
        <p className="text-xs text-[var(--text)]">Podpisano: {session.signedAt?.slice(0, 16).replace('T', ' ')}</p>
      )}
      <p className="text-sm text-[var(--text)] whitespace-pre-wrap">{session.notes}</p>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </li>
  )
}

export default function ClientDetail() {
  const { clientId } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [sessions, setSessions] = useState([])
  const [clientLoading, setClientLoading] = useState(true)
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    api.get(`/clients/${clientId}`)
      .then((res) => setClient(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setClientLoading(false))
  }, [clientId])

  const loadSessions = () => {
    setSessionsLoading(true)
    api.get(`/sessions?clientId=${clientId}`)
      .then((res) => {
        const sorted = (res.data.sessions ?? []).sort((a, b) => b.date.localeCompare(a.date))
        setSessions(sorted)
      })
      .catch(() => {})
      .finally(() => setSessionsLoading(false))
  }

  useEffect(() => { loadSessions() }, [clientId])

  if (clientLoading) return <p className="text-[var(--text)]">Ładowanie…</p>
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-[var(--text-h)]">
            Sesje {!sessionsLoading && sessions.length > 0 && (
              <span className="text-sm font-normal text-[var(--text)] ml-1">({sessions.length})</span>
            )}
          </h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
            >
              Dodaj sesję
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-6">
            <SessionForm
              clientId={clientId}
              onCreated={() => { setShowForm(false); loadSessions() }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {sessionsLoading && <p className="text-[var(--text)] text-sm">Ładowanie sesji…</p>}

        {!sessionsLoading && sessions.length === 0 && (
          <p className="text-[var(--text)] text-sm">Brak sesji.</p>
        )}

        {!sessionsLoading && sessions.length > 0 && (
          <ul className="divide-y divide-[var(--border)]">
            {sessions.map((s) => (
              <SessionItem
                key={s.PK ?? s.id}
                session={s}
                onSigned={loadSessions}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
