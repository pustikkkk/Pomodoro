import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { timersApi } from '@/api/timers'
import { useFocusStore } from '@/stores/focusStore'
import { useCountdown } from '@/hooks/useCountdown'
import { PhaseBackground } from '@/components/focus/PhaseBackground'
import { PhaseDisplay } from '@/components/focus/PhaseDisplay'
import { PhaseLabel } from '@/components/focus/PhaseLabel'
import { BlockProgress } from '@/components/focus/BlockProgress'
import { Button } from '@/components/ui/Button'
import { TEMPLATE_DEFINITIONS, TEMPLATE_LABELS } from '@/constants/templates'

export function Focus() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: timer, isLoading, isError } = useQuery({
    queryKey: ['timers', id],
    queryFn: () => timersApi.get(id!).then((r) => r.data),
    enabled: !!id,
  })

  const startTimer = useFocusStore((s) => s.startTimer)
  const stopTimer = useFocusStore((s) => s.stopTimer)
  const isRunning = useFocusStore((s) => s.isRunning)
  const blocks = useFocusStore((s) => s.blocks)
  const currentBlock = useFocusStore((s) => s.currentBlock)
  const currentPhase = useFocusStore((s) => s.currentPhase)
  const remainingSeconds = useFocusStore((s) => s.remainingSeconds)
  const phaseType = useFocusStore((s) => s.phaseType)

  useCountdown(timer?.autoRestart ?? false)

  // Starts the timer once the server data is loaded, and cleans up on unmount.
  // Deps intentionally limited to timer?.id — startTimer/stopTimer identities are stable
  // but including them would re-fire on every render and reset a running timer.
  useEffect(() => {
    if (timer) {
      startTimer(timer.id, timer.blocks)
    }
    return () => stopTimer()
  }, [timer?.id])

  const handleStop = () => {
    stopTimer()
    navigate('/dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-black animate-pulse text-sm">Loading...</span>
      </div>
    )
  }

  if (isError || !timer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-black mb-4">Timer not found</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  // Fall back to timer.blocks when focusStore blocks is still empty (before startTimer has fired on first render).
  const template = blocks.length > 0 ? TEMPLATE_DEFINITIONS[blocks[currentBlock]] : TEMPLATE_DEFINITIONS[timer.blocks[0]]
  const phaseDurationSeconds = template[currentPhase] * 60
  const blockType = blocks.length > 0 ? TEMPLATE_LABELS[blocks[currentBlock]] : ''

  return (
    <PhaseBackground phaseType={phaseType}>
      <div className="flex-1 flex flex-col items-center justify-center gap-8 p-4">
        <PhaseLabel
          phaseType={phaseType}
          blockIndex={currentBlock}
          totalBlocks={blocks.length || timer.blocks.length}
          blockType={blockType}
        />

        <PhaseDisplay
          remainingSeconds={remainingSeconds}
          totalSeconds={phaseDurationSeconds}
          phaseType={phaseType}
        />

        <div className="w-64">
          <BlockProgress
            blocks={blocks.length > 0 ? blocks : timer.blocks}
            currentBlock={currentBlock}
          />
        </div>

        <div className="flex gap-4">
          {isRunning && (
            <Button variant="outline" onClick={handleStop}>
              Stop
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 text-center">
        <p className="text-xs text-black">{timer.title}</p>
      </div>
    </PhaseBackground>
  )
}
