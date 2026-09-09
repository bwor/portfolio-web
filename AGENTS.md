# AGENTS.md

## 项目状态

已完成脚手架搭建：基于 Vite 8 + React 19 + TypeScript 的应用位于 `src/` 目录（瑞士风格的访客站点）。PRD/设计文档位于 `.trae/documents/`。要求 Node ≥20.19（见 `.nvmrc` 与 `engines`）。

## 已锁定决策

- 技术栈：**Vite + React + TypeScript**（已由负责人确认；不要搭建 Next.js、Astro 或纯 HTML 变体；新源码文件使用 `.ts`/`.tsx`，`src/` 下不允许出现 `.js`/`.jsx`）。
- 包管理器：**npm**。严禁运行 `pnpm install`、`yarn` 或 `bun install`；不要提交外来锁文件（`pnpm-lock.yaml`、`yarn.lock`、`bun.lockb`）。使用 `package-lock.json`。

## 脚手架完成之后

- 开发服务器：`npm run dev`；构建：`npm run build`；本地预览生产构建：`npm run preview`。
- 在猜测命令名称前先检查 `package.json` 中的 scripts——scripts 是唯一权威来源。
- Vite 环境变量必须以 `VITE_` 为前缀才能被客户端代码访问；其他内容仅在服务端/构建时可用。

# 开发规范

## 基础配置

- 后端 API 地址：`http://localhost:8000`
- 业务上下文：如不确定字段含义，可参考 `../docs/requirements/` 中的需求文档

## 类型管理规范（强制执行）

1. **禁止**在组件内使用 JSDoc 或内联 `interface` 定义数据结构。
2. **所有业务类型**必须定义在 `src/types/` 目录下，并按业务模块拆分为独立文件（如 `resume.ts`、`user.ts`）。
3. **类型来源**：当实现或修改某个模块时，必须：
   - 读取后端实时 Swagger 文档：`http://localhost:8000/openapi.json`
   - 在 JSON 中查找对应接口的 `components/schemas` 或 `requestBody` 定义
   - 将 JSON Schema **手动转换为标准的 TypeScript `interface` 或 `type`**，写入对应的模块文件（例如 `src/types/resume.ts`）
4. 模块文件必须包含清晰的注释，注明该类型对应的后端接口路径或业务含义。

## API 调用规范

1. API 请求统一封装在 `src/api/` 目录下，按模块拆分。
2. 请求方法的**参数和返回值必须显式标注类型**，类型从 `src/types/` 导入。
3. BaseURL 统一使用 `http://localhost:8000`，可通过环境变量覆盖。

## 页面组件规范

1. 页面组件放在 `src/pages/` 目录下，按功能命名。
2. 组件内**只导入类型，不定义类型**。
3. 数据获取使用 `useEffect` + 状态管理。
