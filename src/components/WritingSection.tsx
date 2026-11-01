import { Link } from 'react-router-dom'
import { Arrow } from './Arrow'
import Section from './Section'
import SectionHead from './SectionHead'
import styles from './WritingSection.module.css'
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
    <Section id="writing" ariaLabel="文章">
      <SectionHead
        kicker="Writing"
        title="最近在写"
        link={{ label: '全部文章', href: '#' }}
      />
      {articles.length === 0 ? (
        <p className={styles.writingEmpty}>暂时还没有发布文章。</p>
      ) : (
        <div className={styles.writingList}>
          {articles.map((a) => (
            <Link to={`/article/${a.id}`} className={styles.writingItem} key={a.id}>
              <div className={styles.writingMeta}>
                <span className={styles.writingDate}>{formatShort(a.created_at)}</span>
                {a.category && <span className={styles.writingCat}>#{a.category}</span>}
              </div>
              <div>
                <h3 className={styles.writingTitle}>{a.title}</h3>
                {a.excerpt && <p className={styles.writingExcerpt}>{a.excerpt}</p>}
              </div>
              <div className={styles.writingExtra}>
                {a.read_time && <span>{a.read_time}</span>}
                <span className={styles.writingArrow}>
                  <Arrow />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Section>
  )
}
