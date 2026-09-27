interface SiteFooterProps {
  /** 未加载或后端不可用时为 null，此时只保留年份 */
  name: string | null
}

export default function SiteFooter({ name }: SiteFooterProps) {
  return (
    <footer>
      <div className="wrap">
        <span>© 2026{name ? ` ${name}` : ''}</span>
        <span>END OF DOCUMENT</span>
      </div>
    </footer>
  )
}
