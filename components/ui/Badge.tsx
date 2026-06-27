interface BadgeProps {
  children: React.ReactNode
  variant?: 'brown' | 'green' | 'gray' | 'orange'
  className?: string
}

const variants = {
  brown: { backgroundColor: 'rgba(181,112,79,0.12)', color: '#B5704F' },
  green: { backgroundColor: 'rgba(45,74,62,0.12)', color: '#2D4A3E' },
  gray: { backgroundColor: 'rgba(107,101,96,0.1)', color: '#6B6560' },
  orange: { backgroundColor: 'rgba(224,130,50,0.12)', color: '#B56A20' },
}

export function Badge({ children, variant = 'brown', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={variants[variant]}
    >
      {children}
    </span>
  )
}
