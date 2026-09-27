/**
 * 个人简介接口（后端 GET /api/web/profile）。
 * 使用 web 路由（公开只读），不要改调 /api/v1/profile。
 */
import { httpGet } from './http'
import type { Profile } from '../types/profile'

export function getPublicProfile(): Promise<Profile> {
  return httpGet<Profile>('/api/web/profile')
}
