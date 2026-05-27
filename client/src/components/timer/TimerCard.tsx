import { useNavigate } from 'react-router-dom'
import type { Timer } from '@/types'
import { BlockBadge } from './BlockBadge'
import { Button } from '@/components/ui/Button'
import { getTotalMinutes } from '@/constants/templates'

interface TimerCardProps {
  timer: Timer
  onDelete: (id: string) => void
}

export function TimerCard({ timer, onDelete }: TimerCardProps) {
  const navigate = useNavigate()
  const totalMin = getTotalMinutes(timer.blocks)
  const hours = Math.floor(totalMin / 60)
  const mins = totalMin % 60

  return (
    <div className="bg-white/30 border border-black/10 rounded-lg p-6 flex flex-col gap-4 hover:border-black/25 transition-colors backdrop-blur-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-black font-semibold text-sm">{timer.title}</h3>
          {timer.description && (
            <p className="text-black text-xs mt-0.5 line-clamp-2">{timer.description}</p>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          {timer.autoRestart && (
            <span className="text-xs text-black border border-black/20 rounded px-1.5 py-0.5">loop</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {timer.blocks.map((type, i) => (
          <BlockBadge key={i} type={type} />
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 pt-1 border-t border-black/10">
        <span className="text-xs text-black">
          {hours > 0 ? `${hours}h ` : ''}{mins}m total
        </span>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate(`/edit/${timer.id}`)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(timer.id)}>Delete</Button>
          <Button size="sm" onClick={() => navigate(`/focus/${timer.id}`)}>Start</Button>
        </div>
      </div>
    </div>
  )
}
