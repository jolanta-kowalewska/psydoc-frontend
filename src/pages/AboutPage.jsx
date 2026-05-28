import { Link } from 'react-router-dom'

const ACCENT = '#2D6B47'
const ACCENT_DARK = '#1B3A2F'
const ACCENT_LIGHT = '#F2F7F4'
const ACCENT_BTN = '#3D8C5E'

function NavBack() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="text-sm font-medium hover:underline" style={{ color: ACCENT }}>← MindData</Link>
        <nav className="hidden sm:flex items-center gap-5 text-sm text-gray-500">
          <Link to="/bezpieczenstwo" className="hover:text-gray-800">Bezpieczeństwo</Link>
          <Link to="/rodo" className="hover:text-gray-800">RODO</Link>
          <Link to="/kontakt" className="hover:text-gray-800">Kontakt</Link>
        </nav>
      </div>
    </header>
  )
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavBack />
      <main className="max-w-3xl mx-auto px-6 py-16 space-y-14">
        <section className="text-center">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full" style={{ color: ACCENT_BTN, backgroundColor: '#e8f4ee' }}>
            O aplikacji
          </span>
          <h1 className="text-3xl font-bold mb-4" style={{ color: ACCENT_DARK }}>MindData — czym jest i dla kogo?</h1>
          <p className="text-gray-600 leading-relaxed">
            MindData to aplikacja webowa stworzona z myślą o psychologach i psychoterapeutach prowadzących prywatny gabinet.
            Pomaga porządkować codzienną dokumentację w sposób zgodny z obowiązującym prawem i standardami bezpieczeństwa danych.
          </p>
        </section>

        <section className="rounded-2xl p-8 space-y-4" style={{ background: ACCENT_LIGHT }}>
          <h2 className="text-lg font-semibold" style={{ color: ACCENT_DARK }}>Dla kogo jest MindData?</h2>
          <ul className="space-y-3 text-sm text-gray-700">
            {[
              'Psychologowie i psychoterapeuci prowadzący prywatny gabinet',
              'Specjaliści obsługujący pacjentów dorosłych i małoletnich',
              'Praktyki wymagające cyfrowego obiegu zgód RODO i dokumentacji sesji',
              'Gabinety chcące odejść od papierowej dokumentacji',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span style={{ color: ACCENT_BTN }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold" style={{ color: ACCENT_DARK }}>Główne funkcje</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: '📋', title: 'Notatki z sesji', desc: 'Dokumentacja każdej wizyty z możliwością podpisania i dodawania adnotacji.' },
              { icon: '📜', title: 'Zarządzanie zgodami', desc: 'Cyfrowe zbieranie i odwoływanie zgód RODO z podpisem elektronicznym.' },
              { icon: '📅', title: 'Kalendarz', desc: 'Planowanie wizyt, spotkania online i cykliczne.' },
              { icon: '👥', title: 'Baza klientów', desc: 'Pełne profile pacjentów, w tym małoletnich z opiekunem.' },
            ].map(f => (
              <div key={f.title} className="border border-gray-100 rounded-xl p-4">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="font-medium text-sm mb-1" style={{ color: ACCENT_DARK }}>{f.title}</h3>
                <p className="text-xs text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center pt-4">
          <p className="text-sm text-gray-600 mb-4">Chcesz zobaczyć MindData w praktyce?</p>
          <Link
            to="/kontakt"
            className="inline-block px-6 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: ACCENT_BTN }}
          >
            Skontaktuj się z nami
          </Link>
        </section>
      </main>
    </div>
  )
}
