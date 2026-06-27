import Link from 'next/link'

interface PageHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  rightElement?: React.ReactNode
}

export function PageHeader({ title, subtitle, backHref, rightElement }: PageHeaderProps) {
  return (
    <header className="px-5 pt-14 pb-4 flex items-start justify-between">
      <div className="flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="w-8 h-8 flex items-center justify-center rounded-full -ml-1"
            style={{ backgroundColor: '#EDE5DC' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" style={{ color: '#B5704F' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#1A1A1A' }}>{title}</h1>
          {subtitle && <p className="text-sm mt-0.5" style={{ color: '#6B6560' }}>{subtitle}</p>}
        </div>
      </div>
      {rightElement && <div className="mt-1">{rightElement}</div>}
    </header>
  )
}
