import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import SignaturePad from './SignaturePad'
import { DEFAULT_CONSENT_TEXTS } from '../config/consentTexts'

function validatePeselChecksum(pesel) {
  if (pesel?.length !== 11) return false
  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]
  const digits = pesel.split('').map(Number)
  if (digits.some(isNaN)) return false
  const sum = weights.reduce((acc, w, i) => acc + w * digits[i], 0)
  const control = (10 - (sum % 10)) % 10
  return control === digits[10]
}

function parsePeselDate(pesel) {
  if (pesel?.length !== 11) return null
  let year = parseInt(pesel.substring(0, 2))
  let month = parseInt(pesel.substring(2, 4))
  const day = parseInt(pesel.substring(4, 6))

  if (month > 80) { year += 1800; month -= 80 }
  else if (month > 60) { year += 2200; month -= 60 }
  else if (month > 40) { year += 2100; month -= 40 }
  else if (month > 20) { year += 2000; month -= 20 }
  else { year += 1900 }

  const d = new Date(year, month - 1, day)
  if (isNaN(d.getTime())) return null
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function isMinor(pesel, birthDate) {
  const dateStr = parsePeselDate(pesel) ?? birthDate
  if (!dateStr) return false
  const dob = new Date(dateStr)
  const today = new Date()
  const age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  return age < 18 || (age === 18 && m < 0)
}

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

export default function ClientForm({ onSuccess }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const [consentDefs, setConsentDefs] = useState(DEFAULT_CONSENT_TEXTS)

  useEffect(() => {
    api.get('/consent-texts')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) setConsentDefs(res.data)
      })
      .catch(() => {})
  }, [])

  const [clientData, setClientData] = useState({
    firstName: '',
    lastName: '',
    pesel: '',
    birthDate: '',
    email: '',
    phone: '',
    address: '',
  })

  const [guardianData, setGuardianData] = useState({
    firstName: '',
    lastName: '',
    pesel: '',
    address: '',
  })

  const initialConsentState = Object.fromEntries(DEFAULT_CONSENT_TEXTS.map(d => [d.field, false]))
  const [consentData, setConsentData] = useState({ ...initialConsentState, isGuardian: false })

  const [signatureImage, setSignatureImage] = useState(null)
  const [createdClientId, setCreatedClientId] = useState(null)
  const [signatureError, setSignatureError] = useState(null)

  const isMinorClient = isMinor(clientData.pesel, clientData.birthDate)

  const handleClientChange = (e) => {
    const { name, value } = e.target
    setClientData((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'pesel') {
        const parsed = parsePeselDate(value)
        if (parsed) next.birthDate = parsed
      }
      return next
    })
  }

  const handleGuardianChange = (e) => {
    const { name, value } = e.target
    setGuardianData((prev) => ({ ...prev, [name]: value }))
  }

  const handleConsentChange = (e) => {
    const { name, checked } = e.target
    setConsentData((prev) => ({ ...prev, [name]: checked }))
  }

  const validateStep1 = () => {
    const required = ['firstName', 'lastName', 'pesel', 'birthDate', 'address']
    const missing = required.filter((f) => !clientData[f])
    if (missing.length > 0) {
      setError(`Wypełnij wymagane pola: ${missing.join(', ')}`)
      return false
    }

    if (clientData.pesel.length === 11 && !validatePeselChecksum(clientData.pesel)) {
      setError('PESEL jest nieprawidłowy — sprawdź cyfrę kontrolną')
      return false
    }

    if (isMinorClient && (!guardianData.firstName || !guardianData.lastName || !guardianData.pesel || !guardianData.address)) {
      setError('Dla małoletnich wymagane są dane przedstawiciela ustawowego')
      return false
    }

    if (isMinorClient && guardianData.pesel.length === 11 && !validatePeselChecksum(guardianData.pesel)) {
      setError('PESEL przedstawiciela ustawowego jest nieprawidłowy')
      return false
    }

    return true
  }

  const validateStep2 = () => {
    const missing = consentDefs.filter(d => d.required && !consentData[d.field])
    if (missing.length > 0) {
      setError('Zaakceptuj wszystkie wymagane zgody')
      return false
    }
    return true
  }

  const handleNextStep = () => {
    setError(null)
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) {
      setError('Zaakceptuj wszystkie wymagane zgody')
      return
    }
    setStep(step + 1)
  }

  const buildConsentPayload = () =>
    consentDefs
      .filter(d => consentData[d.field])
      .map(d => ({ consentType: 'individual', consentText: d.text }))

  const handleStep2Submit = async () => {
    setError(null)
    if (!validateStep2()) return

    setLoading(true)
    try {
      const clientResponse = await api.post('/clients', {
        ...clientData,
        consents: buildConsentPayload(),
      })

      const clientId = clientResponse.data.id
      setCreatedClientId(clientId)
      setStep(3)
      setLoading(false)
    } catch (e) {
      setError(`Błąd przy tworzeniu klienta: ${e.message}`)
      setLoading(false)
    }
  }

  const handleSignatureCapture = async (signatureBase64) => {
    setSignatureError(null)
    setLoading(true)
    setSignatureImage(signatureBase64)

    try {
      await api.post('/documents/consent-pdf', {
        clientId: createdClientId,
        consents: buildConsentPayload(),
        signatureImage: signatureBase64,
      })

      navigate(`/clients/${createdClientId}`)
    } catch (e) {
      setSignatureError(e.message)
      setSignatureImage(null)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-medium text-[var(--text-h)]">
            {step === 1 && 'Dodaj klienta — Dane osobowe'}
            {step === 2 && 'Dodaj klienta — Zgody'}
            {step === 3 && 'Dodaj klienta — Podpis elektroniczny'}
          </h1>
          <span className="text-sm text-[var(--text)]">
            Krok {step} z 3
          </span>
        </div>
        <div className="flex gap-2">
          <div className={`h-1 flex-1 rounded ${step >= 1 ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`} />
          <div className={`h-1 flex-1 rounded ${step >= 2 ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`} />
          <div className={`h-1 flex-1 rounded ${step >= 3 ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`} />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* KROK 1 — DANE KLIENTA */}
      {step === 1 && (
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-[var(--text-h)] mb-2">
                Imię *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={clientData.firstName}
                onChange={handleClientChange}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[var(--text-h)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="Jan"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-[var(--text-h)] mb-2">
                Nazwisko *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={clientData.lastName}
                onChange={handleClientChange}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[var(--text-h)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="Kowalski"
              />
            </div>
          </div>

          <div>
            <label htmlFor="pesel" className="block text-sm font-medium text-[var(--text-h)] mb-2">
              PESEL (11 cyfr) *
            </label>
            <input
              id="pesel"
              name="pesel"
              type="text"
              required
              value={clientData.pesel}
              onChange={handleClientChange}
              maxLength="11"
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[var(--text-h)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="00000000000"
            />
            {clientData.pesel.length === 11 && !validatePeselChecksum(clientData.pesel) && (
              <p className="text-sm text-red-600 mt-2">
                Nieprawidłowy PESEL (błędna cyfra kontrolna)
              </p>
            )}
            {isMinorClient && (
              <p className="text-sm text-orange-600 mt-2">
                Pacjent jest małoletni — wymagane dane przedstawiciela ustawowego
              </p>
            )}
          </div>

          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-[var(--text-h)] mb-2">
              Data urodzenia *
            </label>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              required
              value={clientData.birthDate}
              onChange={handleClientChange}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[var(--text-h)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-h)] mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={clientData.email}
                onChange={handleClientChange}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[var(--text-h)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="jan@example.com"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[var(--text-h)] mb-2">
                Telefon
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={clientData.phone}
                onChange={handleClientChange}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[var(--text-h)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="+48 123 456 789"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-[var(--text-h)] mb-2">
              Adres *
            </label>
            <input
              id="address"
              name="address"
              type="text"
              required
              value={clientData.address}
              onChange={handleClientChange}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[var(--text-h)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="ul. Przykładowa 1, 00-001 Warszawa"
            />
          </div>

          {/* POLA PRZEDSTAWICIELA DLA MAŁOLETNICH */}
          {isMinorClient && (
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h3 className="font-medium text-[var(--text-h)] mb-4">Dane przedstawiciela ustawowego</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="guardianFirstName" className="block text-sm font-medium text-[var(--text-h)] mb-2">
                    Imię *
                  </label>
                  <input
                    id="guardianFirstName"
                    name="firstName"
                    type="text"
                    required
                    value={guardianData.firstName}
                    onChange={handleGuardianChange}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[var(--text-h)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    placeholder="Maria"
                  />
                </div>
                <div>
                  <label htmlFor="guardianLastName" className="block text-sm font-medium text-[var(--text-h)] mb-2">
                    Nazwisko *
                  </label>
                  <input
                    id="guardianLastName"
                    name="lastName"
                    type="text"
                    required
                    value={guardianData.lastName}
                    onChange={handleGuardianChange}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[var(--text-h)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    placeholder="Kowalska"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="guardianPesel" className="block text-sm font-medium text-[var(--text-h)] mb-2">
                  PESEL *
                </label>
                <input
                  id="guardianPesel"
                  name="pesel"
                  type="text"
                  required
                  value={guardianData.pesel}
                  onChange={handleGuardianChange}
                  maxLength="11"
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[var(--text-h)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="00000000000"
                />
              </div>
              <div className="mt-4">
                <label htmlFor="guardianAddress" className="block text-sm font-medium text-[var(--text-h)] mb-2">
                  Adres *
                </label>
                <input
                  id="guardianAddress"
                  name="address"
                  type="text"
                  required
                  value={guardianData.address}
                  onChange={handleGuardianChange}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[var(--text-h)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="ul. Przykładowa 1, 00-001 Warszawa"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => navigate('/clients')}
              className="flex-1 px-4 py-2 border border-[var(--border)] text-[var(--text-h)] rounded-lg text-sm hover:bg-[var(--code-bg)] transition-colors"
            >
              Anuluj
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
            >
              Dalej → Zgody
            </button>
          </div>
        </form>
      )}

      {/* KROK 2 — ZGODY */}
      {step === 2 && (
        <form className="space-y-6">
          <p className="text-sm text-[var(--text)]">
            Zaznacz wszystkie wymagane zgody, a następnie przejdź do złożenia podpisu elektronicznego.
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

            {isMinorClient && (
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
                    <div className="font-medium text-[var(--text-h)]">
                      Działam jako przedstawiciel ustawowy
                    </div>
                    <p className="text-xs text-[var(--text)] mt-1">
                      Oświadczam, że jestem przedstawicielem ustawowym i wyrażam powyższe zgody w jego/jej imieniu.
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setStep(1)
                setError(null)
              }}
              className="flex-1 px-4 py-2 border border-[var(--border)] text-[var(--text-h)] rounded-lg text-sm hover:bg-[var(--code-bg)] transition-colors"
            >
              ← Wróć
            </button>
            <button
              type="button"
              onClick={handleStep2Submit}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Zapisuję…' : 'Dalej → Podpis'}
            </button>
          </div>
        </form>
      )}

      {/* KROK 3 — PODPIS ELEKTRONICZNY */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--code-bg)]">
            <h3 className="font-medium text-[var(--text-h)] mb-2">Podsumowanie zgód do podpisania</h3>
            <p className="text-sm text-[var(--text)] mb-3">
              Podpisujesz zgodę dla: <strong>{clientData.firstName} {clientData.lastName}</strong>
            </p>
            <ul className="text-sm text-[var(--text)] space-y-1">
              {consentDefs
                .filter(d => consentData[d.field])
                .map(d => (
                  <li key={d.id} className="flex items-center gap-2">
                    <span className="text-[var(--accent)]">✓</span> {d.title}
                  </li>
                ))
              }
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-h)] mb-2">
              Podpis elektroniczny *
            </label>
            <SignaturePad
              onSign={handleSignatureCapture}
              onClear={() => { setSignatureImage(null); setSignatureError(null) }}
              onError={(msg) => setSignatureError(msg)}
              disabled={loading}
            />
          </div>

          {loading && (
            <p className="text-sm text-[var(--text)] text-center">Generuję dokument zgody…</p>
          )}

          {signatureError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
              <p className="text-sm text-red-700 font-medium">Błąd generowania dokumentu zgody:</p>
              <p className="text-sm text-red-600">{signatureError}</p>
              <p className="text-sm text-[var(--text)]">
                Klient został zapisany. Możesz{' '}
                <button
                  type="button"
                  onClick={() => navigate(`/clients/${createdClientId}`)}
                  className="text-[var(--accent)] underline hover:opacity-80"
                >
                  przejść do profilu klienta
                </button>
                {' '}i spróbować podpisać zgodę ponownie.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
