import { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, Check, Clock, Timer, Trash2 } from 'lucide-react'
import { getYouTubeSearchUrl } from '../data/workoutPlan'
import MuscleMap from './MuscleMap'

export default function ExerciseCard({
  exercise,
  prevSets,
  currentSets,
  onSetComplete,
  onSetUpdate,
  isExpanded,
  onToggleExpand,
  onRestStart,
  onDelete,
  editMode,
  onSwap,
  onAddAfter,
}) {
  const { name, sets, reps, rest, muscles, cues, videoSearch, note, isCardio, isTime, duration, isCustom, alternatives } = exercise
  const [showAlts, setShowAlts] = useState(false)

  const completedCount = currentSets.filter(s => s.completed).length
  const allDone = completedCount === (isCardio ? 1 : sets)
  const progress = sets > 0 ? completedCount / sets : 0

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
      <div className="flex items-start gap-2 p-4">
        <button
          className="flex items-start gap-3 flex-1 text-left active:opacity-80"
          onClick={onToggleExpand}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5 ${
            allDone ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-300'
          }`}>
            {allDone
              ? <Check size={18} strokeWidth={2.5} className="text-green-400" />
              : <span className="text-xs">{completedCount}/{sets}</span>
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold text-base leading-tight ${allDone ? 'text-gray-400 line-through decoration-gray-600' : 'text-white'}`}>
                {name}
              </h3>
              {note && <span className="text-xs text-gray-500 bg-gray-700/60 px-1.5 py-0.5 rounded">{note}</span>}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-400 text-sm">
                {isCardio ? `${duration} min` : isTime ? `${sets}×${duration}s` : `${sets}×${reps}`}
              </span>
              {rest > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-gray-600">
                  <Clock size={10} /> {rest}s rest
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {muscles.slice(0, 2).map(m => (
                <span key={m} className="text-xs text-gray-500 bg-gray-700/40 px-1.5 py-0.5 rounded-full">{m}</span>
              ))}
            </div>
          </div>

          {isExpanded
            ? <ChevronUp size={18} className="text-gray-500 flex-shrink-0 mt-1" />
            : <ChevronDown size={18} className="text-gray-500 flex-shrink-0 mt-1" />
          }
        </button>

        {editMode && onDelete && (
          <button
            onClick={onDelete}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/10 text-red-400 active:bg-red-500/20 flex-shrink-0 mt-0.5"
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
        <div className="px-4 pb-4 space-y-4 animate-slide-up">

          {/* Muscle map */}
          {muscles?.length > 0 && !isCustom && (
            <div className="bg-gray-900/60 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Muscles</p>
              <MuscleMap muscles={muscles} />
            </div>
          )}

          {/* Form cues */}
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

          {/* Video link */}
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
                  <SetRow
                    key={idx}
                    idx={idx}
                    set={set}
                    prev={prev}
                    isTime={isTime}
                    duration={duration}
                    rest={rest}
                    onToggle={() => handleSetToggle(idx)}
                    onUpdate={(field, val) => onSetUpdate(idx, field, val)}
                    onRestStart={onRestStart}
                  />
                )
              })}
            </div>
          )}

          {isCardio && (
            <div className="bg-gray-900/60 rounded-xl p-3">
              <p className="text-sm text-gray-300">
                Target: <span className="text-white font-medium">{duration} minutes</span> at incline 8–12%, speed 3.5–4.5 km/h
              </p>
              <p className="text-xs text-gray-500 mt-1">Zone 2 — you should be able to hold a conversation</p>
            </div>
          )}

          {/* Alternatives */}
          {alternatives?.length > 0 && (
            <div className="border-t border-gray-700/40 pt-3">
              <button
                onClick={() => setShowAlts(s => !s)}
                className="w-full flex items-center justify-between py-1 text-xs text-gray-500 active:text-gray-400"
              >
                <span className="font-semibold uppercase tracking-wider">Alternatives</span>
                <ChevronDown size={14} className={`transition-transform ${showAlts ? 'rotate-180' : ''}`} />
              </button>
              {showAlts && (
                <div className="space-y-2 mt-2">
                  {alternatives.map(alt => (
                    <div key={alt.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-900/80 border border-gray-700/40">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{alt.name}</p>
                        <p className="text-xs text-gray-500">{alt.muscles.join(' · ')}</p>
                      </div>
                      {onSwap && (
                        <button
                          onClick={() => { onSwap(alt); setShowAlts(false) }}
                          className="px-2.5 py-1.5 rounded-lg bg-orange-500/15 text-orange-400 text-xs font-semibold active:bg-orange-500/25 flex-shrink-0"
                        >
                          Swap
                        </button>
                      )}
                      {onAddAfter && (
                        <button
                          onClick={() => { onAddAfter(alt); setShowAlts(false) }}
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
  )
}

function SetRow({ idx, set, prev, isTime, duration, rest, onToggle, onUpdate, onRestStart }) {
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

      {set.completed && rest > 0 && (
        <button
          onClick={() => onRestStart(rest)}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-orange-500/15 text-orange-400 active:bg-orange-500/30 flex-shrink-0"
          title="Start rest timer"
        >
          <Timer size={14} />
        </button>
      )}
    </div>
  )
}
