/**
 * 个人简介类型定义。
 * 对应后端：GET /api/web/profile → components.schemas.ProfileResponse（全局单例）。
 * 注：管理端的 /api/v1/profile 不属于本端调用范围。
 */
export interface Profile {
  name: string
  title: string
  summary: string
  skills: string[]
}
