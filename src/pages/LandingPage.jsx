import { Link, useNavigate } from 'react-router-dom'

const ACCENT = '#2D6B47'
const ACCENT_DARK = '#1B3A2F'
const ACCENT_LIGHT = '#F2F7F4'
const ACCENT_BTN = '#3D8C5E'

function Header() {
  const navigate = useNavigate()
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="text-xl font-bold tracking-tight" style={{ color: ACCENT_DARK }}>Mind<span style={{ color: ACCENT_BTN }}>Data</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/o-aplikacji" className="hover:text-gray-900 transition-colors">O aplikacji</Link>
          <Link to="/bezpieczenstwo" className="hover:text-gray-900 transition-colors">Bezpieczeństwo</Link>
          <Link to="/rodo" className="hover:text-gray-900 transition-colors">RODO</Link>
          <Link to="/kontakt" className="hover:text-gray-900 transition-colors">Kontakt</Link>
        </nav>

        <button
          onClick={() => navigate('/dashboard')}
          className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: ACCENT_BTN }}
        >
          Zaloguj się
        </button>
      </div>
    </header>
  )
}

function Hero() {
  const navigate = useNavigate()
  return (
    <section className="pt-32 pb-20 px-6 text-center" style={{ background: `linear-gradient(160deg, ${ACCENT_LIGHT} 0%, #fff 60%)` }}>
      <div className="max-w-3xl mx-auto">
        <span className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full" style={{ color: ACCENT_BTN, backgroundColor: '#e8f4ee' }}>
          Dla psychologów i psychoterapeutów
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6" style={{ color: ACCENT_DARK }}>
          Twój gabinet<br className="hidden sm:block" /> w cyfrowym porządku
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
          MindData to bezpieczna aplikacja wspierająca codzienną pracę gabinetu psychologicznego —
          dokumentacja sesji, zarządzanie zgodami RODO i kalendarz wizyt w jednym miejscu.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-7 py-3 rounded-xl text-white font-semibold text-base shadow-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: ACCENT_BTN }}
          >
            Zaloguj się do aplikacji
          </button>
          <Link
            to="/o-aplikacji"
            className="px-7 py-3 rounded-xl font-semibold text-base border transition-colors hover:bg-gray-50"
            style={{ color: ACCENT, borderColor: '#c5ddd0' }}
          >
            Dowiedz się więcej
          </Link>
        </div>
      </div>
    </section>
  )
}

const FEATURES = [
  {
    icon: '📋',
    title: 'Notatki z sesji',
    desc: 'Twórz i podpisuj notatki z każdej wizyty. Wersja robocza — edytuj do momentu podpisania, potem niezmienialny rekord.',
  },
  {
    icon: '🔒',
    title: 'Bezpieczeństwo danych',
    desc: 'Szyfrowanie AES-256, MFA, pełen audit log. Dane przechowywane w UE (Frankfurt). Zgodność z ustawą o zawodzie psychologa.',
  },
  {
    icon: '📜',
    title: 'Zarządzanie zgodami RODO',
    desc: 'Cyfrowe zbieranie i odwoływanie zgód pacjentów. Podpis elektroniczny, historia zmian, zgodność z Art. 7 RODO.',
  },
  {
    icon: '📅',
    title: 'Kalendarz wizyt',
    desc: 'Tygodniowy widok wizyt, wizyty cykliczne, spotkania stacjonarne i online (Zoom / własny link).',
  },
]

function Features() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12" style={{ color: ACCENT_DARK }}>
          Wszystko czego potrzebujesz w gabinecie
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(f => (
            <div key={f.title} className="rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow" style={{ background: ACCENT_LIGHT }}>
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-2 text-sm" style={{ color: ACCENT_DARK }}>{f.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DemoSection() {
  return (
    <section className="py-20 px-6" style={{ background: ACCENT_LIGHT }}>
      <div className="max-w-4xl mx-auto text-center">
        <span className="inline-block text-xs font-semibold tracking-widest uppercase mb-3 px-3 py-1 rounded-full" style={{ color: ACCENT_BTN, backgroundColor: '#e8f4ee' }}>
          Demo
        </span>
        <h2 className="text-2xl font-bold mb-4" style={{ color: ACCENT_DARK }}>Zobacz aplikację w akcji</h2>
        <p className="text-gray-600 mb-8 text-sm">Krótki film pokazujący codzienną pracę z MindData — od dodania klienta po podpisanie notatki.</p>
        <div className="aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center bg-white" style={{ borderColor: '#c5ddd0' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: ACCENT_BTN }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          <p className="text-sm font-medium" style={{ color: ACCENT }}>Film demonstracyjny — wkrótce</p>
        </div>
      </div>
    </section>
  )
}

const SUBPAGES = [
  {
    to: '/o-aplikacji',
    icon: '🏥',
    title: 'O aplikacji',
    desc: 'Dla kogo jest MindData, jak działa i jakie problemy rozwiązuje w pracy gabinetu.',
  },
  {
    to: '/bezpieczenstwo',
    icon: '🛡️',
    title: 'Bezpieczeństwo',
    desc: 'Szczegółowe informacje o architekturze bezpieczeństwa, szyfrowaniu i zgodności z przepisami.',
  },
  {
    to: '/rodo',
    icon: '⚖️',
    title: 'RODO i prywatność',
    desc: 'Jak przetwarzamy dane pacjentów, podstawy prawne i prawa osób, których dane dotyczą.',
  },
  {
    to: '/kontakt',
    icon: '✉️',
    title: 'Kontakt',
    desc: 'Masz pytania lub chcesz umówić demonstrację? Napisz do nas.',
  },
]

function SubpagesSection() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12" style={{ color: ACCENT_DARK }}>Więcej informacji</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {SUBPAGES.map(p => (
            <Link
              key={p.to}
              to={p.to}
              className="group flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-lg transition-all"
              style={{ '--hover-color': ACCENT_LIGHT }}
            >
              <span className="text-2xl mt-0.5 shrink-0">{p.icon}</span>
              <div>
                <h3 className="font-semibold text-sm mb-1 group-hover:underline" style={{ color: ACCENT_DARK }}>{p.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{p.desc}</p>
              </div>
              <svg className="ml-auto shrink-0 mt-0.5 text-gray-300 group-hover:text-gray-500 transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-gray-100 text-center">
      <p className="text-xs text-gray-400">
        © {new Date().getFullYear()} MindData · Aplikacja dla gabinetów psychologicznych ·{' '}
        <Link to="/rodo" className="hover:underline">Polityka prywatności</Link>
      </p>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <Features />
        <DemoSection />
        <SubpagesSection />
      </main>
      <Footer />
    </div>
  )
}
