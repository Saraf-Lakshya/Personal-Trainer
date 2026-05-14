import { useState } from 'react'
import Dashboard from './components/Dashboard'
import WorkoutSession from './components/WorkoutSession'
import SessionPicker from './components/SessionPicker'
import HistoryView from './components/HistoryView'
import ProgressView from './components/ProgressView'
import Navigation from './components/Navigation'
import SignIn from './components/SignIn'
import UpdatePassword from './components/UpdatePassword'
import { useAuth } from './hooks/useAuth'
import { useWorkoutData } from './hooks/useWorkoutData'

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="text-5xl">🏋️</div>
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )
}

export default function App() {
  const { user, recoveryMode, signOut } = useAuth()
  const { sessions, loading, addSession, deleteSession } = useWorkoutData(user?.id)

  const [view, setView] = useState('dashboard')
  const [activeSessionKey, setActiveSessionKey] = useState(null)
  const [changingPassword, setChangingPassword] = useState(false)

  // Still resolving auth state
  if (user === undefined) return <LoadingScreen />

  // Password reset link was clicked, or user chose to change password
  if (recoveryMode || changingPassword) return (
    <UpdatePassword onCancel={changingPassword ? () => setChangingPassword(false) : null} />
  )

  // Not signed in
  if (user === null) return <SignIn />

  // Signed in but data loading
  if (loading) return <LoadingScreen />

  const handleStartWorkout = (sessionKey) => {
    setActiveSessionKey(sessionKey)
    setView('workout')
  }

  const handleCompleteWorkout = async (record) => {
    await addSession(record)
    setActiveSessionKey(null)
    setView('dashboard')
  }

  const handleCancelWorkout = () => {
    setActiveSessionKey(null)
    setView('picker')
  }

  const handleNavigate = (newView) => {
    if (newView === 'workout') {
      setView(activeSessionKey ? 'workout' : 'picker')
      return
    }
    setView(newView)
  }

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      {view === 'workout' && activeSessionKey ? (
        <WorkoutSession
          sessionKey={activeSessionKey}
          history={sessions}
          onComplete={handleCompleteWorkout}
          onCancel={handleCancelWorkout}
        />
      ) : (
        <>
          {view === 'dashboard' && (
            <Dashboard
              history={sessions}
              user={user}
              onStartWorkout={handleStartWorkout}
              onNavigate={handleNavigate}
              onSignOut={signOut}
              onChangePassword={() => setChangingPassword(true)}
            />
          )}
          {(view === 'picker' || view === 'workout') && (
            <SessionPicker history={sessions} onStartWorkout={handleStartWorkout} />
          )}
          {view === 'history' && (
            <HistoryView history={sessions} onDelete={deleteSession} />
          )}
          {view === 'progress' && (
            <ProgressView history={sessions} />
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
