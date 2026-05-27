import type { TemplateType } from '@prisma/client'

// Phase durations in minutes for each template type.
// Phases alternate focus/break: even indices (0, 2, 4, 6) are focus, odd indices (1, 3, 5, 7) are breaks.
// The last element is a longer final break. Must stay in sync with client/src/constants/templates.ts.
export const TEMPLATE_DEFINITIONS: Record<TemplateType, number[]> = {
  short:     [15, 3, 15, 3, 15, 3, 15, 5],
  standard:  [25, 5, 25, 5, 25, 5, 25, 15],
  hybrid:    [40, 10, 40, 10, 40, 10, 40, 25],
  deep_work: [60, 10, 60, 10, 60, 10, 60, 30],
}
