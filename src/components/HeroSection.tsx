import { Arrow } from './Arrow'
import Kicker from './Kicker'
import styles from './HeroSection.module.css'
import type { Profile } from '../types/profile'

interface HeroSectionProps {
  /** 未加载或后端不可用时为 null，组件自行降级渲染 */
  profile: Profile | null
}

export default function HeroSection({ profile }: HeroSectionProps) {
  const skills = profile?.skills ?? []
  const primary = skills.slice(0, 2).join(' / ') || '—'
  const focus = skills.length > 2 ? skills.slice(2, 4).join(' / ') : '—'
  const initial = profile?.name?.trim().charAt(0) || '·'

  return (
    <aside className={styles.sidebar} id="intro" aria-label="个人简介">
      <div className={styles.sidebarHead}>
        <div className={styles.avatar} aria-hidden="true">
          <span>{initial}</span>
          <i className={styles.avatarDot} />
        </div>
        <div>
          <Kicker>{profile?.title ?? 'Portfolio'}</Kicker>
          <h1 className={styles.sidebarName}>{profile?.name ?? 'Portfolio'}</h1>
        </div>
      </div>
      <p className={styles.sidebarBio}>{profile?.summary ?? '简介正在整理中，稍后再来看看。'}</p>
      <dl className={styles.sidebarMeta}>
        <div>
          <dt>主要技术</dt>
          <dd>{primary}</dd>
        </div>
        <div>
          <dt>关注方向</dt>
          <dd>{focus}</dd>
        </div>
        <div>
          <dt>当前状态</dt>
          <dd className={styles.status}>
            <i />
            开放交流
          </dd>
        </div>
      </dl>
      <div className={styles.sidebarSocial}>
        {profile?.github_url && (
          <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
            GitHub <Arrow diagonal />
          </a>
        )}
        {profile?.email && (
          <a href={`mailto:${profile.email}`} className={styles.socialLink}>
            Email <Arrow diagonal />
          </a>
        )}
      </div>
    </aside>
  )
}
