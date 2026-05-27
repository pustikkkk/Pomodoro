import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFocusStore } from '@/stores/focusStore'
import { starsApi } from '@/api/stars'
import { useQueryClient } from '@tanstack/react-query'

export function useCountdown(autoRestart: boolean) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const rafRef = useRef<number | null>(null)
  // Wall-clock timestamp of the last second tick — compared against Date.now() so ticks are
  // accurate even if RAF fires at slightly irregular intervals (e.g. tab becomes inactive).
  const lastTickRef = useRef<number>(Date.now())

  const tick = useFocusStore((s) => s.tick)
  const advancePhase = useFocusStore((s) => s.advancePhase)
  const isRunning = useFocusStore((s) => s.isRunning)
  const remainingSeconds = useFocusStore((s) => s.remainingSeconds)
  const startTimer = useFocusStore((s) => s.startTimer)
  const blocks = useFocusStore((s) => s.blocks)
  const timerId = useFocusStore((s) => s.timerId)

  // RAF-based ticker: more accurate than setInterval because it can compensate for missed frames.
  useEffect(() => {
    if (!isRunning) return

    const loop = () => {
      const now = Date.now()
      if (now - lastTickRef.current >= 1000) {
        lastTickRef.current = now
        tick()
      }
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [isRunning, tick])

  // Phase-transition effect: fires when remainingSeconds reaches 0.
  // Awards a star for the completed block, then either advances to the next phase,
  // restarts the session (autoRestart), or navigates back to the dashboard (session done).
  useEffect(() => {
    if (!isRunning || remainingSeconds > 0) return

    const { blockCompleted, templateType, sessionDone } = advancePhase()

    if (blockCompleted && templateType) {
      starsApi.award(templateType).then(() => {
        queryClient.invalidateQueries({ queryKey: ['stars'] })
      })
    }

    if (sessionDone) {
      if (autoRestart && timerId && blocks.length > 0) {
        startTimer(timerId, blocks)
      } else {
        navigate('/dashboard')
      }
    }
  }, [remainingSeconds, isRunning, advancePhase, autoRestart, navigate, timerId, blocks, startTimer, queryClient])
}
