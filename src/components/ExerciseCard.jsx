import { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, Check, Trash2, TrendingUp, Zap, Circle, CheckCircle2, Info, ArrowUp, Minus } from 'lucide-react'
import { getYouTubeSearchUrl, estimateOneRepMax } from '../data/workoutPlan'
import MuscleMap from './MuscleMap'

export default function ExerciseCard({
  exercise,
  prevSets,
  currentSets,
  onSetComplete,
  onSetUpdate,
  isExpanded,
  onToggleExpand,
  onShowHistory,
  onDelete,
  editMode,
  onSwap,
  onAddAfter,
}) {
  const { name, sets, reps, rest, muscles, cues, videoSearch, note, isCardio, isTime, duration, alternatives } = exercise
  const [showInfo, setShowInfo] = useState(false)

  const completedCount = currentSets.filter(s => s.completed).length
  const allDone = completedCount === (isCardio ? 1 : sets)
  const progress = sets > 0 ? completedCount / sets : 0

  // Progressive overload: what did we actually complete last time, and should we go heavier?
  const prevDone = (prevSets ?? []).filter(s => s.completed)
  let overloadTip = null
  if (!isCardio && !isTime && prevDone.length > 0) {
    const topWeight = Math.max(...prevDone.map(s => s.weight || 0))
    const hitAllReps = reps > 0 && prevDone.length >= sets && prevDone.every(s => (s.reps || 0) >= reps)
    if (topWeight > 0 && hitAllReps) {
      overloadTip = `You hit all your reps last time — try ${topWeight + 2.5} kg today`
    }
  }

  // Best estimated 1-rep max from completed sets this session (Epley).
  const best1RM = (!isCardio && !isTime)
    ? currentSets.reduce((best, s) => s.completed ? Math.max(best, estimateOneRepMax(s.weight, s.reps)) : best, 0)
    : 0

  const hasInfo = muscles?.length > 0 || cues?.length > 0 || !!videoSearch || alternatives?.length > 0

  const handleSetToggle = (idx) => {
    const wasCompleted = currentSets[idx].completed
    onSetComplete(idx, !wasCompleted)
    // Rest timer is NOT auto-started — user must tap the timer button
  }

  return (
    <div className={`rounded-2xl border transition-colors ${
      allDone ? 'bg-gray-800/60 border-green-500/30' : 'bg-gray-800/80 border-gray-700/50'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-2 p-4">
        <button
          className="flex items-center gap-3 flex-1 text-left active:opacity-80 min-w-0"
          onClick={onToggleExpand}
        >
          {allDone
            ? <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
            : <Circle size={20} className="text-gray-600 flex-shrink-0" />
          }

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className={`font-semibold text-base leading-tight truncate ${allDone ? 'text-gray-400 line-through decoration-gray-600' : 'text-white'}`}>
                {name}
              </h3>
              <span className="text-sm text-gray-500 flex-shrink-0 tabular-nums">{completedCount}/{isCardio ? 1 : sets}</span>
            </div>
            <p className="flex items-center gap-1.5 flex-wrap text-gray-500 text-sm mt-1">
              <span>
                {isCardio ? `${duration} min` : isTime ? `${sets}×${duration}s` : `${sets}×${reps}`}
                {rest > 0 ? ` · ${rest}s rest` : ''}
              </span>
              {note && <span className="text-xs text-gray-500 bg-gray-700/60 px-1.5 py-0.5 rounded">{note}</span>}
            </p>
          </div>

          {isExpanded
            ? <ChevronUp size={16} className="text-gray-700 flex-shrink-0" />
            : <ChevronDown size={16} className="text-gray-700 flex-shrink-0" />
          }
        </button>

        {editMode && onDelete && (
          <button
            onClick={onDelete}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/10 text-red-400 active:bg-red-500/20 flex-shrink-0"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Progress bar */}
      {sets > 0 && (
        <div className="h-0.5 mx-4 mb-1 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${allDone ? 'bg-green-500' : 'bg-orange-500'}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-3 space-y-4 border-t border-gray-800 animate-slide-up">

          {/* Last time / progressive overload */}
          {!isCardio && prevDone.length > 0 && (
            <div>
              <div className="flex items-baseline justify-between">
                <p className="text-sm text-gray-500">
                  Last time{' '}
                  <span className="text-gray-300 font-mono">
                    {isTime
                      ? prevDone.map(s => `${s.duration || 0}s`).join('  ')
                      : prevDone.map(s => `${s.weight || 0}×${s.reps || 0}`).join('  ')}
                  </span>
                </p>
                {onShowHistory && (
                  <button
                    onClick={() => onShowHistory(exercise.id, name)}
                    className="text-xs text-gray-600 active:text-gray-400"
                  >
                    All history
                  </button>
                )}
              </div>
              {overloadTip && (
                <p className="flex items-center gap-1 text-sm text-orange-400 mt-1 font-medium">
                  <TrendingUp size={13} /> {overloadTip}
                </p>
              )}
            </div>
          )}

          {/* Set tracking */}
          {!isCardio && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                <span>Set</span>
                <div className="flex gap-8 mr-9">
                  <span>kg</span>
                  <span>reps</span>
                </div>
              </div>

              {currentSets.map((set, idx) => {
                const prev = prevSets?.[idx]
                return (
                  <div key={idx} className="space-y-1.5">
                    <SetRow
                      idx={idx}
                      set={set}
                      prev={prev}
                      isTime={isTime}
                      duration={duration}
                      onToggle={() => handleSetToggle(idx)}
                      onUpdate={(field, val) => onSetUpdate(idx, field, val)}
                    />
                    {set.completed && !isTime && (
                      <>
                        {(set.drops || []).map((drop, di) => (
                          <DropRow
                            key={di}
                            drop={drop}
                            onChange={(field, val) => {
                              const drops = [...(set.drops || [])]
                              drops[di] = { ...drops[di], [field]: val }
                              onSetUpdate(idx, 'drops', drops)
                            }}
                            onRemove={() => {
                              const drops = (set.drops || []).filter((_, i) => i !== di)
                              onSetUpdate(idx, 'drops', drops.length ? drops : undefined)
                            }}
                          />
                        ))}
                        <button
                          onClick={() => {
                            const lastWeight = set.drops?.length
                              ? set.drops[set.drops.length - 1].weight
                              : set.weight || 0
                            const dropWeight = Math.round((lastWeight * 0.7) / 2.5) * 2.5
                            const drops = [...(set.drops || []), { weight: dropWeight, reps: set.reps || 0 }]
                            onSetUpdate(idx, 'drops', drops)
                          }}
                          className="flex items-center gap-1 text-xs text-amber-500/70 active:text-amber-400 py-1 pl-6"
                        >
                          + Drop
                        </button>
                      </>
                    )}
                  </div>
                )
              })}

              {best1RM > 0 && (
                <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-gray-500">
                  <Zap size={12} className="text-orange-400" />
                  Est. 1RM <span className="text-gray-300 font-mono font-semibold">~{Math.round(best1RM * 2) / 2} kg</span>
                </div>
              )}
            </div>
          )}

          {isCardio && (
            <div className="bg-gray-900/60 rounded-xl p-3">
              <p className="text-sm text-gray-300">
                Target: <span className="text-white font-medium">{duration} minutes</span>
              </p>
              {cues?.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">{cues[0]}</p>
              )}
            </div>
          )}

          {/* Info: muscle map, form cues, video, alternatives */}
          {hasInfo && (
            <div className="border-t border-gray-800 pt-3">
              <button
                onClick={() => setShowInfo(s => !s)}
                className="w-full flex items-center justify-between text-sm text-gray-500 active:text-gray-400"
              >
                <span className="flex items-center gap-1.5"><Info size={14} /> Form, video & alternatives</span>
                <ChevronDown size={14} className={`transition-transform ${showInfo ? 'rotate-180' : ''}`} />
              </button>

              {showInfo && (
                <div className="space-y-3 mt-3">
                  {muscles?.length > 0 && (
                    <div className="bg-gray-900/60 rounded-xl p-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Muscles</p>
                      <MuscleMap muscles={muscles} />
                    </div>
                  )}

                  {cues?.length > 0 && (
                    <div className="bg-gray-900/60 rounded-xl p-3 space-y-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Form Cues</p>
                      {cues.map((cue, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-orange-500 text-xs font-bold mt-0.5 flex-shrink-0">{i + 1}.</span>
                          <p className="text-gray-300 text-sm leading-relaxed">{cue}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {videoSearch && (
                    <a
                      href={getYouTubeSearchUrl(videoSearch)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium active:bg-red-500/20"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-red-500 flex-shrink-0">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                      Watch Form Demo on YouTube
                      <ExternalLink size={13} className="ml-auto" />
                    </a>
                  )}

                  {alternatives?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Alternatives</p>
                      {alternatives.map(alt => (
                        <div key={alt.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-900/80 border border-gray-700/40">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-200 truncate">{alt.name}</p>
                            <p className="text-xs text-gray-500">{alt.muscles.join(' · ')}</p>
                          </div>
                          {onSwap && (
                            <button
                              onClick={() => onSwap(alt)}
                              className="px-2.5 py-1.5 rounded-lg bg-orange-500/15 text-orange-400 text-xs font-semibold active:bg-orange-500/25 flex-shrink-0"
                            >
                              Swap
                            </button>
                          )}
                          {onAddAfter && (
                            <button
                              onClick={() => onAddAfter(alt)}
                              className="px-2.5 py-1.5 rounded-lg bg-gray-700 text-gray-300 text-xs font-semibold active:bg-gray-600 flex-shrink-0"
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function getDelta(set, prev, isTime) {
  if (!set.completed || !prev) return null
  if (isTime) {
    const cur = set.duration || 0
    const old = prev.duration || 0
    if (cur > old) return 'up'
    if (cur < old) return 'down'
    return 'same'
  }
  const cw = set.weight || 0, cr = set.reps || 0
  const pw = prev.weight || 0, pr = prev.reps || 0
  if (cw > pw || (cw === pw && cr > pr)) return 'up'
  if (cw < pw || (cw === pw && cr < pr)) return 'down'
  return 'same'
}

function DropRow({ drop, onChange, onRemove }) {
  return (
    <div className="flex items-center gap-2 ml-5 rounded-xl px-3 py-2 bg-amber-500/5 border border-amber-500/15">
      <span className="text-xs text-amber-500/60 font-medium">↳</span>
      <input
        type="number"
        inputMode="decimal"
        value={drop.weight || ''}
        placeholder="0"
        onChange={e => onChange('weight', parseFloat(e.target.value) || 0)}
        className="w-14 bg-gray-800 text-white text-center rounded-lg px-2 py-1.5 text-sm font-mono border border-gray-700 focus:border-amber-500 focus:outline-none placeholder:text-gray-600"
      />
      <span className="text-gray-600 text-xs">×</span>
      <input
        type="number"
        inputMode="numeric"
        value={drop.reps || ''}
        placeholder="0"
        onChange={e => onChange('reps', parseInt(e.target.value) || 0)}
        className="w-12 bg-gray-800 text-white text-center rounded-lg px-2 py-1.5 text-sm font-mono border border-gray-700 focus:border-amber-500 focus:outline-none placeholder:text-gray-600"
      />
      <button
        onClick={onRemove}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 active:text-red-400 flex-shrink-0 text-xs"
      >
        ✕
      </button>
    </div>
  )
}

function SetRow({ idx, set, prev, isTime, duration, onToggle, onUpdate }) {
  const delta = getDelta(set, prev, isTime)
  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors ${
      set.completed ? 'bg-green-500/10 border border-green-500/20' : 'bg-gray-900/60 border border-gray-700/40'
    }`}>
      <span className="w-5 text-center text-xs text-gray-500 font-medium">{idx + 1}</span>

      {isTime ? (
        <div className="flex-1 flex items-center gap-1.5">
          <input
            type="number"
            value={set.duration ?? duration}
            onChange={e => onUpdate('duration', Number(e.target.value))}
            className="w-16 bg-gray-800 text-white text-center rounded-lg px-2 py-1.5 text-sm font-mono border border-gray-700 focus:border-orange-500 focus:outline-none"
            min={1}
          />
          <span className="text-gray-500 text-xs">sec</span>
          {prev?.duration && (
            <span className="text-gray-600 text-xs ml-1">prev: {prev.duration}s</span>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={set.weight || ''}
            placeholder={prev?.weight ? String(prev.weight) : '0'}
            onChange={e => onUpdate('weight', parseFloat(e.target.value) || 0)}
            className="w-16 bg-gray-800 text-white text-center rounded-lg px-2 py-1.5 text-sm font-mono border border-gray-700 focus:border-orange-500 focus:outline-none placeholder:text-gray-600"
          />
          <span className="text-gray-600 text-xs">×</span>
          <input
            type="number"
            inputMode="numeric"
            value={set.reps || ''}
            placeholder={prev?.reps ? String(prev.reps) : '0'}
            onChange={e => onUpdate('reps', parseInt(e.target.value) || 0)}
            className="w-14 bg-gray-800 text-white text-center rounded-lg px-2 py-1.5 text-sm font-mono border border-gray-700 focus:border-orange-500 focus:outline-none placeholder:text-gray-600"
          />
        </div>
      )}

      <button
        onClick={onToggle}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
          set.completed ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-500 active:bg-gray-600'
        }`}
      >
        <Check size={16} strokeWidth={2.5} />
      </button>

      {delta === 'up' && <ArrowUp size={14} className="text-green-400 flex-shrink-0" />}
      {delta === 'same' && <Minus size={14} className="text-gray-600 flex-shrink-0" />}
    </div>
  )
}
