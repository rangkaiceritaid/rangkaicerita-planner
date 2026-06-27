interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  style?: React.CSSProperties
}

export function Card({ children, className = '', onClick, style }: CardProps) {
  const base = 'rounded-2xl p-4 shadow-sm'
  const clickable = onClick ? 'cursor-pointer active:scale-[0.99] transition-transform' : ''

  return (
    <div
      className={`${base} ${clickable} ${className}`}
      style={{ backgroundColor: '#fff', border: '1px solid #F0EAE2', ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
