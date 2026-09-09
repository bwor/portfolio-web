import { PROFILE } from '../data/portfolio'

export default function SkillsSection() {
  if (PROFILE.skills.length === 0) return null
  return (
    <section className="sec" id="skills" aria-label="技能">
      <div className="wrap">
        <div className="sec-h">
          <h2>技能</h2>
          <span className="up">Skills {String(PROFILE.skills.length).padStart(2, '0')}</span>
        </div>
        <div className="cloud">
          {PROFILE.skills.map((s) => (
            <span className="chip" key={s}>
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
