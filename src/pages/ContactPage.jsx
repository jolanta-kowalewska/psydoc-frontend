import { useState } from 'react'
import { Link } from 'react-router-dom'

const ACCENT = '#2D6B47'
const ACCENT_DARK = '#1B3A2F'
const ACCENT_LIGHT = '#F2F7F4'
const ACCENT_BTN = '#3D8C5E'

const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 transition-shadow'
const focusRing = { '--tw-ring-color': ACCENT_BTN }

function NavBack() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="text-sm font-medium hover:underline" style={{ color: ACCENT }}>← MindData</Link>
        <nav className="hidden sm:flex items-center gap-5 text-sm text-gray-500">
          <Link to="/o-aplikacji" className="hover:text-gray-800">O aplikacji</Link>
          <Link to="/bezpieczenstwo" className="hover:text-gray-800">Bezpieczeństwo</Link>
          <Link to="/rodo" className="hover:text-gray-800">RODO</Link>
        </nav>
      </div>
    </header>
  )
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'demo', message: '' })
  const [sent, setSent] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    const body = encodeURIComponent(
      `Imię i nazwisko: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    )
    window.location.href = `mailto:kontakt@minddata.pl?subject=${encodeURIComponent(
      form.subject === 'demo' ? 'Prośba o demonstrację — MindData' :
      form.subject === 'pytanie' ? 'Pytanie o aplikację — MindData' :
      'Inne — MindData'
    )}&body=${body}`
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <NavBack />
      <main className="max-w-2xl mx-auto px-6 py-16 space-y-10">
        <section className="text-center">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full" style={{ color: ACCENT_BTN, backgroundColor: '#e8f4ee' }}>
            Kontakt
          </span>
          <h1 className="text-3xl font-bold mb-4" style={{ color: ACCENT_DARK }}>Napisz do nas</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Masz pytania o MindData, chcesz umówić demonstrację lub zgłosić problem?
            Odpowiadamy zazwyczaj w ciągu jednego dnia roboczego.
          </p>
        </section>

        {sent ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: ACCENT_LIGHT }}>
            <div className="text-4xl mb-3">✉️</div>
            <p className="font-semibold mb-1" style={{ color: ACCENT_DARK }}>Otworzyliśmy Twój program pocztowy</p>
            <p className="text-sm text-gray-600">Wyślij wiadomość z aplikacji pocztowej, żebyśmy mogli Ci odpowiedzieć.</p>
            <button onClick={() => setSent(false)} className="mt-4 text-sm underline" style={{ color: ACCENT }}>
              Wróć do formularza
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Imię i nazwisko</label>
                <input
                  name="name" required value={form.name} onChange={handleChange}
                  placeholder="Anna Kowalska"
                  className={inputCls} style={focusRing}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                <input
                  type="email" name="email" required value={form.email} onChange={handleChange}
                  placeholder="anna@gabinet.pl"
                  className={inputCls} style={focusRing}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Temat</label>
              <select
                name="subject" value={form.subject} onChange={handleChange}
                className={inputCls} style={focusRing}
              >
                <option value="demo">Chcę zobaczyć demonstrację</option>
                <option value="pytanie">Mam pytanie o aplikację</option>
                <option value="inne">Inne</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Wiadomość</label>
              <textarea
                name="message" required value={form.message} onChange={handleChange}
                rows={5} placeholder="Opisz czego szukasz…"
                className={inputCls} style={focusRing}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: ACCENT_BTN }}
            >
              Wyślij wiadomość
            </button>

            <p className="text-center text-xs text-gray-400">
              Możesz też napisać bezpośrednio na{' '}
              <a href="mailto:kontakt@minddata.pl" className="underline" style={{ color: ACCENT }}>
                kontakt@minddata.pl
              </a>
            </p>
          </form>
        )}
      </main>
    </div>
  )
}
