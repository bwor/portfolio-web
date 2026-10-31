import { Link } from 'react-router-dom'
import type { Profile } from '../types/profile'
import type { Project } from '../types/project'

interface AboutSectionProps {
  profile: Profile | null
  projects: Project[]
}

const pad = (n: number) => String(n).padStart(2, '0')

export default function AboutSection({ profile, projects }: AboutSectionProps) {
  const latest = projects[0] ?? null
  const skills = profile?.skills ?? []
  const updated = latest ? new Date(latest.created_at) : null

  return (
    <section className="section" id="now" aria-label="最近">
      <div className="section-head">
        <div>
          <p className="kicker">Now</p>
          <h2>最近</h2>
        </div>
        <span className="section-meta">
          {updated ? `${updated.getFullYear()} / ${pad(updated.getMonth() + 1)} 更新` : '整理中'}
        </span>
      </div>
      <div className="now-quote">
        <p>
          {latest
            ? latest.description?.trim() || latest.name
            : '作品正在整理中，新的项目即将上线。'}
        </p>
        <div className="now-meta">
          <div>
            <span>项目</span>
            {latest ? (
              <Link to={`/project/${latest.id}`}>{latest.name}</Link>
            ) : (
              <strong>暂无</strong>
            )}
          </div>
          <div>
            <span>作品</span>
            <Link to={{ pathname: '/', hash: '#works' }}>{projects.length} 项</Link>
          </div>
          {skills.length > 0 && (
            <div>
              <span>技能</span>
              <Link to={{ pathname: '/', hash: '#skills' }}>{skills.length} 项</Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
