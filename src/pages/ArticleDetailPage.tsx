import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useArticle } from '../hooks/useArticle'

const formatDate = (ms: number) =>
  new Date(ms).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })

/**
 * 文章详情页 `/article/:id`。
 * 数据来自 GET /api/web/articles/{id}；正文是 Markdown，用 react-markdown + remark-gfm 渲染。
 * 与项目详情页一致，不做滚动显形（异步加载，观察时机不可控）。
 */
export default function ArticleDetailPage() {
  const { id } = useParams()
  const { article, loading, error } = useArticle(Number(id))

  // 标题跟随文章，离开页面时还原，避免污染首页的静态 title
  useEffect(() => {
    if (!article) return
    const prev = document.title
    document.title = `${article.title} · 文章`
    return () => {
      document.title = prev
    }
  }, [article])

  const back = (
    <p className="up back">
      <Link to={{ pathname: '/', hash: '#writing' }}>← 文章</Link>
    </p>
  )

  if (loading) {
    return (
      <section className="detail">
        <div className="wrap">
          {back}
          <div className="empty">
            <p className="big">加载中…</p>
          </div>
        </div>
      </section>
    )
  }

  if (error || !article) {
    const big = error === 'notfound' ? '没有找到这篇文章' : '文章暂时加载不出来'
    const detail =
      error === 'notfound' ? '它可能已下架，或链接有误。' : '请稍后再来看看，或从上面的导航回首页。'
    return (
      <section className="detail">
        <div className="wrap">
          {back}
          <div className="empty">
            <p className="big">{big}</p>
            <p>{detail}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="detail">
      <div className="wrap">
        {back}
        <div className="detail-h article-h">
          <div>
            <p className="no">{formatDate(article.created_at)}</p>
            <h1>{article.title}</h1>
            {article.excerpt && <p className="summary">{article.excerpt}</p>}
            {(article.category || article.read_time) && (
              <div className="meta">
                {article.category && (
                  <div>
                    <span>分类</span>
                    <span>{article.category}</span>
                  </div>
                )}
                {article.read_time && (
                  <div>
                    <span>阅读时长</span>
                    <span>{article.read_time}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {article.content && (
          <article className="md">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
          </article>
        )}
      </div>
    </section>
  )
}
