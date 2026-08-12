import { type SelectHTMLAttributes, forwardRef } from 'react'
import { IconChevronDown } from '../icons'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, placeholder = 'Select', id, className = '', children, ...rest }, ref) => {
    const selectId = id ?? label.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex w-full flex-col gap-2">
        <label htmlFor={selectId} className="text-[15px] font-medium text-core-text">
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            defaultValue=""
            className={`w-full appearance-none rounded-[4px] border border-core-border-strong bg-core-surface-raised px-3 py-[11px] text-[15px] text-core-text outline-none focus:border-core-info ${className}`}
            {...rest}
          >
            <option value="" disabled className="text-core-text-muted">
              {placeholder}
            </option>
            {children}
          </select>
          <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3 -translate-y-1/2 text-core-text" />
        </div>
      </div>
    )
  },
)
Select.displayName = 'Select'
