import { useCallback, useMemo, useState } from 'react'
import SiteNav from './components/SiteNav'
import HeroSection from './components/HeroSection'
import WorksSection from './components/WorksSection'
import ResumeSection from './components/ResumeSection'
import SkillsSection from './components/SkillsSection'
import SiteFooter from './components/SiteFooter'
import Lightbox from './components/Lightbox'
import useReveal from './hooks/useReveal'
import { useResumes } from './hooks/useResumes'
import { PROJECTS, visibleProjects } from './data/portfolio'

export default function App() {
  const projects = useMemo(() => visibleProjects(PROJECTS), [])
  const [lightbox, setLightbox] = useState<number | null>(null)
  const { resumes, loading } = useResumes()

  useReveal([resumes.length, loading])

  const step = useCallback(
    (d: number) =>
      setLightbox((i) => (i === null ? i : (i + d + projects.length) % projects.length)),
    [projects.length],
  )
  const close = useCallback(() => setLightbox(null), [])

  return (
    <>
      <SiteNav />
      <main>
        <HeroSection />
        <WorksSection projects={projects} onOpen={setLightbox} />
        <ResumeSection resumes={resumes} loading={loading} />
        <SkillsSection />
      </main>
      <SiteFooter />
      {lightbox !== null && projects.length > 0 && (
        <Lightbox projects={projects} index={lightbox} onClose={close} onStep={step} />
      )}
    </>
  )
}
