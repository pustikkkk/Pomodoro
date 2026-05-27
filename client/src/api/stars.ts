import api from './client'
import type { Stars, TemplateType } from '@/types'

export const starsApi = {
  list: () =>
    api.get<{ stars: Stars }>('/stars'),

  award: (templateType: TemplateType) =>
    api.post<{ templateType: TemplateType; count: number }>('/stars/award', { templateType }),
}
