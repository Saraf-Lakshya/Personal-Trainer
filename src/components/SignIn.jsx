import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function SignIn() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'reset'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const switchMode = (m) => { setMode(m); setError(null); setSuccessMsg(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.href.split('?')[0].split('#')[0],
      })
      if (error) setError(error.message)
      else setSuccessMsg('Password reset email sent — check your inbox, set a new password, then come back and sign in.')
    } else if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setSuccessMsg('Account created — you\'re signed in!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(
        error.message === 'Invalid login credentials'
          ? 'Wrong email or password.'
          : error.message
      )
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6">
      <div className="text-center mb-10">
        <div className="text-7xl mb-5">🏋️</div>
        <h1 className="text-3xl font-bold text-white">Personal Trainer</h1>
        <p className="text-gray-400 mt-2 text-sm">Your workouts, on every device</p>
      </div>

      {mode !== 'reset' && (
        <div className="flex w-full max-w-xs bg-gray-800 rounded-2xl p-1 mb-5">
          {['signin', 'signup'].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                mode === m ? 'bg-orange-500 text-white' : 'text-gray-400 active:text-gray-200'
              }`}
            >
              {m === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>
      )}

      {mode === 'reset' && (
        <div className="w-full max-w-xs mb-5">
          <button onClick={() => switchMode('signin')} className="text-gray-500 text-sm active:text-gray-300">
            ← Back to sign in
          </button>
          <p className="text-white font-semibold mt-2">Set a password</p>
          <p className="text-gray-400 text-sm mt-1">Enter your email and we'll send a password reset link.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-4 text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-none text-base"
        />
        {mode !== 'reset' && (
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-4 text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-none text-base"
          />
        )}
        <button
          type="submit"
          disabled={loading || !email || (mode !== 'reset' && !password)}
          className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl active:opacity-80 disabled:opacity-40 transition-opacity"
        >
          {loading ? '…' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Email'}
        </button>
      </form>

      {mode === 'signin' && !error && !successMsg && (
        <button
          onClick={() => switchMode('reset')}
          className="text-gray-500 text-sm mt-4 active:text-gray-300"
        >
          Forgot password / no password set?
        </button>
      )}

      {error && <p className="text-red-400 text-sm mt-4 text-center max-w-xs">{error}</p>}
      {successMsg && <p className="text-green-400 text-sm mt-4 text-center max-w-xs leading-relaxed">{successMsg}</p>}

      <p className="text-gray-600 text-xs mt-8 text-center max-w-xs leading-relaxed">
        Your data syncs across every device. Sign in once and stay logged in.
      </p>
    </div>
  )
}
