import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format, isToday, parseISO, formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'
import api from '../api/client'

function StatCard({ label, value, sub, loading, to, icon }) {
  const inner = (
    <div className="flex flex-col gap-3 p-5 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)] transition-colors h-full">
      <div className="flex items-start justify-between">
        <span className="text-sm text-[var(--text)]">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="flex items-baseline gap-2">
        {loading
          ? <div className="h-9 w-12 rounded bg-[var(--border)] animate-pulse" />
          : <span className="text-4xl font-semibold text-[var(--text-h)]">{value}</span>
        }
        {sub && !loading && <span className="text-sm text-[var(--text)]">{sub}</span>}
      </div>
    </div>
  )
  return to ? <Link to={to} className="block">{inner}</Link> : <div>{inner}</div>
}

function QuickLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-bg)] transition-colors text-center"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium text-[var(--text-h)]">{label}</span>
    </Link>
  )
}

function timeAgo(isoString) {
  try {
    return formatDistanceToNow(parseISO(isoString), { addSuffix: true, locale: pl })
  } catch {
    return ''
  }
}

function formatHour(isoString) {
  try {
    return format(parseISO(isoString), 'HH:mm')
  } catch {
    return ''
  }
}

export default function Dashboard() {
  const [clients, setClients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/clients'),
      api.get('/appointments'),
    ])
      .then(([cRes, aRes]) => {
        setClients(cRes.data.clients ?? [])
        setAppointments(aRes.data.appointments ?? [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const todayAppts = appointments.filter((a) => {
    try { return isToday(parseISO(a.startTime)) } catch { return false }
  })

  const recentAppts = [...appointments]
    .filter((a) => a.startTime)
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(0, 6)

  const upcomingToday = [...todayAppts]
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Wszyscy pacjenci"
          value={clients.length}
          icon="👤"
          loading={loading}
          to="/clients"
        />
        <StatCard
          label="Wizyty dziś"
          value={todayAppts.length}
          icon="📅"
          loading={loading}
          to="/calendar"
        />
        <div className="grid grid-cols-2 gap-3 col-span-2 md:col-span-1">
          <QuickLink to="/clients/new" icon="➕" label="Nowy pacjent" />
          <QuickLink to="/calendar" icon="🗓️" label="Kalendarz" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* DZISIAJ */}
        <section>
          <h2 className="text-base font-semibold text-[var(--text-h)] mb-3">
            Dzisiaj — {format(new Date(), 'd MMMM yyyy', { locale: pl })}
          </h2>
          <div className="rounded-xl border border-[var(--border)] overflow-hidden">
            {loading && (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-5 rounded bg-[var(--border)] animate-pulse" />
                ))}
              </div>
            )}
            {!loading && upcomingToday.length === 0 && (
              <p className="p-4 text-sm text-[var(--text)]">Brak wizyt na dziś.</p>
            )}
            {!loading && upcomingToday.map((a, i) => (
              <div
                key={a.appointmentId ?? i}
                className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--text-h)]">{a.clientName}</p>
                  <p className="text-xs text-[var(--text)]">{a.appointmentType}</p>
                </div>
                <span className="text-sm font-mono text-[var(--accent)]">{formatHour(a.startTime)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* OSTATNIE WIZYTY */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[var(--text-h)]">Ostatnie wizyty</h2>
            <Link to="/calendar" className="text-xs text-[var(--accent)] hover:underline">
              Pokaż wszystkie
            </Link>
          </div>
          <div className="rounded-xl border border-[var(--border)] overflow-hidden">
            {loading && (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-5 rounded bg-[var(--border)] animate-pulse" />
                ))}
              </div>
            )}
            {!loading && recentAppts.length === 0 && (
              <p className="p-4 text-sm text-[var(--text)]">Brak historii wizyt.</p>
            )}
            {!loading && recentAppts.map((a, i) => (
              <div
                key={a.appointmentId ?? i}
                className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--text-h)]">{a.clientName}</p>
                  <p className="text-xs text-[var(--text)]">{a.appointmentType}</p>
                </div>
                <span className="text-xs text-[var(--text)]">{timeAgo(a.startTime)}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
