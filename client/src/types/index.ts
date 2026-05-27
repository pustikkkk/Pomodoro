export type TemplateType = 'short' | 'standard' | 'hybrid' | 'deep_work'

export interface User {
  id: string
  username: string
  email: string
}

export interface Timer {
  id: string
  userId: string
  title: string
  description: string | null
  autoRestart: boolean
  blocks: TemplateType[]
  createdAt: string
  updatedAt: string
}

export interface Stars {
  short: number
  standard: number
  hybrid: number
  deep_work: number
}
