/** 文章公开接口（后端 /api/web/articles），见 src/types/article.ts */
import { httpGet } from './http'
import type { Article, ArticleDetail } from '../types/article'

/** GET /api/web/articles —— 已发布文章列表（最新在前，不含 content） */
export function listPublishedArticles(): Promise<Article[]> {
  return httpGet<Article[]>('/api/web/articles')
}

/** GET /api/web/articles/{id} —— 文章详情（含 Markdown 正文）；未发布或不存在返回 404 */
export function getPublishedArticle(id: number): Promise<ArticleDetail> {
  return httpGet<ArticleDetail>(`/api/web/articles/${id}`)
}
