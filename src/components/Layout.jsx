import { useEffect, useState } from 'react'
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useWallet } from '../context/WalletContext.jsx'
import { ROLES, CONTACT } from '../lib/constants.js'
import Logo from './Logo.jsx'

const PUBLIC = [['/', 'Inicio'], ['/guia', 'Cómo separar'], ['/horarios', 'Horarios'], ['/premios', 'Premios']]

function menuFor(role) {
  if (role === 'admin') return [['/operador', 'Panel del operador'], ['/premios', 'Catálogo'], ['/guia', 'Cómo separar'], ['/horarios', 'Horarios']]
  if (role === 'comprador') return [['/panel', 'Mi cuenta'], ['/premios', 'Premios'], ['/impacto', 'Mi impacto'], ['/familia', 'Mi familia'], ['/guia', 'Cómo separar'], ['/horarios', 'Horarios']]
  if (role) return [['/panel', 'Mi cuenta'], ['/premios', 'Premios'], ['/impacto', 'Mi impacto'], ['/guia', 'Cómo separar'], ['/horarios', 'Horarios']]
  return PUBLIC
}

export default function Layout() {
  const { profile, signOut } = useAuth()
  const { affordable } = useWallet()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [pathname])
  const items = menuFor(profile?.role)

  return (
    <>
      <header className="nav">
        <div className="wrap nav-in">
          <Link to="/" aria-label="EcoCanje Huancayo, inicio"><Logo light /></Link>
          <button className="burger" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Abrir menú">
            <span /><span /><span />
          </button>
          <nav className={`links ${open ? 'open' : ''}`}>
            {items.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>
            ))}
            {profile ? (
              <div className="who">
                {profile.role !== 'admin' && affordable.length > 0 && (
                  <Link to="/premios" className="bell" title="Tienes premios disponibles">
                    🔔<i>{affordable.length}</i>
                  </Link>
                )}
                <span className="who-name">{profile.full_name.split(' ')[0]} <small>{ROLES[profile.role].short}</small></span>
                <button className="btn sm ghost-light" onClick={signOut}>Salir</button>
              </div>
            ) : (
              <Link className="btn sm" to="/acceso">Ingresar</Link>
            )}
          </nav>
        </div>
      </header>

      <main><Outlet /></main>

      <footer className="foot">
        <div className="wrap foot-grid">
          <div>
            <Logo light />
            <p>Separa tus residuos, acumula EcoPuntos y canjéalos por productos útiles. Un sistema de economía circular para el Mercado Modelo de Huancayo.</p>
          </div>
          <div>
            <h4>Navegar</h4>
            <ul>
              <li><Link to="/guia">Cómo separar</Link></li>
              <li><Link to="/horarios">Horarios del punto</Link></li>
              <li><Link to="/premios">Catálogo de premios</Link></li>
              <li><Link to={profile ? '/panel' : '/acceso'}>{profile ? 'Mi cuenta' : 'Crear mi cuenta'}</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contacto</h4>
            <ul>
              <li>{CONTACT.place}</li>
              <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
              <li><a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp {CONTACT.whatsappLabel}</a></li>
            </ul>
          </div>
        </div>
        <div className="wrap foot-bottom">© {new Date().getFullYear()} EcoCanje Huancayo. Tus residuos vuelven con valor.</div>
      </footer>
    </>
  )
}
