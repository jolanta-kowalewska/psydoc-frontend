import { useState, useEffect, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'

const DEFAULT_APPOINTMENT_TYPES = [
  { id: 'default-individual', name: 'Indywidualna', durationMinutes: 50 },
  { id: 'default-diagnostic', name: 'Diagnostyczna', durationMinutes: 60 },
]
import { format, parse, startOfWeek, endOfWeek, getDay, addMinutes } from 'date-fns'
import { pl } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import api from '../api/client'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { pl },
})

const messages = {
  today: 'Dziś', previous: '←', next: '→',
  month: 'Miesiąc', week: 'Tydzień', day: 'Dzień', agenda: 'Lista',
  date: 'Data', time: 'Godzina', event: 'Wizyta',
  noEventsInRange: 'Brak wizyt w tym tygodniu',
  showMore: (n) => `+${n} więcej`,
}

const toDatetimeLocal = (date) =>
  format(date, "yyyy-MM-dd'T'HH:mm")

const inputCls = 'w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--text-h)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]'
const btnPrimary = 'px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity'
const btnSecondary = 'px-4 py-2 border border-[var(--border)] text-[var(--text-h)] rounded-lg text-sm hover:bg-[var(--code-bg)] transition-colors'

// ── Modal shell ────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="font-medium text-[var(--text-h)]">{title}</h2>
          <button onClick={onClose} className="text-[var(--text)] hover:text-[var(--text-h)] text-lg leading-none">×</button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
      </div>
    </div>
  )
}

// ── Choice modal (wizyta vs blokada) ──────────────────────────
function ChoiceModal({ slot, onAppointment, onBlock, onClose }) {
  return (
    <Modal title="Dodaj" onClose={onClose}>
      <p className="text-sm text-[var(--text)]">
        {format(slot.start, 'EEEE d MMMM, HH:mm', { locale: pl })}
      </p>
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button onClick={onAppointment} className="flex flex-col items-center gap-2 p-4 border-2 border-[var(--accent)] rounded-xl text-[var(--accent)] hover:bg-[var(--accent-bg)] transition-colors">
          <span className="text-2xl">📅</span>
          <span className="text-sm font-medium">Wizyta</span>
        </button>
        <button onClick={onBlock} className="flex flex-col items-center gap-2 p-4 border-2 border-[var(--border)] rounded-xl text-[var(--text)] hover:bg-[var(--code-bg)] transition-colors">
          <span className="text-2xl">🚫</span>
          <span className="text-sm font-medium">Blokada</span>
        </button>
      </div>
    </Modal>
  )
}

// ── Appointment modal ─────────────────────────────────────────
function AppointmentModal({ slot, appointmentTypes, clients, onSaved, onClose }) {
  const [selectedType, setSelectedType] = useState(null)
  const [customName, setCustomName] = useState('')
  const [duration, setDuration] = useState(50)
  const [clientSearch, setClientSearch] = useState('')
  const [clientId, setClientId] = useState('')
  const [clientName, setClientName] = useState('')
  const [startTime, setStartTime] = useState(toDatetimeLocal(slot.start))
  const [recurring, setRecurring] = useState(false)
  const [recurringWeeks, setRecurringWeeks] = useState(8)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [showClientList, setShowClientList] = useState(false)

  const filteredClients = showClientList
    ? clients.filter(c => !clientSearch || `${c.firstName} ${c.lastName}`.toLowerCase().includes(clientSearch.toLowerCase())).slice(0, 8)
    : []

  const handleTypeSelect = (type) => {
    setSelectedType(type)
    if (type !== 'custom') setDuration(type.durationMinutes)
  }

  const handleClientSelect = (c) => {
    setClientId(c.clientId ?? c.PK?.replace('CLIENT#', '') ?? '')
    setClientName(`${c.firstName} ${c.lastName}`)
    setClientSearch(`${c.firstName} ${c.lastName}`)
    setShowClientList(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedType) { setError('Wybierz typ wizyty'); return }
    if (!clientId) { setError('Wybierz klienta'); return }
    const typeName = selectedType === 'custom' ? customName.trim() : selectedType.name
    if (!typeName) { setError('Podaj nazwę wizyty'); return }
    setError(null)
    setSaving(true)
    try {
      await api.post('/appointments', {
        clientId,
        clientName,
        startTime,
        appointmentType: typeName,
        durationMinutes: Number(duration),
        recurring,
        recurringWeeks: recurring ? Number(recurringWeeks) : 1,
        note,
      })
      onSaved()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Nowa wizyta" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Typ wizyty */}
        <div>
          <p className="text-sm font-medium text-[var(--text-h)] mb-2">Typ wizyty</p>
          <div className="grid grid-cols-2 gap-2">
            {appointmentTypes.map((t) => (
              <button
                key={t.id} type="button"
                onClick={() => handleTypeSelect(t)}
                className={`px-3 py-2 rounded-lg text-sm text-left border transition-colors ${selectedType?.id === t.id ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-h)] hover:bg-[var(--code-bg)]'}`}
              >
                <span className="font-medium">{t.name}</span>
                <span className="block text-xs opacity-60">{t.durationMinutes} min</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleTypeSelect('custom')}
              className={`px-3 py-2 rounded-lg text-sm text-left border transition-colors ${selectedType === 'custom' ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-h)] hover:bg-[var(--code-bg)]'}`}
            >
              <span className="font-medium">Nowa wizyta</span>
              <span className="block text-xs opacity-60">własna nazwa</span>
            </button>
          </div>
          {selectedType === 'custom' && (
            <input
              className={`${inputCls} mt-2`}
              placeholder="Nazwa wizyty"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
          )}
        </div>

        {/* Klient */}
        <div className="relative">
          <label className="block text-sm font-medium text-[var(--text-h)] mb-1">Klient</label>
          <input
            className={inputCls}
            placeholder="Zacznij wpisywać nazwisko…"
            value={clientSearch}
            onChange={(e) => { setClientSearch(e.target.value); setClientId(''); setShowClientList(true) }}
            onFocus={() => setShowClientList(true)}
            onBlur={() => setTimeout(() => setShowClientList(false), 150)}
          />
          {showClientList && filteredClients.length > 0 && (
            <ul className="absolute z-10 w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg mt-1 shadow-lg max-h-40 overflow-y-auto">
              {filteredClients.map((c) => (
                <li key={c.PK ?? c.clientId}>
                  <button type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--code-bg)] text-[var(--text-h)]" onClick={() => handleClientSelect(c)}>
                    {c.firstName} {c.lastName}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Data i czas */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[var(--text-h)] mb-1">Początek</label>
            <input type="datetime-local" className={inputCls} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-h)] mb-1">Czas trwania (min)</label>
            <input type="number" min="1" max="480" className={inputCls} value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
        </div>

        {/* Cykliczne */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-[var(--text-h)] cursor-pointer">
            <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="accent-[var(--accent)]" />
            Wizyta cykliczna (co tydzień)
          </label>
          {recurring && (
            <div className="flex items-center gap-2 pl-5">
              <span className="text-sm text-[var(--text)]">Liczba tygodni:</span>
              <input type="number" min="2" max="52" className={`${inputCls} w-20`} value={recurringWeeks} onChange={(e) => setRecurringWeeks(e.target.value)} />
            </div>
          )}
        </div>

        {/* Notatka */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-h)] mb-1">Notatka (opcjonalnie)</label>
          <input className={inputCls} placeholder="np. pierwsza wizyta" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className={btnSecondary}>Anuluj</button>
          <button type="submit" disabled={saving} className={`${btnPrimary} flex-1`}>
            {saving ? 'Zapisuję…' : recurring ? `Utwórz ${recurringWeeks} wizyt` : 'Utwórz wizytę'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Block modal ───────────────────────────────────────────────
function BlockModal({ slot, onSaved, onClose }) {
  const [startTime, setStartTime] = useState(toDatetimeLocal(slot.start))
  const [endTime, setEndTime] = useState(toDatetimeLocal(addMinutes(slot.start, 60)))
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await api.post('/appointments/blocks', { startTime, endTime, note })
      onSaved()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Blokada czasu" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[var(--text-h)] mb-1">Od</label>
            <input type="datetime-local" className={inputCls} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-h)] mb-1">Do</label>
            <input type="datetime-local" className={inputCls} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-h)] mb-1">Powód</label>
          <input className={inputCls} placeholder="np. urlop, praca w szkole, szkolenie…" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className={btnSecondary}>Anuluj</button>
          <button type="submit" disabled={saving} className={`${btnPrimary} flex-1`}>{saving ? 'Zapisuję…' : 'Dodaj blokadę'}</button>
        </div>
      </form>
    </Modal>
  )
}

// ── Event modal (view / delete) ────────────────────────────────
function EventModal({ event, onDeleted, onClose }) {
  const r = event.resource
  const isBlock = r.type === 'block'
  const isRecurring = !!r.recurringGroupId
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  const handleDelete = async (scope = 'this') => {
    setDeleting(true)
    setError(null)
    try {
      if (isBlock) {
        await api.delete(`/appointments/blocks/${r.blockId}`)
      } else {
        await api.delete(`/appointments/${r.appointmentId}?scope=${scope}`)
      }
      onDeleted()
    } catch (e) {
      setError(e.message)
      setDeleting(false)
    }
  }

  return (
    <Modal title={isBlock ? 'Blokada' : event.title} onClose={onClose}>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-[var(--text)]">Data</dt>
          <dd className="text-[var(--text-h)]">{format(event.start, 'EEEE d MMMM yyyy', { locale: pl })}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[var(--text)]">Godzina</dt>
          <dd className="text-[var(--text-h)]">{format(event.start, 'HH:mm')} – {format(event.end, 'HH:mm')}</dd>
        </div>
        {!isBlock && (
          <div className="flex justify-between">
            <dt className="text-[var(--text)]">Klient</dt>
            <dd className="text-[var(--text-h)]">{r.clientName}</dd>
          </div>
        )}
        {r.note && (
          <div className="flex justify-between">
            <dt className="text-[var(--text)]">{isBlock ? 'Powód' : 'Notatka'}</dt>
            <dd className="text-[var(--text-h)]">{r.note}</dd>
          </div>
        )}
        {isRecurring && (
          <div className="flex justify-between">
            <dt className="text-[var(--text)]">Seria</dt>
            <dd className="text-amber-600 text-xs">wizyta cykliczna</dd>
          </div>
        )}
      </dl>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="pt-2 border-t border-[var(--border)] space-y-2">
        {isRecurring ? (
          <>
            <button onClick={() => handleDelete('this')} disabled={deleting} className="w-full text-left text-sm text-red-500 hover:underline disabled:opacity-50">
              Usuń tylko tę wizytę
            </button>
            <button onClick={() => handleDelete('all')} disabled={deleting} className="w-full text-left text-sm text-red-500 hover:underline disabled:opacity-50">
              Usuń całą serię
            </button>
          </>
        ) : (
          <button onClick={() => handleDelete('this')} disabled={deleting} className="w-full text-left text-sm text-red-500 hover:underline disabled:opacity-50">
            {deleting ? 'Usuwam…' : isBlock ? 'Usuń blokadę' : 'Usuń wizytę'}
          </button>
        )}
      </div>
    </Modal>
  )
}

// ── Main CalendarPage ─────────────────────────────────────────
export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [appointmentTypes, setAppointmentTypes] = useState([])
  const [clients, setClients] = useState([])

  const [zoom, setZoom] = useState(() => parseInt(localStorage.getItem('minddata-zoom') || '16'))
  const slotHeight = Math.round(60 * (zoom / 16))

  useEffect(() => {
    const handler = (e) => setZoom(e.detail)
    window.addEventListener('zoomchange', handler)
    return () => window.removeEventListener('zoomchange', handler)
  }, [])

  const [choiceSlot, setChoiceSlot] = useState(null)
  const [appointmentSlot, setAppointmentSlot] = useState(null)
  const [blockSlot, setBlockSlot] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)

  const loadEvents = useCallback(async (date) => {
    setLoading(true)
    const from = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const to = format(endOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    try {
      const res = await api.get(`/appointments?from=${from}&to=${to}`)
      const appts = (res.data.appointments ?? []).map((a) => ({
        id: a.appointmentId,
        title: `${a.appointmentType} — ${a.clientName}`,
        start: new Date(a.startTime),
        end: new Date(a.endTime),
        resource: { type: 'appointment', ...a },
      }))
      const blocks = (res.data.blocks ?? []).map((b) => ({
        id: b.blockId,
        title: b.note || 'Blokada',
        start: new Date(b.startTime),
        end: new Date(b.endTime),
        resource: { type: 'block', ...b },
      }))
      setEvents([...appts, ...blocks])
    } catch {
      // silent — empty calendar is fine
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadEvents(currentDate) }, [currentDate, loadEvents])

  useEffect(() => {
    api.get('/psychologist/profile')
      .then((r) => {
        const types = r.data.appointmentTypes
        setAppointmentTypes(types?.length ? types : DEFAULT_APPOINTMENT_TYPES)
      })
      .catch(() => setAppointmentTypes(DEFAULT_APPOINTMENT_TYPES))
    api.get('/clients')
      .then((r) => {
        const all = r.data.clients ?? r.data ?? []
        setClients(all.filter(c => c.PK?.startsWith('CLIENT#') && c.SK === 'PROFILE'))
      })
      .catch(() => {})
  }, [])

  const eventPropGetter = (event) => {
    if (event.resource?.type === 'block') {
      return { style: { backgroundColor: '#6b7280', borderColor: '#4b5563', color: 'white' } }
    }
    return { style: { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' } }
  }

  const EventComponent = ({ event }) => {
    const r = event.resource
    if (r?.type === 'block') {
      return <div className="truncate px-0.5 font-medium">🚫 {r.note || 'Blokada'}</div>
    }
    return (
      <div className="px-0.5 leading-tight overflow-hidden h-full">
        <div className="font-semibold truncate">{r?.clientName}</div>
        <div className="truncate opacity-80">{r?.appointmentType}</div>
      </div>
    )
  }

  const handleSlotSelect = ({ start, end }) => setChoiceSlot({ start, end })
  const handleEventSelect = (event) => setSelectedEvent(event)
  const handleNavigate = (date) => setCurrentDate(date)

  const closeAll = () => {
    setChoiceSlot(null)
    setAppointmentSlot(null)
    setBlockSlot(null)
    setSelectedEvent(null)
  }

  const handleSaved = () => {
    closeAll()
    loadEvents(currentDate)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-[var(--text-h)]">Kalendarz</h1>
        {loading && <span className="text-sm text-[var(--text)]">Ładowanie…</span>}
      </div>

      <style>{`
        .rbc-timeslot-group { min-height: ${slotHeight}px; }
        .rbc-time-content { font-size: ${Math.round(zoom * 0.7)}px; }
        .rbc-event { padding: 2px 4px !important; font-size: ${Math.round(zoom * 0.7)}px !important; }
        .rbc-time-gutter .rbc-label { font-size: ${Math.round(zoom * 0.7)}px; }
        .rbc-time-header.rbc-overflowing { border-right: 0; margin-right: 6px !important; }
        .rbc-time-header-gutter { flex-shrink: 0; }
        .rbc-header { padding: 6px 4px; border-bottom: 0; }
        .rbc-time-header > .rbc-row { border-bottom: 1px solid var(--border); }
        .rbc-allday-cell { display: none; }
        .rbc-time-header-content > .rbc-row.rbc-row-resource { display: none; }
        .rbc-time-content::-webkit-scrollbar { width: 6px; }
        .rbc-time-content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
        .rbc-time-content::-webkit-scrollbar-track { background: transparent; }
      `}</style>
      <div className="border border-[var(--border)] rounded-xl overflow-hidden" style={{ height: '720px' }}>
        <Calendar
          localizer={localizer}
          culture="pl"
          events={events}
          defaultView={Views.WEEK}
          views={[Views.WEEK, Views.DAY]}
          step={30}
          timeslots={1}
          min={new Date(0, 0, 0, 7, 0)}
          max={new Date(0, 0, 0, 21, 0)}
          date={currentDate}
          onNavigate={handleNavigate}
          onSelectSlot={handleSlotSelect}
          onSelectEvent={handleEventSelect}
          selectable
          eventPropGetter={eventPropGetter}
          components={{ event: EventComponent }}
          messages={messages}
          formats={{ timeGutterFormat: 'HH:mm', eventTimeRangeFormat: ({ start, end }) => `${format(start, 'HH:mm')}–${format(end, 'HH:mm')}` }}
        />
      </div>

      {choiceSlot && (
        <ChoiceModal
          slot={choiceSlot}
          onAppointment={() => { setAppointmentSlot(choiceSlot); setChoiceSlot(null) }}
          onBlock={() => { setBlockSlot(choiceSlot); setChoiceSlot(null) }}
          onClose={closeAll}
        />
      )}
      {appointmentSlot && (
        <AppointmentModal
          slot={appointmentSlot}
          appointmentTypes={appointmentTypes}
          clients={clients}
          onSaved={handleSaved}
          onClose={closeAll}
        />
      )}
      {blockSlot && (
        <BlockModal slot={blockSlot} onSaved={handleSaved} onClose={closeAll} />
      )}
      {selectedEvent && (
        <EventModal event={selectedEvent} onDeleted={handleSaved} onClose={closeAll} />
      )}
    </div>
  )
}
