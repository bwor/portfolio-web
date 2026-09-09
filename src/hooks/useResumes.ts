/**
 * 简历作品数据获取（开发规范：数据获取使用 useEffect + 状态管理，类型从 src/types 导入）。
 * 只读拉取 GET /api/v1/resumes；请求集中在 src/api/resume.ts。
 */
import { useEffect, useState } from 'react'
import { listResumes } from '../api/resume'
import type { Resume } from '../types/resume'

export function useResumes(): { resumes: Resume[]; loading: boolean; error: string | null } {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    listResumes()
      .then((data) => {
        if (alive) setResumes(data)
      })
      .catch(() => {
        // E-01：接口不可用也不白屏，退化为空列表占位（与 WorksSection 空状态一致）
        if (alive) setError('unavailable')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  return { resumes, loading, error }
}
