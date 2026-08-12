import { type ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  loading?: boolean
}

const base =
  'inline-flex items-center justify-center rounded-core-sm px-4 py-3 text-[15px] font-semibold transition-[opacity,transform] duration-[var(--core-duration-fast)] ease-[var(--core-ease-standard)] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-core-primary'

const variants: Record<Variant, string> = {
  primary: 'text-core-primary-contrast bg-core-primary hover:brightness-105 shadow-core-sm',
  secondary:
    'text-core-text bg-core-surface border border-core-border hover:bg-core-bg',
  ghost: 'text-core-primary hover:bg-core-primary/10',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading, className = '', children, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? 'Please wait…' : children}
    </button>
  ),
)
Button.displayName = 'Button'
