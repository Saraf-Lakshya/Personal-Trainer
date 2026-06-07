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

function ErrorScreen({ onRetry, onSignOut }) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-5 px-8 text-center">
      <div className="text-5xl">📡</div>
      <div>
        <p className="text-white font-semibold">Couldn't load your workouts</p>
        <p className="text-gray-500 text-sm mt-1">Check your connection and try again — your data is safe.</p>
      </div>
      <button
        onClick={onRetry}
        className="px-6 py-3 rounded-2xl bg-orange-500 text-white font-bold active:bg-orange-600"
      >
        Retry
      </button>
      <button onClick={onSignOut} className="text-gray-600 text-sm active:text-gray-400">
        Sign out
      </button>
    </div>
  )
}

export default function App() {
  const { user, recoveryMode, signOut } = useAuth()
  const { sessions, loading, loadError, addSession, deleteSession, refetch } = useWorkoutData(user?.id)

  const [view, setView] = useState('dashboard')
  const [activeSessionKey, setActiveSessionKey] = useState(null)
  const [changingPassword, setChangingPassword] = useState(false)
  const [failedRecord, setFailedRecord] = useState(null)

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

  // Data failed to load after retries
  if (loadError) return <ErrorScreen onRetry={refetch} onSignOut={signOut} />

  const handleStartWorkout = (sessionKey) => {
    setActiveSessionKey(sessionKey)
    setView('workout')
  }

  const handleCompleteWorkout = async (record) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) await new Promise(r => setTimeout(r, 1000 * attempt))
        await addSession(record)
        setFailedRecord(null)
        setActiveSessionKey(null)
        setView('dashboard')
        return
      } catch (err) {
        console.error(`Save attempt ${attempt + 1} failed:`, err)
        if (attempt === 2) setFailedRecord(record)
      }
    }
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
          saveError={!!failedRecord}
          onRetrySave={failedRecord ? () => handleCompleteWorkout(failedRecord) : null}
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
