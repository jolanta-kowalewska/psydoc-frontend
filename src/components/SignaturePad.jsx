import { useRef, useEffect, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'

export default function SignaturePad({ onSign, onClear, onError, disabled = false }) {
  const signatureRef = useRef(null)
  const [hasDrawing, setHasDrawing] = useState(false)

  useEffect(() => {
    // Defer resize until after browser layout is complete
    const raf = requestAnimationFrame(() => {
      const canvas = signatureRef.current?.getCanvas()
      if (canvas && canvas.offsetWidth > 0 && canvas.offsetHeight > 0) {
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
      }
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  const handleSign = () => {
    if (!signatureRef.current || !hasDrawing) return
    try {
      // Use full canvas to avoid 0×0 trimmed canvas when buffer wasn't set correctly
      const srcCanvas = signatureRef.current.getCanvas()
      const w = srcCanvas.width || srcCanvas.offsetWidth || 400
      const h = srcCanvas.height || srcCanvas.offsetHeight || 200
      const whiteCanvas = document.createElement('canvas')
      whiteCanvas.width = w
      whiteCanvas.height = h
      const ctx = whiteCanvas.getContext('2d')
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(srcCanvas, 0, 0)
      onSign(whiteCanvas.toDataURL('image/png'))
    } catch (e) {
      console.error('Signature capture failed:', e)
      if (onError) onError(`Błąd odczytu podpisu: ${e.message}`)
    }
  }

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear()
      setHasDrawing(false)
      onClear()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="border-2 border-dashed border-[var(--border)] rounded-lg bg-[var(--code-bg)] overflow-hidden">
        <SignatureCanvas
          ref={signatureRef}
          clearOnResize={false}
          penColor="#000"
          minWidth={1}
          maxWidth={2}
          onBegin={() => setHasDrawing(true)}
          canvasProps={{
            className: 'w-full touch-none',
            style: { display: 'block', height: '300px' },
          }}
        />
      </div>

      <p className="text-xs text-[var(--text)] text-center">
        Podpisz się na ekranie tabletu lub myszką
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          className="flex-1 px-4 py-2 border border-[var(--border)] text-[var(--text-h)] rounded-lg text-sm hover:bg-[var(--code-bg)] disabled:opacity-50 transition-colors"
        >
          Wyczyść
        </button>
        <button
          type="button"
          onClick={handleSign}
          disabled={disabled || !hasDrawing}
          className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          Podpisz
        </button>
      </div>
    </div>
  )
}
