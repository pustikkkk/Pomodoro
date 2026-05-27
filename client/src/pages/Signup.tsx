import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

type FieldErrors = { username?: string; email?: string; password?: string }

function validate(form: { username: string; email: string; password: string }): FieldErrors {
  const errors: FieldErrors = {}
  if (!form.username.trim()) {
    errors.username = 'Username is required'
  } else if (form.username.length < 3) {
    errors.username = 'Must be at least 3 characters'
  } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
    errors.username = 'Only letters, numbers and underscores'
  }
  if (!form.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address'
  }
  if (!form.password) {
    errors.password = 'Password is required'
  } else if (form.password.length < 8) {
    errors.password = 'Must be at least 8 characters'
  }
  return errors
}

export function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (res) => {
      navigate('/verify', { state: { email: res.data.email, flow: 'signup' } })
    },
    onError: (err: any) => {
      const message: string = err.response?.data?.message ?? ''
      const errorCode: string = err.response?.data?.error ?? ''
      if (errorCode === 'EMAIL_ERROR') {
        setFieldErrors((e) => ({ ...e, email: 'Could not send a verification email to this address. Please double-check it.' }))
      } else if (message.toLowerCase().includes('username') || message.toLowerCase().includes('taken')) {
        setFieldErrors((e) => ({ ...e, username: 'This username is already taken' }))
      } else if (message.toLowerCase().includes('email') || message.toLowerCase().includes('use')) {
        setFieldErrors((e) => ({ ...e, email: 'This email is already registered' }))
      } else {
        setFieldErrors((e) => ({ ...e, password: 'Something went wrong — please try again' }))
      }
    },
  })

  const handleBlur = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }))
    setFieldErrors(validate(form))
  }

  const handleChange = (field: string, value: string) => {
    const next = { ...form, [field]: value }
    setForm(next)
    if (touched[field]) setFieldErrors(validate(next))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validate(form)
    setFieldErrors(errors)
    setTouched({ username: true, email: true, password: true })
    if (Object.keys(errors).length > 0) return
    mutate(form)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-black font-mono font-bold text-2xl tracking-widest">POMODORO</h1>
          <p className="text-black text-sm mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="username"
            label="Username"
            placeholder="aleksej"
            value={form.username}
            onChange={(e) => handleChange('username', e.target.value)}
            onBlur={() => handleBlur('username')}
            error={touched.username ? fieldErrors.username : undefined}
            autoComplete="username"
          />
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            error={touched.email ? fieldErrors.email : undefined}
            autoComplete="email"
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="min 8 characters"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            error={touched.password ? fieldErrors.password : undefined}
            autoComplete="new-password"
          />

          <Button type="submit" loading={isPending} className="mt-2">
            Sign up
          </Button>
        </form>

        <p className="text-center text-xs text-black mt-6">
          Already have an account?{' '}
          <Link to="/login" className="underline hover:opacity-70">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
