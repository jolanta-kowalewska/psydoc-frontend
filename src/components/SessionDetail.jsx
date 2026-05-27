import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../api/client'

export default function SessionDetail() {
  const { clientId, sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [signing, setSigning] = useState(false)
  const [signError, setSignError] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState(null)
  const [restricting, setRestricting] = useState(false)
  const [restrictError, setRestrictError] = useState(null)
  const [transcribing, setTranscribing] = useState(false)
  const [transcribeError, setTranscribeError] = useState(null)

  const load = () => {
    setLoading(true)
    api.get(`/sessions/${sessionId}`)
      .then((res) => setSession(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [sessionId])

  // Polling — sprawdza status transkrypcji co 5s gdy job jest w toku
  useEffect(() => {
    if (session?.transcribeStatus !== 'IN_PROGRESS' || session?.transcript) return
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/sessions/${sessionId}/transcribe`)
        if (res.data.status === 'COMPLETED' || res.data.status === 'FAILED') {
          clearInterval(interval)
          load()
        }
      } catch {
        // ignoruj błędy pollingu
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [session?.transcribeStatus, session?.transcript])

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const handleTranscribeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''

    const ext = file.name.split('.').pop().toLowerCase()
    if (!['mp3', 'wav', 'mp4'].includes(ext)) {
      setTranscribeError('Nieobsługiwany format. Użyj mp3, wav lub mp4.')
      return
    }
    if (file.size > 7 * 1024 * 1024) {
      setTranscribeError('Plik za duży. Maksymalny rozmiar: 7 MB.')
      return
    }

    setTranscribing(true)
    setTranscribeError(null)
    try {
      const base64 = await fileToBase64(file)
      await api.post(`/sessions/${sessionId}/transcribe`, { audioData: base64, audioFormat: ext })
      load()
    } catch (err) {
      setTranscribeError(err.message)
    } finally {
      setTranscribing(false)
    }
  }

  const handleSign = async () => {
    setSigning(true)
    setSignError(null)
    try {
      await api.post(`/sessions/${sessionId}/sign`)
      load()
    } catch (err) {
      setSignError(err.message)
    } finally {
      setSigning(false)
    }
  }

  const handleToggleRestrict = async () => {
    const newRestricted = !session.accessRestricted
    setRestricting(true)
    setRestrictError(null)
    try {
      await api.put(`/sessions/${sessionId}/restrict`, {
        accessRestricted: newRestricted,
        ...(newRestricted ? { restrictionReason: 'guardian_protection' } : {}),
      })
      load()
    } catch (e) {
      setRestrictError(e.message)
    } finally {
      setRestricting(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    setExportError(null)
    try {
      const res = await api.post('/documents/export', { sessionId })
      window.open(res.data.url, '_blank')
    } catch (e) {
      setExportError(e.message)
    } finally {
      setExporting(false)
    }
  }

  if (loading) return <p className="text-[var(--text)]">Ładowanie…</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!session) return <p className="text-[var(--text)]">Sesja nie znaleziona.</p>

  const isSigned = session.state === 'signed'

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; color: black; }
        }
      `}</style>

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6 no-print">
          <button
            onClick={() => navigate(`/clients/${clientId}`)}
            className="text-[var(--accent)] text-sm"
          >
            ← Wróć do klienta
          </button>
          <div className="flex gap-2">
            {!isSigned && (
              <button
                onClick={handleSign}
                disabled={signing}
                className="px-4 py-2 border border-[var(--border)] text-[var(--text-h)] rounded-lg text-sm hover:bg-[var(--code-bg)] disabled:opacity-50 transition-colors"
              >
                {signing ? 'Podpisuję…' : 'Podpisz'}
              </button>
            )}
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {exporting ? 'Generuję…' : 'Eksportuj PDF'}
            </button>
          </div>
        </div>

        {signError && (
          <p className="text-red-500 text-sm mb-4 no-print">{signError}</p>
        )}
        {exportError && (
          <p className="text-red-500 text-sm mb-4 no-print">{exportError}</p>
        )}

        <div className="border border-[var(--border)] rounded-lg p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-medium text-[var(--text-h)] capitalize">
                Sesja {session.sessionType}
              </h1>
              <p className="text-[var(--text)] mt-1">{session.date}</p>
            </div>
            <span className={`text-sm px-3 py-1 rounded-full ${isSigned ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {isSigned ? 'podpisana' : 'szkic'}
            </span>
          </div>

          {isSigned && (
            <div className="text-sm text-[var(--text)] border-t border-[var(--border)] pt-4">
              <p>Podpisano: {session.signedAt?.slice(0, 16).replace('T', ' ')}</p>
              <p className="font-mono text-xs mt-1 break-all text-[var(--text)]">
                SHA-256: {session.signatureHash}
              </p>
            </div>
          )}

          {(() => {
            const autoRestricted = ['arkusz_testu', 'notatki_robocze'].includes(session.sessionType)
            const reasonLabels = {
              test_sheet: 'arkusz testu (art. 28 ust. 4)',
              working_notes: 'notatki robocze (art. 28 ust. 4)',
              guardian_protection: 'ochrona dobra klienta (art. 28 ust. 7)',
            }
            return (
              <div className="border-t border-[var(--border)] pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-[var(--text)]">Dostęp pacjenta</span>
                    {session.accessRestricted && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        ograniczony — {reasonLabels[session.restrictionReason] ?? session.restrictionReason}
                      </span>
                    )}
                  </div>
                  {!autoRestricted && (
                    <button
                      type="button"
                      onClick={handleToggleRestrict}
                      disabled={restricting}
                      className="text-sm text-[var(--text)] hover:text-[var(--text-h)] disabled:opacity-50 transition-colors"
                    >
                      {restricting ? '…' : session.accessRestricted ? 'Odblokuj' : 'Ogranicz (art. 28 ust. 7)'}
                    </button>
                  )}
                </div>
                {restrictError && <p className="text-red-500 text-xs mt-1">{restrictError}</p>}
              </div>
            )
          })()}

          <div className="border-t border-[var(--border)] pt-4">
            <h2 className="text-sm font-medium text-[var(--text)] mb-3">Notatki</h2>
            <p className="text-[var(--text-h)] whitespace-pre-wrap break-words leading-relaxed">
              {session.notes}
            </p>
          </div>

          <div className="border-t border-[var(--border)] pt-4 no-print">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-[var(--text)]">Transkrypcja</h2>
              {session.transcribeStatus === 'IN_PROGRESS' && (
                <span className="flex items-center gap-1.5 text-xs text-[var(--text)]">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  W toku…
                </span>
              )}
              {session.transcribeStatus === 'COMPLETED' && (
                <span className="text-xs text-[var(--accent)]">Gotowa</span>
              )}
            </div>

            {session.transcript ? (
              <p className="text-sm text-[var(--text-h)] whitespace-pre-wrap leading-relaxed bg-[var(--code-bg)] rounded-lg p-4">
                {session.transcript}
              </p>
            ) : session.transcribeStatus === 'IN_PROGRESS' ? (
              <p className="text-sm text-[var(--text)]">Transkrypcja w toku — sprawdzam automatycznie co 5 sekund…</p>
            ) : session.transcribeStatus === 'FAILED' ? (
              <div>
                <p className="text-sm text-red-500 mb-2">Transkrypcja nie powiodła się. Spróbuj ponownie.</p>
                <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--text-h)] hover:bg-[var(--code-bg)] transition-colors">
                  Prześlij ponownie
                  <input type="file" accept=".mp3,.wav,.mp4" className="hidden" onChange={handleTranscribeUpload} />
                </label>
              </div>
            ) : (
              <div>
                <label className={`inline-flex items-center gap-2 cursor-pointer px-4 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--text-h)] hover:bg-[var(--code-bg)] transition-colors ${transcribing ? 'opacity-50 pointer-events-none' : ''}`}>
                  {transcribing ? 'Wysyłam…' : 'Prześlij nagranie'}
                  <input
                    type="file"
                    accept=".mp3,.wav,.mp4"
                    className="hidden"
                    disabled={transcribing}
                    onChange={handleTranscribeUpload}
                  />
                </label>
                <p className="text-xs text-[var(--text)] mt-1.5">mp3 · wav · mp4 &nbsp;·&nbsp; maks. 7 MB &nbsp;·&nbsp; język: polski</p>
              </div>
            )}

            {transcribeError && <p className="text-red-500 text-xs mt-2">{transcribeError}</p>}
          </div>
        </div>
      </div>
    </>
  )
}
