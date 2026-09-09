import { useEffect } from 'react'
import type { Project } from '../types'

const pad = (n: number) => String(n).padStart(2, '0')

interface LightboxProps {
  projects: Project[]
  index: number
  onClose: () => void
  onStep: (d: number) => void
}

export default function Lightbox({ projects, index, onClose, onStep }: LightboxProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onStep(-1)
      if (e.key === 'ArrowRight') onStep(1)
    }
    document.body.classList.add('lb-open')
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('lb-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose, onStep])

  const p = projects[index]
  return (
    <div className="lb" role="dialog" aria-modal="true" aria-label="作品大图">
      <div className="scrim" onClick={onClose} />
      <button className="ar l" onClick={() => onStep(-1)} aria-label="上一张">
        ←
      </button>
      <button className="ar r" onClick={() => onStep(1)} aria-label="下一张">
        →
      </button>
      <figure>
        <button className="x" onClick={onClose} aria-label="关闭">
          ✕
        </button>
        <img src={p.imageUrl} alt={p.title} />
        <figcaption>{`${pad(index + 1)} — ${p.en}`}</figcaption>
      </figure>
    </div>
  )
}
