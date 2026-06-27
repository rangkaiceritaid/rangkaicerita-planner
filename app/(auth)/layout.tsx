export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh flex flex-col" style={{ backgroundColor: '#F5F0EB' }}>
      {children}
    </div>
  )
}
