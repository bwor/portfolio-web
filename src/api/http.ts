/**
 * 统一请求封装。后端返回裸 JSON，无 { code, message, data } 包裹。
 * 只请求相对路径 `/api/web/*`，没有 BASE_URL：dev 由 vite server.proxy 转发，
 * 部署由宿主机 nginx 转发，两边路径一致，所以前端不区分环境。
 */
export async function httpGet<T>(path: string): Promise<T> {
  const resp = await fetch(path, { headers: { Accept: 'application/json' } })
  if (!resp.ok) {
    throw new Error(`GET ${path} 失败：HTTP ${resp.status}`)
  }
  return (await resp.json()) as T
}
