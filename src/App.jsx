import { Routes, Route, Navigate } from 'react-router-dom'
import { configured } from './lib/supabase.js'
import { AuthProvider } from './context/AuthContext.jsx'
import { WalletProvider } from './context/WalletContext.jsx'
import Layout from './components/Layout.jsx'
import Protected from './components/Protected.jsx'
import SetupNotice from './components/SetupNotice.jsx'
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Rewards from './pages/Rewards.jsx'
import Impact from './pages/Impact.jsx'
import Family from './pages/Family.jsx'
import Guide from './pages/Guide.jsx'
import Schedule from './pages/Schedule.jsx'
import Admin from './pages/Admin.jsx'

const SOCIOS = ['comerciante', 'vendedor', 'comprador']

export default function App() {
  if (!configured) return <SetupNotice />
  return (
    <AuthProvider>
      <WalletProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="guia" element={<Guide />} />
            <Route path="horarios" element={<Schedule />} />
            <Route path="premios" element={<Rewards />} />
            <Route path="acceso" element={<Auth />} />
            <Route path="panel" element={<Protected roles={SOCIOS}><Dashboard /></Protected>} />
            <Route path="impacto" element={<Protected roles={SOCIOS}><Impact /></Protected>} />
            <Route path="familia" element={<Protected roles={['comprador']}><Family /></Protected>} />
            <Route path="operador" element={<Protected roles={['admin']}><Admin /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </WalletProvider>
    </AuthProvider>
  )
}
