// All timer state is intentionally client-side only — no server persistence.
// Closing the browser tab loses current progress; reopening the timer starts from scratch.
import { create } from 'zustand'
import type { TemplateType } from '@/types'
import { TEMPLATE_DEFINITIONS, getPhaseType } from '@/constants/templates'

interface FocusState {
  timerId: string | null
  blocks: TemplateType[]
  currentBlock: number
  currentPhase: number
  remainingSeconds: number
  phaseType: 'focus' | 'break'
  isRunning: boolean

  startTimer: (timerId: string, blocks: TemplateType[]) => void
  tick: () => void
  // Returns blockCompleted + templateType so the caller (useCountdown) can award a star,
  // and sessionDone so the caller can navigate or restart.
  advancePhase: () => { blockCompleted: boolean; templateType: TemplateType | null; sessionDone: boolean }
  stopTimer: () => void
}

export const useFocusStore = create<FocusState>((set, get) => ({
  timerId: null,
  blocks: [],
  currentBlock: 0,
  currentPhase: 0,
  remainingSeconds: 0,
  phaseType: 'focus',
  isRunning: false,

  startTimer: (timerId, blocks) => {
    const template = TEMPLATE_DEFINITIONS[blocks[0]]
    set({
      timerId,
      blocks,
      currentBlock: 0,
      currentPhase: 0,
      remainingSeconds: template[0] * 60,
      phaseType: 'focus',
      isRunning: true,
    })
  },

  tick: () => {
    set((state) => ({ remainingSeconds: Math.max(0, state.remainingSeconds - 1) }))
  },

  advancePhase: () => {
    const { blocks, currentBlock, currentPhase } = get()
    const template = TEMPLATE_DEFINITIONS[blocks[currentBlock]]
    const isLastPhase = currentPhase === template.length - 1
    const isLastBlock = currentBlock === blocks.length - 1

    let blockCompleted = false
    let templateType: TemplateType | null = null
    let sessionDone = false

    let nextBlock = currentBlock
    let nextPhase = currentPhase + 1

    if (isLastPhase) {
      blockCompleted = true
      templateType = blocks[currentBlock]

      if (isLastBlock) {
        sessionDone = true
        set({ isRunning: false })
        return { blockCompleted, templateType, sessionDone }
      }

      nextBlock = currentBlock + 1
      nextPhase = 0
    }

    const nextTemplate = TEMPLATE_DEFINITIONS[blocks[nextBlock]]
    set({
      currentBlock: nextBlock,
      currentPhase: nextPhase,
      remainingSeconds: nextTemplate[nextPhase] * 60,
      phaseType: getPhaseType(nextPhase),
    })

    return { blockCompleted, templateType, sessionDone }
  },

  stopTimer: () => {
    set({ isRunning: false, timerId: null, blocks: [], remainingSeconds: 0 })
  },
}))
