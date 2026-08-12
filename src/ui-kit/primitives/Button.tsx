import { type ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'cta' | 'secondary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  loading?: boolean
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-core-sm px-4 py-3 text-[15px] font-semibold transition-[opacity,transform] duration-[var(--core-duration-fast)] ease-[var(--core-ease-standard)] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-core-primary'

const variants: Record<Variant, string> = {
  primary: 'text-core-primary-contrast bg-core-primary hover:brightness-105 shadow-core-sm',
  // Matches the Figma cyan gradient used for Login/Enroll/Submit/etc.
  cta: 'text-white hover:brightness-105 shadow-core-sm',
  secondary: 'text-core-text bg-core-surface border border-core-border hover:bg-core-bg',
  ghost: 'text-core-primary hover:bg-core-primary/10',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading, className = '', style, children, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${className}`}
      style={
        variant === 'cta'
          ? { backgroundImage: 'linear-gradient(90deg, var(--core-color-cta-from) 14.6%, var(--core-color-cta-to) 107.38%)', ...style }
          : style
      }
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? 'Please wait…' : children}
    </button>
  ),
)
Button.displayName = 'Button'
