import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from './BackLink.module.css'

interface BackLinkProps {
  to: { pathname: string; hash: string }
  children: ReactNode
}

export default function BackLink({ to, children }: BackLinkProps) {
  return (
    <p className={styles.back}>
      <Link to={to}>{children}</Link>
    </p>
  )
}
