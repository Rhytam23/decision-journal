import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-ink-secondary uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full bg-app-input border rounded-xl px-4 py-2.5 text-sm text-ink-primary
            placeholder:text-ink-muted
            border-border focus:border-gold focus:outline-none
            focus:ring-2 focus:ring-gold/25 transition-all duration-200
            ${error ? 'border-signal-red focus:border-signal-red focus:ring-signal-red/20' : ''}
            ${className}
          `}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-ink-muted">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-signal-red" role="alert">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
