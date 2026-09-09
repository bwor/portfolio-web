/**
 * 统一请求封装（开发规范：请求集中在 src/api/，BaseURL 默认 http://localhost:8000，可用 VITE_API_BASE_URL 覆盖）。
 * 后端为 FastAPI，资源接口直接返回裸 JSON，无 { code, message, data } 包裹，此处不解 envelope。
 */
const envBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined
export const BASE_URL = (envBaseUrl ?? 'http://localhost:8000').replace(/\/+$/, '')

export async function httpGet<T>(path: string): Promise<T> {
  const resp = await fetch(`${BASE_URL}${path}`, { headers: { Accept: 'application/json' } })
  if (!resp.ok) {
    throw new Error(`GET ${path} 失败：HTTP ${resp.status}`)
  }
  return (await resp.json()) as T
}
