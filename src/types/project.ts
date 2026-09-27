/**
 * 项目（作品集）类型定义。
 * 对应后端：GET /api/web/projects → components.schemas.ProjectResponse。
 */
export type ProjectStatus = 'published' | 'unpublished'

export interface Project {
  id: number
  name: string
  description: string | null
  url: string | null
  thumb: string | null
  status: ProjectStatus
  /** Unix 毫秒时间戳（13 位 number），不是 ISO 字符串：渲染时 `new Date(created_at)` */
  created_at: number
}
