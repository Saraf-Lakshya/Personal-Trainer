import { Play } from 'lucide-react'
import { SESSIONS, getSessionColor, getTodayScheduleInfo } from '../data/workoutPlan'

const SESSION_ORDER = ['A', 'B', 'C', 'D', 'E']

export default function SessionPicker({ history, onStartWorkout }) {
  const { weekType } = getTodayScheduleInfo()

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-white">What are we doing today?</h1>
        <span className="inline-block text-xs font-semibold bg-gray-800 text-gray-300 px-2.5 py-1 rounded-full border border-gray-700 mt-2">
          Week {weekType}
        </span>
      </div>

      <div className="px-4 pb-32 space-y-3">
        {SESSION_ORDER.map(key => {
          const s = SESSIONS[key]
          const c = getSessionColor(key)

          return (
            <button
              key={key}
              onClick={() => onStartWorkout(key)}
              className="w-full p-5 rounded-2xl border border-gray-800 bg-gray-900/50 text-left transition-colors active:opacity-80"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{s.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${c.bg} text-white`}>
                        Session {key}
                      </span>
                    </div>
                    <p className="font-bold text-white text-lg mt-0.5">{s.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.muscles}</p>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-800">
                  <Play size={18} fill="white" className="text-white ml-0.5" />
                </div>
              </div>

              <div className="flex gap-1.5 mt-3 flex-wrap">
                {s.isHomeSession
                  ? <span className="text-xs text-gray-500 bg-gray-800/80 px-2 py-0.5 rounded-full">🏠 Video workout · Mark done</span>
                  : <>
                      {s.exercises.slice(0, 4).map(ex => (
                        <span key={ex.id} className="text-xs text-gray-500 bg-gray-800/80 px-2 py-0.5 rounded-full">
                          {ex.name.split(' ').slice(0, 2).join(' ')}
                        </span>
                      ))}
                      {s.exercises.length > 4 && (
                        <span className="text-xs text-gray-600 px-2 py-0.5">+{s.exercises.length - 4}</span>
                      )}
                    </>
                }
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
