import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useWallet } from '../context/WalletContext.jsx'

export default function Family() {
  const { profile, refreshProfile } = useAuth()
  const { deposits, balance, reload } = useWallet()
  const [fam, setFam] = useState(null)
  const [members, setMembers] = useState([])
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    if (!profile.family_id) { setFam(null); setMembers([]); return }
    supabase.from('families').select('*').eq('id', profile.family_id).maybeSingle().then(({ data }) => setFam(data))
    supabase.from('profiles').select('id, full_name, member_code').eq('family_id', profile.family_id).then(({ data }) => setMembers(data || []))
  }, [profile.family_id])

  const run = async (fn, args) => {
    setMsg(null)
    const { error } = await supabase.rpc(fn, args)
    if (error) return setMsg({ type: 'err', text: error.message })
    await refreshProfile(); await reload()
  }
  const ptsOf = (id) => deposits.filter((d) => d.user_id === id).reduce((s, d) => s + d.points, 0)

  return (
    <section className="wrap pad narrow">
      <h1>Mi familia</h1>
      <p className="sub">Los EcoPuntos de todos los miembros se suman en un solo saldo familiar que pueden canjear juntos.</p>
      {msg && <p className={`msg ${msg.type}`} role="alert">{msg.text}</p>}

      {!profile.family_id ? (
        <div className="two">
          <form className="card form" onSubmit={(e) => { e.preventDefault(); run('create_family', { p_name: name }) }}>
            <h2>Crear una familia</h2>
            <label>Nombre de la familia
              <input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Familia Quispe" />
            </label>
            <button className="btn">Crear familia</button>
          </form>
          <form className="card form" onSubmit={(e) => { e.preventDefault(); run('join_family', { p_code: code }) }}>
            <h2>Unirme con un código</h2>
            <label>Código de familia
              <input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ej. A1B2C3" />
            </label>
            <button className="btn">Unirme</button>
          </form>
        </div>
      ) : (
        <>
          <div className="stats">
            <div className="stat main"><small>{fam?.name || 'Tu familia'}</small><b>{balance}</b><span>EcoPuntos disponibles</span></div>
            <div className="stat"><small>Código para invitar</small><b>{fam?.code}</b></div>
          </div>
          <div className="card">
            <h2>Miembros</h2>
            <ul className="plain members">
              {members.map((m) => (
                <li key={m.id}><span>{m.full_name}{m.id === profile.id ? ' (tú)' : ''}</span><b>{ptsOf(m.id)} puntos aportados</b></li>
              ))}
            </ul>
            <p><small>Comparte el código con tu familia: lo ingresan en esta misma página después de crear su cuenta de comprador.</small></p>
            <button className="btn sm ghost" onClick={() => window.confirm('¿Salir de esta familia? Dejarás de compartir el saldo.') && run('leave_family')}>Salir de la familia</button>
          </div>
        </>
      )}
    </section>
  )
}
