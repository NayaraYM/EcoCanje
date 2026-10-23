import { SCHEDULE, CONTACT } from '../lib/constants.js'

export default function Schedule() {
  return (
    <section className="wrap pad">
      <h1>Horarios</h1>
      <p className="sub">Punto EcoCanje en el {CONTACT.place}. Son horarios del piloto y pueden ajustarse según la demanda.</p>
      <div className="grid">
        {SCHEDULE.map((s) => (
          <article className="card" key={s.title}>
            <h2>{s.title}</h2>
            <p><b>{s.days}</b></p>
            <p>{s.hours}</p>
            <p><small>{s.note}</small></p>
          </article>
        ))}
      </div>
    </section>
  )
}
