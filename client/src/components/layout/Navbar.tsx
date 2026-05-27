import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'

export function Navbar() {
  const navigate = useNavigate()
  const { user, clearUser } = useAuthStore()

  const { mutate: logout } = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearUser()
      navigate('/')
    },
  })

  return (
    <header className="px-4 pt-4 sticky top-4 z-40">
      <div className="max-w-5xl mx-auto bg-white/20 backdrop-blur-md border border-black/10 rounded-full px-8 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-black font-mono font-bold text-base tracking-widest hover:opacity-60 transition-opacity"
        >
          POMODORO
        </button>
        <div className="flex items-center gap-4">
          <span className="text-sm text-black">{user?.username}</span>
          <Button variant="ghost" onClick={() => logout()}>
            Log out
          </Button>
        </div>
      </div>
    </header>
  )
}
