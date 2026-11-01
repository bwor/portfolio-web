import Section from './Section'
import SectionHead from './SectionHead'
import styles from './SkillsSection.module.css'
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
    <Section id="skills" ariaLabel="技能">
      <SectionHead kicker="Toolkit" title="技能" meta={`Skills ${pad(skills.length)}`} />
      <div className={styles.skillsGrid}>
        {skills.map((s, i) => (
          <div className={styles.skill} key={s}>
            <span className={styles.skillNo}>{pad(i + 1)}</span>
            <span className={styles.skillName}>{s}</span>
          </div>
        ))}
      </div>
    </Section>
  )
}
