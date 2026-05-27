import type { TemplateType } from '@/types'
import { TEMPLATE_LABELS } from '@/constants/templates'

interface BlockProgressProps {
  blocks: TemplateType[]
  currentBlock: number
}

export function BlockProgress({ blocks, currentBlock }: BlockProgressProps) {
  return (
    <div className="flex gap-2 items-center">
      {blocks.map((type, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
            i < currentBlock
              ? 'bg-black/20'
              : i === currentBlock
              ? 'bg-black/70'
              : 'bg-black/10'
          }`}
          title={TEMPLATE_LABELS[type]}
        />
      ))}
    </div>
  )
}
