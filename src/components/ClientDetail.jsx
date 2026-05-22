import { useParams } from 'react-router-dom'

export default function ClientDetail() {
  const { clientId } = useParams()

  return (
    <div>
      <h1>Klient #{clientId}</h1>
      <p className="text-[var(--text)]">Szczegóły klienta i sesje — do implementacji.</p>
    </div>
  )
}
