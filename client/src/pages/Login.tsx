import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      navigate('/verify', { state: { email: res.data.email, flow: 'login' } })
    },
    onError: (err: any) => {
      setError(err.response?.data?.message ?? 'Invalid credentials')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    mutate(form)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-black font-mono font-bold text-2xl tracking-widest">POMODORO</h1>
          <p className="text-black text-sm mt-1">Welcome back</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="username"
            label="Username"
            placeholder="aleksej"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            autoComplete="username"
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            autoComplete="current-password"
            required
          />

          {error && <p className="text-sm text-red-700">{error}</p>}

          <Button type="submit" loading={isPending} className="mt-2">
            Log in
          </Button>
        </form>

        <p className="text-center text-xs text-black mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="underline hover:opacity-70">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
