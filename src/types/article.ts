/**
 * 文章公开接口的响应类型，对应后端 app/schemas/article.py。
 * 只读：GET /api/web/articles（列表不带 content）、GET /api/web/articles/{id}（详情含正文）。
 */

/** ArticleResponse：列表返回体 */
export interface Article {
  id: number
  title: string
  /** 摘要，首页卡片展示；未填写为 null */
  excerpt: string | null
  /** 分类标签，如「性能」；未填写为 null */
  category: string | null
  /** 阅读时长文案，如 "10 min" */
  read_time: string | null
  /** published / unpublished */
  status: string
  /** Unix 毫秒时间戳，展示层格式化为 MM.DD */
  created_at: number
}

/** ArticleDetailResponse：列表字段 + Markdown 正文 */
export interface ArticleDetail extends Article {
  content: string | null
}
