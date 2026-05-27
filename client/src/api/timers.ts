import api from './client'
import type { Timer, TemplateType } from '@/types'

export const timersApi = {
  list: () =>
    api.get<{ timers: Timer[] }>('/timers'),

  get: (id: string) =>
    api.get<Timer>(`/timers/${id}`),

  create: (data: { title: string; description?: string; autoRestart?: boolean; blocks: TemplateType[] }) =>
    api.post<Timer>('/timers', data),

  update: (id: string, data: { title?: string; description?: string; autoRestart?: boolean; blocks?: TemplateType[] }) =>
    api.patch<Timer>(`/timers/${id}`, data),

  delete: (id: string) =>
    api.delete(`/timers/${id}`),
}
