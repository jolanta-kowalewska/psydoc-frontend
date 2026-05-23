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

  const load = () => {
    setLoading(true)
    api.get(`/sessions/${sessionId}`)
      .then((res) => setSession(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [sessionId])

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

  const handlePrint = () => window.print()

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
              onClick={handlePrint}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
            >
              Eksportuj PDF
            </button>
          </div>
        </div>

        {signError && (
          <p className="text-red-500 text-sm mb-4 no-print">{signError}</p>
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

          <div className="border-t border-[var(--border)] pt-4">
            <h2 className="text-sm font-medium text-[var(--text)] mb-3">Notatki</h2>
            <p className="text-[var(--text-h)] whitespace-pre-wrap leading-relaxed">
              {session.notes}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
