/**
 * 简历作品业务类型（用户端只读）。
 * 手动转换自后端 OpenAPI：http://localhost:8000/openapi.json
 *   → components.schemas.ResumeResponse。
 * 对应接口：GET /api/v1/resumes。业务来源：docs/requirements/resume-feature.md。
 */
export interface Resume {
  id: number
  /** 必填，≤120 字 */
  title: string
  /** 必填，作品描述 */
  description: string
  /** 选填，http/https 网址 */
  link: string | null
  /** 选填，缩略图地址 */
  thumb: string | null
  /** ISO 8601（后端 date-time） */
  created_at: string
}
