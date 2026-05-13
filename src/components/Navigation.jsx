import { Home, Dumbbell, History, TrendingUp } from 'lucide-react'

const TABS = [
  { id: 'dashboard', label: 'Home', Icon: Home },
  { id: 'workout', label: 'Workout', Icon: Dumbbell },
  { id: 'history', label: 'History', Icon: History },
  { id: 'progress', label: 'Progress', Icon: TrendingUp },
]

export default function Navigation({ current, onNavigate, activeSession }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur border-t border-gray-800 safe-bottom">
      <div className="flex">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = current === id
          const isWorkout = id === 'workout'
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                isActive ? 'text-orange-400' : 'text-gray-500 active:text-gray-300'
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                {isWorkout && activeSession && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-gray-900" />
                )}
              </div>
              <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'text-orange-400' : 'text-gray-500'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
