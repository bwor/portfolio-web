/**
 * 文章详情取数（GET /api/web/articles/{id}）。
 * 与 useProject 同一套快照约定：按 id 归属结果，loading 在渲染期推导。
 */
import { useEffect, useState } from 'react'
import { getPublishedArticle } from '../api/article'
import type { ArticleDetail } from '../types/article'

/** 'unavailable' = 接口失败；'notfound' = id 非法或后端 404 */
type ArticleError = 'unavailable' | 'notfound'

interface UseArticleResult {
  article: ArticleDetail | null
  loading: boolean
  error: ArticleError | null
}

/** 单条快照：id 用来判断这份结果是否属于当前请求 */
interface Entry {
  id: number
  article: ArticleDetail | null
  error: ArticleError | null
}

export function useArticle(id: number): UseArticleResult {
  const [entry, setEntry] = useState<Entry | null>(null)
  const valid = Number.isInteger(id) && id > 0

  useEffect(() => {
    if (!valid) return
    let alive = true
    getPublishedArticle(id)
      .then((data) => {
        if (alive) setEntry({ id, article: data, error: null })
      })
      .catch((err: unknown) => {
        if (alive) {
          setEntry({ id, article: null, error: isNotFound(err) ? 'notfound' : 'unavailable' })
        }
      })
    return () => {
      alive = false
    }
  }, [id, valid])

  if (!valid) return { article: null, loading: false, error: 'notfound' }
  if (!entry || entry.id !== id) return { article: null, loading: true, error: null }
  return { article: entry.article, loading: false, error: entry.error }
}

/** httpGet 抛的是 `Error('GET ... 失败：HTTP 404')`，按文案区分 404 与网络失败 */
function isNotFound(err: unknown): boolean {
  return err instanceof Error && /HTTP 404\b/.test(err.message)
}
