import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Lightbox, { type LightboxItem } from '../components/Lightbox'
import { useProject } from '../hooks/useProject'
import type { Project } from '../types/project'

const pad = (n: number) => String(n).padStart(2, '0')

const formatDate = (ms: number) =>
  new Date(ms).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })

interface ProjectDetailPageProps {
  /** 全站已发布项目列表，用来算上一个/下一个作品 */
  projects: Project[]
}

/**
 * 项目详情页 `/project/:id`。
 * 数据来自 GET /api/web/projects/{id}；正文字段是 Markdown，用 react-markdown + remark-gfm 渲染。
 * 本页不用滚动显形（异步加载，观察时机不可控），内容直接出现。
 */
export default function ProjectDetailPage({ projects }: ProjectDetailPageProps) {
  const { id } = useParams()
  const { project, loading, error } = useProject(Number(id))
  const [lightbox, setLightbox] = useState<number | null>(null)

  // 标题跟随项目名，离开页面时还原，避免污染首页的静态 title
  useEffect(() => {
    if (!project) return
    const prev = document.title
    document.title = `${project.name} · 作品`
    return () => {
      document.title = prev
    }
  }, [project])

  // 图集：详情页 Lightbox 的数据源（没图就是空数组）
  const gallery: LightboxItem[] =
    project?.images.map((src, i) => ({
      src,
      caption: `${project.name} · 图 ${pad(i + 1)}`,
    })) ?? []
  const close = useCallback(() => setLightbox(null), [])
  const step = useCallback(
    (d: number) =>
      setLightbox((i) => (i === null ? i : (i + d + gallery.length) % gallery.length)),
    [gallery.length],
  )

  const back = (
    <p className="up back">
      <Link to={{ pathname: '/', hash: '#work' }}>← 作品</Link>
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

  if (error || !project) {
    const big = error === 'notfound' ? '没有找到这个项目' : '作品暂时加载不出来'
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

  // 上一个/下一个：只在列表里能定位到本项目时才给导航
  const index = projects.findIndex((p) => p.id === project.id)
  const prev = index > 0 ? projects[index - 1] : null
  const next = index >= 0 && index < projects.length - 1 ? projects[index + 1] : null

  return (
    <section className="detail">
      <div className="wrap">
        {back}
        <div className="detail-h">
          <div>
            {index >= 0 && <p className="no">{pad(index + 1)}</p>}
            <h1>{project.name}</h1>
            {project.description && <p className="summary">{project.description}</p>}
            <div className="meta">
              <div>
                <span>发布时间</span>
                <span>{formatDate(project.created_at)}</span>
              </div>
              {project.url && (
                <div>
                  <span>在线访问</span>
                  <span>
                    <a href={project.url} target="_blank" rel="noreferrer">
                      打开 ↗
                    </a>
                  </span>
                </div>
              )}
            </div>
            {project.tech_stack.length > 0 && (
              <ul className="tags">
                {project.tech_stack.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
          </div>
          {project.thumb && (
            <div className="media detail-thumb">
              <img src={project.thumb} alt={project.name} />
            </div>
          )}
        </div>

        {gallery.length > 0 && (
          <>
            <div className="section-head gallery-head">
              <div>
                <p className="kicker">Gallery</p>
                <h2>图集</h2>
              </div>
              <span className="section-meta">{pad(gallery.length)} 张</span>
            </div>
            <div className="gallery">
              {gallery.map((item, i) => (
                <button key={item.src} className="gallery-item" onClick={() => setLightbox(i)}>
                  <img src={item.src} alt={item.caption} loading="lazy" />
                </button>
              ))}
            </div>
          </>
        )}

        {project.content && (
          <article className="md">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.content}</ReactMarkdown>
          </article>
        )}

        <nav className="detail-nav" aria-label="项目翻页">
          {prev ? (
            <Link className="detail-nav-item" to={`/project/${prev.id}`}>
              <span className="up">← 上一个</span>
              <strong>{prev.name}</strong>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link className="detail-nav-item right" to={`/project/${next.id}`}>
              <span className="up">下一个 →</span>
              <strong>{next.name}</strong>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>

      {lightbox !== null && gallery.length > 0 && (
        <Lightbox items={gallery} index={lightbox} onClose={close} onStep={step} />
      )}
    </section>
  )
}
