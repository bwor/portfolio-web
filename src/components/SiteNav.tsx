interface SiteNavProps {
  /** 未加载或后端不可用时为 null，退化为中性站名 */
  name: string | null
}

export default function SiteNav({ name }: SiteNavProps) {
  return (
    <header className="nav">
      <div className="wrap">
        <a className="brand" href="#intro">
          {name ?? 'Portfolio'}
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
