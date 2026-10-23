import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { ROLES } from '../lib/constants.js'

const errorEs = (m = '') => {
  if (m.includes('Invalid login')) return 'Correo o contraseña incorrectos.'
  if (m.includes('already registered')) return 'Ese correo ya tiene una cuenta. Prueba ingresando.'
  if (m.includes('Email not confirmed')) return 'Confirma tu correo antes de ingresar (revisa tu bandeja de entrada).'
  if (m.includes('at least')) return 'La contraseña debe tener al menos 6 caracteres.'
  if (m.includes('rate limit')) return 'Hiciste muchos intentos. Espera unos minutos y vuelve a probar.'
  return m
}

export default function Auth() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('modo') === 'registro' ? 'registro' : 'login')
  const [f, setF] = useState({ full_name: '', email: '', phone: '', password: '', role: 'comerciante', stall: '' })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const { profile } = useAuth()
  const nav = useNavigate()
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  useEffect(() => {
    if (profile) nav(profile.role === 'admin' ? '/operador' : '/panel', { replace: true })
  }, [profile, nav])

  const submit = async (e) => {
    e.preventDefault()
    setMsg(null)
    if (mode === 'registro' && f.phone && !/^9\d{8}$/.test(f.phone)) {
      return setMsg({ type: 'err', text: 'El celular debe tener 9 dígitos y empezar con 9.' })
    }
    setBusy(true)
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password })
      if (error) setMsg({ type: 'err', text: errorEs(error.message) })
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: f.email,
        password: f.password,
        options: { data: { full_name: f.full_name.trim(), role: f.role, stall: f.stall.trim(), phone: f.phone } },
      })
      if (error) setMsg({ type: 'err', text: errorEs(error.message) })
      else if (!data.session) setMsg({ type: 'ok', text: 'Cuenta creada. Revisa tu correo para confirmarla y luego ingresa.' })
    }
    setBusy(false)
  }

  const r = ROLES[f.role]
  return (
    <section className="wrap pad narrow">
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'on' : ''} onClick={() => setMode('login')}>Ingresar</button>
        <button role="tab" aria-selected={mode === 'registro'} className={mode === 'registro' ? 'on' : ''} onClick={() => setMode('registro')}>Crear cuenta</button>
      </div>
      <form className="card form" onSubmit={submit}>
        <h1>{mode === 'login' ? 'Ingresa a tu cuenta' : 'Crea tu cuenta EcoCanje'}</h1>

        {mode === 'registro' && (
          <>
            <fieldset className="roles">
              <legend>¿Cómo participas?</legend>
              {['comerciante', 'vendedor', 'comprador'].map((k) => (
                <label key={k} className={f.role === k ? 'pick on' : 'pick'}>
                  <input type="radio" name="role" value={k} checked={f.role === k} onChange={set('role')} />
                  <b>{ROLES[k].label}</b>
                  <span>{ROLES[k].hint}</span>
                </label>
              ))}
            </fieldset>
            <label>Nombre completo
              <input required minLength={3} value={f.full_name} onChange={set('full_name')} autoComplete="name" />
            </label>
            {r.stallLabel && (
              <label>{r.stallLabel}
                <input value={f.stall} onChange={set('stall')} />
              </label>
            )}
            <label>Celular (opcional, para avisos por WhatsApp)
              <input inputMode="numeric" maxLength={9} placeholder="9XXXXXXXX" value={f.phone} onChange={set('phone')} autoComplete="tel-national" />
            </label>
          </>
        )}

        <label>Correo electrónico
          <input type="email" required value={f.email} onChange={set('email')} autoComplete="email" />
        </label>
        <label>Contraseña
          <input type="password" required minLength={6} value={f.password} onChange={set('password')}
                 autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
        </label>

        {msg && <p className={`msg ${msg.type}`} role="alert">{msg.text}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Un momento…' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</button>
      </form>
    </section>
  )
}
