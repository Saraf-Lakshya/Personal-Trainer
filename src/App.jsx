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
import { useBodyWeight } from './hooks/useBodyWeight'
import { SESSION_META, getSessionColor } from './data/workoutPlan'

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
  const {
    sessions, loading, loadError, addSession, deleteSession, refetch,
    pendingDraft, completeDraft, discardDraft,
  } = useWorkoutData(user?.id)
  const { weights, logWeight } = useBodyWeight(user?.id)

  const [view, setView] = useState('dashboard')
  const [activeSessionKey, setActiveSessionKey] = useState(null)
  const [activeDraftData, setActiveDraftData] = useState(null)
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
    setActiveDraftData(null)
    setView('workout')
  }

  const handleResumeDraft = () => {
    setActiveSessionKey(pendingDraft.sessionKey)
    setActiveDraftData(pendingDraft)
    setView('workout')
  }

  const handleDiscardDraft = () => {
    discardDraft(pendingDraft.id)
  }

  const handleCompleteWorkout = async (record) => {
    const { _draftId, ...cleanRecord } = record
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) await new Promise(r => setTimeout(r, 1000 * attempt))
        if (_draftId) {
          await completeDraft(_draftId, cleanRecord)
        } else {
          await addSession(cleanRecord)
        }
        setFailedRecord(null)
        setActiveSessionKey(null)
        setActiveDraftData(null)
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
    setActiveDraftData(null)
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
          userId={user.id}
          draftData={activeDraftData}
        />
      ) : (
        <>
          {view === 'dashboard' && (
            <Dashboard
              history={sessions}
              user={user}
              weights={weights}
              onLogWeight={logWeight}
              onStartWorkout={handleStartWorkout}
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
            <ProgressView history={sessions} weights={weights} />
          )}
          <Navigation
            current={view === 'picker' ? 'workout' : view}
            onNavigate={handleNavigate}
            activeSession={!!activeSessionKey}
          />
        </>
      )}

      {pendingDraft && view !== 'workout' && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-gray-950/80 backdrop-blur-sm px-4 pb-8 animate-fade-in">
          <div className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${getSessionColor(pendingDraft.sessionKey).bg}`} />
              <p className="text-white font-semibold">Resume workout?</p>
            </div>
            <p className="text-gray-400 text-sm">
              You have an unfinished {SESSION_META[pendingDraft.sessionKey]?.label ?? 'workout'} session.
            </p>
            <div className="flex gap-2 mt-5">
              <button
                onClick={handleDiscardDraft}
                className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-200 font-semibold text-sm active:bg-gray-700"
              >
                Discard
              </button>
              <button
                onClick={handleResumeDraft}
                className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-semibold text-sm active:bg-orange-600"
              >
                Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
