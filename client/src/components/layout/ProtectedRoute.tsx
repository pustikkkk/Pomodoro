import { useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'

export function ProtectedRoute() {
  const navigate = useNavigate()
  const { setUser, isAuthenticated } = useAuthStore()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['user'],
    queryFn: () => authApi.me().then((r) => r.data),
    retry: false,
    // 5-min staleTime prevents repeated /auth/me calls on every in-app navigation.
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (data) setUser(data)
  }, [data, setUser])

  useEffect(() => {
    if (isError) navigate('/login')
  }, [isError, navigate])

  // Skip the loading screen if the user is already known (e.g. navigating between protected pages).
  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-mars-text-muted text-sm animate-pulse">Loading...</span>
      </div>
    )
  }

  if (isError) return null

  return <Outlet />
}
