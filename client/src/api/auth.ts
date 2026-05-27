import api from './client'
import type { User } from '@/types'

export const authApi = {
  signup: (data: { username: string; email: string; password: string }) =>
    api.post<{ message: string; email: string }>('/auth/signup', data),

  login: (data: { username: string; password: string }) =>
    api.post<{ message: string; email: string }>('/auth/login', data),

  sendCode: (email: string) =>
    api.post('/auth/send-code', { email }),

  verifyCode: (data: { email: string; code: string; flow: 'signup' | 'login' }) =>
    api.post<{ user: User }>('/auth/verify-code', data),

  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get<User>('/auth/me'),
}
