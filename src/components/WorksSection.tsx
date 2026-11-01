import { Link } from 'react-router-dom'
import { Arrow } from './Arrow'
import type { Project } from '../types/project'

const pad = (n: number) => String(n).padStart(2, '0')

type VisualKind = 'dashboard' | 'components' | 'bundle'

const VISUALS: VisualKind[] = ['dashboard', 'components', 'bundle']

function ProjectVisual({ kind }: { kind: VisualKind }) {
  if (kind === 'dashboard') {
    return (
      <div className="pv-dashboard" aria-hidden="true">
        <div className="pv-dots">
          <i />
          <i />
          <i />
        </div>
        <div className="pv-dash-body">
          <div className="pv-dash-side">
            <i />
            <i />
            <i />
          </div>
          <div>
            <div className="pv-blocks">
              <i />
              <i />
              <i />
            </div>
            <svg viewBox="0 0 100 34" preserveAspectRatio="none">
              <path
                d="M0 28C15 25 17 8 31 15S51 29 61 18 76 5 100 9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      </div>
    )
  }

  if (kind === 'components') {
    return (
      <div className="pv-components" aria-hidden="true">
        <div className="pv-card pv-card-a">
          <i />
          <i />
        </div>
        <div className="pv-card pv-card-b">
          <i className="pv-avatar" />
          <div>
            <i />
            <i />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pv-bundle" aria-hidden="true">
      {[38, 62, 47, 78, 55, 88, 68].map((height, index) => (
        <i
          key={height}
          className={index === 5 ? 'on' : undefined}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  )
}

export default function WorksSection({ projects }: { projects: Project[] }) {
  return (
    <section className="section" id="work" aria-label="作品集">
      <div className="section-head">
        <div>
          <p className="kicker">Selected Work</p>
          <h2>近期项目</h2>
        </div>
        <span className="section-meta">Works {pad(projects.length)}</span>
      </div>
      {projects.length > 0 ? (
        <div className="works-grid">
          {projects.map((p, i) => (
            <Link
              className="project-tile reveal"
              key={p.id}
              to={`/project/${p.id}`}
              aria-label={`查看项目详情：${p.name}`}
            >
              <div className={`project-media tone-${i % 3}`}>
                {p.thumb ? (
                  <img src={p.thumb} alt={p.name} loading="lazy" />
                ) : (
                  <ProjectVisual kind={VISUALS[i % VISUALS.length]} />
                )}
              </div>
              <div className="project-info">
                <div className="project-top">
                  <div>
                    <p className="project-no">
                      {pad(i + 1)} · {p.type ?? '项目'}
                    </p>
                    <h3 className="project-title">{p.name}</h3>
                  </div>
                  <span className="project-arrow">
                    <Arrow diagonal />
                  </span>
                </div>
                {p.description && <p className="project-desc">{p.description}</p>}
                {p.tech_stack.length > 0 && (
                  <ul className="tags">
                    {p.tech_stack.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty">
          <p className="big">作品正在整理中</p>
          <p>敬请期待，稍后再来看看。</p>
        </div>
      )}
    </section>
  )
}
