import { Link } from 'react-router-dom'
import { Arrow } from './Arrow'
import EmptyState from './EmptyState'
import Section from './Section'
import SectionHead from './SectionHead'
import { cx } from '../lib/cx'
import styles from './WorksSection.module.css'
import type { Project } from '../types/project'

const pad = (n: number) => String(n).padStart(2, '0')

type VisualKind = 'dashboard' | 'components' | 'bundle'

const VISUALS: VisualKind[] = ['dashboard', 'components', 'bundle']

const TONES = [styles.tone0, styles.tone1, styles.tone2]

function ProjectVisual({ kind }: { kind: VisualKind }) {
  if (kind === 'dashboard') {
    return (
      <div className={styles.pvDashboard} aria-hidden="true">
        <div className={styles.pvDots}>
          <i />
          <i />
          <i />
        </div>
        <div className={styles.pvDashBody}>
          <div className={styles.pvDashSide}>
            <i />
            <i />
            <i />
          </div>
          <div>
            <div className={styles.pvBlocks}>
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
      <div className={styles.pvComponents} aria-hidden="true">
        <div className={cx(styles.pvCard, styles.pvCardA)}>
          <i />
          <i />
        </div>
        <div className={cx(styles.pvCard, styles.pvCardB)}>
          <i className={styles.pvAvatar} />
          <div>
            <i />
            <i />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pvBundle} aria-hidden="true">
      {[38, 62, 47, 78, 55, 88, 68].map((height, index) => (
        <i
          key={height}
          className={index === 5 ? styles.on : undefined}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  )
}

export default function WorksSection({ projects }: { projects: Project[] }) {
  return (
    <Section id="work" ariaLabel="作品集">
      <SectionHead kicker="Selected Work" title="近期项目" meta={`Works ${pad(projects.length)}`} />
      {projects.length > 0 ? (
        <div className={styles.worksGrid}>
          {projects.map((p, i) => (
            <Link
              className={cx(styles.projectTile, 'reveal')}
              key={p.id}
              to={`/project/${p.id}`}
              aria-label={`查看项目详情：${p.name}`}
            >
              <div className={cx(styles.projectMedia, TONES[i % TONES.length])}>
                {p.thumb ? (
                  <img src={p.thumb} alt={p.name} loading="lazy" />
                ) : (
                  <ProjectVisual kind={VISUALS[i % VISUALS.length]} />
                )}
              </div>
              <div className={styles.projectInfo}>
                <div className={styles.projectTop}>
                  <div>
                    <p className={styles.projectNo}>
                      {pad(i + 1)} · {p.type ?? '项目'}
                    </p>
                    <h3 className={styles.projectTitle}>{p.name}</h3>
                  </div>
                  <span className={styles.projectArrow}>
                    <Arrow diagonal />
                  </span>
                </div>
                {p.description && <p className={styles.projectDesc}>{p.description}</p>}
                {p.tech_stack.length > 0 && (
                  <ul className={styles.tags}>
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
        <EmptyState title="作品正在整理中" detail="敬请期待，稍后再来看看。" />
      )}
    </Section>
  )
}
