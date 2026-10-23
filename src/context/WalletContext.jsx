import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from './AuthContext.jsx'

const Ctx = createContext(null)
export const useWallet = () => useContext(Ctx)

const empty = {
  balance: 0, earned: 0, spent: 0, family: false,
  materials: [], rewards: [], deposits: [], redemptions: [], loading: true,
}

// Carga catálogo (público) y, si hay sesión, saldo, entregas y canjes visibles para el usuario.
export function WalletProvider({ children }) {
  const { profile, loading: authLoading } = useAuth()
  const [w, setW] = useState(empty)

  const reload = useCallback(async () => {
    const [mat, rew] = await Promise.all([
      supabase.from('materials').select('*').eq('active', true).order('id'),
      supabase.from('rewards').select('*').eq('active', true).order('points').order('id'),
    ])
    let priv = {}
    if (profile) {
      const [bal, dep, red] = await Promise.all([
        supabase.rpc('my_balance'),
        supabase.from('deposits').select('*, materials(name, kind), profiles!deposits_user_id_fkey(full_name)').order('created_at', { ascending: false }),
        supabase.from('redemptions').select('*, rewards(name, emoji), profiles!redemptions_user_id_fkey(full_name, member_code)').order('created_at', { ascending: false }),
      ])
      priv = { ...(bal.data || {}), deposits: dep.data || [], redemptions: red.data || [] }
    }
    setW({ ...empty, materials: mat.data || [], rewards: rew.data || [], ...priv, loading: false })
  }, [profile])

  useEffect(() => {
    if (!authLoading) reload()
  }, [authLoading, reload])

  // Premios que el usuario ya puede canjear (de menor a mayor costo)
  const affordable = useMemo(
    () => w.rewards.filter((r) => r.stock > 0 && r.points <= w.balance).sort((a, b) => a.points - b.points),
    [w.rewards, w.balance]
  )

  return <Ctx.Provider value={{ ...w, affordable, reload }}>{children}</Ctx.Provider>
}
