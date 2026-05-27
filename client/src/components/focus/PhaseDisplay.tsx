interface PhaseDisplayProps {
  remainingSeconds: number
  totalSeconds: number
  phaseType: 'focus' | 'break'
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function PhaseDisplay({ remainingSeconds, totalSeconds, phaseType }: PhaseDisplayProps) {
  const progress = totalSeconds > 0 ? 1 - remainingSeconds / totalSeconds : 0
  // circumference = 2πr; strokeDashoffset = circumference × (1 - progress) drives the arc fill.
  const circumference = 2 * Math.PI * 80
  const accent = phaseType === 'focus' ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.35)'

  return (
    <div className="relative w-64 h-64">
      {/* -rotate-90 shifts the arc start to 12 o'clock (SVG default starts at 3 o'clock). */}
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="10" />
        <circle
          cx="100" cy="100" r="80" fill="none"
          stroke={accent} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 1.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl font-bold text-black font-mono tracking-tight">
          {formatTime(remainingSeconds)}
        </span>
      </div>
    </div>
  )
}
