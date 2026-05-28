import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

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

function isMinorByDate(pesel, birthDate) {
  const dateStr = parsePeselDate(pesel) ?? birthDate
  if (!dateStr) return false
  const dob = new Date(dateStr)
  const today = new Date()
  const age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  return age < 18 || (age === 18 && m < 0)
}

export default function ClientForm() {
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
    address: '',
  })

  const [guardianData, setGuardianData] = useState({
    firstName: '',
    lastName: '',
    pesel: '',
    address: '',
  })

  const isMinorClient = isMinorByDate(clientData.pesel, clientData.birthDate)

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

  const validate = () => {
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

  const handleSubmit = async () => {
    setError(null)
    if (!validate()) return
    setLoading(true)
    try {
      const res = await api.post('/clients', clientData)
      navigate(`/clients/${res.data.id}`)
    } catch (e) {
      setError(`Błąd przy zapisywaniu klienta: ${e.message}`)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-medium text-[var(--text-h)] mb-8">Nowy klient — dane osobowe</h1>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}

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
            <p className="text-sm text-red-600 mt-2">Nieprawidłowy PESEL (błędna cyfra kontrolna)</p>
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
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Zapisuję…' : 'Zapisz klienta'}
          </button>
        </div>
      </form>
    </div>
  )
}
