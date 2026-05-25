import { useEffect, useState } from 'react'
import api from '../api/client'

export default function PsychologistProfile() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    licenseNumber: '',
    address: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/psychologist/profile')
      .then((res) => {
        const { firstName, lastName, licenseNumber, address } = res.data
        setForm({
          firstName: firstName ?? '',
          lastName: lastName ?? '',
          licenseNumber: licenseNumber ?? '',
          address: address ?? '',
        })
      })
      .catch((e) => {
        if (!e.message?.includes('404')) setError(e.message)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setSaved(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await api.put('/psychologist/profile', form)
      setSaved(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-[var(--text)]">Ładowanie…</p>

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-medium text-[var(--text-h)] mb-8">Profil psychologa</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border border-[var(--border)] rounded-lg p-6 space-y-5">
          <h2 className="font-medium text-[var(--text-h)]">Dane osobowe</h2>

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
                value={form.firstName}
                onChange={handleChange}
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
                value={form.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[var(--text-h)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="Kowalski"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-[var(--text-h)] mb-2">
              Adres gabinetu
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[var(--text-h)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="ul. Przykładowa 1, 00-001 Warszawa"
            />
          </div>
        </div>

        <div className="border border-[var(--border)] rounded-lg p-6 space-y-5">
          <div>
            <h2 className="font-medium text-[var(--text-h)]">Numer wpisu do Rejestru</h2>
            <p className="text-xs text-[var(--text)] mt-1">Obowiązkowy od 2028 r. (art. 5 ustawy o zawodzie psychologa)</p>
          </div>
          <div>
            <label htmlFor="licenseNumber" className="block text-sm font-medium text-[var(--text-h)] mb-2">
              Numer wpisu
            </label>
            <input
              id="licenseNumber"
              name="licenseNumber"
              type="text"
              value={form.licenseNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[var(--text-h)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="PSY/2028/00000"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        {saved && (
          <p className="text-green-600 text-sm">Profil zapisany.</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saving ? 'Zapisuję…' : 'Zapisz profil'}
        </button>
      </form>
    </div>
  )
}
