'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { DEFAULT_BUDGET_CATEGORIES, formatRupiah } from '@/constants/budgetCategories'

function Step2Content() {
  const router = useRouter()
  const params = useSearchParams()
  const [budget, setBudget] = useState(80_000_000)
  const [autoAllocate, setAutoAllocate] = useState(true)
  const [rawInput, setRawInput] = useState('80.000.000')

  function handleBudgetChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    const num = parseInt(raw || '0', 10)
    setBudget(num)
    setRawInput(num.toLocaleString('id-ID'))
  }

  function handleNext() {
    const prev = Object.fromEntries(params.entries())
    const nextParams = new URLSearchParams({ ...prev, budget: String(budget) })
    router.push(`/onboarding/summary?${nextParams.toString()}`)
  }

  const categories = autoAllocate
    ? DEFAULT_BUDGET_CATEGORIES.map((c) => ({
        ...c,
        amount: Math.floor(budget * c.allocated_pct / 100),
      }))
    : []

  return (
    <div className="flex-1 flex flex-col px-6 pt-12">
      {/* Progress */}
      <div className="flex items-center justify-between mb-8">
        <span className="text-xs font-medium tracking-wide uppercase" style={{ color: '#B5704F' }}>LANGKAH 2 DARI 3</span>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div key={s} className="h-1.5 w-8 rounded-full" style={{ backgroundColor: s <= 2 ? '#B5704F' : '#E0D8D0' }} />
          ))}
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>Berapa anggaran pernikahanmu?</h1>
      <p className="text-sm mb-6" style={{ color: '#6B6560' }}>Kami bantu pantau agar tidak melebihi rencana.</p>

      {/* Budget Input */}
      <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: '#EDE5DC' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold" style={{ color: '#6B6560' }}>Rp</span>
          <input
            type="text"
            inputMode="numeric"
            value={rawInput}
            onChange={handleBudgetChange}
            className="flex-1 bg-transparent text-right text-2xl font-bold outline-none"
            style={{ color: '#1A1A1A' }}
          />
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: '#6B6560' }}>
          Rata-rata pernikahan Indonesia: Rp 50–150 juta
        </p>
      </div>

      {/* Auto Allocate Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>Atur alokasi otomatis</p>
          <p className="text-xs mt-0.5" style={{ color: '#6B6560' }}>Proporsi umum pernikahan Indonesia</p>
        </div>
        <button
          type="button"
          onClick={() => setAutoAllocate(!autoAllocate)}
          className="w-12 h-6 rounded-full relative transition-colors"
          style={{ backgroundColor: autoAllocate ? '#B5704F' : '#C4BAB2' }}
        >
          <span
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
            style={{ transform: autoAllocate ? 'translateX(26px)' : 'translateX(2px)' }}
          />
        </button>
      </div>

      {/* Category breakdown */}
      {autoAllocate && budget > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E0D8D0', backgroundColor: '#fff' }}>
          <div className="flex justify-between items-center px-4 py-3" style={{ borderBottom: '1px solid #F0EAE2' }}>
            <span className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>Rincian alokasi</span>
            <span className="text-xs" style={{ color: '#B5704F' }}>edit nanti</span>
          </div>
          <div className="divide-y divide-[#F0EAE2]">
            {categories.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{cat.icon}</span>
                  <span className="text-sm" style={{ color: '#1A1A1A' }}>{cat.name}</span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: `${cat.color}18`, color: cat.color }}
                  >
                    {cat.allocated_pct}%
                  </span>
                </div>
                <span className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                  {formatRupiah(cat.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto pt-6 pb-8 flex flex-col gap-3">
        <Button onClick={handleNext} fullWidth size="lg">
          Lanjut →
        </Button>
        <button
          onClick={() => router.back()}
          className="text-sm font-medium py-2"
          style={{ color: '#6B6560' }}
        >
          Kembali
        </button>
      </div>
    </div>
  )
}

export default function OnboardingStep2() {
  return (
    <Suspense>
      <Step2Content />
    </Suspense>
  )
}
