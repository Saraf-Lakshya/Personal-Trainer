import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  const handleSend = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.href.split('?')[0].split('#')[0],
      },
    })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-5">📬</div>
        <h2 className="text-xl font-bold text-white">Check your email</h2>
        <p className="text-gray-400 mt-2 text-sm">
          Magic link sent to <span className="text-white font-medium">{email}</span>
        </p>
        <p className="text-gray-600 text-xs mt-3">Tap the link in the email to sign in.</p>
        <button
          onClick={() => { setSent(false); setEmail('') }}
          className="text-gray-600 text-xs mt-10 active:text-gray-400"
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6">
      <div className="text-center mb-10">
        <div className="text-7xl mb-5">🏋️</div>
        <h1 className="text-3xl font-bold text-white">Personal Trainer</h1>
        <p className="text-gray-400 mt-2 text-sm">Your workouts, on every device</p>
      </div>

      <form onSubmit={handleSend} className="w-full max-w-xs space-y-3">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-4 text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-none text-base"
        />
        <button
          type="submit"
          disabled={loading || !email}
          className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl active:opacity-80 disabled:opacity-40 transition-opacity"
        >
          {loading ? 'Sending…' : 'Send magic link ✉️'}
        </button>
      </form>

      {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}

      <p className="text-gray-600 text-xs mt-8 text-center max-w-xs leading-relaxed">
        No password needed. We'll email you a one-tap sign-in link that works on any device.
      </p>
    </div>
  )
}
