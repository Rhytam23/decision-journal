import { TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className = '', id, rows = 4, ...props }, ref) => {
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
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={`
            w-full bg-app-input border rounded-xl px-4 py-3 text-sm text-ink-primary
            placeholder:text-ink-muted resize-none
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
Textarea.displayName = 'Textarea'
