import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useWallet } from '../context/WalletContext.jsx'
import PrizeAlert from '../components/PrizeAlert.jsx'
import { fmtDate, soles } from '../lib/constants.js'

export default function Rewards() {
  const { profile } = useAuth()
  const { rewards, balance, redemptions, reload } = useWallet()
  const [busy, setBusy] = useState(null)
  const [msg, setMsg] = useState(null)
  const isSocio = profile && profile.role !== 'admin'
  const mine = redemptions.filter((r) => r.user_id === profile?.id)

  const redeem = async (r) => {
    if (!window.confirm(`¿Canjear ${r.points} EcoPuntos por ${r.name}?`)) return
    setBusy(r.id); setMsg(null)
    const { error } = await supabase.rpc('redeem_reward', { p_reward: r.id })
    setBusy(null)
    if (error) return setMsg({ type: 'err', text: error.message })
    setMsg({ type: 'ok', text: `Canje registrado: ${r.name}. Recógelo en el punto EcoCanje mostrando tu código ${profile.member_code}.` })
    reload()
  }

  return (
    <section className="wrap pad">
      <div className="head">
        <div>
          <h1>Premios</h1>
          <p className="sub">Productos útiles para tu puesto y tu hogar. El valor de los EcoPuntos y el catálogo se ajustan según costos y alianzas.</p>
        </div>
        {isSocio && <div className="code"><small>Tu saldo</small><b>{balance} EcoPuntos</b></div>}
      </div>

      {isSocio && <PrizeAlert />}
      {msg && <p className={`msg ${msg.type}`} role="alert">{msg.text}</p>}

      <div className="grid">
        {rewards.map((r) => {
          const can = isSocio && r.stock > 0 && balance >= r.points
          return (
            <article className="card reward" key={r.id}>
              <span className="emoji" aria-hidden="true">{r.emoji}</span>
              <h3>{r.name}</h3>
              <p>{r.description}</p>
              <b className="pts">{r.points} EcoPuntos</b>
              {r.price != null && <small>Valor referencial {soles(r.price)}</small>}
              <small>{r.stock > 0 ? `Quedan ${r.stock}` : 'Agotado'}</small>
              {!profile && <Link className="btn sm ghost" to="/acceso">Ingresa para canjear</Link>}
              {isSocio && (
                <button className="btn sm" disabled={!can || busy === r.id} onClick={() => redeem(r)}>
                  {r.stock <= 0 ? 'Agotado' : can ? 'Canjear' : `Te faltan ${r.points - balance}`}
                </button>
              )}
            </article>
          )
        })}
      </div>

      {isSocio && mine.length > 0 && (
        <div className="card">
          <h2>Mis canjes</h2>
          <div className="scroll">
            <table>
              <thead><tr><th>Fecha</th><th>Premio</th><th>EcoPuntos</th><th>Estado</th></tr></thead>
              <tbody>
                {mine.map((r) => (
                  <tr key={r.id}>
                    <td>{fmtDate(r.created_at)}</td><td>{r.rewards?.emoji} {r.rewards?.name}</td><td>-{r.points}</td>
                    <td><span className={`tag ${r.status}`}>{r.status === 'pendiente' ? 'Por recoger' : 'Entregado'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
