import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useWallet } from '../context/WalletContext.jsx'
import PrizeAlert from '../components/PrizeAlert.jsx'
import { ROLES, TIPS, fmtDate, num } from '../lib/constants.js'

export default function Dashboard() {
  const { profile } = useAuth()
  const w = useWallet()
  const next = w.rewards.filter((r) => r.points > w.balance).sort((a, b) => a.points - b.points)[0]
  const kg = w.deposits.reduce((s, d) => s + Number(d.kg), 0)
  const co2 = w.deposits.reduce((s, d) => s + Number(d.co2_kg), 0)
  const pending = w.redemptions.filter((r) => r.status === 'pendiente' && r.user_id === profile.id)

  return (
    <section className="wrap pad">
      <div className="head">
        <div>
          <h1>Hola, {profile.full_name.split(' ')[0]}</h1>
          <p className="sub">{ROLES[profile.role].label}{profile.stall ? ` · ${profile.stall}` : ''}</p>
        </div>
        <div className="code" title="Muéstralo en el punto EcoCanje">
          <small>Tu código de socio</small>
          <b>{profile.member_code}</b>
        </div>
      </div>

      <PrizeAlert />

      <div className="stats">
        <div className="stat main">
          <small>{w.family ? 'EcoPuntos de tu familia' : 'Tus EcoPuntos'}</small>
          <b>{w.balance}</b>
          <span>{w.earned} ganados · {w.spent} canjeados</span>
        </div>
        <div className="stat"><small>Residuos entregados</small><b>{num(kg)} kg</b></div>
        <div className="stat"><small>CO₂ evitado (estimado)</small><b>{num(co2)} kg</b></div>
        <div className="stat"><small>Entregas</small><b>{w.deposits.length}</b></div>
      </div>

      {next && (
        <div className="card progress">
          <p>Tu próximo premio: {next.emoji} <b>{next.name}</b> ({next.points} EcoPuntos)</p>
          <div className="bar" role="progressbar" aria-valuenow={w.balance} aria-valuemax={next.points}>
            <i style={{ width: `${Math.min(100, (w.balance / next.points) * 100)}%` }} />
          </div>
          <small>Te faltan {next.points - w.balance} EcoPuntos.</small>
        </div>
      )}

      {pending.length > 0 && (
        <div className="card">
          <h2>Canjes por recoger</h2>
          <ul className="plain">
            {pending.map((r) => <li key={r.id}>{r.rewards?.emoji} {r.rewards?.name}. Recógelo en el punto EcoCanje con tu código.</li>)}
          </ul>
        </div>
      )}

      {profile.role === 'comprador' && !w.family && (
        <div className="card note">
          <h2>Suma puntos en familia</h2>
          <p>Crea tu familia o únete con un código para juntar EcoPuntos entre todos.</p>
          <Link className="btn sm" to="/familia">Configurar mi familia</Link>
        </div>
      )}

      <div className="card">
        <h2>Mis últimas entregas</h2>
        {w.deposits.length === 0 ? (
          <p>Aún no tienes entregas. Lleva tus residuos separados al punto EcoCanje y muestra tu código de socio. <Link to="/guia">Ver cómo separar</Link></p>
        ) : (
          <div className="scroll">
            <table>
              <thead><tr><th>Fecha</th>{w.family && <th>Quién</th>}<th>Material</th><th>Peso</th><th>EcoPuntos</th></tr></thead>
              <tbody>
                {w.deposits.slice(0, 8).map((d) => (
                  <tr key={d.id}>
                    <td>{fmtDate(d.created_at)}</td>{w.family && <td>{d.profiles?.full_name}</td>}
                    <td>{d.materials?.name}</td><td>{num(d.kg)} kg</td><td>+{d.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Para separar mejor</h2>
        <ul className="plain">{TIPS.map((t) => <li key={t}>{t}</li>)}</ul>
      </div>
    </section>
  )
}
