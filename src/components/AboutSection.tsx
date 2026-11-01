import { Link } from 'react-router-dom'
import Section from './Section'
import SectionHead from './SectionHead'
import styles from './AboutSection.module.css'
import type { Profile } from '../types/profile'
import type { Project } from '../types/project'

interface AboutSectionProps {
  profile: Profile | null
  projects: Project[]
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * 「近况」区块（Figma: Now）。
 * 引语正文 / 研究方向 / 最近更新标题来自 Profile（管理端维护）；未填写时不渲染假文案。
 * 区块右上角的「更新」月份取自有数据（最新项目）的创建时间。
 */
export default function AboutSection({ profile, projects }: AboutSectionProps) {
  const latest = projects[0] ?? null
  const updated = latest ? new Date(latest.created_at) : null

  return (
    <Section id="now" ariaLabel="最近">
      <SectionHead
        kicker="Now"
        title="最近"
        meta={updated ? `${updated.getFullYear()} / ${pad(updated.getMonth() + 1)} 更新` : '整理中'}
      />
      <div className={styles.nowQuote}>
        {profile?.now_text && <p>{profile.now_text}</p>}
        <div className={styles.nowMeta}>
          <div>
            <span>项目</span>
            {latest ? (
              <Link to={`/project/${latest.id}`}>{latest.name}</Link>
            ) : (
              <strong>暂无</strong>
            )}
          </div>
          <div>
            <span>研究</span>
            {profile?.research_focus ? (
              <strong>{profile.research_focus}</strong>
            ) : (
              <strong>—</strong>
            )}
          </div>
          <div>
            <span>更新</span>
            {profile?.latest_update_title ? (
              <Link to={{ pathname: '/', hash: '#writing' }}>
                {profile.latest_update_title}
              </Link>
            ) : (
              <strong>—</strong>
            )}
          </div>
        </div>
      </div>
    </Section>
  )
}
