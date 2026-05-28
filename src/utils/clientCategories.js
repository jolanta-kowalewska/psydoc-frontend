const MS_DAY = 24 * 60 * 60 * 1000

export const CATEGORIES = {
  regularny:    { label: 'Regularny',               color: 'bg-blue-100 text-blue-700' },
  konsultacje:  { label: 'Pojedyncze konsultacje',  color: 'bg-amber-100 text-amber-700' },
  archiwalny:   { label: 'Archiwalny',              color: 'bg-[var(--code-bg)] text-[var(--text)]' },
}

export const CATEGORY_ORDER = ['regularny', 'konsultacje', null, 'archiwalny']

/**
 * Zwraca kategorię klienta na podstawie historii wizyt:
 *  'regularny'   — ≥3 wizyty w ostatnich 30 dniach
 *  'konsultacje' — dokładnie 1 wizyta w ostatnich 90 dniach
 *  'archiwalny'  — brak wizyty od >365 dni lub brak wizyt w ogóle
 *  null          — pozostałe (aktywni bez wyraźnego wzorca)
 */
export function getClientCategory(clientId, appointments) {
  const now = Date.now()
  const dates = appointments
    .filter(a => a.clientId === clientId && a.startTime)
    .map(a => new Date(a.startTime).getTime())
    .filter(t => !isNaN(t))
    .sort((a, b) => b - a)

  if (dates.length === 0) return 'archiwalny'

  const last = dates[0]
  const in30  = dates.filter(t => t >= now - 30  * MS_DAY).length
  const in90  = dates.filter(t => t >= now - 90  * MS_DAY).length

  if (in30 >= 3)                        return 'regularny'
  if (in90 === 1)                       return 'konsultacje'
  if (last < now - 365 * MS_DAY)        return 'archiwalny'
  return null
}

export function sortByCategory(clients, categoryMap) {
  return [...clients].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(categoryMap[a.clientId] ?? null)
    const bi = CATEGORY_ORDER.indexOf(categoryMap[b.clientId] ?? null)
    return ai - bi
  })
}
