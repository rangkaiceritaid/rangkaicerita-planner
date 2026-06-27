import { BottomNav } from '@/components/layout/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-svh" style={{ backgroundColor: '#F5F0EB' }}>
      <main className="page-content">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
