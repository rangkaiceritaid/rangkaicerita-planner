export const DEFAULT_BUDGET_CATEGORIES = [
  { name: 'Venue & Gedung', icon: '🏛️', allocated_pct: 28, color: '#B5704F', sort_order: 1 },
  { name: 'Katering', icon: '🍽️', allocated_pct: 23, color: '#8B9D6A', sort_order: 2 },
  { name: 'Foto & Video', icon: '📸', allocated_pct: 12, color: '#6B8FA3', sort_order: 3 },
  { name: 'Dekorasi & Bunga', icon: '💐', allocated_pct: 10, color: '#D4A5A5', sort_order: 4 },
  { name: 'Busana & MUA', icon: '👗', allocated_pct: 8, color: '#A8855A', sort_order: 5 },
  { name: 'Mas Kawin & Seserahan', icon: '💍', allocated_pct: 7, color: '#C4A35A', sort_order: 6 },
  { name: 'Entertainment & MC', icon: '🎤', allocated_pct: 5, color: '#9B7DB0', sort_order: 7 },
  { name: 'Undangan & Souvenir', icon: '✉️', allocated_pct: 4, color: '#7B9E87', sort_order: 8 },
  { name: 'Transportasi', icon: '🚗', allocated_pct: 1, color: '#9B8DB0', sort_order: 9 },
  { name: 'Lain-lain', icon: '📦', allocated_pct: 2, color: '#C4B49A', sort_order: 10 },
]

export function formatWeddingDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatRupiahShort(amount: number): string {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}jt`
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}rb`
  return `Rp ${amount}`
}
