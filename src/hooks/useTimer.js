import { useState, useEffect, useRef, useCallback } from 'react'

export function useTimer(initialSeconds, onComplete) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const endTimeRef = useRef(null)   // absolute ms timestamp when timer reaches 0
  const intervalRef = useRef(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      return
    }

    const tick = () => {
      if (!endTimeRef.current) return
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000))
      setSeconds(remaining)
      if (remaining <= 0) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        setRunning(false)
        onCompleteRef.current?.()
      }
    }

    // Snap display immediately when app returns from background
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick()
    }

    intervalRef.current = setInterval(tick, 500)
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [running])

  const start = useCallback((overrideSecs) => {
    if (overrideSecs !== undefined) {
      endTimeRef.current = Date.now() + overrideSecs * 1000
      setSeconds(overrideSecs)
    }
    setRunning(true)
  }, [])

  const pause = useCallback(() => setRunning(false), [])

  const reset = useCallback((secs) => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    setRunning(false)
    endTimeRef.current = null
    setSeconds(secs ?? initialSeconds)
  }, [initialSeconds])

  const add = useCallback((delta) => {
    if (endTimeRef.current) endTimeRef.current += delta * 1000
    setSeconds(s => s + delta)
  }, [])

  return { seconds, running, start, pause, reset, add }
}
