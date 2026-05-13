import { useState } from 'react'
import Dashboard from './components/Dashboard'
import WorkoutSession from './components/WorkoutSession'
import SessionPicker from './components/SessionPicker'
import HistoryView from './components/HistoryView'
import ProgressView from './components/ProgressView'
import Navigation from './components/Navigation'
import { useLocalStorage } from './hooks/useLocalStorage'

export default function App() {
  const [view, setView] = useState('dashboard')
  const [activeSessionKey, setActiveSessionKey] = useState(null)
  const [history, setHistory] = useLocalStorage('pt_sessions', [])

  const handleStartWorkout = (sessionKey) => {
    setActiveSessionKey(sessionKey)
    setView('workout')
  }

  const handleCompleteWorkout = (record) => {
    setHistory(prev => [...prev, record])
    setActiveSessionKey(null)
    setView('dashboard')
  }

  const handleCancelWorkout = () => {
    setActiveSessionKey(null)
    setView('picker')
  }

  const handleDeleteSession = (id) => {
    setHistory(prev => prev.filter(s => s.id !== id))
  }

  const handleNavigate = (newView) => {
    if (newView === 'workout') {
      if (activeSessionKey) {
        setView('workout')
      } else {
        setView('picker')
      }
      return
    }
    setView(newView)
  }

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      {view === 'workout' && activeSessionKey ? (
        <WorkoutSession
          sessionKey={activeSessionKey}
          history={history}
          onComplete={handleCompleteWorkout}
          onCancel={handleCancelWorkout}
        />
      ) : (
        <>
          {view === 'dashboard' && (
            <Dashboard
              history={history}
              onStartWorkout={handleStartWorkout}
              onNavigate={handleNavigate}
            />
          )}
          {(view === 'picker' || view === 'workout') && (
            <SessionPicker
              history={history}
              onStartWorkout={handleStartWorkout}
            />
          )}
          {view === 'history' && (
            <HistoryView history={history} onDelete={handleDeleteSession} />
          )}
          {view === 'progress' && (
            <ProgressView history={history} />
          )}
          <Navigation
            current={view === 'picker' ? 'workout' : view}
            onNavigate={handleNavigate}
            activeSession={!!activeSessionKey}
          />
        </>
      )}
    </div>
  )
}
