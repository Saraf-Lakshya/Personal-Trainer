import { useState, useEffect, useRef, useCallback } from 'react'

export function useTimer(initialSeconds, onComplete) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    if (!running) { clear(); return }
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clear()
          setRunning(false)
          onCompleteRef.current?.()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return clear
  }, [running])

  const start = useCallback((overrideSecs) => {
    if (overrideSecs !== undefined) setSeconds(overrideSecs)
    setRunning(true)
  }, [])

  const pause = useCallback(() => setRunning(false), [])

  const reset = useCallback((secs) => {
    clear()
    setRunning(false)
    setSeconds(secs ?? initialSeconds)
  }, [initialSeconds])

  const add = useCallback((delta) => {
    setSeconds(s => s + delta)
  }, [])

  return { seconds, running, start, pause, reset, add }
}
