import type { ReactNode } from 'react'
import { Arrow } from './Arrow'
import Kicker from './Kicker'
import { cx } from '../lib/cx'
import styles from './SectionHead.module.css'

interface SectionHeadProps {
  kicker: string
  title: string
  meta?: ReactNode
  link?: { label: string; href: string }
  className?: string
  metaClassName?: string
}

export default function SectionHead({
  kicker,
  title,
  meta,
  link,
  className,
  metaClassName,
}: SectionHeadProps) {
  return (
    <div className={cx(styles.sectionHead, className)}>
      <div>
        <Kicker>{kicker}</Kicker>
        <h2>{title}</h2>
      </div>
      {meta != null && <span className={cx(styles.sectionMeta, metaClassName)}>{meta}</span>}
      {link && (
        <a href={link.href} className={styles.sectionLink}>
          {link.label} <Arrow />
        </a>
      )}
    </div>
  )
}
