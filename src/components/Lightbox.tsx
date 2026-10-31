import { useEffect } from 'react'

const pad = (n: number) => String(n).padStart(2, '0')

/** 大图里要展示的一张：src 用后端签名过的公网 URL，caption 显示在图下方 */
export interface LightboxItem {
  src: string
  caption: string
}

interface LightboxProps {
  items: LightboxItem[]
  index: number
  onClose: () => void
  onStep: (d: number) => void
}

export default function Lightbox({ items, index, onClose, onStep }: LightboxProps) {
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

  const item = items[index]
  // items 被清空或 index 越界（比如关闭前数据变了）时不渲染，避免白屏
  if (!item) return null

  return (
    <div className="lb" role="dialog" aria-modal="true" aria-label="图片大图">
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
        <img src={item.src} alt={item.caption} />
        <figcaption>{`${pad(index + 1)} — ${item.caption}`}</figcaption>
      </figure>
    </div>
  )
}
