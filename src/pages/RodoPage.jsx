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
          <Link to="/o-aplikacji" className="hover:text-gray-800">O aplikacji</Link>
          <Link to="/bezpieczenstwo" className="hover:text-gray-800">Bezpieczeństwo</Link>
          <Link to="/kontakt" className="hover:text-gray-800">Kontakt</Link>
        </nav>
      </div>
    </header>
  )
}

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold" style={{ color: ACCENT_DARK }}>{title}</h2>
      <div className="text-sm text-gray-700 leading-relaxed space-y-2">{children}</div>
    </section>
  )
}

export default function RodoPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavBack />
      <main className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        <section className="text-center">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full" style={{ color: ACCENT_BTN, backgroundColor: '#e8f4ee' }}>
            RODO i prywatność
          </span>
          <h1 className="text-3xl font-bold mb-4" style={{ color: ACCENT_DARK }}>Ochrona danych osobowych</h1>
          <p className="text-gray-600 leading-relaxed">
            MindData przetwarza dane wrażliwe — dane o stanie zdrowia (art. 9 RODO). Poniżej opisujemy,
            w jaki sposób dbamy o ich bezpieczeństwo i jakie prawa przysługują osobom, których dane dotyczą.
          </p>
        </section>

        <div className="rounded-2xl p-6 border-l-4 space-y-1" style={{ background: ACCENT_LIGHT, borderColor: ACCENT_BTN }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT_BTN }}>Administrator danych</p>
          <p className="text-sm text-gray-700">
            Administratorem danych pacjentów jest psycholog/psychoterapeuta korzystający z aplikacji MindData
            we własnym gabinecie. MindData pełni rolę <strong>podmiotu przetwarzającego</strong> dane w jego imieniu.
          </p>
        </div>

        <Section title="Podstawy prawne przetwarzania">
          <p>Dane o stanie zdrowia przetwarzamy na podstawie <strong>art. 9 ust. 2 lit. h RODO</strong> — diagnostyka i leczenie — w związku z ustawą z dnia 8 czerwca 2001 r. o zawodzie psychologa.</p>
          <p>Dane w celach rozliczeniowych przetwarzamy na podstawie <strong>art. 6 ust. 1 lit. c RODO</strong> — obowiązek prawny.</p>
        </Section>

        <Section title="Zarządzanie zgodami pacjentów">
          <p>Aplikacja umożliwia psychologowi cyfrowe zbieranie i odwoływanie zgód RODO.</p>
          <ul className="space-y-2 mt-2">
            {[
              'Każda zgoda jest zapisywana z datą i rodzajem (indywidualna / grupowa) wraz z podpisem elektronicznym.',
              'Cofnięcie zgody jest możliwe w każdej chwili — zapis pozostaje w historii zgodnie z art. 5 ust. 2 RODO (rozliczalność).',
              'Cofnięcie nie usuwa danych — psycholog może zaprzestać świadczenia usług.',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5" style={{ color: ACCENT_BTN }}>•</span>{item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Prawa osób, których dane dotyczą">
          <ul className="space-y-2">
            {[
              'Prawo dostępu do danych (art. 15 RODO)',
              'Prawo do sprostowania (art. 16 RODO)',
              'Prawo do usunięcia (art. 17 RODO) — z zastrzeżeniem obowiązku archiwizacji dokumentacji medycznej',
              'Prawo do ograniczenia przetwarzania (art. 18 RODO)',
              'Prawo do przenoszenia danych (art. 20 RODO)',
              'Prawo do wniesienia skargi do Prezesa UODO',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5" style={{ color: ACCENT_BTN }}>✓</span>{item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Przechowywanie i bezpieczeństwo">
          <p>Dane przechowywane są wyłącznie w centrach danych na terenie Unii Europejskiej (region AWS eu-central-1, Frankfurt).</p>
          <p>Dane w spoczynku szyfrowane są kluczem AES-256 zarządzanym przez AWS KMS. Szczegóły techniczne na stronie <Link to="/bezpieczenstwo" className="underline" style={{ color: ACCENT }}>Bezpieczeństwo</Link>.</p>
        </Section>

        <Section title="Kontakt w sprawach danych osobowych">
          <p>W sprawach dotyczących ochrony danych osobowych prosimy o kontakt przez stronę <Link to="/kontakt" className="underline" style={{ color: ACCENT }}>Kontakt</Link>.</p>
        </Section>
      </main>
    </div>
  )
}
