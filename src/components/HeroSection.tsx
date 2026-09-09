import { PROFILE } from '../data/portfolio'

const META: { k: string; v: string }[] = [
  { k: 'Field', v: 'Front-End' },
  { k: 'Focus', v: 'Interaction' },
  { k: 'Index', v: '2026' },
]

export default function HeroSection() {
  return (
    <section className="hero" id="intro" aria-label="个人简介">
      <div className="wrap">
        <div>
          <h1 className="a1">{PROFILE.name}</h1>
          <p className="title a1">{PROFILE.title}</p>
          <p className="summary a1">{PROFILE.summary}</p>
        </div>
        <div className="meta up">
          {META.map((m) => (
            <div key={m.k}>
              <span className="up">{m.k}</span>
              <span>{m.v}</span>
            </div>
          ))}
        </div>
        <p className="chips a1">
          {PROFILE.skills.slice(0, 5).map((s) => (
            <span className="chip" key={s}>
              {s}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
