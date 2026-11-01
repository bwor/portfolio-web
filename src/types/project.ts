/**
 * 项目类型，转换自后端 app/schemas/project.py。
 * 对应接口：GET /api/web/projects、GET /api/web/projects/{id}。
 */
export type ProjectStatus = 'published' | 'unpublished'

/** ProjectResponse：列表项，不含 content */
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

/** ProjectDetailResponse：列表字段 + Markdown 正文 */
export interface ProjectDetail extends Project {
  content: string | null
}
