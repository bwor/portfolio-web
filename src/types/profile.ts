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
  github_url: string | null
  email: string | null
  /** 「近况」区块正文；未填写为 null（整段不渲染） */
  now_text: string | null
  /** 研究方向；未填写为 null（显示占位符） */
  research_focus: string | null
  /** 最近更新标题；未填写为 null（显示占位符） */
  latest_update_title: string | null
}
