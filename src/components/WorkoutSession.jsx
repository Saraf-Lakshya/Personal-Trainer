import { useState, useEffect, useRef, useMemo } from 'react'
import { ArrowLeft, CheckCircle, Timer, Zap, Plus, Pencil, X, RotateCcw, ExternalLink, Trophy } from 'lucide-react'
import { SESSIONS, getSessionColor, RATINGS } from '../data/workoutPlan'
import ExerciseCard from './ExerciseCard'
import RestTimer from './RestTimer'
import WarmupCooldown from './WarmupCooldown'

function getPrevSets(exerciseId, sessionKey, history) {
  const prev = [...history].reverse().find(h =>
    h.sessionKey === sessionKey && h.exercises?.some(e => e.exerciseId === exerciseId)
  )
  return prev?.exercises.find(e => e.exerciseId === exerciseId)?.sets ?? []
}

function buildInitialSets(exercise, prevSets) {
  if (exercise.isCardio) return [{ completed: false }]
  return Array.from({ length: exercise.sets }, (_, i) => ({
    weight: prevSets?.[i]?.weight ?? 0,
    reps: exercise.reps ?? 0,
    duration: exercise.duration ?? 0,
    completed: false,
  }))
}

export default function WorkoutSession({ sessionKey, history, onComplete, onCancel, saveError, onRetrySave }) {
  const session = SESSIONS[sessionKey]
  const colors = getSessionColor(sessionKey)

  const [phase, setPhase] = useState(() => session.isHomeSession ? 'workout' : 'warmup')

  const [exercises, setExercises] = useState(() =>
    session.exercises.map(ex => ({ ...ex, uid: crypto.randomUUID() }))
  )
  const [exerciseStates, setExerciseStates] = useState(() =>
    session.exercises.map(ex => ({
      sets: buildInitialSets(ex, getPrevSets(ex.id, sessionKey, history)),
    }))
  )

  const [expandedIdx, setExpandedIdx] = useState(0)
  const [restTimer, setRestTimer] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [newExName, setNewExName] = useState('')
  const [newExSets, setNewExSets] = useState(3)
  const [newExReps, setNewExReps] = useState(10)
  const [cooldownRecord, setCooldownRecord] = useState(null)
  const cooldownRecordRef = useRef(null)
  const [confirmExit, setConfirmExit] = useState(false)
  const [showRating, setShowRating] = useState(false)
  const finishRecordRef = useRef(null)

  // Personal-record celebration
  const [prCelebration, setPrCelebration] = useState(null)
  const prTimerRef = useRef(null)
  const celebratedRef = useRef({})   // exerciseId -> heaviest weight already celebrated this session

  // Heaviest completed weight per exercise across all past sessions (the bar to beat)
  const historyPRs = useMemo(() => {
    const map = {}
    for (const sess of history) {
      for (const ex of sess.exercises ?? []) {
        for (const s of ex.sets) {
          if (s.completed && s.weight > 0 && s.reps > 0) {
            map[ex.exerciseId] = Math.max(map[ex.exerciseId] ?? 0, s.weight)
          }
        }
      }
    }
    return map
  }, [history])

  // Undo toast state
  const [pendingUndo, setPendingUndo] = useState(null) // { label, onUndo }
  const [undoSecsLeft, setUndoSecsLeft] = useState(0)
  const undoTimerRef = useRef(null)
  const undoTickRef = useRef(null)

  // Elapsed timer — only counts during workout phase; never reset once started
  const [elapsed, setElapsed] = useState(0)
  const workoutStartRef = useRef(null)

  useEffect(() => {
    if (phase !== 'workout') return
    // Only set the start time once — don't reset it if effect re-runs
    if (!workoutStartRef.current) workoutStartRef.current = Date.now()
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - workoutStartRef.current) / 1000))
    }, 1000)
    return () => clearInterval(t)
  }, [phase])

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
      if (undoTickRef.current) clearInterval(undoTickRef.current)
      if (prTimerRef.current) clearTimeout(prTimerRef.current)
    }
  }, [])

  const triggerUndo = (label, onUndo) => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    if (undoTickRef.current) clearInterval(undoTickRef.current)
    setPendingUndo({ label, onUndo })
    setUndoSecsLeft(5)
    undoTickRef.current = setInterval(() => {
      setUndoSecsLeft(s => Math.max(0, s - 1))
    }, 1000)
    undoTimerRef.current = setTimeout(() => {
      setPendingUndo(null)
      clearInterval(undoTickRef.current)
      undoTimerRef.current = null
      undoTickRef.current = null
    }, 5000)
  }

  const handleUndo = () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    if (undoTickRef.current) clearInterval(undoTickRef.current)
    undoTimerRef.current = null
    undoTickRef.current = null
    if (pendingUndo) pendingUndo.onUndo()
    setPendingUndo(null)
  }

  const totalSets = exercises.reduce((acc, ex) => acc + (ex.isCardio ? 1 : ex.sets), 0)
  const completedSets = exerciseStates.reduce((acc, es) => acc + es.sets.filter(s => s.completed).length, 0)
  const progressPct = totalSets > 0 ? (completedSets / totalSets) * 100 : 0
  const allComplete = progressPct === 100

  const updateSetField = (exIdx, setIdx, field, val) => {
    setExerciseStates(prev => prev.map((es, i) =>
      i !== exIdx ? es : {
        ...es,
        sets: es.sets.map((s, j) => j === setIdx ? { ...s, [field]: val } : s),
      }
    ))
  }

  // Celebrate when a completed set beats the heaviest weight ever done for this
  // exercise. Only fires if there's prior history to beat, and only on each new
  // session high (so heavier follow-up sets re-trigger, repeats don't).
  const maybeCelebratePR = (ex, set) => {
    if (!ex || !set || ex.isCardio || ex.isTime) return
    const w = set.weight || 0
    const r = set.reps || 0
    if (w <= 0 || r <= 0) return
    const histBest = historyPRs[ex.id] ?? 0
    if (histBest <= 0) return
    const bar = Math.max(histBest, celebratedRef.current[ex.id] ?? 0)
    if (w > bar) {
      celebratedRef.current[ex.id] = w
      setPrCelebration({ name: ex.name, weight: w, reps: r })
      if ('vibrate' in navigator) navigator.vibrate([40, 30, 80])
      if (prTimerRef.current) clearTimeout(prTimerRef.current)
      prTimerRef.current = setTimeout(() => setPrCelebration(null), 3800)
    }
  }

  // Fix: derive all-done check from the updated state inside the functional setter
  const toggleSet = (exIdx, setIdx, completed) => {
    setExerciseStates(prev => {
      const updated = prev.map((es, i) =>
        i !== exIdx ? es : {
          ...es,
          sets: es.sets.map((s, j) => j === setIdx ? { ...s, completed } : s),
        }
      )
      if (completed) {
        const allExDone = updated[exIdx].sets.every(s => s.completed)
        if (allExDone && exIdx < exercises.length - 1) {
          setTimeout(() => setExpandedIdx(exIdx + 1), 400)
        }
      }
      return updated
    })
    if (completed) maybeCelebratePR(exercises[exIdx], exerciseStates[exIdx]?.sets[setIdx])
  }

  const addCustomExercise = () => {
    if (!newExName.trim()) return
    const newEx = {
      id: `custom-${Date.now()}`,
      uid: crypto.randomUUID(),
      name: newExName.trim(),
      sets: newExSets,
      reps: newExReps,
      rest: 60,
      muscles: [],
      cues: [],
      videoSearch: null,
      isCustom: true,
    }
    setExercises(prev => [...prev, newEx])
    setExerciseStates(prev => [...prev, { sets: buildInitialSets(newEx, []) }])
    setNewExName('')
    setNewExSets(3)
    setNewExReps(10)
    triggerUndo(`Added "${newEx.name}"`, () => {
      setExercises(prev => prev.filter(e => e.id !== newEx.id))
      setExerciseStates(prev => prev.slice(0, -1))
    })
  }

  // When an exercise is chosen from `source`'s dropdown, give the chosen exercise
  // its own dropdown: the original (stripped of nesting) plus the remaining siblings,
  // so the user can keep swapping — or swap back — without needing the undo toast.
  const buildSwapAlternatives = (source, chosen) => {
    const { alternatives: srcAlts = [], uid, ...srcBase } = source
    return [srcBase, ...srcAlts.filter(a => a.id !== chosen.id)]
  }

  const handleSwapExercise = (idx, newExercise) => {
    const oldExercise = exercises[idx]
    const oldState = exerciseStates[idx]
    const swapped = {
      ...newExercise,
      uid: crypto.randomUUID(),
      alternatives: buildSwapAlternatives(oldExercise, newExercise),
    }
    const newState = { sets: buildInitialSets(swapped, getPrevSets(swapped.id, sessionKey, history)) }
    setExercises(prev => prev.map((ex, i) => i === idx ? swapped : ex))
    setExerciseStates(prev => prev.map((es, i) => i === idx ? newState : es))
    triggerUndo(`Swapped to "${newExercise.name}"`, () => {
      setExercises(prev => prev.map((ex, i) => i === idx ? oldExercise : ex))
      setExerciseStates(prev => prev.map((es, i) => i === idx ? oldState : es))
    })
  }

  const handleAddAfter = (idx, newExercise) => {
    const source = exercises[idx]
    const added = {
      ...newExercise,
      uid: crypto.randomUUID(),
      alternatives: buildSwapAlternatives(source, newExercise),
    }
    const newState = { sets: buildInitialSets(added, getPrevSets(added.id, sessionKey, history)) }
    setExercises(prev => [...prev.slice(0, idx + 1), added, ...prev.slice(idx + 1)])
    setExerciseStates(prev => [...prev.slice(0, idx + 1), newState, ...prev.slice(idx + 1)])
    triggerUndo(`Added "${newExercise.name}"`, () => {
      setExercises(prev => prev.filter((_, i) => i !== idx + 1))
      setExerciseStates(prev => prev.filter((_, i) => i !== idx + 1))
    })
  }

  const deleteExercise = (idx) => {
    const removedEx = exercises[idx]
    const removedState = exerciseStates[idx]
    setExercises(prev => prev.filter((_, i) => i !== idx))
    setExerciseStates(prev => prev.filter((_, i) => i !== idx))
    if (expandedIdx === idx) setExpandedIdx(-1)
    else if (expandedIdx > idx) setExpandedIdx(expandedIdx - 1)
    triggerUndo(`Removed "${removedEx.name}"`, () => {
      setExercises(prev => [...prev.slice(0, idx), removedEx, ...prev.slice(idx)])
      setExerciseStates(prev => [...prev.slice(0, idx), removedState, ...prev.slice(idx)])
      setExpandedIdx(idx)
    })
  }

  const handleFinish = () => {
    const record = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      sessionKey,
      durationSeconds: elapsed,
      exercises: session.isHomeSession
        ? []
        : exercises.map((ex, i) => ({
            exerciseId: ex.id,
            exerciseName: ex.name,
            sets: exerciseStates[i].sets,
          })),
    }
    if (session.isHomeSession) {
      finishRecordRef.current = record
      setShowRating(true)
    } else {
      cooldownRecordRef.current = record   // ref: never stale
      setCooldownRecord(record)            // state: drives UI (save error banner)
      setPhase('cooldown')
    }
  }

  const handleCooldownDone = () => {
    finishRecordRef.current = cooldownRecordRef.current
    setShowRating(true)
  }

  const submitRating = (rating) => {
    const rec = finishRecordRef.current
    setShowRating(false)
    onComplete(rating != null ? { ...rec, rating } : rec)
  }

  const formatElapsed = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gray-950/95 backdrop-blur border-b border-gray-800">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <button
            onClick={
              phase === 'cooldown'
                ? () => { cooldownRecordRef.current = null; setCooldownRecord(null); setPhase('workout') }
                : (phase === 'workout' && completedSets > 0)
                  ? () => setConfirmExit(true)
                  : onCancel
            }
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-800 active:bg-gray-700"
          >
            <ArrowLeft size={18} className="text-gray-400" />
          </button>
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colors.bg}`} />
            <span className="font-semibold text-white truncate">{session.label}</span>
          </div>

          {phase === 'workout' && !session.isHomeSession && (
            <>
              <div className="flex items-center gap-1.5 text-sm text-gray-400">
                <Timer size={14} />
                <span className="font-mono tabular-nums">{formatElapsed(elapsed)}</span>
              </div>
              <button
                onClick={() => setEditMode(m => !m)}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
                  editMode ? 'text-orange-400' : 'text-gray-500 active:text-gray-300'
                }`}
              >
                {editMode ? <X size={16} /> : <Pencil size={16} />}
              </button>
            </>
          )}
        </div>

        {phase === 'workout' && !session.isHomeSession && (
          <div className="h-1 mx-4 mb-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${allComplete ? 'bg-green-500' : 'bg-orange-500'}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </div>

      {prCelebration && (
        <div className="fixed top-4 inset-x-4 z-[80] flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 shadow-2xl shadow-orange-500/30 animate-slide-up">
          <Trophy size={22} className="text-white flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-white font-bold text-sm">New personal record! 🎉</p>
            <p className="text-white/90 text-xs truncate">{prCelebration.name} · {prCelebration.weight} kg × {prCelebration.reps}</p>
          </div>
        </div>
      )}

      {phase === 'warmup' && (
        <WarmupCooldown phase="warmup" onDone={() => setPhase('workout')} />
      )}

      {phase === 'workout' && session.isHomeSession && (
        <div className="flex-1 flex flex-col items-center justify-center gap-10 px-8 pb-20">
          <div className="text-center">
            <span className="text-6xl">{session.emoji}</span>
            <p className="text-gray-400 text-sm mt-4">Follow along with today's video</p>
            <p className="text-2xl font-bold text-white mt-1">{session.label}</p>
          </div>

          <a
            href={session.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-red-600 text-white font-bold text-lg active:bg-red-700 shadow-lg shadow-red-600/25"
          >
            <ExternalLink size={20} />
            Open on YouTube
          </a>

          <div className="flex flex-col items-center gap-1 text-gray-500">
            <Timer size={16} />
            <span className="font-mono text-3xl text-white mt-1">{formatElapsed(elapsed)}</span>
            <p className="text-xs text-gray-600">elapsed</p>
          </div>

          <button
            onClick={handleFinish}
            className="w-full py-4 rounded-2xl bg-green-500 text-white font-bold text-base flex items-center justify-center gap-2 active:bg-green-600 shadow-lg shadow-green-500/25"
          >
            <CheckCircle size={20} />
            Mark as Done
          </button>
        </div>
      )}

      {phase === 'workout' && !session.isHomeSession && (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-36">
            {exercises.map((ex, i) => (
              <ExerciseCard
                key={ex.uid}
                exercise={ex}
                prevSets={getPrevSets(ex.id, sessionKey, history)}
                currentSets={exerciseStates[i].sets}
                isExpanded={expandedIdx === i}
                onToggleExpand={() => setExpandedIdx(expandedIdx === i ? -1 : i)}
                onSetComplete={(setIdx, completed) => toggleSet(i, setIdx, completed)}
                onSetUpdate={(setIdx, field, val) => updateSetField(i, setIdx, field, val)}
                onRestStart={(dur) => setRestTimer({ duration: dur })}
                editMode={editMode}
                onDelete={editMode ? () => deleteExercise(i) : undefined}
                onSwap={(alt) => handleSwapExercise(i, alt)}
                onAddAfter={(alt) => handleAddAfter(i, alt)}
              />
            ))}

            {editMode && (
              <div className="rounded-2xl border border-dashed border-gray-600 bg-gray-900/40 p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Add Exercise</p>
                <input
                  type="text"
                  placeholder="Exercise name"
                  value={newExName}
                  onChange={e => setNewExName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-none text-sm"
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Sets</label>
                    <input
                      type="number"
                      value={newExSets}
                      onChange={e => setNewExSets(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-center font-mono focus:border-orange-500 focus:outline-none text-sm"
                      min={1}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Reps</label>
                    <input
                      type="number"
                      value={newExReps}
                      onChange={e => setNewExReps(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-center font-mono focus:border-orange-500 focus:outline-none text-sm"
                      min={1}
                    />
                  </div>
                </div>
                <button
                  onClick={addCustomExercise}
                  disabled={!newExName.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500/20 text-orange-400 font-semibold text-sm active:bg-orange-500/30 disabled:opacity-40"
                >
                  <Plus size={16} /> Add to Session
                </button>
              </div>
            )}
          </div>

          {/* Undo toast */}
          {pendingUndo && (
            <div className="fixed bottom-36 left-4 right-4 z-40 overflow-hidden rounded-2xl bg-gray-700 border border-gray-600 shadow-xl">
              <div
                className="h-0.5 bg-orange-500 transition-[width] duration-[950ms] ease-linear"
                style={{ width: `${undoSecsLeft * 20}%` }}
              />
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-white text-sm">{pendingUndo.label}</span>
                <button
                  onClick={handleUndo}
                  className="flex items-center gap-1.5 text-orange-400 font-semibold text-sm active:text-orange-300 ml-4"
                >
                  <RotateCcw size={13} />
                  Undo
                </button>
              </div>
            </div>
          )}

          {/* Finish button */}
          <div className="fixed bottom-20 left-4 right-4 z-30">
            <button
              onClick={handleFinish}
              className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
                allComplete
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/25 active:bg-green-600'
                  : 'bg-gray-800 text-gray-400 active:bg-gray-700'
              }`}
            >
              {allComplete
                ? <><CheckCircle size={20} /> Finish Workout</>
                : <><Zap size={18} /> Finish Early ({Math.round(progressPct)}%)</>
              }
            </button>
          </div>
        </>
      )}

      {phase === 'cooldown' && (
        <WarmupCooldown phase="cooldown" onDone={handleCooldownDone} />
      )}

      {restTimer && (
        <RestTimer
          duration={restTimer.duration}
          onDone={() => setRestTimer(null)}
          onSkip={() => setRestTimer(null)}
        />
      )}

      {showRating && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-950/90 backdrop-blur-sm px-6 animate-fade-in">
          <div className="w-full max-w-sm">
            <p className="text-white font-bold text-xl text-center">How did that feel?</p>
            <p className="text-gray-500 text-sm text-center mt-1">Logging this helps you spot your patterns.</p>
            <div className="flex justify-between gap-2 mt-7">
              {RATINGS.map(r => (
                <button
                  key={r.value}
                  onClick={() => submitRating(r.value)}
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-gray-900 border border-gray-800 active:bg-gray-800 active:scale-95 transition-transform"
                >
                  <span className="text-3xl">{r.emoji}</span>
                  <span className="text-[10px] text-gray-400 font-medium">{r.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => submitRating(null)}
              className="w-full text-gray-500 text-sm mt-6 py-2 active:text-gray-300"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {confirmExit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-950/80 backdrop-blur-sm px-8 animate-fade-in">
          <div className="w-full max-w-xs bg-gray-900 border border-gray-700 rounded-2xl p-5 shadow-2xl">
            <p className="text-white font-semibold text-center">Leave this workout?</p>
            <p className="text-gray-400 text-sm text-center mt-1">
              You've logged {completedSets} {completedSets === 1 ? 'set' : 'sets'}. They won't be saved if you leave now.
            </p>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setConfirmExit(false)}
                className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-200 font-semibold text-sm active:bg-gray-700"
              >
                Keep training
              </button>
              <button
                onClick={() => { setConfirmExit(false); onCancel() }}
                className="flex-1 py-3 rounded-xl bg-red-500/15 text-red-400 font-semibold text-sm active:bg-red-500/25"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {saveError && (
        <div className="fixed inset-x-4 bottom-24 z-50 bg-red-950 border border-red-500/40 rounded-2xl px-4 py-3 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-white text-sm font-semibold">Save failed</p>
            <p className="text-red-400 text-xs mt-0.5">Check your connection and retry</p>
          </div>
          <button
            onClick={onRetrySave}
            className="ml-4 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold active:bg-orange-600 flex-shrink-0"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}
