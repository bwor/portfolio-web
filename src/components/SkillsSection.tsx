import type { Profile } from '../types/profile'

interface SkillsSectionProps {
  /** 未加载或后端不可用时为 null，整段隐藏 */
  profile: Profile | null
}

export default function SkillsSection({ profile }: SkillsSectionProps) {
  const skills = profile?.skills ?? []
  if (skills.length === 0) return null
  return (
    <section className="sec" id="skills" aria-label="技能">
      <div className="wrap">
        <div className="sec-h">
          <h2>技能</h2>
          <span className="up">Skills {String(skills.length).padStart(2, '0')}</span>
        </div>
        <div className="cloud">
          {skills.map((s) => (
            <span className="chip" key={s}>
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
