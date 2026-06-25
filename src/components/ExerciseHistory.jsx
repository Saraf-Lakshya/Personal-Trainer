import { X } from 'lucide-react'
import { SESSION_META } from '../data/workoutPlan'

function formatDate(isoStr) {
  const d = new Date(isoStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ExerciseHistory({ exerciseId, exerciseName, history, onClose }) {
  const entries = []
  for (const session of history) {
    const match = session.exercises?.find(e => e.exerciseId === exerciseId)
    if (!match) continue
    const done = match.sets.filter(s => s.completed)
    if (!done.length) continue
    entries.push({
      date: session.date,
      sessionKey: session.sessionKey,
      sets: done,
    })
  }
  entries.reverse()

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-gray-950/90 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md max-h-[80vh] bg-gray-900 border-t border-gray-700 rounded-t-2xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-800">
          <h2 className="text-white font-semibold truncate">{exerciseName}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 active:text-gray-300">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {entries.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No previous sessions found.</p>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, i) => (
                <div key={i} className="border-b border-gray-800/60 last:border-0 pb-3 last:pb-0">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm text-gray-400">{formatDate(entry.date)}</p>
                    <p className="text-xs text-gray-600">{SESSION_META[entry.sessionKey]?.label}</p>
                  </div>
                  <p className="text-white font-mono text-sm mt-1">
                    {entry.sets.map((s, j) => {
                      let txt
                      if (s.duration > 0 && !s.weight) txt = `${s.duration}s`
                      else txt = `${s.weight || 0}×${s.reps || 0}`
                      if (s.drops?.length) txt += s.drops.map(d => ` → ${d.weight}×${d.reps}`).join('')
                      return txt
                    }).join('   ')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
