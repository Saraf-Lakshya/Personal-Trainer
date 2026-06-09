import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function fromDb(row) {
  return {
    id: row.id,
    date: row.date,        // 'YYYY-MM-DD' (local calendar day)
    weight: Number(row.weight),
  }
}

// Local calendar day as 'YYYY-MM-DD' (not UTC — so "today" matches the user's day)
export function localDateStr(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const byDateAsc = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)

export function useBodyWeight(userId) {
  const [weights, setWeights] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchWeights = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) await new Promise(r => setTimeout(r, 1000 * attempt))
        const { data, error } = await supabase
          .from('weights')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: true })
        if (error) throw error
        setWeights((data ?? []).map(fromDb))
        setLoading(false)
        return
      } catch (err) {
        console.error(`Load weights attempt ${attempt + 1} failed:`, err)
        // Weight tracking is secondary — never block the app. Leave it empty.
        if (attempt === 2) { setWeights([]); setLoading(false) }
      }
    }
  }, [userId])

  useEffect(() => { fetchWeights() }, [fetchWeights])

  // One entry per calendar day — logging again for the same day overwrites it.
  const logWeight = useCallback(async (weight, date = localDateStr()) => {
    const { data, error } = await supabase
      .from('weights')
      .upsert({ user_id: userId, date, weight }, { onConflict: 'user_id,date' })
      .select()
      .single()
    if (error) throw error
    const entry = fromDb(data)
    setWeights(prev => [...prev.filter(w => w.date !== entry.date), entry].sort(byDateAsc))
  }, [userId])

  const deleteWeight = useCallback(async (id) => {
    const { error } = await supabase
      .from('weights')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (!error) setWeights(prev => prev.filter(w => w.id !== id))
  }, [userId])

  return { weights, loading, logWeight, deleteWeight }
}
