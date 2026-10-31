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
    <aside className="sidebar" id="intro" aria-label="个人简介">
      <div className="sidebar-head">
        <div className="avatar" aria-hidden="true">
          <span>{initial}</span>
          <i className="avatar-dot" />
        </div>
        <div>
          <p className="kicker">{profile?.title ?? 'Portfolio'}</p>
          <h1 className="sidebar-name">{profile?.name ?? 'Portfolio'}</h1>
        </div>
      </div>
      <p className="sidebar-bio">{profile?.summary ?? '简介正在整理中，稍后再来看看。'}</p>
      <dl className="sidebar-meta">
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
          <dd className="status">
            <i />
            开放交流
          </dd>
        </div>
      </dl>
    </aside>
  )
}
