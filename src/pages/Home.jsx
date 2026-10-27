import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useWallet } from '../context/WalletContext.jsx'
import { STEPS, ROLES, num, soles } from '../lib/constants.js'
import { Bins, Stall, Icon } from '../components/Art.jsx'

// Boleta de pesaje: simula cuántos EcoPuntos da una entrega con los valores reales del catálogo
function Balanza() {
  const { materials, rewards } = useWallet()
  const [mid, setMid] = useState(null)
  const [kg, setKg] = useState(6)
  const m = materials.find((x) => x.id === mid) || materials.find((x) => /PET/i.test(x.name)) || materials[0]
  if (!m) return <div className="ticket"><p>Cargando balanza…</p></div>
  const pts = Math.round(kg * m.points_per_kg)
  const co2 = kg * m.co2_per_kg
  const valor = pts * 0.1
  const best = [...rewards].filter((r) => r.points <= pts).sort((a, b) => b.points - a.points)[0]
  const next = [...rewards].filter((r) => r.points > pts).sort((a, b) => a.points - b.points)[0]
  return (
    <div className="ticket" aria-label="Simulador de pesaje">
      <h2>Pesa tus residuos</h2>
      <label>Material
        <select value={m.id} onChange={(e) => setMid(Number(e.target.value))}>
          {materials.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
      </label>
      <label>Peso: <b>{num(kg)} kg</b>
        <input type="range" min="0.5" max="40" step="0.5" value={kg} onChange={(e) => setKg(Number(e.target.value))} />
      </label>
      <div className="ticket-total">
        <span className="big">{pts}</span>
        <span>EcoPuntos<br /><small>Valen unos {soles(valor)} en productos</small><br /><small>{num(co2)} kg de CO₂ evitados (estimado)</small></span>
      </div>
      <p className="ticket-note">
        {best ? <>Con esta entrega ya alcanzas {best.emoji} <b>{best.name}</b>.</> : next ? <>Te faltan {next.points - pts} puntos para {next.emoji} {next.name}.</> : null}
      </p>
    </div>
  )
}

export default function Home() {
  const { profile } = useAuth()
  const { rewards } = useWallet()
  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <h1>Tus residuos vuelven con valor</h1>
            <p className="lead">
              En el Mercado Modelo de Huancayo, separar cartón, botellas y restos de frutas y verduras ahora suma EcoPuntos.
              Los cambias por lejía, detergente, bolsas y otros productos que usas todos los días.
            </p>
            <div className="row">
              {profile ? (
                <Link className="btn" to={profile.role === 'admin' ? '/operador' : '/panel'}>Ir a mi cuenta</Link>
              ) : (
                <>
                  <Link className="btn" to="/acceso?modo=registro">Crear mi cuenta</Link>
                  <Link className="btn ghost" to="/acceso">Ya tengo cuenta</Link>
                </>
              )}
            </div>
            <Stall className="hero-art" />
          </div>
          <Balanza />
        </div>
      </section>

      <section className="wrap sec">
        <h2>Cómo funciona</h2>
        <p className="sub">Los residuos dejan de ser solo desecho y se convierten en recursos dentro de un sistema circular.</p>
        <ol className="steps">
          {STEPS.map(([t, ic, d], i) => (
            <li key={t}>
              <div className="step-ico"><Icon name={ic} size={44} /><span className="step-n">{i + 1}</span></div>
              <h3>{t}</h3><p>{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="band">
        <div className="wrap two">
          <div>
            <Bins className="band-art" />
            <h2>Qué recibimos</h2>
            <h3>Orgánicos aprovechables</h3>
            <ul className="plain"><li>Restos de frutas</li><li>Restos de verduras</li><li>Otros residuos vegetales aceptados</li></ul>
            <h3>Reciclables</h3>
            <ul className="plain"><li>Cartón limpio</li><li>Botellas PET</li><li>Plásticos valorizables</li><li>Latas</li></ul>
            <Link className="btn sm" to="/guia">Ver la guía para separar</Link>
          </div>
          <div>
            <h2>Para quién es</h2>
            {['comerciante', 'vendedor', 'comprador'].map((r) => (
              <div className="who-card" key={r}>
                <h3>{ROLES[r].label}</h3>
                <p>{{
                  comerciante: 'Entrega los residuos de tu puesto, acumula EcoPuntos y canjéalos por artículos de limpieza para tu negocio.',
                  vendedor: 'Un punto cercano y un proceso rápido, pensado para quien vende en la calle.',
                  comprador: 'Suma puntos en familia llevando tus residuos separados o apoyando campañas del mercado.',
                }[r]}</p>
              </div>
            ))}
            <figure className="photo">
              <img src="/img/mercado-modelo.jpg" alt="Fachada del Mercado Modelo de Huancayo" loading="lazy"
                   onError={(e) => { e.currentTarget.closest('figure').style.display = 'none' }} />
              <figcaption>Mercado Modelo de Huancayo</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="wrap sec">
        <h2>Premios que puedes canjear</h2>
        <p className="sub">Productos útiles y de bajo costo. El catálogo se actualiza según alianzas y disponibilidad.</p>
        <div className="grid">
          {rewards.slice(0, 6).map((r) => (
            <article className="card reward" key={r.id}>
              <span className="emoji" aria-hidden="true">{r.emoji}</span>
              <h3>{r.name}</h3>
              <p>{r.description}</p>
              <b className="pts">{r.points} EcoPuntos</b>
              {r.price != null && <small>Valor referencial {soles(r.price)}</small>}
            </article>
          ))}
        </div>
        <p><Link to="/premios">Ver el catálogo completo</Link></p>
      </section>
    </>
  )
}
