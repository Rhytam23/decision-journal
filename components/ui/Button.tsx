import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-heading font-semibold tracking-wide rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-gold select-none'

    const variants = {
      primary:
        'bg-gold text-app-bg shadow-[0_0_15px_rgba(207,168,107,0.25)] hover:shadow-[0_0_20px_rgba(207,168,107,0.35)] hover:-translate-y-px active:translate-y-0',
      secondary:
        'bg-transparent border border-border text-ink-secondary hover:text-ink-primary hover:bg-app-hover',
      ghost:
        'bg-transparent text-ink-secondary hover:text-ink-primary hover:bg-app-hover',
      danger:
        'bg-transparent border border-signal-red/30 text-signal-red hover:bg-signal-red/10',
    }

    const sizes = {
      sm:  'h-8 px-3 text-xs',
      md:  'h-10 px-5 text-sm',
      lg:  'h-12 px-7 text-[0.9rem]',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading…</span>
          </>
        ) : children}
      </button>
    )
  }
)
Button.displayName = 'Button'
