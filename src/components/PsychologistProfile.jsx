import { useEffect, useState } from 'react'
import api from '../api/client'

const EMPTY = { firstName: '', lastName: '', licenseNumber: '', address: '', calendlyUrl: '' }

function Field({ label, value, placeholder }) {
  return (
    <div>
      <p className="text-sm font-medium text-[var(--text-h)]">{label}</p>
      <p className="text-sm text-[var(--text)] mt-1">{value || <span className="opacity-40">{placeholder}</span>}</p>
    </div>
  )
}

function FormInput({ id, label, required, value, onChange, placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[var(--text-h)] mb-2">
        {label}{required && ' *'}
      </label>
      <input
        id={id}
        name={id}
        type="text"
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[var(--text-h)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      />
    </div>
  )
}

export default function PsychologistProfile() {
  const [saved, setSaved] = useState(EMPTY)
  const [form, setForm] = useState(EMPTY)
  const [isEditing, setIsEditing] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [flashSaved, setFlashSaved] = useState(false)

  useEffect(() => {
    api.get('/psychologist/profile')
      .then((res) => {
        const { firstName = '', lastName = '', licenseNumber = '', address = '', calendlyUrl = '' } = res.data
        const profile = { firstName, lastName, licenseNumber, address, calendlyUrl }
        setSaved(profile)
        setForm(profile)
        setHasProfile(true)
      })
      .catch((e) => {
        if (e.message?.toLowerCase().includes('not found') || e.message?.includes('404')) {
          setIsEditing(true)
        } else {
          setError(e.message)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEdit = () => {
    setForm(saved)
    setError(null)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setForm(saved)
    setError(null)
    setIsEditing(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await api.put('/psychologist/profile', form)
      setSaved(form)
      setHasProfile(true)
      setIsEditing(false)
      setFlashSaved(true)
      setTimeout(() => setFlashSaved(false), 3000)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-[var(--text)]">Ładowanie…</p>

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-medium text-[var(--text-h)]">Profil psychologa</h1>
        {!isEditing && hasProfile && (
          <button
            type="button"
            onClick={handleEdit}
            className="px-4 py-2 border border-[var(--border)] text-[var(--text-h)] rounded-lg text-sm hover:bg-[var(--code-bg)] transition-colors"
          >
            Edytuj profil
          </button>
        )}
      </div>

      {flashSaved && (
        <p className="text-green-600 text-sm mb-4">Profil zapisany.</p>
      )}

      {!isEditing ? (
        <div className="space-y-6">
          <div className="border border-[var(--border)] rounded-lg p-6 space-y-4">
            <h2 className="font-medium text-[var(--text-h)]">Dane osobowe</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Imię" value={saved.firstName} placeholder="—" />
              <Field label="Nazwisko" value={saved.lastName} placeholder="—" />
            </div>
            <Field label="Adres gabinetu" value={saved.address} placeholder="nie podano" />
          </div>

          <div className="border border-[var(--border)] rounded-lg p-6 space-y-4">
            <div>
              <h2 className="font-medium text-[var(--text-h)]">Numer wpisu do Rejestru</h2>
              <p className="text-xs text-[var(--text)] mt-1">Obowiązkowy od 2028 r. (art. 5 ustawy o zawodzie psychologa)</p>
            </div>
            <Field label="Numer wpisu" value={saved.licenseNumber} placeholder="nie podano" />
          </div>

          <div className="border border-[var(--border)] rounded-lg p-6 space-y-4">
            <h2 className="font-medium text-[var(--text-h)]">Kalendarz Calendly</h2>
            <div>
              <p className="text-sm font-medium text-[var(--text-h)]">Link do kalendarza</p>
              {saved.calendlyUrl
                ? <a href={saved.calendlyUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--accent)] hover:underline mt-1 block break-all">{saved.calendlyUrl}</a>
                : <p className="text-sm text-[var(--text)] mt-1 opacity-40">nie podano</p>
              }
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {hasProfile && (
            <button
              type="button"
              onClick={handleCancel}
              className="text-sm text-[var(--text)] hover:text-[var(--text-h)] transition-colors"
            >
              ← Anuluj
            </button>
          )}

          <div className="border border-[var(--border)] rounded-lg p-6 space-y-5">
            <h2 className="font-medium text-[var(--text-h)]">Dane osobowe</h2>
            <div className="grid grid-cols-2 gap-4">
              <FormInput id="firstName" label="Imię" required value={form.firstName} onChange={handleChange} placeholder="Jan" />
              <FormInput id="lastName" label="Nazwisko" required value={form.lastName} onChange={handleChange} placeholder="Kowalski" />
            </div>
            <FormInput id="address" label="Adres gabinetu" value={form.address} onChange={handleChange} placeholder="ul. Przykładowa 1, 00-001 Warszawa" />
          </div>

          <div className="border border-[var(--border)] rounded-lg p-6 space-y-5">
            <div>
              <h2 className="font-medium text-[var(--text-h)]">Numer wpisu do Rejestru</h2>
              <p className="text-xs text-[var(--text)] mt-1">Obowiązkowy od 2028 r. (art. 5 ustawy o zawodzie psychologa)</p>
            </div>
            <FormInput id="licenseNumber" label="Numer wpisu" value={form.licenseNumber} onChange={handleChange} placeholder="PSY/2028/00000" />
          </div>

          <div className="border border-[var(--border)] rounded-lg p-6 space-y-5">
            <h2 className="font-medium text-[var(--text-h)]">Kalendarz Calendly</h2>
            <FormInput id="calendlyUrl" label="Link do kalendarza" value={form.calendlyUrl} onChange={handleChange} placeholder="https://calendly.com/twoj-login" />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? 'Zapisuję…' : 'Zapisz'}
          </button>
        </form>
      )}
    </div>
  )
}
