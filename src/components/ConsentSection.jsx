import { useState, useEffect } from 'react'
import api from '../api/client'
import ConsentFlow from './ConsentFlow'
import ConsentDocuments from './ConsentDocuments'

const REVOKE_REASONS = [
  { value: 'patient_request', label: 'Na wniosek pacjenta' },
  { value: 'guardian_request', label: 'Na wniosek przedstawiciela ustawowego' },
  { value: 'other', label: 'Inny powód' },
]

function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('pl-PL', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function RevokeModal({ consent, clientId, onRevoked, onCancel }) {
  const [reason, setReason] = useState('patient_request')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleRevoke = async () => {
    setLoading(true)
    setError(null)
    try {
      await api.put(`/clients/${clientId}/consents/${encodeURIComponent(consent.SK)}/revoke`, {
        revokedReason: reason,
      })
      onRevoked()
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl shadow-xl max-w-md w-full p-6 space-y-5">
        <div>
          <h3 className="font-semibold text-[var(--text-h)] text-lg">Cofnij zgodę</h3>
          <p className="text-sm text-[var(--text)] mt-1">
            <strong className="text-[var(--text-h)]">{consent.title ?? 'Zgoda'}</strong>
          </p>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            Cofnięcie zgody jest nieodwracalne w sensie prawnym — zapis pozostaje w historii
            zgodnie z Art. 5 ust. 2 RODO (rozliczalność). Psycholog może zaprzestać świadczenia
            usług po cofnięciu zgody na leczenie.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-h)] mb-2">
            Powód cofnięcia
          </label>
          <div className="space-y-2">
            {REVOKE_REASONS.map(r => (
              <label key={r.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="revokeReason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => setReason(r.value)}
                  className="w-4 h-4 accent-[var(--accent)]"
                />
                <span className="text-sm text-[var(--text-h)]">{r.label}</span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-[var(--border)] text-[var(--text-h)] rounded-lg text-sm hover:bg-[var(--code-bg)] transition-colors"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={handleRevoke}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Cofam zgodę…' : 'Cofnij zgodę'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ConsentRow({ consent, clientId, onRevoked }) {
  const [showModal, setShowModal] = useState(false)
  const isRevoked = !!consent.revokedAt

  return (
    <>
      <div className={`flex items-start justify-between gap-4 px-4 py-3 border-b border-[var(--border)] last:border-0 ${isRevoked ? 'opacity-60' : ''}`}>
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-base mt-0.5 shrink-0">{isRevoked ? '❌' : '✅'}</span>
          <div>
            <p className="text-sm font-medium text-[var(--text-h)] leading-snug">
              {consent.title ?? consent.consentType ?? 'Zgoda'}
            </p>
            <p className="text-xs text-[var(--text)] mt-0.5">
              Udzielona: {formatDate(consent.grantedAt ?? consent.signedAt)}
            </p>
            {isRevoked && (
              <p className="text-xs text-red-600 mt-0.5">
                Cofnięta: {formatDate(consent.revokedAt)}
                {consent.revokedReason && (
                  <span className="ml-1 text-[var(--text)]">
                    — {REVOKE_REASONS.find(r => r.value === consent.revokedReason)?.label ?? consent.revokedReason}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
        {!isRevoked && (
          <button
            onClick={() => setShowModal(true)}
            className="shrink-0 text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            Cofnij
          </button>
        )}
      </div>

      {showModal && (
        <RevokeModal
          consent={consent}
          clientId={clientId}
          onRevoked={() => { setShowModal(false); onRevoked() }}
          onCancel={() => setShowModal(false)}
        />
      )}
    </>
  )
}

export default function ConsentSection({ clientId, clientName, isMinor }) {
  const [consents, setConsents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showFlow, setShowFlow] = useState(false)
  const [docRefresh, setDocRefresh] = useState(0)

  const loadConsents = () => {
    setLoading(true)
    api.get(`/clients/${clientId}/consents`)
      .then(res => setConsents(res.data.consents ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadConsents() }, [clientId])

  const handleFlowComplete = () => {
    setShowFlow(false)
    setDocRefresh(r => r + 1)
    loadConsents()
  }

  const activeCount = consents.filter(c => !c.revokedAt).length
  const hasConsents = consents.length > 0

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-[var(--text-h)]">Zgody RODO</h2>
          {hasConsents && !loading && (
            <p className="text-xs text-[var(--text)] mt-0.5">
              {activeCount} aktywn{activeCount === 1 ? 'a' : activeCount < 5 ? 'e' : 'ych'}
              {consents.length - activeCount > 0 && `, ${consents.length - activeCount} cofniętych`}
            </p>
          )}
        </div>
        {!showFlow && (
          <button
            onClick={() => setShowFlow(true)}
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            Zbierz zgody
          </button>
        )}
      </div>

      {showFlow && (
        <ConsentFlow
          clientId={clientId}
          clientName={clientName}
          isMinor={isMinor}
          onComplete={handleFlowComplete}
          onCancel={() => setShowFlow(false)}
        />
      )}

      {!showFlow && (
        <>
          {loading && (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 rounded-lg bg-[var(--border)] animate-pulse" />
              ))}
            </div>
          )}

          {!loading && error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {!loading && !error && consents.length === 0 && (
            <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center">
              <p className="text-sm text-[var(--text)]">Brak zebranych zgód.</p>
              <p className="text-xs text-[var(--text)] mt-1">
                Użyj przycisku "Zbierz zgody" podczas pierwszej wizyty.
              </p>
            </div>
          )}

          {!loading && !error && consents.length > 0 && (
            <div className="rounded-xl border border-[var(--border)] overflow-hidden">
              {consents.map((consent, i) => (
                <ConsentRow
                  key={consent.SK ?? i}
                  consent={consent}
                  clientId={clientId}
                  onRevoked={loadConsents}
                />
              ))}
            </div>
          )}
        </>
      )}

      <div>
        <h3 className="text-sm font-medium text-[var(--text-h)] mb-3">Podpisane dokumenty PDF</h3>
        <ConsentDocuments clientId={clientId} refreshTrigger={docRefresh} />
      </div>
    </section>
  )
}
