interface PhaseLabelProps {
  phaseType: 'focus' | 'break'
  blockIndex: number
  totalBlocks: number
  blockType: string
}

export function PhaseLabel({ phaseType, blockIndex, totalBlocks, blockType }: PhaseLabelProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-sm font-mono tracking-[0.3em] uppercase font-semibold text-black transition-opacity duration-700">
        {phaseType === 'focus' ? 'Focus' : 'Break'}
      </span>
      <span className="text-xs text-black">
        {blockType} · block {blockIndex + 1} of {totalBlocks}
      </span>
    </div>
  )
}
