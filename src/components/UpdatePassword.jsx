import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setError("Passwords don't match."); return }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    // On success, USER_UPDATED fires → recoveryMode clears → app loads automatically
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6">
      <div className="text-center mb-10">
        <div className="text-7xl mb-5">🔑</div>
        <h1 className="text-2xl font-bold text-white">Set your password</h1>
        <p className="text-gray-400 mt-2 text-sm">Choose a password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
        <input
          type="password"
          required
          minLength={6}
          placeholder="New password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-4 text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-none text-base"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Confirm password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-4 text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-none text-base"
        />
        <button
          type="submit"
          disabled={loading || !password || !confirm}
          className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl active:opacity-80 disabled:opacity-40 transition-opacity"
        >
          {loading ? '…' : 'Set Password'}
        </button>
      </form>

      {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
    </div>
  )
}
