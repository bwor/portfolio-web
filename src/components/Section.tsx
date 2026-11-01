import type { ReactNode } from 'react'
import styles from './Section.module.css'

interface SectionProps {
  id?: string
  ariaLabel?: string
  children: ReactNode
}

export default function Section({ id, ariaLabel, children }: SectionProps) {
  return (
    <section id={id} aria-label={ariaLabel} className={styles.section}>
      {children}
    </section>
  )
}
