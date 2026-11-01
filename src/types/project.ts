/**
 * 项目类型，转换自后端 app/schemas/project.py。
 * 对应接口：GET /api/web/projects、GET /api/web/projects/{id}。
 */
export type ProjectStatus = 'published' | 'unpublished'

/** 迭代类型：后端用枚举校验，前端徽章配色依赖这三个值 */
export type TimelineKind = '新功能' | '重构' | '性能优化'

export interface ProjectFeature {
  title: string
  description: string
}

export interface ProjectTimelineItem {
  version: string
  date: string
  description: string
  kind: TimelineKind
}

export interface ProjectArchItem {
  title: string
  description: string
}

export interface ProjectProblemItem {
  problem: string
  solution: string
}

export interface ProjectStatItem {
  value: string
  label: string
}

/** 详情响应的相邻项目引用 */
export interface ProjectRef {
  id: number
  name: string
}

/** 详情响应的关联文章引用 */
export interface RelatedArticleRef {
  id: number
  title: string
}

/** ProjectResponse：列表项，不含 content 与详情区块 */
export interface Project {
  id: number
  name: string
  /** 类型标签，如 SaaS 产品；未填写为 null（卡片回退显示「项目」） */
  type: string | null
  description: string | null
  url: string | null
  /** 对象存储直传后的公网 URL（后端读取时已重新签名） */
  thumb: string | null
  status: ProjectStatus
  /** ≤12 项、每项 ≤20 字 */
  tech_stack: string[]
  /** ≤9 张 */
  images: string[]
  /** Unix 毫秒时间戳（13 位） */
  created_at: number
}

/**
 * ProjectDetailResponse：列表字段 + Markdown 正文 + 9 个平铺详情区块。
 * 详情区块都是可变长数组，空数组表示后台未录入（页面隐藏对应章节）。
 */
export interface ProjectDetail extends Project {
  content: string | null
  background: string | null
  features: ProjectFeature[]
  timeline: ProjectTimelineItem[]
  architecture: ProjectArchItem[]
  problems: ProjectProblemItem[]
  stats: ProjectStatItem[]
  gains: string | null
  improvements: string | null
  roadmap: string[]
  prev: ProjectRef | null
  next: ProjectRef | null
  related_articles: RelatedArticleRef[]
}
