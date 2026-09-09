/**
 * 简历作品接口（后端 GET /api/v1/resumes）。
 * 参数与返回值显式标注类型，类型从 src/types/resume 导入（组件只导入类型、不定义类型）。
 */
import { httpGet } from './http'
import type { Resume } from '../types/resume'

/** 用户端只读列表 */
export function listResumes(): Promise<Resume[]> {
  return httpGet<Resume[]>('/api/v1/resumes')
}
