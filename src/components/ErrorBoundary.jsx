import { Component } from 'react'

// Last-resort guard: if any screen crashes, show a way out instead of a blank
// page with no navigation. Reloading lands on the dashboard; an in-progress
// workout is kept as a draft and offered for resume.
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info?.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-5 px-8 text-center">
        <div className="text-5xl">⚠️</div>
        <div>
          <p className="text-white font-semibold">Something went wrong</p>
          <p className="text-gray-500 text-sm mt-1">Your saved workouts are safe. Reload to get back to the app.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-2xl bg-orange-500 text-white font-bold active:bg-orange-600"
        >
          Reload
        </button>
      </div>
    )
  }
}
