import { useState, useMemo } from 'react'
import { TrendingUp, Award, BarChart2, ChevronDown, Scale } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts'
import { ALL_TRACKABLE_EXERCISES } from '../data/workoutPlan'

function shortDate(isoStr) {
  const d = new Date(isoStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Weight dates are 'YYYY-MM-DD' — parse as local (not UTC) so the label doesn't shift a day.
function weightShortDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getExerciseData(history, exerciseId) {
  return history
    .filter(session => session.exercises?.some(e => e.exerciseId === exerciseId))
    .map(session => {
      const ex = session.exercises.find(e => e.exerciseId === exerciseId)
      const completedSets = ex.sets.filter(s => s.completed)
      if (!completedSets.length) return null
      const maxWeight = Math.max(...completedSets.map(s => s.weight || 0))
      const totalVolume = completedSets.reduce((a, s) => a + ((s.weight || 0) * (s.reps || 0)), 0)
      const avgReps = completedSets.reduce((a, s) => a + (s.reps || 0), 0) / completedSets.length
      return {
        date: shortDate(session.date),
        fullDate: session.date,
        maxWeight,
        totalVolume,
        avgReps: Math.round(avgReps * 10) / 10,
        setsCompleted: completedSets.length,
      }
    })
    .filter(Boolean)
}

function getWeeklyVolume(history) {
  const map = {}
  history.forEach(session => {
    const d = new Date(session.date)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1))
    weekStart.setHours(0, 0, 0, 0)
    const key = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const vol = (session.exercises || []).reduce((acc, ex) =>
      acc + ex.sets.filter(s => s.completed).reduce((a, s) => a + ((s.weight || 0) * (s.reps || 0)), 0), 0
    )
    map[key] = (map[key] || 0) + vol
  })
  return Object.entries(map).map(([week, volume]) => ({ week, volume })).slice(-8)
}

function getPRs(history) {
  const prs = {}
  history.forEach(session => {
    (session.exercises || []).forEach(ex => {
      ex.sets.filter(s => s.completed && s.weight > 0 && s.reps > 0).forEach(s => {
        if (!prs[ex.exerciseId] || s.weight > prs[ex.exerciseId].weight) {
          prs[ex.exerciseId] = { weight: s.weight, reps: s.reps, exerciseName: ex.exerciseName, date: session.date }
        }
      })
    })
  })
  return Object.values(prs).sort((a, b) => b.weight - a.weight)
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-mono font-semibold">
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(p.value % 1 === 0 ? 0 : 1) : p.value}
          {p.name === 'maxWeight' || p.name === 'totalVolume' || p.name === 'weight' ? ' kg' : ''}
        </p>
      ))}
    </div>
  )
}

export default function ProgressView({ history, weights = [] }) {
  const trackableExercises = ALL_TRACKABLE_EXERCISES.filter(ex => !ex.isCardio)
  const [selectedExercise, setSelectedExercise] = useState(trackableExercises[0]?.id ?? '')
  const [metric, setMetric] = useState('maxWeight')
  const [showPicker, setShowPicker] = useState(false)

  const exerciseData = useMemo(() =>
    getExerciseData(history, selectedExercise), [history, selectedExercise]
  )
  const weeklyVolume = useMemo(() => getWeeklyVolume(history), [history])
  const prs = useMemo(() => getPRs(history), [history])

  const selectedEx = trackableExercises.find(e => e.id === selectedExercise)

  const weightChart = useMemo(() => weights.map(w => ({ date: weightShortDate(w.date), weight: w.weight })), [weights])
  const weightStats = useMemo(() => {
    if (!weights.length) return null
    const vals = weights.map(w => w.weight)
    return {
      current: weights[weights.length - 1].weight,
      start: weights[0].weight,
      lowest: Math.min(...vals),
      change: Math.round((weights[weights.length - 1].weight - weights[0].weight) * 10) / 10,
    }
  }, [weights])

  if (!history.length && !weights.length) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 px-8 text-center">
        <TrendingUp size={48} className="text-gray-700" />
        <p className="text-gray-500">No data yet.</p>
        <p className="text-gray-600 text-sm">Complete workouts or log your weight to see progress here.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="px-5 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-white">Progress</h1>
        <p className="text-gray-500 text-sm mt-1">Track your gains session by session</p>
      </div>

      <div className="px-4 pb-32 space-y-6">

        {/* Body Weight */}
        {weightStats && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Scale size={15} className="text-blue-400" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Body Weight</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white tabular-nums">{weightStats.current}</span>
                    <span className="text-sm text-gray-500">kg</span>
                  </div>
                  {weightStats.change !== 0 && (
                    <p className={`text-xs font-medium mt-0.5 ${weightStats.change < 0 ? 'text-green-400' : 'text-orange-400'}`}>
                      {weightStats.change < 0 ? '▼' : '▲'} {Math.abs(weightStats.change)} kg since start
                    </p>
                  )}
                </div>
                <div className="text-right text-xs text-gray-500 space-y-0.5">
                  <p>Start: <span className="text-gray-400 font-mono">{weightStats.start} kg</span></p>
                  <p>Lowest: <span className="text-gray-400 font-mono">{weightStats.lowest} kg</span></p>
                </div>
              </div>

              {weightChart.length > 1 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={weightChart} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone" dataKey="weight" name="weight"
                      stroke="#60a5fa" strokeWidth={2.5}
                      dot={{ fill: '#60a5fa', strokeWidth: 0, r: 3 }}
                      activeDot={{ r: 6, fill: '#60a5fa' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-gray-600 text-center py-4">Log on more days to see your trend line.</p>
              )}
            </div>
          </section>
        )}

        {/* Personal Records */}
        {prs.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Award size={15} className="text-yellow-400" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Personal Records</p>
            </div>
            <div className="space-y-2">
              {prs.slice(0, 5).map((pr, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-900/50 border border-gray-800">
                  <span className="text-lg w-8 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{pr.exerciseName}</p>
                    <p className="text-xs text-gray-500">{shortDate(pr.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-yellow-400 font-mono">{pr.weight} kg</p>
                    <p className="text-xs text-gray-600">× {pr.reps} reps</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Weekly Volume */}
        {weeklyVolume.length > 1 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 size={15} className="text-blue-400" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Weekly Volume (kg)</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={weeklyVolume} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="volume" name="volume" radius={[4, 4, 0, 0]}>
                    {weeklyVolume.map((_, i) => (
                      <Cell key={i} fill={i === weeklyVolume.length - 1 ? '#f97316' : '#374151'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Exercise progress chart */}
        {exerciseData.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={15} className="text-orange-400" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Exercise Progress</p>
            </div>

            {/* Exercise picker */}
            <div className="relative mb-3">
              <button
                onClick={() => setShowPicker(p => !p)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white active:border-gray-700"
              >
                <span className="truncate">{selectedEx?.name ?? 'Select exercise'}</span>
                <ChevronDown size={16} className="text-gray-500 flex-shrink-0 ml-2" />
              </button>

              {showPicker && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-2xl max-h-64 overflow-y-auto">
                  {trackableExercises.map(ex => (
                    <button
                      key={ex.id}
                      onClick={() => { setSelectedExercise(ex.id); setShowPicker(false) }}
                      className={`w-full px-4 py-3 text-left text-sm border-b border-gray-800 last:border-0 active:bg-gray-800 ${
                        ex.id === selectedExercise ? 'text-orange-400 bg-orange-500/5' : 'text-gray-300'
                      }`}
                    >
                      {ex.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Metric toggle */}
            <div className="flex gap-2 mb-3">
              {[
                { key: 'maxWeight', label: 'Max Weight' },
                { key: 'totalVolume', label: 'Volume' },
              ].map(m => (
                <button
                  key={m.key}
                  onClick={() => setMetric(m.key)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                    metric === m.key ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-500 active:bg-gray-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={exerciseData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey={metric}
                    name={metric}
                    stroke="#f97316"
                    strokeWidth={2.5}
                    dot={{ fill: '#f97316', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: '#f97316' }}
                  />
                </LineChart>
              </ResponsiveContainer>

              {exerciseData.length < 2 && (
                <p className="text-xs text-gray-600 text-center mt-2">Log more sessions to see trends</p>
              )}
            </div>

            {/* Last 3 sessions for this exercise */}
            {exerciseData.length > 0 && (
              <div className="mt-3 space-y-2">
                {exerciseData.slice(-3).reverse().map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-900/50 border border-gray-800 rounded-xl">
                    <p className="text-sm text-gray-400">{d.date}</p>
                    <div className="flex gap-4 text-xs font-mono">
                      <span className="text-white">{d.maxWeight} kg</span>
                      <span className="text-gray-500">{d.avgReps} avg reps</span>
                      <span className="text-gray-600">{d.setsCompleted} sets</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
