import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(undefined)
  const [recoveryMode, setRecoveryMode] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true)
      } else if (event === 'USER_UPDATED' || event === 'SIGNED_OUT') {
        setRecoveryMode(false)
      }
      // SIGNED_IN fires right after PASSWORD_RECOVERY — intentionally not resetting here
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = () => supabase.auth.signOut()

  return { user, recoveryMode, signOut }
}
