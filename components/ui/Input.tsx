import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#6B6560' }}>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full h-12 rounded-xl px-4 text-base outline-none transition-all
              placeholder:text-[#B0A89F]
              focus:ring-2
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${className}
            `}
            style={{
              backgroundColor: '#EDE5DC',
              color: '#1A1A1A',
              border: error ? '1.5px solid #E05252' : '1.5px solid transparent',
            }}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#6B6560' }}>
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs" style={{ color: '#E05252' }}>{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
