import { useRef, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'

export default function SignaturePad({ onSign, onClear, disabled = false }) {
  const signatureRef = useRef(null)

  const handleSign = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const trimmedCanvas = signatureRef.current.getTrimmedCanvas()
      const whiteCanvas = document.createElement('canvas')
      whiteCanvas.width = trimmedCanvas.width
      whiteCanvas.height = trimmedCanvas.height
      const ctx = whiteCanvas.getContext('2d')
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, whiteCanvas.width, whiteCanvas.height)
      ctx.drawImage(trimmedCanvas, 0, 0)
      const signatureImage = whiteCanvas.toDataURL('image/png')
      onSign(signatureImage)
    }
  }

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear()
      onClear()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="border-2 border-dashed border-[var(--border)] rounded-lg bg-[var(--code-bg)] overflow-hidden">
        <SignatureCanvas
          ref={signatureRef}
          canvasProps={{
            className: 'w-full touch-none',
            style: { display: 'block', height: '300px' }
          }}
          strokeWidth={2}
          strokeColor="#000"
          dotSize={0}
          minWidth={1}
          maxWidth={2}
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
          disabled={disabled}
          className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          Podpisz
        </button>
      </div>
    </div>
  )
}
