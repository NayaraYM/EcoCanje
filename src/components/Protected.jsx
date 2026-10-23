import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Protected({ roles, children }) {
  const { session, profile, loading } = useAuth()
  if (loading) return <p className="wrap pad">Cargando…</p>
  if (!session) return <Navigate to="/acceso" replace />
  if (!profile) return <p className="wrap pad">Cargando tu perfil…</p>
  if (!roles.includes(profile.role)) {
    return <Navigate to={profile.role === 'admin' ? '/operador' : '/panel'} replace />
  }
  return children
}
