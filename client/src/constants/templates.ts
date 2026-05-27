// Client-side copy of server/src/config/templates.ts — must be kept in sync.
import type { TemplateType } from '@/types'

// Phase durations in minutes. Even indices = focus phases, odd indices = break phases.
export const TEMPLATE_DEFINITIONS: Record<TemplateType, number[]> = {
  short:     [15, 3, 15, 3, 15, 3, 15, 5],
  standard:  [25, 5, 25, 5, 25, 5, 25, 15],
  hybrid:    [40, 10, 40, 10, 40, 10, 40, 25],
  deep_work: [60, 10, 60, 10, 60, 10, 60, 30],
}

export const TEMPLATE_LABELS: Record<TemplateType, string> = {
  short:     'Short',
  standard:  'Standard',
  hybrid:    'Hybrid',
  deep_work: 'Deep Work',
}

export const TEMPLATE_COLORS: Record<TemplateType, string> = {
  short:     'bg-white/50 text-black border-black/20',
  standard:  'bg-white/50 text-black border-black/20',
  hybrid:    'bg-white/50 text-black border-black/20',
  deep_work: 'bg-white/50 text-black border-black/20',
}

export const ALL_TEMPLATES: TemplateType[] = ['short', 'standard', 'hybrid', 'deep_work']

export function getTotalMinutes(blocks: TemplateType[]): number {
  return blocks.reduce((sum, block) => {
    return sum + TEMPLATE_DEFINITIONS[block].reduce((a, b) => a + b, 0)
  }, 0)
}

// Even phase index = focus, odd = break — matches the interleaved structure in TEMPLATE_DEFINITIONS.
export function getPhaseType(phaseIndex: number): 'focus' | 'break' {
  return phaseIndex % 2 === 0 ? 'focus' : 'break'
}
