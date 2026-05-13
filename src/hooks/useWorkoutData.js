import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function fromDb(row) {
  return {
    id: row.id,
    date: row.date,
    sessionKey: row.session_key,
    durationSeconds: row.duration_seconds,
    exercises: row.exercises ?? [],
  }
}

function toDb(record, userId) {
  return {
    user_id: userId,
    date: record.date,
    session_key: record.sessionKey,
    duration_seconds: record.durationSeconds,
    exercises: record.exercises,
  }
}

export function useWorkoutData(userId) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }

    setLoading(true)
    supabase
      .from('sessions')
      .select('*')
      .order('date', { ascending: true })
      .then(({ data, error }) => {
        if (!error) setSessions((data ?? []).map(fromDb))
        setLoading(false)
      })
  }, [userId])

  const addSession = useCallback(async (record) => {
    const { data, error } = await supabase
      .from('sessions')
      .insert(toDb(record, userId))
      .select()
      .single()
    if (!error && data) setSessions(prev => [...prev, fromDb(data)])
  }, [userId])

  const deleteSession = useCallback(async (id) => {
    const { error } = await supabase.from('sessions').delete().eq('id', id)
    if (!error) setSessions(prev => prev.filter(s => s.id !== id))
  }, [userId])

  return { sessions, loading, addSession, deleteSession }
}
