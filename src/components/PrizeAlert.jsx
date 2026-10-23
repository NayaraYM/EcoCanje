import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useWallet } from '../context/WalletContext.jsx'
import { CONTACT } from '../lib/constants.js'

// Alerta de premios alcanzados: avisa cuando el saldo ya alcanza para canjear algo
export default function PrizeAlert() {
  const { profile } = useAuth()
  const { affordable, balance } = useWallet()
  if (!profile || !affordable.length) return null
  const top = affordable[affordable.length - 1]
  const text = `Hola, soy ${profile.full_name} (${profile.member_code}). Tengo ${balance} EcoPuntos y quiero canjear: ${top.name}.`
  return (
    <div className="alert" role="status">
      <span className="alert-ico" aria-hidden="true">🏆</span>
      <div>
        <strong>¡Felicidades, {profile.full_name.split(' ')[0]}!</strong>
        <p>
          Ya tienes {balance} EcoPuntos. Puedes canjear {affordable.length === 1 ? 'un premio' : `${affordable.length} premios`},
          como {top.emoji} {top.name}.
        </p>
        <div className="row">
          <Link className="btn sm" to="/premios">Ver premios</Link>
          <a className="btn sm ghost" target="_blank" rel="noreferrer"
             href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`}>
            Avisar al punto por WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
