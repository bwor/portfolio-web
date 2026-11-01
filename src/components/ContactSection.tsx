import { Arrow } from './Arrow'
import type { Profile } from '../types/profile'

interface ContactSectionProps {
  profile: Profile | null
}

export default function ContactSection({ profile }: ContactSectionProps) {
  const email = profile?.email ?? null

  return (
    <section className="cta reveal" id="contact" aria-label="联系">
      <p className="cta-kicker">Let&apos;s build something</p>
      <div className="cta-inner">
        <h2>
          有一个值得实现的想法？
          <br />
          我很乐意听听。
        </h2>
        {email ? (
          <a href={`mailto:${email}`}>
            {email} <Arrow diagonal />
          </a>
        ) : (
          <a href="mailto:hello@linshu.me">
            hello@linshu.me <Arrow diagonal />
          </a>
        )}
      </div>
    </section>
  )
}
