import { Link } from 'react-router-dom'
import { Arrow } from './Arrow'

interface SiteNavProps {
  /** 未加载或后端不可用时为 null，退化为中性站名 */
  name: string | null
  hasSkills?: boolean
}

export default function SiteNav({ name, hasSkills = true }: SiteNavProps) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" to={{ pathname: '/', hash: '#top' }}>
          {name ?? 'Portfolio'}
          <span className="brand-dot">.</span>
        </Link>
        <nav className="nav-links" aria-label="页面锚点">
          <Link to={{ pathname: '/', hash: '#intro' }}>简介</Link>
          <Link to={{ pathname: '/', hash: '#works' }}>作品</Link>
          {hasSkills && <Link to={{ pathname: '/', hash: '#skills' }}>技能</Link>}
          <Link className="nav-cta" to={{ pathname: '/', hash: '#contact' }}>
            聊聊
            <Arrow diagonal />
          </Link>
        </nav>
      </div>
    </header>
  )
}
