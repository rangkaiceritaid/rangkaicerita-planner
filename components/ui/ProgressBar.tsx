interface ProgressBarProps {
  value: number // 0-100
  color?: string
  height?: number
  className?: string
  showLabel?: boolean
}

export function ProgressBar({ value, color = '#B5704F', height = 6, className = '', showLabel }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height, backgroundColor: '#EDE5DC' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium tabular-nums w-8 text-right" style={{ color: '#6B6560' }}>
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  )
}
