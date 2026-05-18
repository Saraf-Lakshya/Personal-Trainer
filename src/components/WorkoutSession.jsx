import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, CheckCircle, Timer, Zap, Plus, Pencil, X } from 'lucide-react'
import { SESSIONS, getSessionColor } from '../data/workoutPlan'
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

export default function WorkoutSession({ sessionKey, history, onComplete, onCancel }) {
  const session = SESSIONS[sessionKey]
  const colors = getSessionColor(sessionKey)

  // Phase: warmup → workout → cooldown
  const [phase, setPhase] = useState('warmup')

  // Modifiable exercise list (supports add/delete)
  const [exercises, setExercises] = useState(() => session.exercises)
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

  // Elapsed timer — only counts during workout phase
  const [elapsed, setElapsed] = useState(0)
  const workoutStartRef = useRef(null)

  useEffect(() => {
    if (phase !== 'workout') return
    workoutStartRef.current = Date.now()
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - workoutStartRef.current) / 1000))
    }, 1000)
    return () => clearInterval(t)
  }, [phase])

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

  const toggleSet = (exIdx, setIdx, completed) => {
    setExerciseStates(prev => prev.map((es, i) =>
      i !== exIdx ? es : {
        ...es,
        sets: es.sets.map((s, j) => j === setIdx ? { ...s, completed } : s),
      }
    ))
    if (completed) {
      const allExDone = exerciseStates[exIdx].sets
        .map((s, j) => j === setIdx ? { ...s, completed: true } : s)
        .every(s => s.completed)
      if (allExDone && exIdx < exercises.length - 1) {
        setTimeout(() => setExpandedIdx(exIdx + 1), 400)
      }
    }
  }

  const addCustomExercise = () => {
    if (!newExName.trim()) return
    const newEx = {
      id: `custom-${Date.now()}`,
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
  }

  const deleteExercise = (idx) => {
    setExercises(prev => prev.filter((_, i) => i !== idx))
    setExerciseStates(prev => prev.filter((_, i) => i !== idx))
    if (expandedIdx === idx) setExpandedIdx(-1)
    else if (expandedIdx > idx) setExpandedIdx(expandedIdx - 1)
  }

  const handleFinish = () => {
    const record = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      sessionKey,
      durationSeconds: elapsed,
      exercises: exercises.map((ex, i) => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: exerciseStates[i].sets,
      })),
    }
    // Store record and move to cooldown; onComplete called after cooldown
    setCooldownRecord(record)
    setPhase('cooldown')
  }

  const handleCooldownDone = () => {
    onComplete(cooldownRecord)
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

          {phase === 'workout' && (
            <>
              <div className="flex items-center gap-1.5 text-sm text-gray-400">
                <Timer size={14} />
                <span className="font-mono tabular-nums">{formatElapsed(elapsed)}</span>
              </div>
              <button
                onClick={() => setEditMode(m => !m)}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
                  editMode ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-800 text-gray-400 active:bg-gray-700'
                }`}
              >
                {editMode ? <X size={16} /> : <Pencil size={16} />}
              </button>
            </>
          )}
        </div>

        {/* Progress bar — only in workout phase */}
        {phase === 'workout' && (
          <>
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
          </>
        )}
      </div>

      {/* Warmup phase */}
      {phase === 'warmup' && (
        <WarmupCooldown phase="warmup" onDone={() => setPhase('workout')} />
      )}

      {/* Workout phase */}
      {phase === 'workout' && (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-36">
            {exercises.map((ex, i) => (
              <ExerciseCard
                key={ex.id}
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
              />
            ))}

            {/* Add exercise form (edit mode) */}
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

      {/* Cooldown phase */}
      {phase === 'cooldown' && (
        <WarmupCooldown phase="cooldown" onDone={handleCooldownDone} />
      )}

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
