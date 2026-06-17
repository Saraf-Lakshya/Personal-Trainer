import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function fromDb(row) {
  return {
    id: row.id,
    date: row.date,
    sessionKey: row.session_key,
    durationSeconds: row.duration_seconds,
    exercises: row.exercises ?? [],
    rating: row.rating ?? null,
    status: row.status ?? 'complete',
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
  const [loadError, setLoadError] = useState(false)
  const [pendingDraft, setPendingDraft] = useState(null)

  const fetchSessions = useCallback(async () => {
    if (!userId) { setLoading(false); return }

    setLoading(true)
    setLoadError(false)
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) await new Promise(r => setTimeout(r, 1000 * attempt))
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: true })
        if (error) throw error
        const all = (data ?? []).map(fromDb)
        setSessions(all.filter(s => s.status !== 'draft'))
        const draft = [...all].reverse().find(s => s.status === 'draft')
        setPendingDraft(draft || null)
        setLoading(false)
        return
      } catch (err) {
        console.error(`Load sessions attempt ${attempt + 1} failed:`, err)
        if (attempt === 2) {
          setLoadError(true)
          setLoading(false)
        }
      }
    }
  }, [userId])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  const addSession = useCallback(async (record) => {
    const { data, error } = await supabase
      .from('sessions')
      .insert(toDb(record, userId))
      .select()
      .single()
    if (error) throw error
    let saved = fromDb(data)
    if (record.rating != null) {
      const { error: rErr } = await supabase
        .from('sessions')
        .update({ rating: record.rating })
        .eq('id', data.id)
        .eq('user_id', userId)
      if (rErr) console.warn('Could not save session rating (is the `rating` column present?)', rErr)
      else saved = { ...saved, rating: record.rating }
    }
    setSessions(prev => [...prev, saved])
  }, [userId])

  const completeDraft = useCallback(async (draftId, record) => {
    const { data, error } = await supabase
      .from('sessions')
      .update({
        status: 'complete',
        exercises: record.exercises,
        duration_seconds: record.durationSeconds,
        date: record.date,
      })
      .eq('id', draftId)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error
    let saved = fromDb(data)
    if (record.rating != null) {
      const { error: rErr } = await supabase
        .from('sessions')
        .update({ rating: record.rating })
        .eq('id', draftId)
        .eq('user_id', userId)
      if (!rErr) saved = { ...saved, rating: record.rating }
    }
    setSessions(prev => [...prev, saved])
    setPendingDraft(null)
  }, [userId])

  const discardDraft = useCallback(async (id) => {
    if (!id || !userId) return
    await supabase.from('sessions').delete().eq('id', id).eq('user_id', userId)
    setPendingDraft(prev => prev?.id === id ? null : prev)
  }, [userId])

  const deleteSession = useCallback(async (id) => {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (!error) setSessions(prev => prev.filter(s => s.id !== id))
  }, [userId])

  return {
    sessions, loading, loadError, addSession, deleteSession, refetch: fetchSessions,
    pendingDraft, completeDraft, discardDraft,
  }
}
