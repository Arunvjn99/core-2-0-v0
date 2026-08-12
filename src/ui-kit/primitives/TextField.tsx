import { type InputHTMLAttributes, forwardRef } from 'react'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  trailing?: React.ReactNode
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, trailing, id, className = '', ...rest }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex w-full flex-col gap-2">
        <label htmlFor={inputId} className="text-[15px] font-medium text-core-text/80">
          {label}
        </label>
        <div className="relative flex w-full items-center">
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-core-sm border border-core-border bg-core-surface px-3 py-[13px] text-[15px] text-core-text outline-none transition-colors focus:border-core-primary ${trailing ? 'pr-11' : ''} ${error ? 'border-core-critical' : ''} ${className}`}
            aria-invalid={!!error}
            {...rest}
          />
          {trailing && <div className="absolute right-3 flex items-center">{trailing}</div>}
        </div>
        {error && <p className="text-[13px] text-core-critical">{error}</p>}
      </div>
    )
  },
)
TextField.displayName = 'TextField'
