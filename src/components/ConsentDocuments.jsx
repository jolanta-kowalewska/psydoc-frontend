import { useState, useEffect } from 'react'
import api from '../api/client'

export default function ConsentDocuments({ clientId, refreshTrigger }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expandedHash, setExpandedHash] = useState(null)

  useEffect(() => {
    fetchDocuments()
  }, [clientId, refreshTrigger])

  const fetchDocuments = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/documents', {
        params: { clientId }
      })
      setDocuments(response.data.documents || [])
    } catch (e) {
      setError(`Błąd przy pobieraniu dokumentów: ${e.message}`)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (doc) => {
    if (doc.presignedUrl) {
      window.open(doc.presignedUrl, '_blank')
    }
  }

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A'
    const date = new Date(isoString)
    return date.toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return <div className="text-sm text-[var(--text)]">Ładuję dokumenty…</div>
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>
  }

  if (!documents || documents.length === 0) {
    return <div className="text-sm text-[var(--text)]">Brak podpisanych dokumentów</div>
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div key={doc.SK} className="border border-[var(--border)] rounded-lg p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="font-medium text-[var(--text-h)]">
                {doc.documentType === 'consent_pdf' ? 'Zgody' : 'Dokument'} — {formatDate(doc.signedAt)}
              </div>
              <p className="text-sm text-[var(--text)] mt-1">
                Liczba zgód: {doc.metadata?.consentCount || doc.consentIds?.length || 0}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload(doc)}
                className="px-3 py-1 bg-[var(--accent)] text-white rounded text-xs hover:opacity-90 transition-opacity"
              >
                Pobierz
              </button>
              <button
                onClick={() => setExpandedHash(expandedHash === doc.SK ? null : doc.SK)}
                className="px-3 py-1 border border-[var(--border)] text-[var(--text-h)] rounded text-xs hover:bg-[var(--code-bg)] transition-colors"
              >
                SHA-256
              </button>
            </div>
          </div>

          {expandedHash === doc.SK && (
            <div className="mt-3 p-3 bg-[var(--code-bg)] rounded border border-[var(--border)]">
              <p className="text-xs font-mono text-[var(--text)] break-all">
                {doc.documentHash}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
