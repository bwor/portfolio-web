/** 作品集公开接口（后端 /api/web/projects），见 src/types/project.ts */
import { httpGet } from './http'
import type { Project, ProjectDetail } from '../types/project'

/** GET /api/web/projects —— 已发布项目列表（不含 content） */
export function listPublishedProjects(): Promise<Project[]> {
  return httpGet<Project[]>('/api/web/projects')
}

/** GET /api/web/projects/{id} —— 项目详情（含 content）；未发布或不存在返回 404 */
export function getPublishedProject(id: number): Promise<ProjectDetail> {
  return httpGet<ProjectDetail>(`/api/web/projects/${id}`)
}
