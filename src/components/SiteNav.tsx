import { Link } from 'react-router-dom'
import { Arrow } from './Arrow'

interface SiteNavProps {
  /** 未加载或后端不可用时为 null，退化为中性站名 */
  name: string | null
  email?: string | null
}

export default function SiteNav({ name, email }: SiteNavProps) {
  const mailto = email ? `mailto:${email}` : 'mailto:hello@linshu.me'
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" to={{ pathname: '/', hash: '#top' }}>
          {name ?? 'Portfolio'}
          <span className="brand-dot">.</span>
        </Link>
        <nav className="nav-links" aria-label="页面锚点">
          <Link to={{ pathname: '/', hash: '#now' }}>近况</Link>
          <Link to={{ pathname: '/', hash: '#writing' }}>文章</Link>
          <Link to={{ pathname: '/', hash: '#work' }}>项目</Link>
          <a className="nav-cta" href={mailto}>
            联系我
            <Arrow diagonal />
          </a>
        </nav>
      </div>
    </header>
  )
}
