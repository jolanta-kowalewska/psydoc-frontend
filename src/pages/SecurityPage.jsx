import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const G_DARK = '#1B3A2F'
const G_MID = '#2D6B47'
const G_LIGHT = '#F2F7F4'
const G_BTN = '#3D8C5E'

function ShieldBg() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden="true">
      <svg width="480" height="576" viewBox="0 0 100 120" fill="none" style={{ opacity: 0.06 }}>
        <path d="M50 5L10 22v33c0 24 17 46 40 55 23-9 40-31 40-55V22L50 5z" stroke="white" strokeWidth="3"/>
        <path d="M50 18L22 30v22c0 16 11 31 28 38 17-7 28-22 28-38V30L50 18z" stroke="white" strokeWidth="2"/>
      </svg>
    </div>
  )
}

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function Tag({ children }) {
  return (
    <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: G_MID }}>
      {children}
    </p>
  )
}

export default function SecurityPage() {
  useEffect(() => {
    document.body.classList.add('public-page')
    return () => document.body.classList.remove('public-page')
  }, [])

  return (
    <div className="font-sans antialiased" style={{ color: '#1a1a1a' }}>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4" style={{ backgroundColor: G_DARK }}>
        <span className="text-white font-semibold text-lg tracking-tight">MindData</span>
        <Link to="/" className="text-sm font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-90" style={{ backgroundColor: 'white', color: G_DARK }}>
          Zaloguj się
        </Link>
      </nav>

      {/* 1 — HERO */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-screen px-6 pt-20" style={{ backgroundColor: G_DARK }}>
        <ShieldBg />
        <div className="relative z-10 max-w-3xl">
          <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>Calm Security</p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight" style={{ color: 'white', margin: 0, fontSize: 'clamp(2.2rem, 5vw, 3.75rem)', letterSpacing: '-0.02em' }}>
            MindData. Spokój i bezpieczeństwo Twojej praktyki.
          </h1>
          <p className="mt-6 text-lg md:text-xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Nowy standard cyfrowej dokumentacji psychologicznej w dobie Ustawy z 2026 roku.
          </p>
          <Link to="/" className="mt-10 inline-block px-8 py-4 rounded-xl font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: G_BTN }}>
            Zacznij w 15 minut
          </Link>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </section>

      {/* 2 — USTAWA / TIMELINE */}
      <section className="py-24 px-8">
        <div className="max-w-5xl mx-auto">
          <Tag>Kontekst prawny</Tag>
          <h2 className="text-3xl md:text-4xl font-semibold leading-snug" style={{ color: G_DARK, margin: 0 }}>
            Ewolucja zawodu zaufania publicznego
          </h2>
          <p className="mt-4 text-lg" style={{ color: '#6b7280' }}>
            Ustawa o zawodzie psychologa (Dz.U.&nbsp;2026 poz.&nbsp;187) na zawsze zmienia zasady prowadzenia gabinetu.
            Czas na przygotowanie mija w maju 2028 roku.
          </p>
          <div className="mt-16 grid md:grid-cols-3 gap-10">
            {[
              { title: 'Rygorystyczna dokumentacja', body: 'Wymóg precyzyjnego śledzenia autorstwa i czasu każdej notatki.' },
              { title: 'Zarządzanie zgodami', body: 'Restrykcyjne zasady oddzielania danych pacjenta od wyrażonych zgód.' },
              { title: 'Archiwizacja', body: 'Prawny obowiązek bezpiecznego przechowywania danych przez dokładnie 5 lat.' },
            ].map((item) => (
              <div key={item.title} className="border-t-4 pt-5" style={{ borderColor: G_MID }}>
                <h3 className="font-semibold text-base" style={{ color: G_DARK }}>{item.title}</h3>
                <p className="mt-2 text-sm" style={{ color: '#6b7280' }}>{item.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex items-center gap-4">
            <div className="flex-1 h-0.5 rounded" style={{ backgroundColor: '#e5e7eb' }} />
            <span className="text-sm font-bold px-4 py-1.5 rounded-full text-white" style={{ backgroundColor: G_DARK }}>
              Deadline: Maj 2028
            </span>
          </div>
        </div>
      </section>

      {/* 3 — BANKING SECURITY */}
      <section className="py-24 px-8" style={{ backgroundColor: G_LIGHT }}>
        <div className="max-w-5xl mx-auto md:flex md:items-center md:gap-16">
          <div className="md:flex-1">
            <Tag>Technologia</Tag>
            <h2 className="text-3xl md:text-4xl font-bold leading-snug" style={{ color: G_DARK, margin: 0 }}>
              Chronimy tajemnicę zawodową metodami z sektora finansowego.
            </h2>
            <p className="mt-4 text-lg" style={{ color: '#6b7280' }}>
              Dane Twoich pacjentów są równie wrażliwe co ich finanse. Dlatego w MindData zastosowaliśmy
              zabezpieczenia znane z najnowocześniejszych systemów bankowych. Zbudowaliśmy aplikację,
              która zdejmuje z Ciebie ciężar technologiczny i prawny.
            </p>
          </div>
          <div className="mt-10 md:mt-0 flex-shrink-0">
            <div className="rounded-2xl text-white px-8 py-7 text-center max-w-xs" style={{ backgroundColor: G_DARK }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="mx-auto mb-4" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <p className="font-semibold text-lg">Ty skupiasz się na terapii.</p>
              <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>My strzeżemy danych.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 — MFA */}
      <section className="py-24 px-8">
        <div className="max-w-5xl mx-auto md:flex md:gap-16 md:items-start">
          <div className="md:flex-1">
            <Tag>Uwierzytelnianie</Tag>
            <h2 className="text-3xl md:text-4xl font-semibold leading-snug" style={{ color: G_DARK, margin: 0 }}>
              Pierwsza linia obrony: logowanie jak do banku.
            </h2>
            <p className="mt-4 text-lg" style={{ color: '#6b7280' }}>
              W dzisiejszych czasach samo hasło to za mało. MindData wymaga podwójnego potwierdzenia tożsamości (MFA).
            </p>
          </div>
          <div className="mt-10 md:mt-0 md:flex-1 space-y-4">
            {[
              'Wpisujesz swoje bezpieczne hasło na komputerze.',
              'Potwierdzasz logowanie na swoim osobistym telefonie.',
              'Nawet jeśli ktoś pozna Twoje hasło, system nie wpuści go bez Twojego urządzenia.',
            ].map((step, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl border" style={{ borderColor: `${G_MID}40` }}>
                <span className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: G_MID }}>
                  {i + 1}
                </span>
                <p className="text-sm" style={{ color: '#4b5563' }}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 — VAULT */}
      <section className="py-24 px-8" style={{ backgroundColor: G_DARK }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>Szyfrowanie</p>
          <h2 className="text-3xl md:text-4xl font-semibold leading-snug max-w-2xl" style={{ color: 'white', margin: 0 }}>
            Twój prywatny, cyfrowy sejf na notatki z sesji.
          </h2>
          <p className="mt-4 text-lg max-w-2xl" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Każde słowo, które zapiszesz po sesji, jest natychmiast, automatycznie kodowane.
            Nie używamy tu półśrodków — stosujemy zaawansowane szyfrowanie.
          </p>
          <blockquote className="mt-10 p-6 rounded-2xl max-w-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderLeft: `4px solid ${G_MID}` }}>
            <p className="font-semibold text-white">Klucz masz tylko Ty.</p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              System został zaprojektowany tak, aby nikt z zewnątrz — włączając w to twórców
              i administratorów MindData — nie miał technicznej możliwości odczytania Twoich
              notatek terapeutycznych.
            </p>
          </blockquote>
        </div>
      </section>

      {/* 6 — RODO/EU */}
      <section className="py-24 px-8" style={{ backgroundColor: G_LIGHT }}>
        <div className="max-w-5xl mx-auto">
          <Tag>RODO</Tag>
          <h2 className="text-3xl md:text-4xl font-semibold leading-snug" style={{ color: G_DARK, margin: 0 }}>
            Pełna zgodność z RODO: Twoje dane nie opuszczają Europy.
          </h2>
          <p className="mt-4 text-lg max-w-3xl" style={{ color: '#6b7280' }}>
            Zgodnie z Art.&nbsp;44 RODO, transfer danych medycznych poza Europejski Obszar Gospodarczy
            niesie ogromne ryzyko prawne.
          </p>
          <div className="mt-10 space-y-4 max-w-2xl">
            {[
              'Cała infrastruktura MindData fizycznie znajduje się w Europie (serwery we Frankfurcie).',
              'Zero transferu danych na inne kontynenty.',
              'Gwarancja objęcia danych najsurowszymi unijnymi standardami prywatności.',
            ].map((item) => (
              <div key={item} className="flex gap-3 items-start">
                <span className="mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: G_MID }}>
                  <Check />
                </span>
                <p style={{ color: '#4b5563' }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 — IMMUTABILITY */}
      <section className="py-24 px-8">
        <div className="max-w-5xl mx-auto">
          <Tag>Integralność dokumentów</Tag>
          <h2 className="text-3xl md:text-4xl font-semibold leading-snug" style={{ color: G_DARK, margin: 0 }}>
            Niezmienność dokumentacji i cyfrowa pieczęć.
          </h2>
          <p className="mt-4 text-lg max-w-2xl" style={{ color: '#6b7280' }}>
            Zgodnie z Art.&nbsp;28 nowej ustawy, po zatwierdzeniu notatki z sesji nikt nie może jej
            potajemnie zmodyfikować.
          </p>
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            {[
              { title: 'Cyfrowy ślad', body: 'System trwale zapisuje unikalny identyfikator psychologa oraz dokładny czas (co do sekundy) podpisania dokumentu.' },
              { title: 'Cyfrowa pieczęć', body: 'Zastosowanie technologii kryptograficznej gwarantuje w sądzie lub przed komisją etyki, że dokument nie uległ najmniejszej zmianie od momentu jego zamknięcia.' },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-2xl border" style={{ borderColor: `${G_MID}40` }}>
                <h3 className="font-semibold" style={{ color: G_DARK }}>{item.title}</h3>
                <p className="mt-2 text-sm" style={{ color: '#6b7280' }}>{item.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex items-center gap-3 max-w-md">
            <span className="text-sm font-medium" style={{ color: '#ef4444' }}>← edycja zablokowana</span>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 h-px" style={{ backgroundColor: '#e5e7eb' }} />
              <span className="text-xs font-semibold px-3 py-1 rounded-full text-white" style={{ backgroundColor: G_MID }}>Zatwierdzona notatka</span>
              <div className="flex-1 h-px" style={{ backgroundColor: '#e5e7eb' }} />
            </div>
            <span className="text-sm" style={{ color: '#9ca3af' }}>Aneks →</span>
          </div>
        </div>
      </section>

      {/* 8 — CONSENT MANAGEMENT */}
      <section className="py-24 px-8" style={{ backgroundColor: G_LIGHT }}>
        <div className="max-w-5xl mx-auto md:flex md:gap-16">
          <div className="md:flex-1">
            <Tag>Zarządzanie zgodami</Tag>
            <h2 className="text-3xl md:text-4xl font-semibold leading-snug" style={{ color: G_DARK, margin: 0 }}>
              Transparentna relacja i elastyczne zarządzanie zgodami.
            </h2>
            <p className="mt-4 text-lg" style={{ color: '#6b7280' }}>
              Wymogi Art.&nbsp;25 Ustawy wymuszają porządek. MindData kategorycznie oddziela
              cyfrowe zgody pacjenta od jego dokumentacji medycznej.
            </p>
            <div className="mt-8 flex items-center gap-5">
              <div className="text-center text-sm font-semibold px-4 py-2.5 rounded-xl text-white" style={{ backgroundColor: G_DARK }}>
                Karta Pacjenta
              </div>
              <div className="flex flex-col gap-2">
                {['Zgoda 1 (czas)', 'Zgoda 2 (czas)'].map((g) => (
                  <span key={g} className="text-xs px-3 py-1.5 rounded-lg border font-medium" style={{ borderColor: `${G_MID}60`, color: G_MID }}>
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-10 md:mt-12 md:w-72">
            <div className="p-5 rounded-2xl text-white" style={{ backgroundColor: G_MID }}>
              <p className="font-semibold">Gotowe na terapię par i grup.</p>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                System automatycznie wymusza i przechowuje indywidualne zgody od każdego uczestnika
                terapii wieloosobowej, każdorazowo nakładając precyzyjny stempel czasowy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9 — COMPLIANCE TABLE */}
      <section className="py-24 px-8">
        <div className="max-w-5xl mx-auto">
          <Tag>Zgodność prawna</Tag>
          <h2 className="text-3xl md:text-4xl font-semibold leading-snug" style={{ color: G_DARK, margin: 0 }}>
            Zaprojektowane od podstaw pod nowe polskie prawo.
          </h2>
          <div className="mt-10 overflow-x-auto rounded-2xl border" style={{ borderColor: `${G_MID}30` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: G_LIGHT }}>
                  <th className="text-left px-6 py-4 font-medium" style={{ color: '#9ca3af' }}>Wymóg Ustawy z 2026 r.</th>
                  <th className="text-left px-6 py-4 font-semibold" style={{ color: G_MID }}>Jak MindData to automatyzuje</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Art. 28 — Śledzenie autorstwa wpisów.', 'Unikalny podpis psychologa z automatycznym czasem (UTC).'],
                  ['Art. 25 — Niezależne przechowywanie zgód.', 'Dedykowany, oddzielny rekord cyfrowy dla każdej zgody.'],
                  ['Nienaruszalność zatwierdzonej dokumentacji.', 'Blokada edycji z certyfikatem cyfrowej pieczęci.'],
                  ['Art. 28 ust. 9 — 5-letni okres przechowywania.', 'Zautomatyzowane, rygorystyczne archiwum z timerem na 5 lat.'],
                ].map(([req, impl], i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'white' : G_LIGHT }}>
                    <td className="px-6 py-4 border-t" style={{ borderColor: `${G_MID}20`, color: '#6b7280' }}>{req}</td>
                    <td className="px-6 py-4 border-t font-medium" style={{ borderColor: `${G_MID}20`, color: G_DARK }}>{impl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 10 — BACKUP */}
      <section className="py-24 px-8" style={{ backgroundColor: G_DARK }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>Calm Security</p>
          <h2 className="text-3xl md:text-4xl font-semibold leading-snug max-w-2xl" style={{ color: 'white', margin: 0 }}>
            Niewidzialna ochrona przed utratą danych.
          </h2>
          <p className="mt-4 text-lg max-w-2xl" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Prawo wymaga przechowywania danych przez 5 lat. MindData automatycznie pilnuje tego
            terminu w tle. Co jednak, gdy popełnisz błąd lub nastąpi awaria?
          </p>
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            {[
              { title: 'Bariera przed skasowaniem', body: 'Tworzymy warstwowe kopie zapasowe, które chronią Cię przed przypadkowym usunięciem akt.' },
              { title: 'Odporność na ataki', body: 'Nasza infrastruktura posiada mechanizmy odzyskiwania danych odporne nawet na zaawansowane ataki typu ransomware. Nic się nie zgubi.' },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11 — ARCHITECTURE */}
      <section className="py-24 px-8" style={{ backgroundColor: G_LIGHT }}>
        <div className="max-w-5xl mx-auto text-center">
          <Tag>Architektura</Tag>
          <h2 className="text-3xl md:text-4xl font-semibold leading-snug" style={{ color: G_DARK, margin: 0 }}>
            Skomplikowana technologia, która służy jednemu celowi.
          </h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: '#6b7280' }}>
            Cała zaawansowana architektura MindData działa całkowicie w tle. Nie musisz być ekspertem
            od IT ani prawnikiem, aby prowadzić gabinet zgodnie z najwyższymi światowymi standardami.
          </p>
          <div className="mt-14 grid md:grid-cols-3 gap-6 text-left">
            {[
              { title: 'Cyfrowy Sejf', sub: 'Szyfrowanie', desc: 'Notatki i nagrania sesji chronione algorytmami używanymi w sektorze bankowym.' },
              { title: 'Bankowe Logowanie', sub: 'MFA', desc: 'Dwuetapowa weryfikacja tożsamości przy każdym dostępie do danych pacjenta.' },
              { title: 'Europejskie Prawo', sub: 'RODO i Ustawa 2026', desc: 'Automatyczna zgodność z polskim i unijnym prawem — bez żadnego wysiłku z Twojej strony.' },
            ].map((pillar) => (
              <div key={pillar.title} className="p-6 rounded-2xl border bg-white" style={{ borderColor: `${G_MID}30` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${G_MID}18` }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={G_MID} strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <p className="text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: G_MID }}>{pillar.sub}</p>
                <h3 className="font-semibold text-base mb-2" style={{ color: G_DARK }}>{pillar.title}</h3>
                <p className="text-sm" style={{ color: '#6b7280' }}>{pillar.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 text-base max-w-xl mx-auto" style={{ color: '#6b7280' }}>
            Zdejmujemy z Ciebie stres administracyjny, abyś mógł w 100% poświęcić swoją uwagę pacjentowi.
          </p>
        </div>
      </section>

      {/* 12 — CTA */}
      <section className="py-28 px-8 text-center" style={{ backgroundColor: G_DARK }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight" style={{ color: 'white', margin: 0 }}>
            Twój cyfrowy gabinet może być gotowy już dziś.
          </h2>
          <p className="mt-6 text-lg" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Przygotowaliśmy interaktywny przewodnik, który przeprowadzi Cię przez proces konfiguracji w zaledwie 15 minut.
          </p>
          <div className="mt-8 mx-auto max-w-md rounded-xl p-5 text-left" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Zaloguj się po raz pierwszy, przejdź do zakładki <strong className="text-white">Pierwsze kroki</strong> i
              pozwól systemowi zbudować Twoją bezpieczną przestrzeń.
            </p>
          </div>
          <Link to="/" className="mt-8 inline-block px-10 py-4 rounded-xl font-semibold text-lg text-white transition-opacity hover:opacity-90" style={{ backgroundColor: G_BTN }}>
            Rozpocznij konfigurację
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-8 text-center text-xs" style={{ backgroundColor: '#111E18', color: '#6b7280' }}>
        MindData &copy; {new Date().getFullYear()} &mdash; Bezpieczna dokumentacja psychologiczna
      </footer>

    </div>
  )
}
