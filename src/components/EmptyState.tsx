import styles from './EmptyState.module.css'

interface EmptyStateProps {
  title: string
  detail?: string
}

export default function EmptyState({ title, detail }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <p className={styles.big}>{title}</p>
      {detail && <p>{detail}</p>}
    </div>
  )
}
