/**
 * 文章列表数据获取（GET /api/web/articles）。
 * 与 useProjects 同一套约定：effect 内只有异步回调 setState，卸载后不再落地结果。
 */
import { useEffect, useState } from 'react'
import { listPublishedArticles } from '../api/article'
import type { Article } from '../types/article'

export function useArticles(): { articles: Article[]; loading: boolean; error: string | null } {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    listPublishedArticles()
      .then((data) => {
        if (alive) setArticles(data)
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

  return { articles, loading, error }
}
