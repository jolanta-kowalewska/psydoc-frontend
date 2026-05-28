import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { InlineWidget } from 'react-calendly'
import api from '../api/client'
import ConsentSection from './ConsentSection'

function isMinorClient(client) {
  if (!client?.birthDate) return false
  const dob = new Date(client.birthDate)
  const today = new Date()
  const age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  return age < 18 || (age === 18 && m < 0)
}

const SESSION_TYPES = [
  'indywidualna',
  'diagnostyczna',
  'konsultacja',
  'grupowa',
  'arkusz_testu',
  'notatki_robocze',
]

const SESSION_TYPE_LABELS = {
  indywidualna: 'Indywidualna',
  diagnostyczna: 'Diagnostyczna',
  konsultacja: 'Konsultacja',
  grupowa: 'Grupowa',
  arkusz_testu: 'Arkusz testu',
  notatki_robocze: 'Notatki robocze',
}

const NOTES_LIMIT = 10_000

function NoteForm({ clientId, onCreated, onCancel }) {
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({ sessionType: SESSION_TYPES[0], date: today, notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'notes' && value.length > NOTES_LIMIT) return
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.notes.trim()) { setError('Treść notatki jest wymagana'); return }
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

  const notesLen = form.notes.length
  const nearLimit = notesLen > NOTES_LIMIT * 0.9

  return (
    <form onSubmit={handleSubmit} className="border border-[var(--border)] rounded-lg p-6 space-y-5">
      <h3 className="font-medium text-[var(--text-h)]">Nowa notatka</h3>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[var(--text)] mb-2">Typ notatki</label>
          <select
            name="sessionType"
            value={form.sessionType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--text-h)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            {SESSION_TYPES.map(t => (
              <option key={t} value={t}>{SESSION_TYPE_LABELS[t] ?? t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-[var(--text)] mb-2">Data *</label>
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
        <div className="flex items-baseline justify-between mb-2">
          <label className="text-sm text-[var(--text)]">Treść *</label>
          <span className={`text-xs tabular-nums ${nearLimit ? 'text-amber-600' : 'text-[var(--text)]'}`}>
            {notesLen.toLocaleString()} / {NOTES_LIMIT.toLocaleString()}
          </span>
        </div>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={6}
          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--text-h)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-y"
          placeholder="Przebieg sesji, obserwacje, plan na kolejną wizytę…"
        />
      </div>
      <div className="flex gap-3 pt-1">
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
          {loading ? 'Zapisuję…' : 'Zapisz notatkę'}
        </button>
      </div>
    </form>
  )
}

function NoteItem({ session, clientId, selectMode, isSelected, onToggle, isLast }) {
  const sessionId = session.PK?.replace('SESSION#', '') ?? session.id
  const isSigned = session.state === 'signed'
  const isRestricted = session.accessRestricted

  return (
    <li className="flex items-stretch gap-0">
      {/* Timeline indicator */}
      <div className="flex flex-col items-center w-8 shrink-0 pt-5">
        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isSigned ? 'bg-[var(--accent)]' : 'bg-[var(--border)] border-2 border-[var(--border)]'}`} />
        {!isLast && <div className="flex-1 w-px bg-[var(--border)] mt-1" />}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start gap-3 pb-5 pl-3">
        {selectMode && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggle(sessionId)}
            className="mt-5 w-4 h-4 shrink-0 accent-[var(--accent)] cursor-pointer"
          />
        )}
        <Link
          to={`/clients/${clientId}/sessions/${sessionId}`}
          className="flex-1 group pt-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-[var(--text-h)] group-hover:text-[var(--accent)] transition-colors">
                  {session.date}
                </span>
                <span className="text-sm text-[var(--text)]">
                  {SESSION_TYPE_LABELS[session.sessionType] ?? session.sessionType}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full ${isSigned ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {isSigned ? 'podpisana' : 'szkic'}
                </span>
                {isRestricted && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    ograniczona
                  </span>
                )}
              </div>
            </div>
            <span className="text-[var(--text)] text-sm opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0">→</span>
          </div>
        </Link>
      </div>
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
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState(null)
  const [calendlyUrl, setCalendlyUrl] = useState(null)
  const [showConsents, setShowConsents] = useState(false)

  useEffect(() => {
    api.get(`/clients/${clientId}`)
      .then(res => setClient(res.data))
      .catch(e => setError(e.message))
      .finally(() => setClientLoading(false))
    api.get('/psychologist/profile')
      .then(res => setCalendlyUrl(res.data.calendlyUrl || null))
      .catch(() => {})
  }, [clientId])

  const loadSessions = () => {
    setSessionsLoading(true)
    api.get(`/sessions?clientId=${clientId}`)
      .then(res => {
        const all = (res.data.sessions ?? []).filter(s => s.PK?.startsWith('SESSION#'))
        setSessions(all.sort((a, b) => b.date.localeCompare(a.date)))
      })
      .catch(() => {})
      .finally(() => setSessionsLoading(false))
  }

  useEffect(() => { loadSessions() }, [clientId])

  const toggleSelect = (sessionId) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(sessionId) ? next.delete(sessionId) : next.add(sessionId)
      return next
    })
  }

  const handleBulkExport = async () => {
    setExporting(true)
    setExportError(null)
    try {
      const res = await api.post('/documents/full-export', {
        clientId,
        sessionIds: [...selectedIds],
      })
      window.open(res.data.url, '_blank')
      setSelectMode(false)
      setSelectedIds(new Set())
    } catch (e) {
      setExportError(e.message)
    } finally {
      setExporting(false)
    }
  }

  if (clientLoading) return <p className="text-[var(--text)]">Ładowanie…</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!client) return <p className="text-[var(--text)]">Klient nie znaleziony.</p>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate('/clients')} className="text-[var(--accent)] text-sm">
        ← Wróć do listy
      </button>

      {/* Patient header */}
      <div className="border border-[var(--border)] rounded-lg p-6">
        <h1 className="text-2xl font-medium text-[var(--text-h)] mb-4">
          {client.firstName} {client.lastName}
          {isMinorClient(client) && (
            <span className="ml-3 text-sm font-normal text-[var(--text)] px-2 py-0.5 bg-[var(--code-bg)] rounded">
              małoletni
            </span>
          )}
        </h1>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div>
            <dt className="text-[var(--text)]">PESEL</dt>
            <dd className="font-medium text-[var(--text-h)] mt-0.5">{client.pesel}</dd>
          </div>
          <div>
            <dt className="text-[var(--text)]">Data urodzenia</dt>
            <dd className="font-medium text-[var(--text-h)] mt-0.5">{client.birthDate}</dd>
          </div>
          {client.email && (
            <div>
              <dt className="text-[var(--text)]">Email</dt>
              <dd className="font-medium text-[var(--text-h)] mt-0.5">{client.email}</dd>
            </div>
          )}
          {client.phone && (
            <div>
              <dt className="text-[var(--text)]">Telefon</dt>
              <dd className="font-medium text-[var(--text-h)] mt-0.5">{client.phone}</dd>
            </div>
          )}
          {client.address && (
            <div className="col-span-2">
              <dt className="text-[var(--text)]">Adres</dt>
              <dd className="font-medium text-[var(--text-h)] mt-0.5">{client.address}</dd>
            </div>
          )}
          {client.guardianName && (
            <div className="col-span-2 pt-1 border-t border-[var(--border)]">
              <dt className="text-[var(--text)]">Opiekun</dt>
              <dd className="font-medium text-[var(--text-h)] mt-0.5">
                {client.guardianName}
                {client.guardianRelation && (
                  <span className="text-[var(--text)] font-normal ml-1.5">({client.guardianRelation})</span>
                )}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Notes / session timeline */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-[var(--text-h)]">
            Notatki
            {!sessionsLoading && sessions.length > 0 && (
              <span className="text-sm font-normal text-[var(--text)] ml-2">{sessions.length}</span>
            )}
          </h2>
          <div className="flex gap-2">
            {!showForm && sessions.length > 0 && (
              <button
                onClick={() => { setSelectMode(v => !v); setSelectedIds(new Set()); setExportError(null) }}
                className="px-3 py-1.5 border border-[var(--border)] text-[var(--text-h)] rounded-lg text-sm hover:bg-[var(--code-bg)] transition-colors"
              >
                {selectMode ? 'Anuluj' : 'Eksportuj'}
              </button>
            )}
            {!showForm && !selectMode && (
              <button
                onClick={() => setShowForm(true)}
                className="px-3 py-1.5 bg-[var(--accent)] text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
              >
                Nowa notatka
              </button>
            )}
          </div>
        </div>

        {selectMode && (
          <div className="mb-4 flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setSelectedIds(new Set(sessions.map(s => s.PK?.replace('SESSION#', '') ?? s.id)))}
              className="text-sm text-[var(--accent)] hover:underline"
            >
              Zaznacz wszystkie
            </button>
            <button
              onClick={() => setSelectedIds(new Set(sessions.filter(s => !s.accessRestricted).map(s => s.PK?.replace('SESSION#', '') ?? s.id)))}
              className="text-sm text-[var(--accent)] hover:underline"
            >
              Zaznacz dostępne dla pacjenta
            </button>
            <button
              onClick={handleBulkExport}
              disabled={selectedIds.size === 0 || exporting}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {exporting ? 'Generuję…' : `Eksportuj zaznaczone (${selectedIds.size})`}
            </button>
            {exportError && <p className="text-red-500 text-sm">{exportError}</p>}
          </div>
        )}

        {showForm && (
          <div className="mb-6">
            <NoteForm
              clientId={clientId}
              onCreated={() => { setShowForm(false); loadSessions() }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {sessionsLoading && <p className="text-[var(--text)] text-sm">Ładowanie notatek…</p>}

        {!sessionsLoading && sessions.length === 0 && !showForm && (
          <p className="text-[var(--text)] text-sm">Brak notatek.</p>
        )}

        {!sessionsLoading && sessions.length > 0 && (
          <ul className="overflow-hidden">
            {sessions.map((s, i) => {
              const sid = s.PK?.replace('SESSION#', '') ?? s.id
              return (
                <NoteItem
                  key={s.PK ?? s.id}
                  session={s}
                  clientId={clientId}
                  selectMode={selectMode}
                  isSelected={selectedIds.has(sid)}
                  onToggle={toggleSelect}
                  isLast={i === sessions.length - 1}
                />
              )
            })}
          </ul>
        )}
      </section>

      {/* Consents — collapsible */}
      <section className="border border-[var(--border)] rounded-lg overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[var(--code-bg)] transition-colors"
          onClick={() => setShowConsents(v => !v)}
        >
          <span className="text-base font-medium text-[var(--text-h)]">Zgody</span>
          <span className="text-[var(--text)] text-sm">{showConsents ? '▲' : '▼'}</span>
        </button>
        {showConsents && (
          <div className="border-t border-[var(--border)] p-6">
            <ConsentSection
              clientId={clientId}
              clientName={`${client.firstName} ${client.lastName}`}
              isMinor={isMinorClient(client)}
            />
          </div>
        )}
      </section>

      {/* Calendly */}
      {calendlyUrl && (
        <section>
          <h2 className="text-base font-medium text-[var(--text-h)] mb-4">Umów wizytę</h2>
          <div className="border border-[var(--border)] rounded-lg overflow-hidden">
            <InlineWidget
              url={calendlyUrl}
              styles={{ minWidth: '320px', height: '700px' }}
            />
          </div>
        </section>
      )}
    </div>
  )
}
