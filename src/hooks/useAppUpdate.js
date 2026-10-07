import { useEffect, useState } from 'react'

// Installed home-screen apps can sit in memory for days on the old version.
// Check for a new version on launch, on return to the app and every 30 min;
// once the new version has taken over, reload — but only when `canReload`
// (i.e. not mid-workout).
export function useAppUpdate(canReload) {
  const [updateReady, setUpdateReady] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const hadController = !!navigator.serviceWorker.controller // false on very first install
    const onControllerChange = () => { if (hadController) setUpdateReady(true) }
    const check = () => {
      navigator.serviceWorker.getRegistration().then(reg => reg?.update()).catch(() => {})
    }
    const onVisible = () => { if (document.visibilityState === 'visible') check() }

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
    document.addEventListener('visibilitychange', onVisible)
    const interval = setInterval(check, 30 * 60 * 1000)
    check()
    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
      document.removeEventListener('visibilitychange', onVisible)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (updateReady && canReload) window.location.reload()
  }, [updateReady, canReload])
}
