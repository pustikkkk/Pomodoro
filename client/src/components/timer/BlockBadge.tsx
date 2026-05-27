import type { TemplateType } from '@/types'
import { TEMPLATE_LABELS, TEMPLATE_COLORS } from '@/constants/templates'

interface BlockBadgeProps {
  type: TemplateType
  onRemove?: () => void
  index?: number
}

export function BlockBadge({ type, onRemove, index }: BlockBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono ${TEMPLATE_COLORS[type]}`}>
      {index !== undefined && (
        <span className="opacity-50">{index + 1}.</span>
      )}
      <span>{TEMPLATE_LABELS[type]}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 opacity-50 hover:opacity-100 transition-opacity leading-none"
          type="button"
        >
          ×
        </button>
      )}
    </div>
  )
}
