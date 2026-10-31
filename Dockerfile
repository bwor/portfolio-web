# syntax=docker/dockerfile:1
# 展示端生产镜像：Node 构建 dist/ -> nginx 纯静态伺服
# 单独构建：docker buildx build --platform linux/amd64 --provenance=false -t portfolio-web:local .
# 全栈：deploy/ 目录下的 compose.yaml，docker compose up -d --build
#
# Jenkins 也直接使用本文件构建，不在流水线里单独跑 npm build：
#   docker buildx build --platform linux/amd64 --provenance=false \
#     --build-arg GIT_SHA=<sha> --build-arg BUILD_NUMBER=<n> \
#     -t <registry>/<ns>/portfolio-web:<tag> --push .

# ---------------------------------------------------------------------------
# Stage 1/3  依赖安装
# ---------------------------------------------------------------------------
# .npmrc 有 engine-strict=true，不拷进上下文 npm ci 会直接失败
FROM node:24-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json .npmrc ./

# build 跑 tsc -b，typescript/@types 在 devDependencies，不能 --omit=dev
# cache mount 需要 BuildKit（顶部 # syntax 已声明），重复构建不必重新下载依赖
RUN --mount=type=cache,target=/root/.npm npm ci


# ---------------------------------------------------------------------------
# Stage 2/3  构建
# ---------------------------------------------------------------------------
FROM node:24-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
# tsconfig.node.json 把 vite.config.ts 纳入类型检查，所以它也要 COPY 进来
COPY package.json .npmrc index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY public ./public
COPY src ./src

# 不设 VITE_* build arg：接口地址是相对路径 /api/web/*，转发由宿主机 nginx 负责
# lint 放在镜像构建里：CI 与本地 docker build 都过同一道门禁
RUN npm run lint
RUN npm run build


# ---------------------------------------------------------------------------
# Stage 3/3  运行时：官方默认配置伺服 dist/，零自定义
# ---------------------------------------------------------------------------
# 路由、反代、缓存头都在镜像外（宿主机 nginx），本镜像只提供产物
FROM nginx:stable-alpine

# 版本信息由 CI 传入，方便在服务器上核对镜像来源（.dockerignore 排除了 .git，容器里取不到）
ARG GIT_SHA=unknown
ARG BUILD_NUMBER=0
LABEL org.opencontainers.image.title="portfolio-web" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.version="${BUILD_NUMBER}"

COPY --from=build /app/dist /usr/share/nginx/html

# 不写 EXPOSE：容器 80 是宿主机 nginx 的 upstream（compose 里只绑 127.0.0.1）
# 不写 HEALTHCHECK：健康检测在 compose.yaml 的 web.healthcheck
# -g "daemon off;"：否则 nginx fork 后自退，PID 1 消失会让容器被判结束
CMD ["nginx", "-g", "daemon off;"]
