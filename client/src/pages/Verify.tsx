import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'

export function Verify() {
  const navigate = useNavigate()
  const location = useLocation()
  const { email, flow } = (location.state ?? {}) as { email?: string; flow?: 'signup' | 'login' }
  const { setUser } = useAuthStore()

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!email || !flow) navigate('/login')
  }, [email, flow, navigate])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.verifyCode,
    onSuccess: (res) => {
      setUser(res.data.user)
      navigate('/dashboard')
    },
    onError: (err: any) => {
      setError(err.response?.data?.message ?? 'Invalid code')
      setDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    },
  })

  const { mutate: resend, isPending: resending } = useMutation({
    mutationFn: () => authApi.sendCode(email!),
    onSuccess: () => setError('New code sent'),
    onError: (err: any) => setError(err.response?.data?.message ?? 'Failed to resend'),
  })

  const handleDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit as soon as all 6 digits are filled — no submit button needed.
    if (next.every(Boolean)) {
      mutate({ email: email!, code: next.join(''), flow: flow! })
    }
  }

  // Backspace on an empty input moves focus to the previous field for quick correction.
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Paste handler: strips non-digits and auto-submits if a full 6-digit code is pasted.
  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const next = pasted.split('')
      setDigits(next)
      mutate({ email: email!, code: pasted, flow: flow! })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-black font-mono font-bold text-2xl tracking-widest mb-2">POMODORO</h1>
        <p className="text-black text-sm mb-1">Check your email</p>
        <p className="text-black text-xs mb-8">
          We sent a 6-digit code to <span className="font-semibold">{email}</span>
        </p>

        <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-11 h-14 text-center text-xl font-bold font-mono rounded border border-black/25 bg-white/30 text-black outline-none"
            />
          ))}
        </div>

        {error && (
          <p className={`text-sm mb-4 ${error === 'New code sent' ? 'text-green-700' : 'text-red-700'}`}>
            {error}
          </p>
        )}

        {isPending && (
          <p className="text-xs text-black mb-4 animate-pulse">Verifying...</p>
        )}

        <Button variant="ghost" size="sm" onClick={() => resend()} loading={resending}>
          Resend code
        </Button>
      </div>
    </div>
  )
}
