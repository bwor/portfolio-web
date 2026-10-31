import type { Profile } from '../types/profile'

interface SkillsSectionProps {
  /** 未加载或后端不可用时为 null，整段隐藏 */
  profile: Profile | null
}

const pad = (n: number) => String(n).padStart(2, '0')

export default function SkillsSection({ profile }: SkillsSectionProps) {
  const skills = profile?.skills ?? []
  if (skills.length === 0) return null

  return (
    <section className="section" id="skills" aria-label="技能">
      <div className="section-head">
        <div>
          <p className="kicker">Toolkit</p>
          <h2>技能</h2>
        </div>
        <span className="section-meta">Skills {pad(skills.length)}</span>
      </div>
      <div className="skills-grid">
        {skills.map((s, i) => (
          <div className="skill" key={s}>
            <span className="skill-no">{pad(i + 1)}</span>
            <span className="skill-name">{s}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
