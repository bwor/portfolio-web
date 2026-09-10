/**
 * 个人简介类型定义。
 * 对应后端：GET /api/v1/profile → components.schemas.ProfileResponse。
 */
export interface Profile {
  name: string
  title: string
  summary: string
  skills: string[]
}
