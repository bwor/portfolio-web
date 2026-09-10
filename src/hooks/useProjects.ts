/**
 * 作品集数据获取（开发规范：数据获取使用 useEffect + 状态管理，类型从 src/types 导入）。
 * 只读拉取 GET /api/web/projects；请求集中在 src/api/project.ts。
 */
import { useEffect, useState } from 'react'
import { listPublishedProjects } from '../api/project'
import type { Project } from '../types/project'

export function useProjects(): { projects: Project[]; loading: boolean; error: string | null } {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    listPublishedProjects()
      .then((data) => {
        if (alive) setProjects(data)
      })
      .catch(() => {
        if (alive) setError('unavailable')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  return { projects, loading, error }
}
