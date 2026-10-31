import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import HeroSection from '../components/HeroSection'
import AboutSection from '../components/AboutSection'
import WorksSection from '../components/WorksSection'
import SkillsSection from '../components/SkillsSection'
import ContactSection from '../components/ContactSection'
import type { Profile } from '../types/profile'
import type { Project } from '../types/project'

interface HomePageProps {
  profile: Profile | null
  projects: Project[]
}

/** 首页：侧栏简介 / 最近 / 作品 / 技能 / 联系，并负责把 `/#works` 这类 hash 滚到对应区块。 */
export default function HomePage({ profile, projects }: HomePageProps) {
  const location = useLocation()

  useEffect(() => {
    const id = location.hash.slice(1)
    if (!id) return
    document.getElementById(id)?.scrollIntoView()
  }, [location])

  return (
    <div className="page" id="top">
      <HeroSection profile={profile} />
      <div className="content">
        <AboutSection profile={profile} projects={projects} />
        <WorksSection projects={projects} />
        <SkillsSection profile={profile} />
        <ContactSection profile={profile} />
      </div>
    </div>
  )
}
