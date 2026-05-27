import { Link } from 'react-router-dom'

const steps = [
  {
    num: 1,
    title: 'Uzupełnij profil',
    desc: 'Podaj imię, nazwisko i numer licencji psychologa. Dodaj adres gabinetu — pojawi się w przypomnieniach dla klientów. Ustaw swoje typy wizyt z czasem trwania.',
    link: '/profile',
    cta: 'Przejdź do profilu →',
  },
  {
    num: 2,
    title: 'Dodaj pierwszego klienta',
    desc: 'Formularz 3-krokowy: dane osobowe z PESEL (data urodzenia uzupełni się automatycznie), zgody RODO, podpis elektroniczny. System wygeneruje PDF zgody i zapisze go w dokumentach klienta.',
    link: '/clients/new',
    cta: 'Dodaj klienta →',
  },
  {
    num: 3,
    title: 'Zaplanuj wizytę',
    desc: 'Kliknij dowolną godzinę w kalendarzu. Wybierz typ spotkania: stacjonarna, Zoom (automatyczny link) lub własny link z Teams czy Google Meet. Przypomnienie email + SMS wyśle się automatycznie 24h przed wizytą.',
    link: '/calendar',
    cta: 'Otwórz kalendarz →',
  },
  {
    num: 4,
    title: 'Dokumentuj sesje',
    desc: 'Po sesji wejdź w profil klienta i otwórz sesję. Dodaj notatki, podpisz sesję cyfrowo i wyeksportuj do PDF. Możesz też nagrać audio bezpośrednio w aplikacji lub przesłać plik — transkrypcja w języku polskim wykona się automatycznie.',
    link: '/clients',
    cta: 'Lista klientów →',
  },
]

export default function GettingStarted() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-[var(--text-h)] mb-2">Pierwsze kroki w MindData</h1>
        <p className="text-[var(--text)]">
          Zanim zaczniesz przyjmować klientów, wykonaj te 4 kroki. Zajmie to około 5 minut.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map(({ num, title, desc, link, cta }) => (
          <div key={num} className="border border-[var(--border)] rounded-xl p-6">
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent)] text-white text-sm font-semibold flex items-center justify-center">
                {num}
              </span>
              <div className="flex-1">
                <h2 className="font-medium text-[var(--text-h)] mb-1">{title}</h2>
                <p className="text-sm text-[var(--text)] leading-relaxed mb-3">{desc}</p>
                <Link
                  to={link}
                  className="text-sm text-[var(--accent)] hover:underline font-medium"
                >
                  {cta}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-[var(--code-bg)] rounded-xl border border-[var(--border)]">
        <p className="text-sm text-[var(--text)]">
          Masz pytania? Napisz na{' '}
          <a href="mailto:jola@minddata.pl" className="text-[var(--accent)] hover:underline">
            jola@minddata.pl
          </a>
          {' '}— odpiszę osobiście.
        </p>
      </div>
    </div>
  )
}
