import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs text-black uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`
          bg-white/30 border rounded-full px-3 py-2 text-sm text-black
          placeholder:text-black/40 outline-none font-mono backdrop-blur-sm
          ${error ? 'border-red-700/50' : 'border-black/20'}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  )
)

Input.displayName = 'Input'
