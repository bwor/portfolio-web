/**
 * 作品集接口（后端 GET /api/web/projects）。
 * 使用 web 路由，仅返回已发布项目。
 */
import { httpGet } from './http'
import type { Project } from '../types/project'

export function listPublishedProjects(): Promise<Project[]> {
  return httpGet<Project[]>('/api/web/projects')
}
