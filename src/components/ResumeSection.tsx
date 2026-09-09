import type { Resume } from '../types/resume'

const pad = (n: number) => String(n).padStart(2, '0')

interface ResumeSectionProps {
  resumes: Resume[]
  loading: boolean
}

/** 简历作品 · 用户端只读列表（数据来自 GET /api/v1/resumes，无任何写入入口）。 */
export default function ResumeSection({ resumes, loading }: ResumeSectionProps) {
  return (
    <section className="sec" id="resume" aria-label="简历作品">
      <div className="wrap">
        <div className="sec-h">
          <h2>简历</h2>
          <span className="up">Resumes {pad(resumes.length)}</span>
        </div>
        {loading ? (
          <div className="resume-list" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div className="resume-item is-skeleton" key={`s${i}`}>
                <span className="no">{pad(i + 1)}</span>
                <span className="resume-body">
                  <span className="resume-sk line-t" />
                  <span className="resume-sk line-b" />
                </span>
              </div>
            ))}
          </div>
        ) : resumes.length > 0 ? (
          <div className="resume-list">
            {resumes.map((r, i) => (
              <article className="resume-item reveal" key={r.id}>
                <span className="no">{pad(i + 1)}</span>
                <div className="resume-thumb">
                  {r.thumb ? (
                    <img src={r.thumb} alt={r.title} loading="lazy" />
                  ) : (
                    <span className="resume-thumb-ph up">No Image</span>
                  )}
                </div>
                <div className="resume-body">
                  <h3>{r.title}</h3>
                  <p>{r.description}</p>
                  {r.link ? (
                    <a className="resume-link up" href={r.link} target="_blank" rel="noreferrer">
                      Visit ↗
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">
            <p className="big">简历作品正在整理中</p>
            <p>敬请期待，稍后再来看看。</p>
          </div>
        )}
      </div>
    </section>
  )
}
