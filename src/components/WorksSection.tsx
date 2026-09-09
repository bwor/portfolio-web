import type { Project } from '../types'

const pad = (n: number) => String(n).padStart(2, '0')

interface WorksSectionProps {
  projects: Project[]
  onOpen: (index: number) => void
}

export default function WorksSection({ projects, onOpen }: WorksSectionProps) {
  return (
    <section className="sec" id="works" aria-label="作品集">
      <div className="wrap">
        <div className="sec-h">
          <h2>作品</h2>
          <span className="up">Works {pad(projects.length)}</span>
        </div>
        {projects.length > 0 ? (
          <div className="grid">
            {projects.map((p, i) => (
              <figure
                className="card reveal"
                key={p.id}
                role="button"
                tabIndex={0}
                aria-label={`查看大图：${p.title}`}
                onClick={() => onOpen(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onOpen(i)
                  }
                }}
              >
                <p className="no">{pad(i + 1)}</p>
                <div className="media">
                  <img src={p.thumbnailUrl || p.imageUrl} alt={p.title} loading="lazy" />
                </div>
                <figcaption>
                  {p.title}
                  <small>{p.en}</small>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="empty">
            <p className="big">作品正在整理中</p>
            <p>敬请期待，稍后再来看看。</p>
          </div>
        )}
      </div>
    </section>
  )
}
