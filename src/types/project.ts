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
  created_at: string
}
