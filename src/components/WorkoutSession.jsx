import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, CheckCircle, Timer, Zap } from 'lucide-react'
import { SESSIONS, getSessionColor } from '../data/workoutPlan'
import ExerciseCard from './ExerciseCard'
import RestTimer from './RestTimer'

function buildInitialSets(exercise) {
  if (exercise.isCardio) return [{ completed: false }]
  return Array.from({ length: exercise.sets }, () => ({
    weight: 0,
    reps: exercise.reps ?? 0,
    duration: exercise.duration ?? 0,
    completed: false,
  }))
}

export default function WorkoutSession({ sessionKey, history, onComplete, onCancel }) {
  const session = SESSIONS[sessionKey]
  const colors = getSessionColor(sessionKey)

  const [exerciseStates, setExerciseStates] = useState(() =>
    session.exercises.map(ex => ({ sets: buildInitialSets(ex) }))
  )
  const [expandedIdx, setExpandedIdx] = useState(0)
  const [restTimer, setRestTimer] = useState(null) // { duration }
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(Date.now())

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000)
    return () => clearInterval(t)
  }, [])

  const totalSets = session.exercises.reduce((acc, ex) => acc + (ex.isCardio ? 1 : ex.sets), 0)
  const completedSets = exerciseStates.reduce((acc, es) => acc + es.sets.filter(s => s.completed).length, 0)
  const progressPct = totalSets > 0 ? (completedSets / totalSets) * 100 : 0

  const getPrevSets = (exerciseId) => {
    const prevSession = [...history].reverse().find(h =>
      h.sessionKey === sessionKey && h.exercises?.some(e => e.exerciseId === exerciseId)
    )
    return prevSession?.exercises.find(e => e.exerciseId === exerciseId)?.sets ?? []
  }

  const updateSetField = (exIdx, setIdx, field, val) => {
    setExerciseStates(prev => {
      const next = prev.map((es, i) => {
        if (i !== exIdx) return es
        const newSets = es.sets.map((s, j) => j === setIdx ? { ...s, [field]: val } : s)
        return { ...es, sets: newSets }
      })
      return next
    })
  }

  const toggleSet = (exIdx, setIdx, completed) => {
    setExerciseStates(prev => {
      const next = prev.map((es, i) => {
        if (i !== exIdx) return es
        const newSets = es.sets.map((s, j) => j === setIdx ? { ...s, completed } : s)
        return { ...es, sets: newSets }
      })
      return next
    })
    if (completed) {
      const allExDone = exerciseStates[exIdx].sets
        .map((s, j) => j === setIdx ? { ...s, completed: true } : s)
        .every(s => s.completed)
      if (allExDone && exIdx < session.exercises.length - 1) {
        setTimeout(() => setExpandedIdx(exIdx + 1), 400)
      }
    }
  }

  const handleFinish = () => {
    const record = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      sessionKey,
      durationSeconds: elapsed,
      exercises: session.exercises.map((ex, i) => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: exerciseStates[i].sets,
      })),
    }
    onComplete(record)
  }

  const formatElapsed = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const allComplete = progressPct === 100

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className={`sticky top-0 z-30 bg-gray-950/95 backdrop-blur border-b border-gray-800`}>
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <button onClick={onCancel} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-800 active:bg-gray-700">
            <ArrowLeft size={18} className="text-gray-400" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.bg} text-white`}>
                Session {sessionKey}
              </span>
              <span className="font-semibold text-white">{session.label}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{session.muscles}</p>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-400">
            <Timer size={14} />
            <span className="font-mono tabular-nums">{formatElapsed(elapsed)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 mx-4 mb-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${allComplete ? 'bg-green-500' : 'bg-orange-500'}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between px-4 pb-3 text-xs text-gray-500">
          <span>{completedSets} / {totalSets} sets done</span>
          <span className={allComplete ? 'text-green-400 font-medium' : ''}>{Math.round(progressPct)}%</span>
        </div>
      </div>

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-36">
        {session.exercises.map((ex, i) => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            prevSets={getPrevSets(ex.id)}
            currentSets={exerciseStates[i].sets}
            isExpanded={expandedIdx === i}
            onToggleExpand={() => setExpandedIdx(expandedIdx === i ? -1 : i)}
            onSetComplete={(setIdx, completed) => toggleSet(i, setIdx, completed)}
            onSetUpdate={(setIdx, field, val) => updateSetField(i, setIdx, field, val)}
            onRestStart={(dur) => setRestTimer({ duration: dur })}
          />
        ))}
      </div>

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

      {/* Rest timer overlay */}
      {restTimer && (
        <RestTimer
          duration={restTimer.duration}
          onDone={() => setRestTimer(null)}
          onSkip={() => setRestTimer(null)}
        />
      )}
    </div>
  )
}
