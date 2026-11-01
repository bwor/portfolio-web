import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import HeroSection from '../components/HeroSection'
import AboutSection from '../components/AboutSection'
import WritingSection from '../components/WritingSection'
import WorksSection from '../components/WorksSection'
import ContactSection from '../components/ContactSection'
import styles from './HomePage.module.css'
import type { Profile } from '../types/profile'
import type { Project } from '../types/project'
import type { Article } from '../types/article'

interface HomePageProps {
  profile: Profile | null
  projects: Project[]
  articles: Article[]
}

/** 首页：侧栏简介 / 最近 / 文章 / 项目 / 联系，并负责把 `/#work` 这类 hash 滚到对应区块。 */
export default function HomePage({ profile, projects, articles }: HomePageProps) {
  const location = useLocation()

  useEffect(() => {
    const id = location.hash.slice(1)
    if (!id) return
    document.getElementById(id)?.scrollIntoView()
  }, [location])

  return (
    <div className={styles.page} id="top">
      <HeroSection profile={profile} />
      <div className={styles.content}>
        <AboutSection profile={profile} projects={projects} />
        <WritingSection articles={articles} />
        <WorksSection projects={projects} />
        <ContactSection profile={profile} />
      </div>
    </div>
  )
}
