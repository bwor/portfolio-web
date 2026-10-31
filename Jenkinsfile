// 展示端独立发版流水线
//
// 前置条件（Jenkins 控制器跑在 Docker 里，见 deploy/jenkins-compose.yaml）：
//   1. 容器挂载 /var/run/docker.sock，并带有 docker CLI / buildx；
//   2. Jenkins 凭据：
//        acr-credentials  Username with password（ACR 登录名 + 访问令牌）
//        ecs-deploy-key   SSH Username with private key（服务器部署用户 + 私钥）
//   3. 服务器 $(DEPLOY_DIR) 下有 compose.prod.yaml 和 .env，
//      且该用户已 docker login 过 ACR、在 docker 组里；
//   4. 本机 Jenkins 没有公网入口，所以默认用 pollSCM 轮询；
//      以后有公网地址/隧道再换成 GitHub webhook（Multibranch 则删掉 triggers）。
//
// 本流水线只处理 portfolio-web：不构建 admin/api，也不重启它们。
// 镜像 tag 形如 web-42-a1b2c3d，写入服务器 .env 的 WEB_TAG。

pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timeout(time: 30, unit: 'MINUTES')
  }

  parameters {
    string(name: 'REGISTRY', defaultValue: 'registry.cn-hangzhou.aliyuncs.com', description: 'ACR 地址（照抄控制台 docker login 后的域名，不带末尾斜杠）')
    string(name: 'NS', defaultValue: 'xb-portfolio', description: 'ACR 命名空间')
    string(name: 'DOCKER_PLATFORM', defaultValue: 'linux/amd64', description: '服务器架构：x86_64→linux/amd64，aarch64→linux/arm64')
    booleanParam(name: 'DEPLOY', defaultValue: true, description: '构建推送后是否部署到服务器')
    booleanParam(name: 'DEPLOY_ONLY', defaultValue: false, description: '只部署 TAG_OVERRIDE，不构建（回滚用）')
    string(name: 'TAG_OVERRIDE', defaultValue: '', description: 'DEPLOY_ONLY=true 时必填，服务器上已存在的镜像 tag')
    string(name: 'SERVER_HOST', defaultValue: '120.26.243.31', description: 'ECS 公网 IP / 域名（DEPLOY=true 时必填）')
    string(name: 'DEPLOY_DIR', defaultValue: '/opt/portfolio', description: '服务器部署目录（含 compose.prod.yaml 与 .env）')
  }

  triggers {
    // 本机 Jenkins 通常没有公网入口，先用轮询；有公网后再改 webhook。
    pollSCM('H/5 * * * *')
  }

  stages {
    stage('Prepare') {
      steps {
        script {
          if (!params.REGISTRY?.trim() || !params.NS?.trim()) {
            error('REGISTRY / NS 不能为空')
          }
          if (params.DEPLOY_ONLY == true) {
            if (params.DEPLOY == false) {
              error('DEPLOY_ONLY=true 时 DEPLOY 也必须为 true')
            }
            if (!params.TAG_OVERRIDE?.trim()) {
              error('DEPLOY_ONLY=true 时必须填 TAG_OVERRIDE（已存在的镜像 tag）')
            }
          }
          if (params.DEPLOY != false && !params.SERVER_HOST?.trim()) {
            error('DEPLOY=true 时 SERVER_HOST 不能为空')
          }

          env.REGISTRY = params.REGISTRY.trim().replaceAll('/+$', '')
          env.NS = params.NS.trim().replaceAll('^/+|/+$', '')
          env.IMAGE = "${env.REGISTRY}/${env.NS}/portfolio-web"
          env.DOCKER_PLATFORM = params.DOCKER_PLATFORM?.trim() ?: 'linux/amd64'
          env.SERVER_HOST = params.SERVER_HOST?.trim() ?: ''
          env.DEPLOY_DIR = params.DEPLOY_DIR?.trim() ?: '/opt/portfolio'

          if (params.DEPLOY_ONLY == true) {
            env.TAG = params.TAG_OVERRIDE.trim()
          } else {
            env.GIT_SHA = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
            env.SHORT_SHA = env.GIT_SHA.take(7)
            env.TAG = "web-${env.BUILD_NUMBER}-${env.SHORT_SHA}"
          }
          echo "镜像: ${env.IMAGE}:${env.TAG}"
        }
      }
    }

    stage('Build & Push') {
      when { expression { params.DEPLOY_ONLY != true } }
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'acr-credentials',
          usernameVariable: 'ACR_USER',
          passwordVariable: 'ACR_PASS'
        )]) {
          sh '''
            set -e
            printf '%s' "$ACR_PASS" | docker login "$REGISTRY" -u "$ACR_USER" --password-stdin
            docker buildx build \
              --platform "$DOCKER_PLATFORM" \
              --provenance=false \
              --build-arg GIT_SHA="$GIT_SHA" \
              --build-arg BUILD_NUMBER="$BUILD_NUMBER" \
              -t "$IMAGE:$TAG" \
              --push \
              .
          '''
        }
      }
    }

    stage('Deploy') {
      when { expression { params.DEPLOY != false } }
      steps {
        withCredentials([sshUserPrivateKey(
          credentialsId: 'ecs-deploy-key',
          keyFileVariable: 'SSH_KEY',
          usernameVariable: 'SSH_USER'
        )]) {
          sh '''
            set -e
            [ -n "$SERVER_HOST" ] || { echo "SERVER_HOST 为空"; exit 1; }

            ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new \
              "$SSH_USER@$SERVER_HOST" "bash -s -- '$TAG' '$DEPLOY_DIR'" <<'REMOTE'
            set -euo pipefail
            NEW_TAG="$1"
            DEPLOY_DIR="$2"
            cd "$DEPLOY_DIR"

            # 串行化部署，避免 web/admin/api 同时改 .env
            exec 9>".deploy.lock"
            flock 9

            # 从 .env 读 REGISTRY / NS，拼出完整镜像名
            REGISTRY=$(grep '^REGISTRY=' .env | cut -d= -f2-)
            NS=$(grep '^NS=' .env | cut -d= -f2-)
            IMAGE="$REGISTRY/$NS/portfolio-web:$NEW_TAG"

            # 写一个临时 override 文件，直接指定 image 全名。
            # 完全绕过 compose.prod.yaml 里 ${WEB_TAG:-${TAG}} 的变量插值，
            # 不管 .env 里 WEB_TAG 是什么，都强制用新镜像。
            cat > .override-web.yaml <<EOF
            services:
              web:
                image: $IMAGE
            EOF

            # 调试
            echo "--- override image ---"
            grep image .override-web.yaml

            # 拉取并强制重建
            docker compose -f compose.prod.yaml -f .override-web.yaml pull web
            docker compose -f compose.prod.yaml -f .override-web.yaml up -d --force-recreate --no-deps web

            # 清理临时文件
            rm -f .override-web.yaml

            # 确认跑起来的镜像确实是新 tag
            RUNNING_IMAGE=$(docker inspect -f '{{.Config.Image}}' portfolio-web 2>/dev/null || true)
            case "$RUNNING_IMAGE" in
              *":$NEW_TAG") ;;
              *) echo "容器镜像不匹配：期望 *:$NEW_TAG，实际 $RUNNING_IMAGE"; exit 1 ;;
            esac

            STATUS=""
            for i in $(seq 1 60); do
              STATUS=$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' portfolio-web 2>/dev/null || true)
              if [ "$STATUS" = "healthy" ]; then
                break
              fi
              sleep 2
            done

            docker compose -f compose.prod.yaml ps web
            if [ "$STATUS" != "healthy" ]; then
              docker compose -f compose.prod.yaml logs --tail=100 web
              echo "部署后健康检查失败，当前状态：$STATUS"
              exit 1
            fi
            echo "已部署 portfolio-web:$NEW_TAG"
REMOTE
          '''
        }
      }
    }
  }

  post {
    always {
      // post 块可能在 node 上下文释放后执行，sh 需要 workspace，必须包在 node 里
      node('built-in') {
        sh 'docker image prune -f >/dev/null 2>&1 || true'
      }
    }
  }
}
