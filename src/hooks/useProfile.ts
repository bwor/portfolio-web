/**
 * 个人简介数据获取（数据获取统一走 useEffect + 状态管理，类型从 src/types 导入）。
 * 只读拉取 GET /api/web/profile；请求集中在 src/api/profile.ts。
 * 沿用 useProjects 的约定：alive 标志做卸载保护，失败返回 error: 'unavailable'。
 */
import { useEffect, useState } from 'react'
import { getPublicProfile } from '../api/profile'
import type { Profile } from '../types/profile'

export function useProfile(): { profile: Profile | null; loading: boolean; error: string | null } {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    getPublicProfile()
      .then((data) => {
        if (alive) setProfile(data)
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

  return { profile, loading, error }
}
