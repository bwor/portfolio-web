import { Link } from 'react-router-dom'

interface SiteFooterProps {
  /** 未加载或后端不可用时为 null，此时只保留年份 */
  name: string | null
}

export default function SiteFooter({ name }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <p>© 2026{name ? ` ${name}` : ''}。Built with React & TypeScript.</p>
      <Link to={{ pathname: '/', hash: '#top' }}>返回顶部 ↑</Link>
    </footer>
  )
}
