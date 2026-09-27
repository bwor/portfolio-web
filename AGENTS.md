# AGENTS.md

访客展示端（公开站点，瑞士风格）。Vite 8 + React 19 + TypeScript 7，源码在 `src/`。要求 Node ≥20.19（见 `.nvmrc` = 20.20.1 与 `engines`）。

## 已锁定决策

- 技术栈：**Vite + React + TypeScript**（不要搭 Next.js / Astro / 纯 HTML 变体）。新源码文件一律 `.ts`/`.tsx`，`src/` 下**不允许**出现 `.js`/`.jsx`。
- 包管理器：**npm**。严禁 `pnpm install` / `yarn` / `bun install`；不要提交外来锁文件（`pnpm-lock.yaml` / `yarn.lock` / `bun.lockb`）。只用 `package-lock.json`。
- `.npmrc` 有 `engine-strict=true`，Node 版本不符会直接安装失败——先 `nvm use`。
- Vite 环境变量必须以 `VITE_` 为前缀才进客户端；真实凭据不得入库。

## 命令

- `npm run dev`（5173）、`npm run build`（`tsc -b && vite build`）、`npm run preview`。
- `npm run typecheck`（`tsc -b`）+ `npm run lint`（oxlint），**提交前两个都跑**。
- **没有测试框架，也没有 `test` script**——别臆造 `npm test`。要验证就 `npm run typecheck && npm run lint`。
- `scripts` 是唯一事实来源，别猜命令名。

## 后端接入（最容易搞错的一处）

- **前端只用相对路径 `/api/web/*`，代码里没有 `BASE_URL`**（`src/api/http.ts` 的 `httpGet` 直接 `fetch(path)`）。转发由部署层负责，两条路都是 `/api`：
  - 本地 `npm run dev` → `vite.config.ts` 的 `server.proxy` 转到 `127.0.0.1:8000`（**只在 dev 生效**，镜像里没有 vite 进程）；
  - 部署 → 由**宿主机 nginx** 转发 `/api` 到后端。
  因为路径一致，前端**不区分环境**。
- **改后端地址改宿主机 nginx 的 `upstream portfolio_api`**，不改代码、不加 `.env` 文件（反代是服务端行为，由 nginx 解析，**不需要**浏览器能解析那个地址）。
- 只调公开只读的 **`/api/web/*`**：`GET /api/web/projects`（后端只返回 `status == "published"`）与 `GET /api/web/profile`（全局单例简介，未创建时 404）。`/api/v1/*` 是管理端专用，**不要从展示端调用**。
- 统一用 `src/api/http.ts` 的 `httpGet<T>`；它不解 envelope，因为后端返回**裸 JSON**（没有 `{ code, message, data }`）。
- 本端**无鉴权**、不发写操作、不发 `credentials: 'include'`。因为同源，连 `CORS` 都不触发。

## 容器化

本仓库出**纯产物镜像**：`Dockerfile`（多阶段 node:24-alpine 构建 → nginx:stable-alpine 伺服）、`.dockerignore`。**镜像里没有任何 nginx 配置**——用官方默认配置（`root` + `index`）伺服 `dist/`，零自定义。本项目**没有前端路由**（单页 + hash 锚点），所以也不需要 SPA 回退。**本仓库不含任何 `.conf` / `.template` 文件。** **全栈 `compose.yaml` 在 `deploy/` 目录**（build context 指向 `../portfolio-web`），命令一律在 `deploy/` 里跑：`docker compose up -d --build`，展示端 http://localhost/。

部署路由**不在镜像内**：**宿主机 nginx 是全站唯一入口**（`D:\nginx-1.30.5\conf\conf.d\portfolio.conf`，宿主机 nginx 的 conf.d 片段），在 80 上按路径分流——`/` → 本容器、`/admin/` → 管理端、`/api/` → 后端。compose 里那个 `127.0.0.1:8080` 只是给 nginx 用的 **upstream，不是入口**。

- **展示端挂在站点根 `/`，所以 vite 不设 `base`**（产物资源引用就是 `/assets/...`），与管理端相反。
- **产物文件名带内容 hash**（如 `index-BOwO38Vh.js`），nginx 据此给 `/assets/*` 发 `public, max-age=31536000, immutable`；`index.html` 与 `favicon.svg` 不带 hash，不能长缓存。去掉 hash 会破坏这套策略。
- **前端不知道后端在哪**：Dockerfile 里**没有** `VITE_*` build arg，也没有 `.env`。换后端地址**不用重新构建镜像**。
- **展示端要被搜索引擎收录**：响应头层面刻意什么都不加（`X-Robots-Tag` 等），要加在宿主机 nginx 统一做。
- **本镜像不含 `HEALTHCHECK`**：健康检测在 `deploy/compose.yaml` 的 `web.healthcheck`。单独 `docker run` 本镜像没有健康状态，属预期。
- **`CMD ["nginx", "-g", "daemon off;"]` 的 `-g` 不要删**：nginx 默认 fork 后自退，PID 1 一消失 Docker 就判定容器结束并杀掉 worker。



## 类型管理规范（强制执行）

1. **禁止**在组件内用 JSDoc 或内联 `interface` 定义数据结构。
2. **所有业务类型**必须定义在 `src/types/` 下，按业务模块拆文件（现有 `profile.ts` / `project.ts`）。
3. **类型来源**：实现或修改某模块时，先读后端实时契约 `http://localhost:8000/openapi.json`（或直接读 `portfolio-api/app/schemas/*.py`），把 JSON Schema **手工转成**标准 `interface` / `type` 写入对应模块文件。类型**不自动生成**。
4. 模块文件必须注释标明对应的后端接口路径或业务含义。
5. 后端响应里**可空字段**（如 `Project.url` / `thumb` / `description`）是 `string | null`，不要写成 `string`——渲染前先判空。
6. 后端时间字段（如 `created_at`）是 **Unix 毫秒时间戳（number，13 位）**，不是 ISO 字符串也不是 `Date` 对象；要显示先 `new Date(created_at)` 再格式化。

## 目录与组件约定

- 本项目**没有 `src/pages/`**，也没有路由：`App.tsx` 直接组合 `src/components/*` 的单页站点（`SiteNav` / `HeroSection` / `WorksSection` / `SkillsSection` / `SiteFooter` / `Lightbox`）。**不要为了"规范"新建 `pages/` 或引入路由库。**
- 可复用 UI 放 `src/components/`（平铺单文件即可，不搞文件夹 + `index.tsx`——那是管理端的约定）。
- 自定义 hook 放 `src/hooks/`，命名 `useXxx.ts` 且具名导出（`useProjects.ts` → `export function useProjects`）。
- 数据获取用 `useEffect` + 状态管理，放在 `src/hooks/` 里，不要塞进组件。**注意 `useProjects` 用了 `alive` 标志做卸载保护，新增 hook 请沿用**，否则 `setState` 会在卸载后触发。
- 请求失败时 `useProjects` / `useProfile` 返回 `error: 'unavailable'` 而不是抛出——组件需自行降级渲染，别假设 loading 一定会结束。
- 组件**不直接发请求**，也**不再有 `src/data/` 假数据**：简介与作品都由 `App.tsx` 调 `useProfile()` / `useProjects()` 后以 props 下发（`SiteNav` / `SiteFooter` 收 `name`，`HeroSection` / `SkillsSection` 收 `profile: Profile | null`）。`profile` 为 `null`（未加载或 404）时 Hero 走 `.empty` 降级块、SkillsSection 整段隐藏。
- 仍**硬编码在 `index.html` 的**是 `title` / `description` / `og:*` 里的姓名与职位（静态站点无法取接口），要跟简介一致就手动同步。

## 业务上下文

历史文档指向 `../docs/requirements/` 与本项目 `.trae/documents/`，**两者在工作区都不存在**。不要去找，也不要凭 PRD 名称编造字段——以后端 `app/schemas/` 与实际代码为准。
