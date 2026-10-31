import { Link } from 'react-router-dom'
import { Arrow } from './Arrow'
import type { Profile } from '../types/profile'

interface ContactSectionProps {
  profile: Profile | null
}

export default function ContactSection({ profile }: ContactSectionProps) {
  return (
    <section className="cta reveal" id="contact" aria-label="联系">
      <p className="cta-kicker">Let&apos;s build something</p>
      <div className="cta-inner">
        <h2>
          有一个值得实现的想法？
          <br />
          我很乐意听听。
        </h2>
        <Link to={{ pathname: '/', hash: '#works' }}>
          先看看作品
          <Arrow diagonal />
        </Link>
      </div>
      {profile?.name && <p className="cta-sign">— {profile.name}</p>}
    </section>
  )
}
