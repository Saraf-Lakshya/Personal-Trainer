// iPhones ignore navigator.vibrate in web apps, so the rest timer also beeps.
// iOS only allows audio once the page has been touched, so the audio context
// is created/resumed on the first tap and reused afterwards.
let ctx = null

function unlock() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return
      ctx = new AC()
    }
    if (ctx.state === 'suspended') ctx.resume()
  } catch { /* audio unavailable — stay silent */ }
}

if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', unlock, { passive: true })
}

export function beep(count = 3) {
  unlock()
  if (!ctx) return
  try {
    const t0 = ctx.currentTime
    for (let i = 0; i < count; i++) {
      const start = t0 + i * 0.25
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.4, start + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.15)
      osc.connect(gain).connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.16)
    }
  } catch { /* ignore */ }
}
