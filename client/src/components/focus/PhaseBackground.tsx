import type { ReactNode } from 'react'

interface PhaseBackgroundProps {
  phaseType: 'focus' | 'break'
  children: ReactNode
}

export function PhaseBackground({ phaseType, children }: PhaseBackgroundProps) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #ffb347, #ffcc33, #ff8c66, #c471ed, #5f2c82)',
        backgroundSize: '300% 300%',
        animation: 'gradientShift 20s ease infinite',
        ...(phaseType === 'break' && { filter: 'brightness(1.1)' }),
      }}
    >
      {children}
    </div>
  )
}
