/**
 * 项目详情取数（GET /api/web/projects/{id}）。
 * 快照按 id 归属，loading 在渲染期推导：effect 内只有异步回调 setState，
 * 既避开 set-state-in-effect，也不会把上一个 id 的结果当成当前结果。
 */
import { useEffect, useState } from 'react'
import { getPublishedProject } from '../api/project'
import type { ProjectDetail } from '../types/project'

/** 'unavailable' = 接口失败；'notfound' = id 非法或后端 404 */
type ProjectError = 'unavailable' | 'notfound'

interface UseProjectResult {
  project: ProjectDetail | null
  loading: boolean
  error: ProjectError | null
}

/** 单条快照：id 用来判断这份结果是否属于当前请求 */
interface Entry {
  id: number
  project: ProjectDetail | null
  error: ProjectError | null
}

export function useProject(id: number): UseProjectResult {
  const [entry, setEntry] = useState<Entry | null>(null)
  const valid = Number.isInteger(id) && id > 0

  useEffect(() => {
    if (!valid) return
    let alive = true
    getPublishedProject(id)
      .then((data) => {
        if (alive) setEntry({ id, project: data, error: null })
      })
      .catch((err: unknown) => {
        if (alive) {
          setEntry({ id, project: null, error: isNotFound(err) ? 'notfound' : 'unavailable' })
        }
      })
    return () => {
      alive = false
    }
  }, [id, valid])

  if (!valid) return { project: null, loading: false, error: 'notfound' }
  if (!entry || entry.id !== id) return { project: null, loading: true, error: null }
  return { project: entry.project, loading: false, error: entry.error }
}

/** httpGet 抛的是 `Error('GET ... 失败：HTTP 404')`，按文案区分 404 与网络失败 */
function isNotFound(err: unknown): boolean {
  return err instanceof Error && /HTTP 404\b/.test(err.message)
}
