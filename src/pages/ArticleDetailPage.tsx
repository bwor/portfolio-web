import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Arrow } from '../components/Arrow'
import BackLink from '../components/BackLink'
import EmptyState from '../components/EmptyState'
import Kicker from '../components/Kicker'
import { cx } from '../lib/cx'
import { useArticle } from '../hooks/useArticle'
import detailStyles from './detail.module.css'
import markdownStyles from './detail-markdown.module.css'
import styles from './ArticleDetailPage.module.css'
import type { Article } from '../types/article'
import type { Profile } from '../types/profile'

interface ArticleDetailPageProps {
  profile: Profile | null
  articles: Article[]
}

interface Heading {
  id: string
  text: string
  level: 2 | 3
}

const pad = (n: number) => String(n).padStart(2, '0')

const formatDate = (ms: number) => {
  const date = new Date(ms)
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'section'

/**
 * 文章详情页 `/article/:id`。
 * 数据来自 GET /api/web/articles/{id}；正文是 Markdown，用 react-markdown + remark-gfm 渲染。
 * 目录从正文的二级/三级标题生成，滚动时同步阅读进度与当前章节。
 */
export default function ArticleDetailPage({ profile, articles }: ArticleDetailPageProps) {
  const { id } = useParams()
  const { article, loading, error } = useArticle(Number(id))
  const [progress, setProgress] = useState(0)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [shareLabel, setShareLabel] = useState('分享文章')
  const [headings, setHeadings] = useState<Heading[]>([])
  const proseRef = useRef<HTMLDivElement>(null)
  const shareTimer = useRef<number | undefined>(undefined)

  const toc = useMemo(
    () => (headings.some((heading) => heading.level === 2)
      ? headings.filter((heading) => heading.level === 2)
      : headings),
    [headings],
  )

  const neighbors = useMemo(() => {
    if (!article) return { prev: null, next: null }
    const sorted = [...articles].sort((a, b) => b.created_at - a.created_at)
    const index = sorted.findIndex((item) => item.id === article.id)
    if (index >= 0) {
      return {
        prev: sorted[index - 1] ?? null,
        next: sorted[index + 1] ?? null,
      }
    }
    return {
      prev: sorted.find((item) => item.created_at > article.created_at) ?? null,
      next: sorted.find((item) => item.created_at < article.created_at) ?? null,
    }
  }, [article, articles])

  useEffect(() => {
    if (!article) return

    const prevTitle = document.title
    document.title = `${article.title} · 文章`
    return () => {
      document.title = prevTitle
    }
  }, [article])

  useEffect(() => {
    const root = proseRef.current
    if (!article || !root) return

    const frame = window.requestAnimationFrame(() => {
      const used = new Map<string, number>()
      const found: Heading[] = []

      root.querySelectorAll<HTMLHeadingElement>('h2, h3').forEach((node) => {
        const text = node.textContent?.trim()
        if (!text) return

        const base = slugify(text)
        const count = used.get(base) ?? 0
        used.set(base, count + 1)
        const headingId = count === 0 ? base : `${base}-${count + 1}`

        node.id = headingId
        found.push({ id: headingId, text, level: node.tagName === 'H2' ? 2 : 3 })
      })

      setHeadings(found)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [article])

  useEffect(() => {
    if (!article) return

    let frame = 0
    const update = () => {
      frame = 0
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      setProgress(scrollable > 0 ? Math.min((window.scrollY / scrollable) * 100, 100) : 0)

      let current = toc[0]?.id ?? null
      for (const heading of toc) {
        const element = document.getElementById(heading.id)
        if (element && element.getBoundingClientRect().top <= 180) current = heading.id
      }
      setActiveId(current)
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    frame = window.requestAnimationFrame(update)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [article, toc])

  useEffect(
    () => () => {
      window.clearTimeout(shareTimer.current)
    },
    [],
  )

  const share = async () => {
    if (!article) return
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: article.title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setShareLabel('链接已复制')
      window.clearTimeout(shareTimer.current)
      shareTimer.current = window.setTimeout(() => setShareLabel('分享文章'), 1800)
    } catch {
      setShareLabel('分享文章')
    }
  }

  const back = <BackLink to={{ pathname: '/', hash: '#writing' }}>← 文章</BackLink>

  if (loading) {
    return (
      <section className={detailStyles.detail}>
        <div className={detailStyles.wrap}>
          {back}
          <EmptyState title="加载中…" />
        </div>
      </section>
    )
  }

  if (error || !article) {
    const big = error === 'notfound' ? '没有找到这篇文章' : '文章暂时加载不出来'
    const detail =
      error === 'notfound' ? '它可能已下架，或链接有误。' : '请稍后再来看看，或从上面的导航回首页。'
    return (
      <section className={detailStyles.detail}>
        <div className={detailStyles.wrap}>
          {back}
          <EmptyState title={big} detail={detail} />
        </div>
      </section>
    )
  }

  const authorName = profile?.name ?? null
  const authorInitial = authorName?.trim().slice(0, 1) ?? '文'
  const hasNext = Boolean(neighbors.prev || neighbors.next)

  return (
    <section className={styles.page}>
      <div className={styles.progress} aria-hidden="true">
        <span className={styles.progressBar} style={{ width: `${progress}%` }} />
      </div>

      <div className={detailStyles.wrap}>
        {back}

        <header className={styles.hero}>
          {article.category && (
            <div className={styles.tags}>
              <span className={styles.tag}>{article.category}</span>
            </div>
          )}
          <h1 className={styles.title}>{article.title}</h1>
          {article.excerpt && <p className={styles.excerpt}>{article.excerpt}</p>}
          <div className={styles.meta}>
            {authorName && <span className={styles.author}>{authorName}</span>}
            <span>{formatDate(article.created_at)}</span>
            {article.read_time && <span>{article.read_time}</span>}
            <button type="button" className={styles.share} onClick={share}>
              {shareLabel}
              <Arrow diagonal />
            </button>
          </div>
        </header>

        <div className={cx(styles.layout, toc.length === 0 && styles.layoutSolo)}>
          <article className={styles.articleColumn}>
            <div className={cx(markdownStyles.md, styles.prose)} ref={proseRef}>
              {article.content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
              ) : (
                <p className={styles.emptyText}>正文还在整理中。</p>
              )}
            </div>

            <div className={styles.shareBlock}>
              <p>如果这篇文章对你有帮助，可以分享给需要的朋友。</p>
              <button type="button" className={styles.shareButton} onClick={share}>
                {shareLabel}
                <Arrow diagonal />
              </button>
            </div>

            {profile && (
              <section className={styles.authorCard}>
                <div className={styles.avatar} aria-hidden="true">
                  {authorInitial}
                </div>
                <div className={styles.authorBody}>
                  <p className={styles.authorKicker}>About the author</p>
                  <h2 className={styles.authorName}>{profile.name}</h2>
                  {profile.summary && <p className={styles.authorBio}>{profile.summary}</p>}
                  <div className={styles.authorLinks}>
                    {profile.github_url && (
                      <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                        GitHub
                      </a>
                    )}
                    {profile.email && <a href={`mailto:${profile.email}`}>Email</a>}
                  </div>
                </div>
              </section>
            )}

            {authorName && (
              <p className={styles.license}>
                本文采用 CC BY-NC-SA 4.0 协议。转载请注明作者与原文链接，非商业使用须以相同协议共享。
              </p>
            )}

            {hasNext && (
              <section className={styles.next}>
                <div className={styles.nextHead}>
                  <Kicker>Read next</Kicker>
                </div>
                <div className={styles.nextGrid}>
                  {neighbors.prev && (
                    <Link
                      className={cx(styles.nextCard, styles.nextPrev)}
                      to={`/article/${neighbors.prev.id}`}
                    >
                      <small>上一篇</small>
                      <strong>
                        {neighbors.prev.title}
                        <Arrow />
                      </strong>
                    </Link>
                  )}
                  {neighbors.next && (
                    <Link className={styles.nextCard} to={`/article/${neighbors.next.id}`}>
                      <small>下一篇</small>
                      <strong>
                        {neighbors.next.title}
                        <Arrow />
                      </strong>
                    </Link>
                  )}
                </div>
              </section>
            )}

            <section className={styles.discussion}>
              <div className={styles.discussionHead}>
                <div>
                  <Kicker>Discussion</Kicker>
                  <h2 className={styles.discussionTitle}>评论</h2>
                </div>
                <span className={styles.discussionSource}>基于 GitHub Discussions</span>
              </div>
              <div className={styles.discussionCard}>
                <p className={styles.discussionCardTitle}>参与这篇文章的讨论</p>
                <p className={styles.discussionCardDesc}>
                  使用 GitHub 账号登录后发表评论，讨论内容将公开展示。
                </p>
                <a
                  href={profile?.github_url ?? '#'}
                  target={profile?.github_url ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className={styles.discussionButton}
                >
                  使用 GitHub 参与讨论
                  <Arrow diagonal />
                </a>
              </div>
            </section>
          </article>

          {toc.length > 0 && (
            <aside className={styles.aside}>
              <div className={styles.toc}>
                <p className={styles.tocTitle}>本文目录</p>
                <nav className={styles.tocNav}>
                  {toc.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      className={cx(
                        styles.tocLink,
                        heading.level === 3 && styles.tocSub,
                        activeId === heading.id && styles.tocActive,
                      )}
                    >
                      {heading.text}
                    </a>
                  ))}
                </nav>
                <button type="button" className={styles.tocShare} onClick={share}>
                  {shareLabel}
                  <Arrow diagonal />
                </button>
              </div>
            </aside>
          )}
        </div>
      </div>

      <button
        type="button"
        className={cx(styles.toTop, progress > 12 && styles.toTopVisible)}
        aria-label="返回顶部"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <Arrow />
      </button>
    </section>
  )
}
