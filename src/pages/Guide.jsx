import { GUIDE, TIPS } from '../lib/constants.js'

export default function Guide() {
  return (
    <section className="wrap pad">
      <h1>Cómo separar tus residuos</h1>
      <p className="sub">Un residuo limpio y seco vale más. Revisa qué recibimos y qué no.</p>
      <div className="grid">
        {GUIDE.map((g) => (
          <article className="card" key={g.title}>
            <h2>{g.title}</h2>
            <h3 className="ok">Sí recibimos</h3>
            <ul className="plain">{g.yes.map((x) => <li key={x}>{x}</li>)}</ul>
            <h3 className="bad">No recibimos</h3>
            <ul className="plain">{g.no.map((x) => <li key={x}>{x}</li>)}</ul>
          </article>
        ))}
      </div>
      <div className="card">
        <h2>Consejos para tu puesto</h2>
        <ul className="plain">{TIPS.map((t) => <li key={t}>{t}</li>)}</ul>
      </div>
    </section>
  )
}
