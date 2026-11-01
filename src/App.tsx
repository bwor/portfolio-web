import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import SiteNav from './components/SiteNav'
import SiteFooter from './components/SiteFooter'
import HomePage from './pages/HomePage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ArticleDetailPage from './pages/ArticleDetailPage'
import useReveal from './hooks/useReveal'
import { useProfile } from './hooks/useProfile'
import { useProjects } from './hooks/useProjects'
import { useArticles } from './hooks/useArticles'

export default function App() {
  return (
    <BrowserRouter>
      <SiteShell />
    </BrowserRouter>
  )
}

/**
 * 站点骨架：导航 + 路由出口 + 页脚。
 * 数据（简介/作品/文章）在这里取一次，以 props 下发给页面，避免来回跳转重复请求。
 */
function SiteShell() {
  const { profile } = useProfile()
  const { projects } = useProjects()
  const { articles } = useArticles()
  const location = useLocation()

  // 依赖带上路由信息：从详情页回到首页时，卡片是重新挂载的，必须重新收集 .reveal
  useReveal([projects.length, location.pathname, location.key])

  // 换路由回到顶部；带 hash 的导航交给 HomePage 滚到区块（子级 effect 先于本 effect 执行）
  useEffect(() => {
    if (location.hash) return
    window.scrollTo(0, 0)
  }, [location])

  return (
    <>
      <SiteNav name={profile?.name ?? null} email={profile?.email ?? null} />
      <main>
        <Routes>
          <Route
            path="/"
            element={<HomePage profile={profile} projects={projects} articles={articles} />}
          />
          <Route path="/project/:id" element={<ProjectDetailPage />} />
          <Route
            path="/article/:id"
            element={<ArticleDetailPage profile={profile} articles={articles} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <SiteFooter name={profile?.name ?? null} />
    </>
  )
}
