export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        className="animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        style={{ width: size, height: size }}
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#B5704F" strokeWidth="3" />
        <path className="opacity-75" fill="#B5704F" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F0EB' }}>
      <LoadingSpinner size={36} />
    </div>
  )
}
