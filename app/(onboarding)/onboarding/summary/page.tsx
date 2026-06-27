'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { formatRupiah } from '@/constants/budgetCategories'
import { getDaysUntilWedding } from '@/lib/dates'

function SummaryContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const akadDate = params.get('akad_date') || ''
  const akadTime = params.get('akad_time') || ''
  const kota = params.get('kota') || ''
  const budget = parseInt(params.get('budget') || '0', 10)

  const daysLeft = akadDate ? getDaysUntilWedding(akadDate) : 0

  async function handleStart() {
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get or create profile names (prompt them inline or use email prefix)
      const nameFromEmail = user.email?.split('@')[0] || 'Pengantin'

      // Upsert profile with initial names
      await supabase.from('profiles').upsert({
        id: user.id,
        groom_name: nameFromEmail,
        bride_name: '',
        onboarding_completed: false,
      })

      // Create wedding record
      const { data: wedding, error: weddingError } = await supabase
        .from('weddings')
        .upsert({
          user_id: user.id,
          akad_date: akadDate || null,
          akad_time: akadTime || null,
          has_resepsi: params.get('has_resepsi') !== 'false',
          kota_pernikahan: kota || null,
          total_budget: budget,
        }, { onConflict: 'user_id' })
        .select('id')
        .single()

      if (weddingError) throw weddingError

      // Seed budget categories only (milestones dipilih sendiri via template picker)
      if (akadDate) {
        await supabase.rpc('seed_budget_categories', {
          p_wedding_id: wedding.id,
        })
      }

      // Mark onboarding complete
      await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id)

      router.push('/beranda')
      router.refresh()
    } catch (err) {
      setError('Terjadi kesalahan. Coba lagi.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col px-6 pt-12">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-12">
        {[1, 2, 3].map((s) => (
          <div key={s} className="h-2 w-2 rounded-full" style={{ backgroundColor: '#B5704F' }} />
        ))}
      </div>

      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>Selamat, pasangan kamu!</h1>
        <p className="text-sm" style={{ color: '#6B6560' }}>Timeline persiapan pernikahanmu sudah siap.</p>
      </div>

      {/* Summary card */}
      <div className="rounded-2xl overflow-hidden mb-8" style={{ border: '1px solid #E0D8D0', backgroundColor: '#fff' }}>
        {[
          {
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="#B5704F" strokeWidth={1.8} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            ),
            label: 'Hari-H',
            value: akadDate
              ? `${new Date(akadDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} · ${daysLeft} hari lagi`
              : 'Belum ditentukan',
          },
          {
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="#B5704F" strokeWidth={1.8} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            ),
            label: 'Pasangan',
            value: 'Kamu & Pasangan',
          },
          {
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="#B5704F" strokeWidth={1.8} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            ),
            label: 'Anggaran',
            value: budget > 0 ? formatRupiah(budget) : 'Belum ditentukan',
          },
        ].map((item, i, arr) => (
          <div
            key={item.label}
            className="flex items-center gap-4 px-5 py-4"
            style={{ borderBottom: i < arr.length - 1 ? '1px solid #F0EAE2' : 'none' }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(181,112,79,0.1)' }}>
              {item.icon}
            </div>
            <div>
              <p className="text-xs" style={{ color: '#6B6560' }}>{item.label}</p>
              <p className="text-sm font-semibold mt-0.5" style={{ color: '#1A1A1A' }}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-center mb-4" style={{ color: '#E05252' }}>{error}</p>}

      <div className="mt-auto pb-10">
        <Button onClick={handleStart} fullWidth size="lg" loading={loading}>
          Mulai perjalananku →
        </Button>
      </div>
    </div>
  )
}

export default function OnboardingSummary() {
  return (
    <Suspense>
      <SummaryContent />
    </Suspense>
  )
}
