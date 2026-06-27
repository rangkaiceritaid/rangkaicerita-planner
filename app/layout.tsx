import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/components/layout/Providers'

export const metadata: Metadata = {
  title: 'RangkaiCerita — Wedding Planner',
  description: 'Rajut setiap momen, jadikan cerita seumur hidup.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RangkaiCerita',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#F5F0EB',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full">
        <Providers>
          <div id="app-shell">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
