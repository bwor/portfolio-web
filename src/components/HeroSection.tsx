import type { Profile } from '../types/profile'

interface HeroSectionProps {
  /** 未加载或后端不可用时为 null，组件自行降级渲染 */
  profile: Profile | null
}

const META: { k: string; v: string }[] = [
  { k: 'Field', v: 'Front-End' },
  { k: 'Focus', v: 'Interaction' },
  { k: 'Index', v: '2026' },
]

export default function HeroSection({ profile }: HeroSectionProps) {
  return (
    <section className="hero" id="intro" aria-label="个人简介">
      <div className="wrap">
        {profile ? (
          <>
            <div>
              <h1 className="a1">{profile.name}</h1>
              <p className="title a1">{profile.title}</p>
              <p className="summary a1">{profile.summary}</p>
            </div>
            <div className="meta up">
              {META.map((m) => (
                <div key={m.k}>
                  <span className="up">{m.k}</span>
                  <span>{m.v}</span>
                </div>
              ))}
            </div>
            {profile.skills.length > 0 && (
              <p className="chips a1">
                {profile.skills.slice(0, 5).map((s) => (
                  <span className="chip" key={s}>
                    {s}
                  </span>
                ))}
              </p>
            )}
          </>
        ) : (
          <div className="empty">
            <p className="big">简介正在整理中</p>
            <p>敬请期待，稍后再来看看。</p>
          </div>
        )}
      </div>
    </section>
  )
}
