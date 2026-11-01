import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Arrow } from '../components/Arrow'
import BackLink from '../components/BackLink'
import EmptyState from '../components/EmptyState'
import Kicker from '../components/Kicker'
import Lightbox, { type LightboxItem } from '../components/Lightbox'
import SectionHead from '../components/SectionHead'
import { cx } from '../lib/cx'
import { useProject } from '../hooks/useProject'
import detailStyles from './detail.module.css'
import markdownStyles from './detail-markdown.module.css'
import styles from './ProjectDetailPage.module.css'
import type { Article } from '../types/article'
import type { Project } from '../types/project'

const pad = (n: number) => String(n).padStart(2, '0')

const formatDate = (ms: number) =>
  new Date(ms).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })

const SECTIONS = [
  ['背景', '#pd-background'],
  ['核心功能', '#pd-features'],
  ['迭代历程', '#pd-timeline'],
  ['技术架构', '#pd-architecture'],
  ['问题与成果', '#pd-results'],
  ['复盘规划', '#pd-roadmap'],
] as const

const FEATURES = [
  ['01', 'Markdown 写作', '支持代码高亮、数学公式与图表，让注意力回到内容本身。'],
  ['02', '一键部署', '克隆仓库并完成配置后，10 分钟即可上线。'],
  ['03', '全文搜索', '毫秒级本地索引搜索，不依赖额外服务。'],
  ['04', '评论系统', '内置社区评论，保留互动且无需额外运维。'],
  ['05', 'SEO 优化', '自动生成 sitemap、RSS 与结构化数据，默认提供良好的索引基础。'],
  ['06', '深色模式', '跟随系统主题自动切换，并在 hydration 前消除页面闪烁。'],
] as const

const TIMELINE = [
  ['v0.1', '2024.03', '搭建基础框架，完成文章列表与详情页', '新功能'],
  ['v0.3', '2024.05', '接入 Markdown 渲染与代码高亮', '新功能'],
  ['v0.6', '2024.07', '上线全文搜索，重构数据层', '重构'],
  ['v1.0', '2024.09', '正式上线，支持评论与 RSS', '新功能'],
  ['v1.2', '2025.01', '性能优化，Lighthouse 评分达到 95+', '性能优化'],
] as const

const ARCHITECTURE = [
  ['App Router', '使用服务端渲染与流式输出，兼顾内容 SEO 和首屏性能。'],
  ['PostgreSQL + ORM', '关系型数据配合类型安全 ORM，让迁移与数据管理更清晰。'],
  ['Tailwind CSS', '使用原子化样式与设计 token，保持界面的一致性。'],
  ['Edge 部署', '与托管平台深度集成，让预览环境和生产部署开箱即用。'],
] as const

const PROBLEMS = [
  ['搜索索引体积过大', '改为构建时增量生成索引，体积减少 60%'],
  ['深色模式切换闪烁', '在 hydration 前通过内联脚本注入主题，消除 FOUC'],
  ['评论系统运维成本高', '改用托管式讨论区，实现零服务器成本'],
] as const

const STATS = [
  ['1,200+', '累计访问用户'],
  ['95+', 'Lighthouse 评分'],
  ['6 个月', '稳定运行时长'],
  ['120+', 'GitHub Star'],
] as const

const ROADMAP = ['图片优化', '多语言支持', '移动端编辑'] as const

const badgeClass = (kind: string) =>
  cx(
    styles.pdBadge,
    kind === '性能优化' ? styles.perf : kind === '重构' ? styles.refactor : styles.new,
  )

interface ProjectDetailPageProps {
  /** 全站已发布项目列表，用来算上一个/下一个作品 */
  projects: Project[]
  /** 全站已发布文章，用于「相关文章」 */
  articles: Article[]
}

function ProjectMock({ name }: { name: string }) {
  return (
    <div className={styles.pdShot} aria-hidden="true">
      <div className={styles.pdShotWindow}>
        <div className={styles.pdShotBar}>
          <span className={styles.pdShotDots}>
            <i />
            <i />
            <i />
          </span>
          <span className={styles.pdShotUrl} />
          <span className={styles.pdShotMark}>PREVIEW</span>
        </div>
        <div className={styles.pdShotBody}>
          <div className={styles.pdShotSide}>
            <span className={styles.pdShotLogo}>
              {name}
              <b>.</b>
            </span>
            {[80, 64, 72, 55].map((width, i) => (
              <span className={cx(styles.pdShotItem, i === 0 && styles.on)} key={width}>
                <i className={styles.pdShotTag} />
                <i className={styles.pdShotLine} style={{ width: `${width}%` }} />
                <i className={cx(styles.pdShotLine, styles.short)} />
              </span>
            ))}
          </div>
          <div className={styles.pdShotMain}>
            <span className={styles.pdShotKicker}>PROJECT OVERVIEW · PREVIEW</span>
            <p className={styles.pdShotTitle}>
              正在构建
              <br />
              更好的产品体验。
            </p>
            <div className={styles.pdShotLines}>
              <i />
              <i />
              <i />
            </div>
            <div className={styles.pdShotCode}>
              <span>const</span> project = await launch()
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 项目详情页 `/project/:id`。
 * 数据来自 GET /api/web/projects/{id}；正文字段是 Markdown，用 react-markdown + remark-gfm 渲染。
 * 本页不用滚动显形（异步加载，观察时机不可控），内容直接出现。
 */
export default function ProjectDetailPage({ projects, articles }: ProjectDetailPageProps) {
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

  const back = <BackLink to={{ pathname: '/', hash: '#work' }}>← 作品</BackLink>

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

  if (error || !project) {
    const big = error === 'notfound' ? '没有找到这个项目' : '作品暂时加载不出来'
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

  // 上一个/下一个：只在列表里能定位到本项目时才给导航
  const index = projects.findIndex((p) => p.id === project.id)
  const prev = index > 0 ? projects[index - 1] : null
  const next = index >= 0 && index < projects.length - 1 ? projects[index + 1] : null
  const previewImage = project.thumb ?? project.images[0] ?? null
  const relatedArticles = articles.slice(0, 2)

  return (
    <section className={detailStyles.detail}>
      <div className={detailStyles.wrap}>
        {back}

        <header className={styles.pdHero}>
          <div>
            <div className={styles.pdStatusline}>
              <span className={styles.pdPill}>已上线 · {project.type ?? '项目'}</span>
              <span className={styles.pdEyebrow}>
                {project.type ?? 'Project'} · {formatDate(project.created_at)}
              </span>
            </div>
            <h1>
              {project.name}
              <span>.</span>
            </h1>
            {project.description && <p className={styles.pdLede}>{project.description}</p>}
          </div>
          <aside className={styles.pdHeroSide}>
            <p className={styles.pdSideLabel}>Built with</p>
            <ul className={styles.pdTags}>
              {project.tech_stack.length > 0 ? (
                project.tech_stack.map((t) => <li key={t}>{t}</li>)
              ) : (
                <li>技术栈待补充</li>
              )}
            </ul>
            <div className={styles.pdActions}>
              {project.url ? (
                <a className={cx(styles.pdBtn, styles.solid)} href={project.url} target="_blank" rel="noreferrer">
                  在线预览 <Arrow diagonal />
                </a>
              ) : (
                <span className={cx(styles.pdBtn, styles.solid, styles.disabled)}>暂无在线预览</span>
              )}
              <Link className={styles.pdBtn} to={{ pathname: '/', hash: '#work' }}>
                返回作品 <Arrow />
              </Link>
            </div>
          </aside>
        </header>

        <div className={styles.pdPreview} id="pd-preview">
          {previewImage ? (
            <img src={previewImage} alt={`${project.name} 预览`} />
          ) : (
            <ProjectMock name={project.name} />
          )}
        </div>

        <div className={styles.pdBody}>
          <aside className={styles.pdToc} aria-label="项目章节">
            <nav>
              {SECTIONS.map(([label, href]) => (
                <a href={href} key={href}>
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          <article className={styles.pdArticle}>
            <section className={styles.pdSection} id="pd-background">
              <Kicker>01 · Background</Kicker>
              <h2>为什么做这个项目</h2>
              <div className={styles.pdBg}>
                <div>
                  {project.description && <p>{project.description}</p>}
                  <p>
                    这个项目从一个具体的问题出发：把重复的流程收敛成可靠、可维护的产品，并把使用门槛降到最低。
                  </p>
                  <p>
                    从设计、开发到部署与迭代，完整走通一遍产品流程，是它最重要的实践价值。
                  </p>
                </div>
                <div className={styles.pdBgCard}>
                  <span>目标用户</span>
                  <strong>
                    独立开发者
                    <br />
                    技术写作者
                  </strong>
                </div>
              </div>
            </section>

            <section className={styles.pdSection} id="pd-features">
              <Kicker>02 · Features</Kicker>
              <h2>核心功能</h2>
              <div className={styles.pdFeatures}>
                {FEATURES.map(([number, title, description]) => (
                  <div className={styles.pdFeature} key={number}>
                    <span className={styles.pdFeatureNo}>{number}</span>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.pdSection} id="pd-timeline">
              <Kicker>03 · Timeline</Kicker>
              <h2>从想法到 v1.2</h2>
              <div className={styles.pdTimeline}>
                {TIMELINE.map(([version, date, description, kind], i) => (
                  <div className={styles.pdTimelineRow} key={version}>
                    <strong className={styles.pdVersion}>{version}</strong>
                    <span className={styles.pdDate}>{date}</span>
                    <p>{description}</p>
                    <span className={badgeClass(kind)}>
                      {kind}
                      {i === TIMELINE.length - 1 ? ' · 当前' : ''}
                    </span>
                  </div>
                ))}
              </div>
              <div className={styles.pdLegend}>
                <span>
                  <i style={{ background: '#e8dfd5' }} />
                  新功能
                </span>
                <span>
                  <i style={{ background: '#dde3eb' }} />
                  重构
                </span>
                <span>
                  <i style={{ background: '#dce8df' }} />
                  性能优化
                </span>
              </div>
            </section>

            <section className={styles.pdSection} id="pd-architecture">
              <Kicker>04 · Architecture</Kicker>
              <h2>技术架构与选型</h2>
              <div className={styles.pdArch}>
                {ARCHITECTURE.map(([title, description], i) => (
                  <div className={styles.pdArchItem} key={title}>
                    <span className={styles.pdArchNo}>0{i + 1}</span>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.pdSection} id="pd-results">
              <Kicker>05 · Problems &amp; Results</Kicker>
              <h2>踩过的坑与解决方案</h2>
              <div className={styles.pdProblems}>
                {PROBLEMS.map(([problem, solution]) => (
                  <div className={styles.pdProblem} key={problem}>
                    <strong>{problem}</strong>
                    <span>
                      <Arrow />
                    </span>
                    <p>{solution}</p>
                  </div>
                ))}
              </div>
              <div className={styles.pdStats}>
                {STATS.map(([value, label]) => (
                  <div className={styles.pdStat} key={label}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.pdSection} id="pd-roadmap">
              <Kicker>06 · Retrospective</Kicker>
              <h2>复盘与后续规划</h2>
              <div className={styles.pdRetro}>
                <div>
                  <span>收获</span>
                  <p>
                    完整走通设计、开发、部署与迭代全流程，对数据获取与渲染模式有了更深入的实战理解。
                  </p>
                </div>
                <div>
                  <span>待优化</span>
                  <p>图片懒加载策略、多语言支持，以及移动端编辑器的输入体验。</p>
                </div>
              </div>
              <div className={styles.pdRoadmap}>
                <span>Roadmap</span>
                <ul>
                  {ROADMAP.map((item, i) => (
                    <li key={item}>
                      0{i + 1} · {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {gallery.length > 0 && (
              <section className={styles.pdSection} id="pd-gallery">
                <SectionHead
                  kicker="Gallery"
                  title="图集"
                  meta={`${pad(gallery.length)} 张`}
                  className={styles.pdSectionHead}
                  metaClassName={styles.pdMeta}
                />
                <div className={detailStyles.gallery}>
                  {gallery.map((item, i) => (
                    <button
                      key={item.src}
                      className={detailStyles.galleryItem}
                      onClick={() => setLightbox(i)}
                      aria-label={`查看大图：${item.caption}`}
                    >
                      <img src={item.src} alt={item.caption} loading="lazy" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {project.content && (
              <section className={styles.pdSection} id="pd-notes">
                <Kicker>Notes</Kicker>
                <h2>项目记录</h2>
                <article className={cx(markdownStyles.md, styles.pdMd)}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.content}</ReactMarkdown>
                </article>
              </section>
            )}

            <section className={cx(styles.pdSection, styles.pdRelated)} id="pd-related">
              <Kicker>Related</Kicker>
              <div className={styles.pdRelatedGrid}>
                {prev ? (
                  <Link className={cx(styles.pdRelatedCard, styles.flip)} to={`/project/${prev.id}`}>
                    <small>上一篇项目</small>
                    <strong>
                      {prev.name}
                      <Arrow />
                    </strong>
                  </Link>
                ) : (
                  <div className={cx(styles.pdRelatedCard, styles.isEmpty)}>
                    <small>上一篇项目</small>
                    <strong>已经是第一个项目</strong>
                  </div>
                )}
                {next ? (
                  <Link className={styles.pdRelatedCard} to={`/project/${next.id}`}>
                    <small>下一篇项目</small>
                    <strong>
                      {next.name}
                      <Arrow />
                    </strong>
                  </Link>
                ) : (
                  <div className={cx(styles.pdRelatedCard, styles.isEmpty)}>
                    <small>下一篇项目</small>
                    <strong>已经是最后一个项目</strong>
                  </div>
                )}
              </div>
              <div className={styles.pdRelatedLinks}>
                <span>相关文章</span>
                <div>
                  {relatedArticles.length > 0 ? (
                    relatedArticles.map((a) => (
                      <Link key={a.id} to={`/article/${a.id}`}>
                        《{a.title}》
                      </Link>
                    ))
                  ) : (
                    <em>暂无相关文章</em>
                  )}
                </div>
              </div>
            </section>
          </article>
        </div>
      </div>

      {lightbox !== null && gallery.length > 0 && (
        <Lightbox items={gallery} index={lightbox} onClose={close} onStep={step} />
      )}
    </section>
  )
}
