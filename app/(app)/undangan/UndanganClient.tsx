'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { Guest } from '@/types/database'

// Contact Picker API type (not in standard TS lib yet)
declare global {
  interface Navigator {
    contacts?: {
      select(properties: string[], options?: { multiple?: boolean }): Promise<Array<{ name?: string[]; tel?: string[] }>>
      getProperties(): Promise<string[]>
    }
  }
}

function parseVCard(text: string): { name?: string; phone?: string } {
  const name = text.match(/^FN[^:]*:(.+)$/m)?.[1]?.trim()
  // Ambil nomor pertama, bersihkan karakter non-digit kecuali +
  const rawPhone = text.match(/^TEL[^:]*:(.+)$/m)?.[1]?.trim()
  const phone = rawPhone?.replace(/[^\d+]/g, '') || undefined
  return { name, phone }
}

const PHONE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
)

function ContactPickerButton({ onPick }: { onPick: (name?: string, phone?: string) => void }) {
  const [mode, setMode] = useState<'none' | 'native' | 'vcard'>('none')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'contacts' in navigator) {
      setMode('native')
    } else {
      setMode('vcard')
    }
  }, [])

  if (mode === 'none') return null

  async function pickNative() {
    try {
      const available = await navigator.contacts!.getProperties()
      const props = (['name', 'tel'] as const).filter(p => available.includes(p))
      const results = await navigator.contacts!.select(props, { multiple: false })
      if (results.length > 0) {
        const c = results[0]
        onPick(c.name?.[0], c.tel?.[0])
      }
    } catch {
      // User cancelled
    }
  }

  function handleVCardFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const { name, phone } = parseVCard(text)
      onPick(name, phone)
    }
    reader.readAsText(file)
    // Reset input so file dapat dipilih ulang
    e.target.value = ''
  }

  const btnStyle: React.CSSProperties = {
    color: '#B5704F',
    backgroundColor: 'rgba(181,112,79,0.12)',
  }

  if (mode === 'native') {
    return (
      <button
        type="button"
        onClick={pickNative}
        title="Pilih dari kontak HP"
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
        style={btnStyle}
      >
        {PHONE_ICON}
      </button>
    )
  }

  // vCard fallback (iOS & browser lain)
  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".vcf,text/vcard"
        className="hidden"
        onChange={handleVCardFile}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        title="Import dari file kontak (.vcf)"
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
        style={btnStyle}
      >
        {PHONE_ICON}
      </button>
    </>
  )
}

function PartnerToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all"
      style={{ backgroundColor: value ? 'rgba(45,74,62,0.08)' : '#F7F3EE', border: `1.5px solid ${value ? '#2D4A3E' : '#E0D8D0'}` }}
    >
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4" style={{ color: value ? '#2D4A3E' : '#6B6560' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 -ml-1.5" style={{ color: value ? '#2D4A3E' : '#6B6560' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
        <span className="text-sm font-medium" style={{ color: value ? '#2D4A3E' : '#6B6560' }}>Membawa pasangan</span>
      </div>
      <div
        className="w-10 h-6 rounded-full flex items-center px-0.5 transition-all"
        style={{ backgroundColor: value ? '#2D4A3E' : '#D4CBC2' }}
      >
        <div
          className="w-5 h-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: value ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </div>
    </button>
  )
}

function GroupInput({ value, onChange, suggestions }: {
  value: string
  onChange: (val: string) => void
  suggestions: string[]
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const filtered = suggestions.filter(s =>
    s.toLowerCase().includes(value.toLowerCase()) && s !== value
  )

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <Input
        placeholder="Kelompok (Keluarga, Teman, Kantor...)"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
      />
      {open && (filtered.length > 0 || suggestions.length > 0) && (
        <div
          className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-hidden z-10"
          style={{ backgroundColor: '#fff', border: '1.5px solid #E0D8D0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
        >
          {/* Chip suggestions — semua kelompok yang ada */}
          {value === '' && suggestions.length > 0 && (
            <div className="px-3 pt-3 pb-2 flex flex-wrap gap-2">
              {suggestions.map(s => (
                <button
                  key={s}
                  onMouseDown={e => { e.preventDefault(); onChange(s); setOpen(false) }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: 'rgba(181,112,79,0.1)', color: '#B5704F' }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {/* Filtered dropdown saat mengetik */}
          {value !== '' && filtered.map(s => (
            <button
              key={s}
              onMouseDown={e => { e.preventDefault(); onChange(s); setOpen(false) }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-left"
              style={{ color: '#1A1A1A', borderTop: '1px solid #F5F0EB' }}
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#B5704F' }}>
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const RSVP_OPTIONS = [
  { key: 'pending', label: 'Pending', variant: 'gray' as const },
  { key: 'hadir', label: 'Hadir', variant: 'green' as const },
  { key: 'tidak_hadir', label: 'Terundang', variant: 'brown' as const },
]

interface GuestForm {
  name: string
  phone: string
  group_label: string
  invitation_type: string
  has_partner: boolean
}

interface Props {
  guests: Guest[]
  weddingId: string
  groomName: string
  brideName: string
}

export function UndanganClient({ guests: initialGuests, weddingId, groomName, brideName }: Props) {
  const [guests, setGuests] = useState(initialGuests)

  const groupSuggestions = useMemo(() => {
    const set = new Set(guests.map(g => g.group_label).filter(Boolean) as string[])
    return Array.from(set).sort()
  }, [guests])
  const [activeTab, setActiveTab] = useState<'all' | 'groom' | 'bride' | 'both'>('all')
  const [search, setSearch] = useState('')

  // Add
  const [showAdd, setShowAdd] = useState(false)
  const [newGuest, setNewGuest] = useState<GuestForm>({ name: '', phone: '', group_label: '', invitation_type: 'both', has_partner: false })
  const [adding, setAdding] = useState(false)

  // Edit
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<GuestForm>({ name: '', phone: '', group_label: '', invitation_type: 'both', has_partner: false })
  const [saving, setSaving] = useState(false)

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Pagination
  const PAGE_SIZE = 15
  const [page, setPage] = useState(1)

  const supabase = createClient()

  const pihakOpts = [
    { value: 'groom', label: groomName.split(' ')[0] },
    { value: 'bride', label: brideName.split(' ')[0] },
    { value: 'both', label: 'Bersama' },
  ]

  const tabs = [
    { key: 'all' as const, label: 'Semua' },
    { key: 'groom' as const, label: groomName.split(' ')[0] },
    { key: 'bride' as const, label: brideName.split(' ')[0] },
    { key: 'both' as const, label: 'Bersama' },
  ]

  const tabGuests = useMemo(() => {
    setPage(1)
    if (activeTab === 'all') return guests
    if (activeTab === 'both') return guests.filter(g => ['both', 'akad', 'resepsi'].includes(g.invitation_type))
    return guests.filter(g => g.invitation_type === activeTab)
  }, [guests, activeTab])

  const filtered = useMemo(() => {
    setPage(1)
    if (!search) return tabGuests
    const q = search.toLowerCase()
    return tabGuests.filter(g =>
      g.name.toLowerCase().includes(q) ||
      g.group_label?.toLowerCase().includes(q)
    )
  }, [tabGuests, search])

  const allGrouped = useMemo(() => {
    const groups: Record<string, Guest[]> = {}
    filtered.forEach(g => {
      const key = g.group_label || 'Lainnya'
      if (!groups[key]) groups[key] = []
      groups[key].push(g)
    })
    return groups
  }, [filtered])

  // Pagination per kelompok: kumpulkan kelompok sampai PAGE_SIZE tamu terpenuhi
  const groupPages = useMemo(() => {
    const pages: Array<[string, Guest[]][]> = []
    let current: [string, Guest[]][] = []
    let count = 0
    for (const entry of Object.entries(allGrouped)) {
      if (count > 0 && count + entry[1].length > PAGE_SIZE) {
        pages.push(current)
        current = []
        count = 0
      }
      current.push(entry)
      count += entry[1].length
    }
    if (current.length > 0) pages.push(current)
    return pages
  }, [allGrouped])

  const totalPages = groupPages.length
  const groupedGuests = groupPages[page - 1] ?? []

  const totalKepala = tabGuests.reduce((s, g) => s + (g.has_partner ? 2 : 1), 0)
  const hadir = tabGuests.filter(g => g.rsvp_status === 'hadir').reduce((s, g) => s + (g.has_partner ? 2 : 1), 0)
  const tidakHadir = tabGuests.filter(g => g.rsvp_status === 'tidak_hadir').reduce((s, g) => s + (g.has_partner ? 2 : 1), 0)
  const pending = tabGuests.filter(g => g.rsvp_status === 'pending').reduce((s, g) => s + (g.has_partner ? 2 : 1), 0)

  const tabCounts: Record<string, number> = {
    all: guests.length,
    groom: guests.filter(g => g.invitation_type === 'groom').length,
    bride: guests.filter(g => g.invitation_type === 'bride').length,
    both: guests.filter(g => ['both', 'akad', 'resepsi'].includes(g.invitation_type)).length,
  }

  async function toggleRsvp(guestId: string, current: string) {
    const next = current === 'pending' ? 'hadir' : current === 'hadir' ? 'tidak_hadir' : 'pending'
    setGuests(prev => prev.map(g => g.id === guestId ? { ...g, rsvp_status: next } : g))
    await supabase.from('guests').update({ rsvp_status: next }).eq('id', guestId)
  }

  async function addGuest() {
    if (!newGuest.name.trim()) return
    setAdding(true)
    const { data } = await supabase.from('guests').insert({
      wedding_id: weddingId,
      name: newGuest.name.trim(),
      phone: newGuest.phone || null,
      group_label: newGuest.group_label || null,
      invitation_type: newGuest.invitation_type,
      has_partner: newGuest.has_partner,
    }).select().single()
    if (data) {
      setGuests(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setNewGuest({ name: '', phone: '', group_label: '', invitation_type: 'both', has_partner: false })
      setShowAdd(false)
    }
    setAdding(false)
  }

  function openEdit(guest: Guest) {
    setEditId(guest.id)
    setEditForm({
      name: guest.name,
      phone: guest.phone ?? '',
      group_label: guest.group_label ?? '',
      invitation_type: guest.invitation_type,
      has_partner: guest.has_partner,
    })
  }

  async function saveEdit() {
    if (!editId || !editForm.name.trim()) return
    setSaving(true)
    const { data } = await supabase
      .from('guests')
      .update({
        name: editForm.name.trim(),
        phone: editForm.phone || null,
        group_label: editForm.group_label || null,
        invitation_type: editForm.invitation_type,
        has_partner: editForm.has_partner,
      })
      .eq('id', editId)
      .select()
      .single()
    if (data) {
      setGuests(prev => prev.map(g => g.id === editId ? data : g))
      setEditId(null)
    }
    setSaving(false)
  }

  async function deleteGuest() {
    if (!deleteId) return
    setDeleting(true)
    await supabase.from('guests').delete().eq('id', deleteId)
    setGuests(prev => prev.filter(g => g.id !== deleteId))
    setDeleteId(null)
    setDeleting(false)
  }

  const deleteTarget = guests.find(g => g.id === deleteId)

  return (
    <div>
      <PageHeader
        title="Daftar Undangan"
        subtitle={`${guests.length} tamu · ${totalKepala} kepala`}
        rightElement={
          <button
            onClick={() => setShowAdd(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#B5704F', color: '#fff' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        }
      />

      {/* Stats */}
      <div className="px-5 mb-4 flex gap-2">
        {[
          { label: 'Kepala', count: totalKepala, color: '#1A1A1A' },
          { label: 'Hadir', count: hadir, color: '#2D4A3E' },
          { label: 'Terundang', count: tidakHadir, color: '#B5704F' },
          { label: 'Pending', count: pending, color: '#6B6560' },
        ].map((s) => (
          <div key={s.label} className="flex-1 text-center py-3 rounded-xl" style={{ backgroundColor: '#fff', border: '1px solid #F0EAE2' }}>
            <p className="text-lg font-bold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs mt-0.5" style={{ color: '#6B6560' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="px-5 mb-3">
        <Input
          placeholder="Cari nama atau kelompok..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          }
        />
      </div>

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map(tab => {
            const count = tabCounts[tab.key]
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: isActive ? '#B5704F' : '#EDE5DC',
                  color: isActive ? '#fff' : '#6B6560',
                }}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                    style={{
                      backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(181,112,79,0.15)',
                      color: isActive ? '#fff' : '#B5704F',
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="px-5 mb-4">
          <Card>
            <h3 className="font-semibold mb-3" style={{ color: '#1A1A1A' }}>Tambah Tamu</h3>
            <div className="flex flex-col gap-3">
              <Input placeholder="Nama tamu *" value={newGuest.name} onChange={(e) => setNewGuest(p => ({ ...p, name: e.target.value }))} autoFocus />
              <Input
                placeholder="No. HP / WhatsApp"
                type="tel"
                value={newGuest.phone}
                onChange={(e) => setNewGuest(p => ({ ...p, phone: e.target.value }))}
                rightIcon={
                  <ContactPickerButton onPick={(name, phone) => {
                    setNewGuest(p => ({
                      ...p,
                      phone: phone ?? p.phone,
                      name: p.name.trim() === '' && name ? name : p.name,
                    }))
                  }} />
                }
              />
              <GroupInput value={newGuest.group_label} onChange={v => setNewGuest(p => ({ ...p, group_label: v }))} suggestions={groupSuggestions} />
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: '#6B6560' }}>Undangan dari pihak</label>
                <div className="flex gap-2">
                  {pihakOpts.map(opt => (
                    <button key={opt.value} onClick={() => setNewGuest(p => ({ ...p, invitation_type: opt.value }))}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{ backgroundColor: newGuest.invitation_type === opt.value ? '#B5704F' : '#EDE5DC', color: newGuest.invitation_type === opt.value ? '#fff' : '#6B6560' }}
                    >{opt.label}</button>
                  ))}
                </div>
              </div>
              <PartnerToggle value={newGuest.has_partner} onChange={v => setNewGuest(p => ({ ...p, has_partner: v }))} />
              <div className="flex gap-2">
                <Button onClick={addGuest} loading={adding} size="sm">Tambah</Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Batal</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Guest list */}
      <div className="px-5 pb-4">
        {groupedGuests.map(([group, groupGuests]) => (
          <div key={group} className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold" style={{ color: '#6B6560' }}>{group}</h3>
              <span className="text-xs" style={{ color: '#6B6560' }}>{groupGuests.reduce((s, g) => s + (g.has_partner ? 2 : 1), 0)} kepala</span>
            </div>
            <div className="flex flex-col gap-2">
              {groupGuests.map((guest) => {
                const rsvp = RSVP_OPTIONS.find(r => r.key === guest.rsvp_status) || RSVP_OPTIONS[0]
                const pihak = guest.invitation_type === 'groom' ? groomName.split(' ')[0]
                  : guest.invitation_type === 'bride' ? brideName.split(' ')[0] : null
                const isEditing = editId === guest.id

                return (
                  <Card key={guest.id} className="py-3">
                    {isEditing ? (
                      /* ── EDIT MODE ── */
                      <div className="flex flex-col gap-3">
                        <Input placeholder="Nama tamu *" value={editForm.name} onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))} autoFocus />
                        <Input
                          placeholder="No. HP / WhatsApp"
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))}
                          rightIcon={
                            <ContactPickerButton onPick={(_, phone) => {
                              if (phone) setEditForm(p => ({ ...p, phone }))
                            }} />
                          }
                        />
                        <GroupInput value={editForm.group_label} onChange={v => setEditForm(p => ({ ...p, group_label: v }))} suggestions={groupSuggestions} />
                        <div>
                          <label className="text-xs font-medium block mb-1.5" style={{ color: '#6B6560' }}>Undangan dari pihak</label>
                          <div className="flex gap-2">
                            {pihakOpts.map(opt => (
                              <button key={opt.value} onClick={() => setEditForm(p => ({ ...p, invitation_type: opt.value }))}
                                className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                                style={{ backgroundColor: editForm.invitation_type === opt.value ? '#B5704F' : '#EDE5DC', color: editForm.invitation_type === opt.value ? '#fff' : '#6B6560' }}
                              >{opt.label}</button>
                            ))}
                          </div>
                        </div>
                        <PartnerToggle value={editForm.has_partner} onChange={v => setEditForm(p => ({ ...p, has_partner: v }))} />
                        <div className="flex gap-2">
                          <Button onClick={saveEdit} loading={saving} size="sm">Simpan</Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditId(null)}>Batal</Button>
                        </div>
                      </div>
                    ) : (
                      /* ── VIEW MODE ── */
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{ backgroundColor: '#EDE5DC', color: '#B5704F' }}>
                          {guest.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium truncate" style={{ color: '#1A1A1A' }}>{guest.name}</p>
                            {guest.has_partner && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: 'rgba(45,74,62,0.1)', color: '#2D4A3E' }}>
                                +1
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {guest.phone && <p className="text-xs" style={{ color: '#6B6560' }}>{guest.phone}</p>}
                            {pihak && activeTab === 'all' && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: 'rgba(181,112,79,0.1)', color: '#B5704F' }}>
                                {pihak}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* RSVP toggle */}
                        <button onClick={() => toggleRsvp(guest.id, guest.rsvp_status)}>
                          <Badge variant={rsvp.variant}>{rsvp.label}</Badge>
                        </button>

                        {/* Action menu */}
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            onClick={() => openEdit(guest)}
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(107,101,96,0.08)' }}
                          >
                            <svg viewBox="0 0 16 16" fill="none" stroke="#6B6560" strokeWidth={1.6} className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.333 2a1.333 1.333 0 011.886 1.886L4.667 12.44l-2.334.447.447-2.334L11.333 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteId(guest.id)}
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(224,82,82,0.08)' }}
                          >
                            <svg viewBox="0 0 16 16" fill="none" stroke="#E05252" strokeWidth={1.6} className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2 4h12M5.333 4V2.667h5.334V4M6.667 7.333v4M9.333 7.333v4M3.333 4l.667 9.333h8L12.667 4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">👥</p>
            <p className="text-sm font-medium mb-1" style={{ color: '#1A1A1A' }}>
              {search ? 'Tamu tidak ditemukan' : 'Belum ada tamu di tab ini'}
            </p>
            <p className="text-xs" style={{ color: '#6B6560' }}>
              {search ? 'Coba kata kunci lain' : 'Tap + untuk menambahkan tamu'}
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 pb-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
              style={{ backgroundColor: '#EDE5DC', color: '#6B6560' }}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 12L6 8l4-4" />
              </svg>
              Sebelumnya
            </button>
            <span className="text-xs" style={{ color: '#6B6560' }}>{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
              style={{ backgroundColor: '#EDE5DC', color: '#6B6560' }}
            >
              Berikutnya
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 4l4 4-4 4" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation overlay */}
      {deleteId && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={() => setDeleteId(null)}
        >
          <div
            className="w-full rounded-2xl p-6"
            style={{ backgroundColor: '#fff', maxWidth: 340 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(224,82,82,0.1)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#E05252" strokeWidth={1.8} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              </svg>
            </div>
            <p className="text-base font-bold text-center mb-1" style={{ color: '#1A1A1A' }}>Hapus tamu?</p>
            <p className="text-sm text-center mb-6" style={{ color: '#6B6560' }}>
              <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{deleteTarget?.name}</span> akan dihapus dari daftar undangan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 h-12 rounded-xl text-sm font-semibold border-2"
                style={{ color: '#B5704F', borderColor: '#B5704F', backgroundColor: 'transparent' }}
              >
                Batal
              </button>
              <button
                onClick={deleteGuest}
                disabled={deleting}
                className="flex-1 h-12 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: '#E05252' }}
              >
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
