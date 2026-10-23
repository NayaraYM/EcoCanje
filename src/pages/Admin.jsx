import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useWallet } from '../context/WalletContext.jsx'
import { ROLES, fmtDate, num } from '../lib/constants.js'

export default function Admin() {
  const { materials, rewards, deposits, redemptions, reload } = useWallet()
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [member, setMember] = useState(null)
  const [mid, setMid] = useState('')
  const [kg, setKg] = useState('')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const term = q.trim().replace(/[%,()]/g, '')
    if (term.length < 2) { setResults([]); return }
    const t = setTimeout(async () => {
      const { data } = await supabase.from('profiles').select('id, full_name, role, stall, member_code')
        .or(`full_name.ilike.%${term}%,member_code.ilike.%${term}%`).neq('role', 'admin').limit(6)
      setResults(data || [])
    }, 250)
    return () => clearTimeout(t)
  }, [q])

  const mat = materials.find((m) => String(m.id) === mid)
  const preview = mat && Number(kg) > 0 ? Math.round(Number(kg) * mat.points_per_kg) : null

  const register = async (e) => {
    e.preventDefault()
    if (!member) return setMsg({ type: 'err', text: 'Primero elige al socio que entrega.' })
    setBusy(true); setMsg(null)
    const { data, error } = await supabase.rpc('register_deposit', { p_code: member.member_code, p_material: Number(mid), p_kg: Number(kg) })
    setBusy(false)
    if (error) return setMsg({ type: 'err', text: error.message })
    setMsg({ type: 'ok', text: `Entrega registrada: ${data.points} EcoPuntos para ${member.full_name}.` })
    setKg(''); reload()
  }

  const deliver = async (id) => {
    await supabase.from('redemptions').update({ status: 'entregado' }).eq('id', id)
    reload()
  }
  const setStock = async (r, v) => {
    if (Number(v) === r.stock || Number(v) < 0) return
    await supabase.from('rewards').update({ stock: Number(v) }).eq('id', r.id)
    reload()
  }
  const pending = redemptions.filter((r) => r.status === 'pendiente')
  const totalKg = deposits.reduce((s, d) => s + Number(d.kg), 0)

  return (
    <section className="wrap pad">
      <h1>Panel del operador</h1>
      <p className="sub">Registra lo que entregan los socios en el punto EcoCanje y entrega los premios canjeados.</p>

      <div className="stats">
        <div className="stat main"><small>Residuos recibidos</small><b>{num(totalKg)} kg</b></div>
        <div className="stat"><small>Entregas registradas</small><b>{deposits.length}</b></div>
        <div className="stat"><small>Canjes por entregar</small><b>{pending.length}</b></div>
      </div>

      <div className="two">
        <form className="card form" onSubmit={register}>
          <h2>Registrar entrega</h2>
          <label>Buscar socio (nombre o código)
            <input value={member ? `${member.full_name} · ${member.member_code}` : q}
                   onChange={(e) => { setMember(null); setQ(e.target.value) }} placeholder="Ej. Rosa o EC-1A2B3C" />
          </label>
          {!member && results.length > 0 && (
            <ul className="results">
              {results.map((p) => (
                <li key={p.id}><button type="button" onClick={() => { setMember(p); setResults([]) }}>
                  <b>{p.full_name}</b> <span>{ROLES[p.role].short} · {p.member_code}</span>
                </button></li>
              ))}
            </ul>
          )}
          <label>Material
            <select required value={mid} onChange={(e) => setMid(e.target.value)}>
              <option value="">Elige el material</option>
              {materials.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.points_per_kg} pts/kg)</option>)}
            </select>
          </label>
          <label>Peso en kg
            <input type="number" required min="0.1" step="0.1" value={kg} onChange={(e) => setKg(e.target.value)} />
          </label>
          {preview !== null && <p className="preview">Se asignarán <b>{preview} EcoPuntos</b></p>}
          {msg && <p className={`msg ${msg.type}`} role="alert">{msg.text}</p>}
          <button className="btn" disabled={busy}>{busy ? 'Registrando…' : 'Registrar entrega'}</button>
        </form>

        <div className="card">
          <h2>Canjes por entregar</h2>
          {pending.length === 0 ? <p>No hay canjes pendientes.</p> : (
            <ul className="plain queue">
              {pending.map((r) => (
                <li key={r.id}>
                  <span>{r.rewards?.emoji} {r.rewards?.name}<small>{r.profiles?.full_name} · {r.profiles?.member_code}</small></span>
                  <button className="btn sm" onClick={() => deliver(r.id)}>Marcar entregado</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Últimas entregas</h2>
        <div className="scroll">
          <table>
            <thead><tr><th>Fecha</th><th>Socio</th><th>Material</th><th>Peso</th><th>EcoPuntos</th></tr></thead>
            <tbody>
              {deposits.slice(0, 10).map((d) => (
                <tr key={d.id}><td>{fmtDate(d.created_at)}</td><td>{d.profiles?.full_name}</td><td>{d.materials?.name}</td><td>{num(d.kg)} kg</td><td>+{d.points}</td></tr>
              ))}
              {deposits.length === 0 && <tr><td colSpan="5">Aún no hay entregas.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Stock de premios</h2>
        <div className="scroll">
          <table>
            <thead><tr><th>Premio</th><th>EcoPuntos</th><th>Stock</th></tr></thead>
            <tbody>
              {rewards.map((r) => (
                <tr key={r.id}>
                  <td>{r.emoji} {r.name}</td><td>{r.points}</td>
                  <td><input className="stock" type="number" min="0" defaultValue={r.stock} key={r.stock}
                             onBlur={(e) => setStock(r, e.target.value)} aria-label={`Stock de ${r.name}`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
