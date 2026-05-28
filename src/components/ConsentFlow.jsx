import { useState, useEffect } from 'react'
import api from '../api/client'
import SignaturePad from './SignaturePad'
import { DEFAULT_CONSENT_TEXTS } from '../config/consentTexts'

function ConsentCard({ def, checked, onChange }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div
      className={`rounded-xl border-2 transition-all ${
        checked
          ? 'border-[var(--accent)] bg-[var(--accent-bg)]'
          : 'border-[var(--border)] bg-[var(--bg)]'
      }`}
    >
      <label className="flex items-start gap-3 p-4 cursor-pointer">
        <input
          type="checkbox"
          name={def.field}
          checked={checked}
          onChange={onChange}
          className="mt-0.5 w-5 h-5 accent-[var(--accent)] cursor-pointer shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <span className="font-medium text-[var(--text-h)] leading-snug">{def.title}</span>
            <div className="flex items-center gap-2 shrink-0">
              {def.required
                ? <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium whitespace-nowrap">Wymagana</span>
                : <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--code-bg)] text-[var(--text)] whitespace-nowrap">Opcjonalna</span>
              }
            </div>
          </div>
          <p className="text-xs text-[var(--text)] mt-0.5">{def.subtitle}</p>
        </div>
      </label>
      <div className="px-4 pb-3 -mt-1">
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          className="text-xs text-[var(--accent)] hover:underline"
        >
          {expanded ? 'Zwiń ↑' : 'Przeczytaj pełną treść ↓'}
        </button>
        {expanded && (
          <p className="mt-2 text-xs text-[var(--text)] leading-relaxed whitespace-pre-line rounded-lg p-3 bg-[var(--code-bg)]">
            {def.text}
          </p>
        )}
      </div>
    </div>
  )
}

export default function ConsentFlow({ clientId, clientName, isMinor, onComplete, onCancel }) {
  const [step, setStep] = useState(1)
  const [consentDefs, setConsentDefs] = useState(DEFAULT_CONSENT_TEXTS)
  const [consentData, setConsentData] = useState(() =>
    Object.fromEntries([...DEFAULT_CONSENT_TEXTS.map(d => [d.field, false]), ['isGuardian', false]])
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [signatureError, setSignatureError] = useState(null)

  useEffect(() => {
    api.get('/consent-texts')
      .then(res => { if (Array.isArray(res.data) && res.data.length > 0) setConsentDefs(res.data) })
      .catch(() => {})
  }, [])

  const handleConsentChange = (e) => {
    const { name, checked } = e.target
    setConsentData(prev => ({ ...prev, [name]: checked }))
  }

  const buildConsentPayload = () =>
    consentDefs
      .filter(d => consentData[d.field])
      .map(d => ({ consentType: 'individual', consentText: d.text, title: d.title }))

  const handleNext = () => {
    const missing = consentDefs.filter(d => d.required && !consentData[d.field])
    if (missing.length > 0) { setError('Zaakceptuj wszystkie wymagane zgody'); return }
    setError(null)
    setStep(2)
  }

  const handleSignature = async (signatureBase64) => {
    setSignatureError(null)
    setLoading(true)
    try {
      const consents = buildConsentPayload()

      // Zapisz każdą zgodę jako rekord CONSENT# w DynamoDB
      await Promise.all(consents.map(c =>
        api.post(`/clients/${clientId}/consents`, {
          clientId,
          consentType: c.consentType,
          consentText: c.consentText,
          title: c.title,
        })
      ))

      // Generuj podpisany PDF ze zgód
      await api.post('/documents/consent-pdf', {
        clientId,
        consents,
        signatureImage: signatureBase64,
      })

      onComplete()
    } catch (e) {
      setSignatureError(e.message)
      setLoading(false)
    }
  }

  return (
    <div className="border-2 border-[var(--accent)] rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[var(--text-h)]">
          {step === 1 ? 'Zbierz zgody' : 'Podpis elektroniczny'}
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className={`h-1 w-8 rounded transition-colors ${step >= 1 ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`} />
            <div className={`h-1 w-8 rounded transition-colors ${step >= 2 ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`} />
          </div>
          <button onClick={onCancel} className="text-xs text-[var(--text)] hover:text-[var(--text-h)] transition-colors">
            ✕ Anuluj
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {step === 1 && (
        <>
          <p className="text-sm text-[var(--text)]">
            Pacjent: <strong className="text-[var(--text-h)]">{clientName}</strong>
          </p>

          <div className="space-y-3">
            {consentDefs.map(def => (
              <ConsentCard
                key={def.id}
                def={def}
                checked={!!consentData[def.field]}
                onChange={handleConsentChange}
              />
            ))}

            {isMinor && (
              <div className="rounded-xl border-2 border-orange-300 bg-orange-50 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isGuardian"
                    checked={consentData.isGuardian}
                    onChange={handleConsentChange}
                    className="mt-0.5 w-5 h-5 accent-[var(--accent)] cursor-pointer shrink-0"
                  />
                  <div>
                    <p className="font-medium text-[var(--text-h)]">Działam jako przedstawiciel ustawowy</p>
                    <p className="text-xs text-[var(--text)] mt-1">
                      Oświadczam, że jestem przedstawicielem ustawowym i wyrażam powyższe zgody w jego/jej imieniu.
                    </p>
                  </div>
                </label>
              </div>
            )}
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
              type="button"
              onClick={handleNext}
              className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
            >
              Dalej → Podpis
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--code-bg)]">
            <p className="text-sm font-medium text-[var(--text-h)] mb-2">Zgody do podpisania:</p>
            <ul className="text-sm text-[var(--text)] space-y-1">
              {consentDefs.filter(d => consentData[d.field]).map(d => (
                <li key={d.id} className="flex items-center gap-2">
                  <span className="text-[var(--accent)]">✓</span> {d.title}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-h)] mb-2">
              Podpis elektroniczny *
            </label>
            <SignaturePad
              onSign={handleSignature}
              onClear={() => setSignatureError(null)}
              onError={(msg) => setSignatureError(msg)}
              disabled={loading}
            />
          </div>

          {loading && (
            <p className="text-sm text-[var(--text)] text-center">Generuję dokument zgody…</p>
          )}

          {signatureError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">Błąd generowania dokumentu:</p>
              <p className="text-sm text-red-600">{signatureError}</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => { setStep(1); setError(null) }}
            className="text-sm text-[var(--accent)] hover:underline"
          >
            ← Wróć do zgód
          </button>
        </>
      )}
    </div>
  )
}
