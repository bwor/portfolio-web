import { PROFILE } from '../data/portfolio'

export default function SiteNav() {
  return (
    <header className="nav">
      <div className="wrap">
        <a className="brand" href="#intro">
          LI MING — {PROFILE.name}
        </a>
        <nav className="links" aria-label="页面锚点">
          <a href="#intro">简介</a>
          <a href="#works">作品</a>
          <a href="#skills">技能</a>
        </nav>
      </div>
    </header>
  )
}
