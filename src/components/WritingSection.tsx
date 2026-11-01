import { Link } from 'react-router-dom'
import { Arrow } from './Arrow'
import type { Article } from '../types/article'

interface WritingSectionProps {
  /** 已发布文章（后端已按 created_at 倒序），空数组时显示占位文案 */
  articles: Article[]
}

/** Unix 毫秒 → MM.DD（与 Figma 的日期样式一致） */
function formatShort(ms: number): string {
  const d = new Date(ms)
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

/**
 * 文章列表区块（Figma「最近在写」）：数据来自 GET /api/web/articles，
 * 每项进入详情页 `/article/:id`，正文由后端 Markdown 渲染。
 */
export default function WritingSection({ articles }: WritingSectionProps) {
  return (
    <section className="section" id="writing" aria-label="文章">
      <div className="section-head">
        <div>
          <p className="kicker">Writing</p>
          <h2>最近在写</h2>
        </div>
        <a href="#" className="section-link">
          全部文章 <Arrow />
        </a>
      </div>
      {articles.length === 0 ? (
        <p className="writing-empty">暂时还没有发布文章。</p>
      ) : (
        <div className="writing-list">
          {articles.map((a) => (
            <Link to={`/article/${a.id}`} className="writing-item" key={a.id}>
              <div className="writing-meta">
                <span className="writing-date">{formatShort(a.created_at)}</span>
                {a.category && <span className="writing-cat">#{a.category}</span>}
              </div>
              <div className="writing-body">
                <h3 className="writing-title">{a.title}</h3>
                {a.excerpt && <p className="writing-excerpt">{a.excerpt}</p>}
              </div>
              <div className="writing-extra">
                {a.read_time && <span>{a.read_time}</span>}
                <span className="writing-arrow">
                  <Arrow />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
