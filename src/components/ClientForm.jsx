import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

const CONSENT_TEXT = `Wyrażam zgodę na przetwarzanie moich danych osobowych
w celu prowadzenia dokumentacji psychologicznej zgodnie z ustawą
z dnia 23 stycznia 2026 r. o zawodzie psychologa.`

const RODO_TEXT = `Wyrażam zgodę na przetwarzanie moich danych osobowych
przez psychologa jako administratora danych, w zakresie niezbędnym
do świadczenia usług psychologicznych, zgodnie z art. 6 ust. 1 lit. b RODO.`

const HEALTH_DATA_TEXT = `Wyrażam zgodę na przetwarzanie moich danych dotyczących zdrowia psychicznego,
zgodnie z art. 9 ust. 2 lit. a RODO (Rozporządzenie UE 2016/679).`

const INFO_CLAUSE_TEXT = `Zapoznałem/am się z klauzulą informacyjną zawierającą informacje na temat:
- administratora danych i sposobu kontaktu,
- celów przetwarzania danych,
- praw pacjenta w zakresie przetwarzania danych osobowych.`

function isMinor(pesel, birthDate) {
  let dob = null

  if (pesel?.length === 11) {
    let year = parseInt(pesel.substring(0, 2))
    let month = parseInt(pesel.substring(2, 4))
    let day = parseInt(pesel.substring(4, 6))

    if (month > 80) { year += 1800; month -= 80 }
    else if (month > 60) { year += 2200; month -= 60 }
    else if (month > 40) { year += 2100; month -= 40 }
    else if (month > 20) { year += 2000; month -= 20 }
    else { year += 1900 }

    dob = new Date(year, month - 1, day)
  } else if (birthDate) {
    dob = new Date(birthDate)
  }

  if (!dob) return false
  const today = new Date()
  const age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  return age < 18 || (age === 18 && m < 0)
}

export default function ClientForm({ onSuccess }) {
  const [step, setStep] = useState(1)
  const [clientId, setClientId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const [clientData, setClientData] = useState({
    firstName: '',
    lastName: '',
    pesel: '',
    birthDate: '',
    email: '',
    phone: '',
  })

  const [guardianData, setGuardianData] = useState({
    firstName: '',
    lastName: '',
    pesel: '',
  })

  const [consentData, setConsentData] = useState({
    serviceConsent: false,
    dataConsent: false,
    healthDataConsent: false,
    infoClauseConsent: false,
    transcription: false,
    isGuardian: false,
  })

  const isMinorClient = isMinor(clientData.pesel, clientData.birthDate)

  const handleClientChange = (e) => {
    const { name, value } = e.target
    setClientData((prev) => ({ ...prev, [name]: value }))
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
    const required = ['firstName', 'lastName', 'pesel', 'birthDate']
    const missing = required.filter((f) => !clientData[f])
    if (missing.length > 0) {
      setError(`Wypełnij wymagane pola: ${missing.join(', ')}`)
      return false
    }

    if (isMinorClient && (!guardianData.firstName || !guardianData.lastName || !guardianData.pesel)) {
      setError('Dla małoletnich wymagane są dane przedstawiciela ustawowego')
      return false
    }

    return true
  }

  const validateStep2 = () => {
    const required = ['serviceConsent', 'dataConsent', 'healthDataConsent', 'infoClauseConsent']
    const missing = required.filter((f) => !consentData[f])
    if (missing.length > 0) {
      setError('Zaakceptuj wszystkie wymagane zgody')
      return false
    }
    return true
  }

  const handleNextStep = async () => {
    setError(null)
    if (!validateStep1()) return

    setLoading(true)
    try {
      const response = await api.post('/clients', clientData)
      setClientId(response.data.id)
      setStep(2)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setError(null)
    if (!validateStep2()) return

    setLoading(true)
    try {
      const consents = [
        { type: 'service', text: CONSENT_TEXT },
        { type: 'rodo_standard', text: RODO_TEXT },
        { type: 'rodo_health', text: HEALTH_DATA_TEXT },
        { type: 'info_clause', text: INFO_CLAUSE_TEXT },
      ]

      if (consentData.transcription) {
        consents.push({ type: 'transcription', text: 'Zgoda na nagrywanie sesji' })
      }

      for (const consent of consents) {
        await api.post(`/clients/${clientId}/consents`, {
          clientId,
          consentType: consent.type,
          consentText: consent.text,
        })
      }

      navigate('/clients')
    } catch (e) {
      setError(`Błąd przy zapisywaniu zgód: ${e.message}`)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-medium text-[var(--text-h)]">
            {step === 1 ? 'Dodaj klienta — Dane osobowe' : 'Dodaj klienta — Zgody'}
          </h1>
          <span className="text-sm text-[var(--text)]">
            Krok {step} z 2
          </span>
        </div>
        <div className="flex gap-2">
          <div className={`h-1 flex-1 rounded ${step >= 1 ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`} />
          <div className={`h-1 flex-1 rounded ${step >= 2 ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`} />
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
            {isMinorClient && (
              <p className="text-sm text-orange-600 mt-2">
                ⚠️ Pacjent jest małoletni — wymagane dane przedstawiciela ustawowego
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
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Tworzę klienta…' : 'Dalej → Zgody'}
            </button>
          </div>
        </form>
      )}

      {/* KROK 2 — ZGODY */}
      {step === 2 && (
        <form className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 border border-[var(--border)] rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="serviceConsent"
                  checked={consentData.serviceConsent}
                  onChange={handleConsentChange}
                  className="mt-1 w-5 h-5 accent-[var(--accent)] cursor-pointer"
                  required
                />
                <div>
                  <div className="font-medium text-[var(--text-h)]">
                    Zgoda na świadczenia psychologiczne *
                  </div>
                  <p className="text-xs text-[var(--text)] mt-1 italic">{CONSENT_TEXT}</p>
                </div>
              </label>
            </div>

            <div className="p-4 border border-[var(--border)] rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="dataConsent"
                  checked={consentData.dataConsent}
                  onChange={handleConsentChange}
                  className="mt-1 w-5 h-5 accent-[var(--accent)] cursor-pointer"
                  required
                />
                <div>
                  <div className="font-medium text-[var(--text-h)]">
                    Zgoda RODO — dane osobowe (art. 6 ust. 1 lit. b) *
                  </div>
                  <p className="text-xs text-[var(--text)] mt-1 italic">{RODO_TEXT}</p>
                </div>
              </label>
            </div>

            <div className="p-4 border border-[var(--border)] rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="healthDataConsent"
                  checked={consentData.healthDataConsent}
                  onChange={handleConsentChange}
                  className="mt-1 w-5 h-5 accent-[var(--accent)] cursor-pointer"
                  required
                />
                <div>
                  <div className="font-medium text-[var(--text-h)]">
                    Zgoda RODO — dane o zdrowiu (art. 9 ust. 2 lit. a) *
                  </div>
                  <p className="text-xs text-[var(--text)] mt-1 italic">{HEALTH_DATA_TEXT}</p>
                </div>
              </label>
            </div>

            <div className="p-4 border border-[var(--border)] rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="infoClauseConsent"
                  checked={consentData.infoClauseConsent}
                  onChange={handleConsentChange}
                  className="mt-1 w-5 h-5 accent-[var(--accent)] cursor-pointer"
                  required
                />
                <div>
                  <div className="font-medium text-[var(--text-h)]">
                    Klauzula informacyjna (art. 13 RODO) *
                  </div>
                  <p className="text-xs text-[var(--text)] mt-1 italic">{INFO_CLAUSE_TEXT}</p>
                </div>
              </label>
            </div>

            <div className="p-4 border border-[var(--border)] rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="transcription"
                  checked={consentData.transcription}
                  onChange={handleConsentChange}
                  className="mt-1 w-5 h-5 accent-[var(--accent)] cursor-pointer"
                />
                <div>
                  <div className="font-medium text-[var(--text-h)]">
                    Zgoda na nagrywanie/transkrypcję sesji (opcjonalna)
                  </div>
                  <p className="text-xs text-[var(--text)] mt-1">
                    Pacjent wyraża zgodę na nagrywanie sesji i automatyczną transkrypcję dla celów dokumentacji.
                  </p>
                </div>
              </label>
            </div>

            {isMinorClient && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isGuardian"
                    checked={consentData.isGuardian}
                    onChange={handleConsentChange}
                    className="mt-1 w-5 h-5 accent-[var(--accent)] cursor-pointer"
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

          <div className="flex gap-2 pt-4">
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
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Zapisuję…' : 'Utwórz klienta'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
