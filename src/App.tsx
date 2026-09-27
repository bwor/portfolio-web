import { useCallback, useState } from 'react'
import SiteNav from './components/SiteNav'
import HeroSection from './components/HeroSection'
import WorksSection from './components/WorksSection'
import SkillsSection from './components/SkillsSection'
import SiteFooter from './components/SiteFooter'
import Lightbox from './components/Lightbox'
import useReveal from './hooks/useReveal'
import { useProfile } from './hooks/useProfile'
import { useProjects } from './hooks/useProjects'

export default function App() {
  const { profile } = useProfile()
  const { projects } = useProjects()
  const [lightbox, setLightbox] = useState<number | null>(null)

  useReveal([projects.length])

  const step = useCallback(
    (d: number) =>
      setLightbox((i) => (i === null ? i : (i + d + projects.length) % projects.length)),
    [projects.length],
  )
  const close = useCallback(() => setLightbox(null), [])

  return (
    <>
      <SiteNav name={profile?.name ?? null} />
      <main>
        <HeroSection profile={profile} />
        <WorksSection projects={projects} onOpen={setLightbox} />
        <SkillsSection profile={profile} />
      </main>
      <SiteFooter name={profile?.name ?? null} />
      {lightbox !== null && projects.length > 0 && (
        <Lightbox projects={projects} index={lightbox} onClose={close} onStep={step} />
      )}
    </>
  )
}