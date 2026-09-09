import type { Profile, Project } from '../types'
import { hueAt, placeholderImage } from '../lib/placeholderImage'

/* 结构对齐 PRD.md §共享数据契约（3.1 profile / 3.2 project[]）。
   正式数据由管理端产出后经接口注入；此处为联调前示例数据。 */
export const PROFILE: Profile = {
  name: '李明',
  title: '前端工程师 · 交互体验方向',
  summary: '用代码把复杂产品做成简单直觉的体验。',
  skills: [
    'React', 'TypeScript', 'Vite', 'Node.js', 'CSS 架构', 'WebGL',
    '性能优化', '无障碍', '设计系统', '微前端', '数据可视化', '工程效率',
  ],
}

type ProjectSeed = Omit<Project, 'imageUrl' | 'thumbnailUrl'>

const PROJECT_SEEDS: ProjectSeed[] = [
  { id: 'p1', title: '实时协同城市场', en: 'WebRTC Signaling', sortOrder: 0, status: 'published' },
  { id: 'p2', title: '设计系统 Aurora', en: 'Design System', sortOrder: 1, status: 'published' },
  { id: 'p3', title: 'WebGL 粒子编辑器', en: 'Particle Editor', sortOrder: 2, status: 'published' },
  { id: 'p4', title: '性能观测面板', en: 'Lighthouse CI', sortOrder: 3, status: 'published' },
  { id: 'p5', title: '图布局引擎', en: 'Graph Layout', sortOrder: 4, status: 'published' },
  { id: 'p6', title: '博客引擎', en: 'Mobile-first SSG', sortOrder: 5, status: 'published' },
  { id: 'p7', title: '草稿项目', en: 'Coming Soon', sortOrder: 6, status: 'unpublished' },
]

export const PROJECTS: Project[] = PROJECT_SEEDS.map((p, i) => ({
  ...p,
  thumbnailUrl: placeholderImage(hueAt(i)),
  imageUrl: placeholderImage(hueAt(i)),
}))

export function visibleProjects(list: Project[]): Project[] {
  return list
    .filter((p) => p.status === 'published')
    .sort((a, b) => a.sortOrder - b.sortOrder)
}
