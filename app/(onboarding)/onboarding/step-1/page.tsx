'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function OnboardingStep1() {
  const router = useRouter()
  const [akadDate, setAkadDate] = useState('')
  const [akadTime, setAkadTime] = useState('09:00')
  const [hasResepsi, setHasResepsi] = useState(true)
  const [kota, setKota] = useState('')

  function handleNext() {
    if (!akadDate) return
    const params = new URLSearchParams({
      akad_date: akadDate,
      akad_time: akadTime,
      has_resepsi: String(hasResepsi),
      kota,
    })
    router.push(`/onboarding/step-2?${params.toString()}`)
  }

  function handleSkip() {
    router.push('/onboarding/step-2?skip=1')
  }

  return (
    <div className="flex-1 flex flex-col px-6 pt-12">
      {/* Progress */}
      <div className="flex items-center justify-between mb-8">
        <span className="text-xs font-medium tracking-wide uppercase" style={{ color: '#B5704F' }}>LANGKAH 1 DARI 3</span>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div key={s} className="h-1.5 w-8 rounded-full" style={{ backgroundColor: s <= 1 ? '#B5704F' : '#E0D8D0' }} />
          ))}
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>Kapan hari istimewamu?</h1>
      <p className="text-sm mb-8" style={{ color: '#6B6560' }}>Kami siapkan seluruh timeline persiapan otomatis untukmu.</p>

      <div className="flex flex-col gap-5">
        <Input
          label="Tanggal Akad *"
          type="date"
          value={akadDate}
          onChange={(e) => setAkadDate(e.target.value)}
          required
          min={new Date().toISOString().split('T')[0]}
        />

        {/* Resepsi toggle */}
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>Resepsi di hari yang sama?</p>
            <p className="text-xs mt-0.5" style={{ color: '#6B6560' }}>Biasanya akad & resepsi 1 hari</p>
          </div>
          <button
            type="button"
            onClick={() => setHasResepsi(!hasResepsi)}
            className="w-12 h-6 rounded-full relative transition-colors"
            style={{ backgroundColor: hasResepsi ? '#B5704F' : '#C4BAB2' }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
              style={{ transform: hasResepsi ? 'translateX(26px)' : 'translateX(2px)' }}
            />
          </button>
        </div>

        {/* Jam Akad */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: '#1A1A1A' }}>Jam Akad</label>
          <div className="flex gap-3">
            <input
              type="number"
              min={0}
              max={23}
              value={akadTime.split(':')[0]}
              onChange={(e) => {
                const h = e.target.value.padStart(2, '0')
                setAkadTime(`${h}:${akadTime.split(':')[1]}`)
              }}
              className="w-full h-12 rounded-xl text-center text-lg font-semibold outline-none"
              style={{ backgroundColor: '#EDE5DC', color: '#1A1A1A' }}
            />
            <span className="flex items-center text-2xl font-bold" style={{ color: '#6B6560' }}>:</span>
            <input
              type="number"
              min={0}
              max={59}
              value={akadTime.split(':')[1]}
              onChange={(e) => {
                const m = e.target.value.padStart(2, '0')
                setAkadTime(`${akadTime.split(':')[0]}:${m}`)
              }}
              className="w-full h-12 rounded-xl text-center text-lg font-semibold outline-none"
              style={{ backgroundColor: '#EDE5DC', color: '#1A1A1A' }}
            />
          </div>
        </div>

        <Input
          label="Kota Pernikahan"
          type="text"
          placeholder="Jakarta, Yogyakarta..."
          value={kota}
          onChange={(e) => setKota(e.target.value)}
          leftIcon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          }
        />
      </div>

      <div className="mt-auto pt-8 pb-8 flex flex-col gap-3">
        <Button onClick={handleNext} fullWidth size="lg" disabled={!akadDate}>
          Lanjut →
        </Button>
        <button
          onClick={handleSkip}
          className="text-sm font-medium py-2"
          style={{ color: '#6B6560' }}
        >
          Isi nanti
        </button>
      </div>
    </div>
  )
}
