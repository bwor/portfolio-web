import { Link } from 'react-router-dom'
import { Arrow } from './Arrow'
import styles from './SiteNav.module.css'

interface SiteNavProps {
  /** 未加载或后端不可用时为 null，退化为中性站名 */
  name: string | null
  email?: string | null
}

export default function SiteNav({ name, email }: SiteNavProps) {
  const mailto = email ? `mailto:${email}` : 'mailto:hello@linshu.me'
  return (
    <header className={styles.siteHeader}>
      <div className={styles.siteHeaderInner}>
        <Link className={styles.brand} to={{ pathname: '/', hash: '#top' }}>
          {name ?? 'Portfolio'}
          <span className={styles.brandDot}>.</span>
        </Link>
        <nav className={styles.navLinks} aria-label="页面锚点">
          <Link to={{ pathname: '/', hash: '#now' }}>近况</Link>
          <Link to={{ pathname: '/', hash: '#writing' }}>文章</Link>
          <Link to={{ pathname: '/', hash: '#work' }}>项目</Link>
          <a className={styles.navCta} href={mailto}>
            联系我
            <Arrow diagonal />
          </a>
        </nav>
      </div>
    </header>
  )
}
