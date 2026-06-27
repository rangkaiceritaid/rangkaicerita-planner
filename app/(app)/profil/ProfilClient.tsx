'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { formatRupiah } from '@/constants/budgetCategories'
import type { Profile, Wedding } from '@/types/database'

interface Props {
  profile: Profile | null
  wedding: Wedding | null
  email: string
}

export function ProfilClient({ profile: initialProfile, wedding, email }: Props) {
  const router = useRouter()
  const [profile, setProfile] = useState(initialProfile)
  const [editing, setEditing] = useState(!initialProfile?.groom_name && !initialProfile?.bride_name)
  const [groomName, setGroomName] = useState(initialProfile?.groom_name ?? '')
  const [brideName, setBrideName] = useState(initialProfile?.bride_name ?? '')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function saveProfile() {
    setSaving(true)
    const { data } = await supabase
      .from('profiles')
      .update({ groom_name: groomName, bride_name: brideName })
      .eq('id', profile!.id)
      .select()
      .single()
    if (data) {
      setProfile(data)
      router.refresh()
    }
    setEditing(false)
    setSaving(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const coupleName = profile?.groom_name && profile?.bride_name
    ? `${profile.groom_name} & ${profile.bride_name}`
    : profile?.groom_name || 'Pasangan'

  return (
    <div>
      <PageHeader title="Profil" />

      {/* Profile card */}
      <div className="px-5 mb-4">
        <Card className="text-center py-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold"
            style={{ backgroundColor: '#EDE5DC', color: '#B5704F' }}
          >
            💍
          </div>
          <h2 className="text-lg font-bold" style={{ color: '#1A1A1A' }}>{coupleName}</h2>
          <p className="text-sm mt-0.5" style={{ color: '#6B6560' }}>{email}</p>
          {wedding?.akad_date && (
            <p className="text-sm mt-1" style={{ color: '#B5704F' }}>
              {new Date(wedding.akad_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </Card>
      </div>

      {/* Edit names */}
      {editing ? (
        <div className="px-5 mb-4">
          <Card>
            <h3 className="font-semibold mb-3" style={{ color: '#1A1A1A' }}>Edit Nama Pasangan</h3>
            <div className="flex flex-col gap-3">
              <Input label="Nama Pengantin Pria" value={groomName} onChange={(e) => setGroomName(e.target.value)} />
              <Input label="Nama Pengantin Wanita" value={brideName} onChange={(e) => setBrideName(e.target.value)} />
              <div className="flex gap-2">
                <Button onClick={saveProfile} loading={saving} size="sm">Simpan</Button>
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Batal</Button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="px-5 mb-4">
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: '#B5704F' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Edit nama pasangan
          </button>
        </div>
      )}

      {/* Wedding info */}
      {wedding && (
        <div className="px-5 mb-4">
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#6B6560' }}>INFO PERNIKAHAN</h3>
          <Card>
            {[
              { label: 'Tanggal Akad', value: wedding.akad_date ? new Date(wedding.akad_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-' },
              { label: 'Kota', value: wedding.kota_pernikahan || '-' },
              { label: 'Total Anggaran', value: formatRupiah(wedding.total_budget) },
            ].map((item, i, arr) => (
              <div
                key={item.label}
                className="flex justify-between py-3"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid #F0EAE2' : 'none' }}
              >
                <span className="text-sm" style={{ color: '#6B6560' }}>{item.label}</span>
                <span className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{item.value}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* Sign out */}
      <div className="px-5 mb-8">
        <Button variant="outline" fullWidth onClick={signOut}>
          Keluar dari akun
        </Button>
      </div>
    </div>
  )
}
