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
import type { TimelineKind } from '../types/project'

const pad = (n: number) => String(n).padStart(2, '0')

const formatDate = (ms: number) =>
  new Date(ms).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })

/** 迭代徽章图例：配色键与后端枚举一一对应 */
const LEGEND: Record<TimelineKind, string> = {
  新功能: '#e8dfd5',
  重构: '#dde3eb',
  性能优化: '#dce8df',
}

const badgeClass = (kind: TimelineKind) =>
  cx(
    styles.pdBadge,
    kind === '性能优化' ? styles.perf : kind === '重构' ? styles.refactor : styles.new,
  )

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
export default function ProjectDetailPage() {
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

  // 详情区块：后台未录入 → 空数组/None → 整章隐藏（不造兜底假数据）
  const { background, features, timeline, architecture, problems, stats, gains, improvements, roadmap } =
    project
  const showBackground = Boolean(project.description || background)
  const showFeatures = features.length > 0
  const showTimeline = timeline.length > 0
  const showArchitecture = architecture.length > 0
  const showResults = problems.length > 0 || stats.length > 0
  const showRetro = Boolean(gains || improvements) || roadmap.length > 0

  // 章节导航只列实际渲染的章节，避免出现指向空章节的链接
  const toc: [string, string][] = []
  if (showBackground) toc.push(['背景', '#pd-background'])
  if (showFeatures) toc.push(['核心功能', '#pd-features'])
  if (showTimeline) toc.push(['迭代历程', '#pd-timeline'])
  if (showArchitecture) toc.push(['技术架构', '#pd-architecture'])
  if (showResults) toc.push(['问题与成果', '#pd-results'])
  if (showRetro) toc.push(['复盘规划', '#pd-roadmap'])

  // 图例只列出现过的类型，避免「图例有、列表没有」
  const legendKinds = Array.from(new Set(timeline.map((item) => item.kind)))

  // 相邻项目与相关文章由详情接口返回（列表默认 limit=20，不能靠全站列表算）
  const { prev, next, related_articles: relatedArticles } = project
  const previewImage = project.thumb ?? project.images[0] ?? null

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
              {toc.map(([label, href]) => (
                <a href={href} key={href}>
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          <article className={styles.pdArticle}>
            {showBackground && (
              <section className={styles.pdSection} id="pd-background">
                <Kicker>01 · Background</Kicker>
                <h2>为什么做这个项目</h2>
                <div className={styles.pdBg}>
                  {project.description && <p>{project.description}</p>}
                  {background && <p>{background}</p>}
                </div>
              </section>
            )}

            {showFeatures && (
              <section className={styles.pdSection} id="pd-features">
                <Kicker>02 · Features</Kicker>
                <h2>核心功能</h2>
                <div className={styles.pdFeatures}>
                  {features.map(({ title, description }, i) => (
                    <div className={styles.pdFeature} key={`${title}-${i}`}>
                      <span className={styles.pdFeatureNo}>{pad(i + 1)}</span>
                      <h3>{title}</h3>
                      <p>{description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {showTimeline && (
              <section className={styles.pdSection} id="pd-timeline">
                <Kicker>03 · Timeline</Kicker>
                <h2>迭代历程</h2>
                <div className={styles.pdTimeline}>
                  {timeline.map(({ version, date, description, kind }, i) => (
                    <div className={styles.pdTimelineRow} key={`${version}-${i}`}>
                      <strong className={styles.pdVersion}>{version}</strong>
                      <span className={styles.pdDate}>{date}</span>
                      <p>{description}</p>
                      <span className={badgeClass(kind)}>
                        {kind}
                        {i === timeline.length - 1 ? ' · 当前' : ''}
                      </span>
                    </div>
                  ))}
                </div>
                <div className={styles.pdLegend}>
                  {legendKinds.map((kind) => (
                    <span key={kind}>
                      <i style={{ background: LEGEND[kind] }} />
                      {kind}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {showArchitecture && (
              <section className={styles.pdSection} id="pd-architecture">
                <Kicker>04 · Architecture</Kicker>
                <h2>技术架构与选型</h2>
                <div className={styles.pdArch}>
                  {architecture.map(({ title, description }, i) => (
                    <div className={styles.pdArchItem} key={`${title}-${i}`}>
                      <span className={styles.pdArchNo}>{pad(i + 1)}</span>
                      <h3>{title}</h3>
                      <p>{description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {showResults && (
              <section className={styles.pdSection} id="pd-results">
                <Kicker>05 · Problems &amp; Results</Kicker>
                <h2>踩过的坑与解决方案</h2>
                {problems.length > 0 && (
                  <div className={styles.pdProblems}>
                    {problems.map(({ problem, solution }, i) => (
                      <div className={styles.pdProblem} key={`${problem}-${i}`}>
                        <strong>{problem}</strong>
                        <span>
                          <Arrow />
                        </span>
                        <p>{solution}</p>
                      </div>
                    ))}
                  </div>
                )}
                {stats.length > 0 && (
                  <div className={styles.pdStats}>
                    {stats.map(({ value, label }, i) => (
                      <div className={styles.pdStat} key={`${label}-${i}`}>
                        <strong>{value}</strong>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {showRetro && (
              <section className={styles.pdSection} id="pd-roadmap">
                <Kicker>06 · Retrospective</Kicker>
                <h2>复盘与后续规划</h2>
                {(gains || improvements) && (
                  <div className={styles.pdRetro}>
                    {gains && (
                      <div>
                        <span>收获</span>
                        <p>{gains}</p>
                      </div>
                    )}
                    {improvements && (
                      <div>
                        <span>待优化</span>
                        <p>{improvements}</p>
                      </div>
                    )}
                  </div>
                )}
                {roadmap.length > 0 && (
                  <div className={styles.pdRoadmap}>
                    <span>Roadmap</span>
                    <ul>
                      {roadmap.map((item, i) => (
                        <li key={`${item}-${i}`}>
                          {pad(i + 1)} · {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

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
