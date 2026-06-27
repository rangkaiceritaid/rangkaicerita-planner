'use client'

interface CheckboxProps {
  checked: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
}

export function Checkbox({ checked, onChange, disabled }: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={() => onChange?.(!checked)}
      disabled={disabled}
      className="w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center transition-all active:scale-95"
      style={{
        backgroundColor: checked ? '#2D4A3E' : 'transparent',
        border: checked ? 'none' : '2px solid #C4BAB2',
      }}
    >
      {checked && (
        <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3">
          <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}
