import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function buildPayload(exercises, exerciseStates) {
  return exercises.map((ex, i) => ({
    exerciseId: ex.id,
    exerciseName: ex.name,
    sets: exerciseStates[i]?.sets ?? [],
    def: {
      sets: ex.sets, reps: ex.reps, rest: ex.rest, duration: ex.duration,
      isCardio: ex.isCardio, isTime: ex.isTime,
      muscles: ex.muscles ?? [], cues: ex.cues ?? [],
      videoSearch: ex.videoSearch ?? null, note: ex.note ?? null,
      alternatives: ex.alternatives ?? [],
    },
  }))
}

export function useDraftSession(userId) {
  const [draftId, setDraftId] = useState(null)
  const timerRef = useRef(null)
  const latestRef = useRef(null)
  const enabledRef = useRef(true)

  const createDraft = useCallback(async (sessionKey, exercises, exerciseStates) => {
    if (!userId || !enabledRef.current) return null
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: userId,
          session_key: sessionKey,
          date: new Date().toISOString(),
          duration_seconds: 0,
          exercises: buildPayload(exercises, exerciseStates),
          status: 'draft',
        })
        .select('id')
        .single()
      if (error) throw error
      setDraftId(data.id)
      return data.id
    } catch (err) {
      console.warn('Draft not available:', err.message)
      enabledRef.current = false
      return null
    }
  }, [userId])

  const save = useCallback((exercises, exerciseStates, elapsed) => {
    if (!draftId || !enabledRef.current) return
    latestRef.current = { exercises, exerciseStates, elapsed }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      const s = latestRef.current
      if (!s) return
      latestRef.current = null
      const { error } = await supabase
        .from('sessions')
        .update({
          exercises: buildPayload(s.exercises, s.exerciseStates),
          duration_seconds: s.elapsed,
        })
        .eq('id', draftId)
        .eq('user_id', userId)
      if (error) console.warn('Draft save failed:', error.message)
    }, 1500)
  }, [draftId, userId])

  const flush = useCallback(async (exercises, exerciseStates, elapsed) => {
    if (!draftId || !enabledRef.current) return
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    latestRef.current = null
    const { error } = await supabase
      .from('sessions')
      .update({
        exercises: buildPayload(exercises, exerciseStates),
        duration_seconds: elapsed,
      })
      .eq('id', draftId)
      .eq('user_id', userId)
    if (error) console.warn('Draft flush failed:', error.message)
  }, [draftId, userId])

  const discard = useCallback(async (id) => {
    const target = id || draftId
    if (!target) return
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    await supabase.from('sessions').delete().eq('id', target).eq('user_id', userId)
    if (target === draftId) setDraftId(null)
  }, [draftId, userId])

  const resume = useCallback((id) => {
    setDraftId(id)
    enabledRef.current = true
  }, [])

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden' && draftId && latestRef.current) {
        const s = latestRef.current
        latestRef.current = null
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
        supabase.from('sessions').update({
          exercises: buildPayload(s.exercises, s.exerciseStates),
          duration_seconds: s.elapsed,
        }).eq('id', draftId).eq('user_id', userId)
      }
    }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [draftId, userId])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return { draftId, createDraft, save, flush, discard, resume }
}
