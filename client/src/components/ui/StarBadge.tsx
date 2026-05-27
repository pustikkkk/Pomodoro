import type { TemplateType } from '@/types'
import { TEMPLATE_LABELS } from '@/constants/templates'

interface StarBadgeProps {
  templateType: TemplateType
  count: number
}

export function StarBadge({ templateType, count }: StarBadgeProps) {
  if (count === 0) return null

  return (
    <div className="flex items-center gap-2 bg-white/30 border border-black/10 rounded px-3 py-2 backdrop-blur-sm">
      <div className="flex gap-0.5">
        {/* Render at most 10 star glyphs; overflow shown as "+N" to keep the badge narrow. */}
        {Array.from({ length: Math.min(count, 10) }).map((_, i) => (
          <span key={i} className="text-black text-sm">★</span>
        ))}
        {count > 10 && <span className="text-black text-xs ml-1">+{count - 10}</span>}
      </div>
      <span className="text-black text-xs">{TEMPLATE_LABELS[templateType]}</span>
    </div>
  )
}
