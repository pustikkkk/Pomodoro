import type { TemplateType } from '@/types'
import { ALL_TEMPLATES, TEMPLATE_LABELS, TEMPLATE_DEFINITIONS, TEMPLATE_COLORS, getTotalMinutes } from '@/constants/templates'
import { BlockBadge } from './BlockBadge'

interface BlockBuilderProps {
  blocks: TemplateType[]
  onChange: (blocks: TemplateType[]) => void
}

const MAX_BLOCKS = 10

export function BlockBuilder({ blocks, onChange }: BlockBuilderProps) {
  const addBlock = (type: TemplateType) => {
    if (blocks.length >= MAX_BLOCKS) return
    onChange([...blocks, type])
  }

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index))
  }

  const totalMin = getTotalMinutes(blocks)
  const hours = Math.floor(totalMin / 60)
  const mins = totalMin % 60

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs text-black uppercase tracking-wider mb-2">Add template blocks</p>
        <div className="flex flex-wrap gap-2">
          {ALL_TEMPLATES.map((type) => {
            const phases = TEMPLATE_DEFINITIONS[type]
            const totalPhaseMin = phases.reduce((a, b) => a + b, 0)
            return (
              <button
                key={type}
                type="button"
                onClick={() => addBlock(type)}
                disabled={blocks.length >= MAX_BLOCKS}
                className={`
                  flex flex-col items-start px-3 py-2 rounded border text-left
                  transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed
                  ${TEMPLATE_COLORS[type]} hover:opacity-80
                `}
              >
                <span className="text-xs font-semibold">{TEMPLATE_LABELS[type]}</span>
                <span className="text-xs opacity-60">{totalPhaseMin} min</span>
              </button>
            )
          })}
        </div>
        {blocks.length >= MAX_BLOCKS && (
          <p className="text-xs text-black mt-1">Max {MAX_BLOCKS} blocks reached</p>
        )}
      </div>

      <div>
        <p className="text-xs text-black uppercase tracking-wider mb-2">
          Your sequence {blocks.length > 0 && `(${blocks.length} block${blocks.length > 1 ? 's' : ''})`}
        </p>
        {blocks.length === 0 ? (
          <p className="text-xs text-black italic">No blocks added yet — pick templates above</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {blocks.map((type, i) => (
              <BlockBadge
                key={i}
                type={type}
                index={i}
                onRemove={() => removeBlock(i)}
              />
            ))}
          </div>
        )}
      </div>

      {blocks.length > 0 && (
        <p className="text-xs text-black">
          Total: {hours > 0 ? `${hours}h ` : ''}{mins}m
        </p>
      )}
    </div>
  )
}
