// Self-contained interactive demo timer for the landing page.
// Uses its own local RAF loop instead of focusStore/useCountdown so it has no side effects.
import { useState, useEffect, useRef } from 'react'
import { TEMPLATE_DEFINITIONS } from '@/constants/templates'

const DEMO_TEMPLATE = TEMPLATE_DEFINITIONS.standard

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function DemoTimer() {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [remaining, setRemaining] = useState(DEMO_TEMPLATE[0] * 60)
  const [running, setRunning] = useState(false)
  const rafRef = useRef<number | null>(null)
  const lastTickRef = useRef<number>(Date.now())

  const isBreak = phaseIndex % 2 !== 0
  const phaseName = isBreak ? 'BREAK' : 'FOCUS'
  const phaseDuration = DEMO_TEMPLATE[phaseIndex] * 60
  const progress = 1 - remaining / phaseDuration

  useEffect(() => {
    if (!running) return

    const loop = () => {
      const now = Date.now()
      if (now - lastTickRef.current >= 1000) {
        lastTickRef.current = now
        setRemaining((prev) => {
          if (prev <= 1) {
            setPhaseIndex((pi) => {
              const next = (pi + 1) % DEMO_TEMPLATE.length
              setRemaining(DEMO_TEMPLATE[next] * 60)
              return next
            })
            return DEMO_TEMPLATE[(phaseIndex + 1) % DEMO_TEMPLATE.length] * 60
          }
          return prev - 1
        })
      }
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [running, phaseIndex])

  const circumference = 2 * Math.PI * 54

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke="rgba(0,0,0,0.7)" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-black font-mono">{formatTime(remaining)}</span>
          <span className="text-xs tracking-widest text-black">{phaseName}</span>
        </div>
      </div>

      <button
        onClick={() => setRunning((r) => !r)}
        className="px-6 py-2 rounded border border-black/25 bg-transparent text-black font-mono text-sm hover:bg-black/5 hover:border-black/40 transition-all"
      >
        {running ? 'Pause' : 'Start Demo'}
      </button>

      <div className="text-xs text-black text-center max-w-xs">
        <div className="flex flex-wrap justify-center items-center gap-x-1 gap-y-0.5 font-mono">
          <span className="mr-1">Standard template</span>
          {DEMO_TEMPLATE.map((p, i) => (
            <span key={i} className="flex items-center gap-x-1">
              {p}
              {i < DEMO_TEMPLATE.length - 1 && (
                <span>·</span>
              )}
            </span>
          ))}
          <span className="ml-1">min</span>
        </div>
        <span>Sign up to create your own timers</span>
      </div>
    </div>
  )
}
