'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import type { TaskTemplate } from '@/types/database'

const GROUP_ICONS: Record<string, string> = {
  'Venue & Akad': '🏛️',
  'Vendor Utama': '🤝',
  'Busana & Penampilan': '👗',
  'Undangan & Tamu': '✉️',
  'Konsep & Dekorasi': '🌸',
  'Anggaran & Administrasi': '📊',
  'Dokumen KUA': '📋',
  'Seserahan & Mahar': '💍',
  'Hari-H': '🎊',
}

const GROUP_DESC: Record<string, string> = {
  'Venue & Akad': 'Survey, booking, dan persiapan tempat akad',
  'Vendor Utama': 'Foto/video, katering, dekorasi, MC, dan transportasi',
  'Busana & Penampilan': 'Baju pengantin, fitting, MUA, dan seragam keluarga',
  'Undangan & Tamu': 'Desain, cetak, kirim undangan, dan kelola RSVP',
  'Konsep & Dekorasi': 'Tema, palet warna, moodboard, dan detail dekorasi',
  'Anggaran & Administrasi': 'Kelola budget, rundown, dan koordinasi acara',
  'Dokumen KUA': 'Semua dokumen administrasi pernikahan di KUA',
  'Seserahan & Mahar': 'Daftar, beli, dan packaging seserahan',
  'Hari-H': 'Checklist dan alur di hari pernikahan',
}

interface Props {
  templates: TaskTemplate[]
  activatedGroups: Set<string>   // group_label yang sudah diaktifkan
  weddingId: string
}

interface CustomMilestone {
  tempId: string
  title: string
  targetDate: string
}

export function TemplatePickerClient({ templates, activatedGroups, weddingId }: Props) {
  const router = useRouter()
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set(activatedGroups))
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [customMilestones, setCustomMilestones] = useState<CustomMilestone[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const [saving, startSaving] = useTransition()
  const supabase = createClient()

  function addCustomMilestone() {
    if (!newTitle.trim()) return
    setCustomMilestones(prev => [...prev, {
      tempId: crypto.randomUUID(),
      title: newTitle.trim(),
      targetDate: newDate,
    }])
    setNewTitle('')
    setNewDate('')
    setShowAddForm(false)
  }

  function removeCustomMilestone(tempId: string) {
    setCustomMilestones(prev => prev.filter(m => m.tempId !== tempId))
  }

  // Dedupe groups by sort_group order
  const groups = [...new Map(
    templates.map(t => [t.group_label, { label: t.group_label, sort: t.sort_group }])
  ).values()].sort((a, b) => a.sort - b.sort)

  function toggleGroup(label: string) {
    setSelectedGroups(prev => {
      const next = new Set(prev)
      next.has(label) ? next.delete(label) : next.add(label)
      return next
    })
  }

  function toggleExpand(label: string) {
    setExpandedGroup(prev => prev === label ? null : label)
  }

  async function handleSave() {
    startSaving(async () => {
      // Ambil milestone yang sudah ada
      const { data: existingMilestones } = await supabase
        .from('milestones')
        .select('id, title')
        .eq('wedding_id', weddingId)

      const existingMap = new Map((existingMilestones ?? []).map(m => [m.title, m.id]))
      const existingLabels = new Set(existingMap.keys())

      // Grup yang dipilih tapi belum ada milestonenya
      const toAdd = [...selectedGroups].filter(g => !existingLabels.has(g))
      // Grup yang dihapus (ada di DB tapi tidak dipilih)
      const toRemove = [...existingLabels].filter(g => !selectedGroups.has(g))

      // Hapus milestone & task yang di-uncheck
      for (const label of toRemove) {
        const milestoneId = existingMap.get(label)
        if (milestoneId) {
          // tasks akan ikut terhapus karena ON DELETE CASCADE
          await supabase.from('milestones').delete().eq('id', milestoneId)
          await supabase.from('wedding_task_templates')
            .delete()
            .eq('wedding_id', weddingId)
            .in('template_id', templates.filter(t => t.group_label === label).map(t => t.id))
        }
      }

      // Buat milestone & tasks baru untuk grup yang dipilih
      for (const label of toAdd) {
        const items = templates
          .filter(t => t.group_label === label)
          .sort((a, b) => a.sort_order - b.sort_order)
        if (items.length === 0) continue

        const groupInfo = groups.find(g => g.label === label)!

        // Cari target_date dari akad_date wedding
        const { data: wedding } = await supabase
          .from('weddings').select('akad_date').eq('id', weddingId).single()

        let targetDate: string | null = null
        if (wedding?.akad_date) {
          const akad = new Date(wedding.akad_date)
          const item = items[0]
          // group_label encoding: H-12 Bulan, H-9 Bulan, H-2 Minggu, Hari-H
          const monthsMatch = label.match(/H-(\d+) Bulan/)
          const weeksMatch = label.match(/H-(\d+) Minggu/)
          if (monthsMatch) {
            const d = new Date(akad)
            d.setMonth(d.getMonth() - parseInt(monthsMatch[1]))
            targetDate = d.toISOString().split('T')[0]
          } else if (weeksMatch) {
            const d = new Date(akad)
            d.setDate(d.getDate() - parseInt(weeksMatch[1]) * 7)
            targetDate = d.toISOString().split('T')[0]
          } else if (label === 'Hari-H') {
            targetDate = wedding.akad_date
          }
        }

        // Insert milestone
        const { data: milestone } = await supabase.from('milestones').insert({
          wedding_id: weddingId,
          title: label,
          description: label,
          target_date: targetDate,
          sort_order: groupInfo.sort,
          is_system: true,
        }).select().single()

        if (!milestone) continue

        // Insert tasks untuk milestone ini
        for (const tmpl of items) {
          const { data: task } = await supabase.from('tasks').insert({
            wedding_id: weddingId,
            milestone_id: milestone.id,
            title: tmpl.title,
            description: tmpl.description,
            link_url: tmpl.link_url,
            is_system: true,
            is_active: true,
            sort_order: tmpl.sort_order,
          }).select().single()

          if (task) {
            await supabase.from('wedding_task_templates').upsert({
              wedding_id: weddingId,
              template_id: tmpl.id,
              task_id: task.id,
            })
          }
        }
      }

      // Buat milestone custom yang ditambahkan user
      const maxSort = Math.max(0, ...groups.map(g => g.sort)) + 1
      for (let i = 0; i < customMilestones.length; i++) {
        const cm = customMilestones[i]
        await supabase.from('milestones').insert({
          wedding_id: weddingId,
          title: cm.title,
          description: cm.title,
          target_date: cm.targetDate || null,
          sort_order: maxSort + i,
          is_system: false,
        })
      }

      router.push('/checklist')
      router.refresh()
    })
  }

  const totalSelected = selectedGroups.size
  const totalGroups = groups.length

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF7F4' }}>
      <PageHeader
        title="Pilih Milestone"
        subtitle="Pilih persiapan yang ingin kamu aktifkan"
        backHref="/checklist"
      />

      {/* Summary bar */}
      <div className="px-5 mb-5 flex items-center justify-between">
        <p className="text-sm" style={{ color: '#6B6560' }}>
          <span className="font-bold" style={{ color: '#1A1A1A' }}>{totalSelected}</span> dari {totalGroups} milestone dipilih
        </p>
        <button
          onClick={() => {
            if (totalSelected === totalGroups) {
              setSelectedGroups(new Set())
            } else {
              setSelectedGroups(new Set(groups.map(g => g.label)))
            }
          }}
          className="text-sm font-medium"
          style={{ color: '#B5704F' }}
        >
          {totalSelected === totalGroups ? 'Batalkan semua' : 'Pilih semua'}
        </button>
      </div>

      {/* Milestone cards */}
      <div className="px-5 flex flex-col gap-3">
        {groups.map(group => {
          const items = templates
            .filter(t => t.group_label === group.label)
            .sort((a, b) => a.sort_order - b.sort_order)
          const isSelected = selectedGroups.has(group.label)
          const isExpanded = expandedGroup === group.label
          const icon = GROUP_ICONS[group.label] ?? '📌'

          return (
            <div
              key={group.label}
              className="rounded-2xl overflow-hidden transition-all"
              style={{
                border: isSelected ? '2px solid #B5704F' : '2px solid #E0D8D0',
                backgroundColor: '#fff',
              }}
            >
              {/* Card header — klik untuk toggle pilih */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                {/* Checkbox */}
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                  style={{
                    borderColor: isSelected ? '#B5704F' : '#D4C9BF',
                    backgroundColor: isSelected ? '#B5704F' : 'transparent',
                  }}
                >
                  {isSelected && (
                    <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {/* Icon & label */}
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <span className="text-2xl flex-shrink-0">{icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold" style={{ color: isSelected ? '#B5704F' : '#1A1A1A' }}>
                      {group.label}
                    </p>
                    <p className="text-xs mt-0.5 leading-snug" style={{ color: '#9E9089' }}>
                      {GROUP_DESC[group.label] ?? `${items.length} tugas`}
                    </p>
                  </div>
                </button>

                {/* Expand toggle untuk preview isi */}
                <button
                  onClick={() => toggleExpand(group.label)}
                  className="flex-shrink-0 flex flex-col items-center gap-0.5"
                  style={{ color: '#9E9089' }}
                >
                  <span className="text-[10px] font-medium">{items.length} tugas</span>
                  <svg
                    viewBox="0 0 24 24" fill="none" stroke="#9E9089" strokeWidth={2}
                    className="w-4 h-4 transition-transform"
                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </div>

              {/* Preview isi tugas */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid #F0EAE2' }}>
                  {items.map((tmpl, i) => (
                    <div
                      key={tmpl.id}
                      className="flex items-start gap-2.5 px-4 py-2.5"
                      style={{
                        borderBottom: i < items.length - 1 ? '1px solid #F5F0EB' : 'none',
                        backgroundColor: '#FDFAF8',
                      }}
                    >
                      <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#B5704F', opacity: 0.5 }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium" style={{ color: '#1A1A1A' }}>{tmpl.title}</p>
                        {tmpl.description && (
                          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#9E9089' }}>{tmpl.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Custom milestone section */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold" style={{ color: '#1A1A1A' }}>Milestone sendiri</p>
            <p className="text-xs mt-0.5" style={{ color: '#9E9089' }}>Tambah persiapan di luar template</p>
          </div>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-xl"
              style={{ backgroundColor: 'rgba(181,112,79,0.1)', color: '#B5704F' }}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v10M3 8h10" />
              </svg>
              Tambah
            </button>
          )}
        </div>

        {/* Form tambah */}
        {showAddForm && (
          <div className="rounded-2xl p-4 mb-3" style={{ backgroundColor: '#fff', border: '2px solid #B5704F' }}>
            <p className="text-sm font-semibold mb-3" style={{ color: '#1A1A1A' }}>Milestone baru</p>
            <div className="flex flex-col gap-3">
              <input
                autoFocus
                placeholder="Nama milestone (wajib)"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomMilestone()}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ backgroundColor: '#F5F0EB', color: '#1A1A1A', border: '1.5px solid transparent' }}
                onFocus={e => (e.target.style.borderColor = '#B5704F')}
                onBlur={e => (e.target.style.borderColor = 'transparent')}
              />
              <div>
                <p className="text-xs mb-1.5" style={{ color: '#9E9089' }}>Target tanggal (opsional)</p>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ backgroundColor: '#F5F0EB', color: '#1A1A1A', border: '1.5px solid transparent' }}
                  onFocus={e => (e.target.style.borderColor = '#B5704F')}
                  onBlur={e => (e.target.style.borderColor = 'transparent')}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addCustomMilestone}
                  disabled={!newTitle.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
                  style={{ backgroundColor: '#B5704F' }}
                >
                  Tambahkan
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setNewTitle(''); setNewDate('') }}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: '#EDE5DC', color: '#6B6560' }}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Daftar custom milestone yang sudah ditambahkan */}
        {customMilestones.length > 0 && (
          <div className="flex flex-col gap-2 mb-3">
            {customMilestones.map(cm => (
              <div
                key={cm.tempId}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ backgroundColor: '#fff', border: '2px solid #E0D8D0' }}
              >
                <span className="text-lg">📌</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>{cm.title}</p>
                  {cm.targetDate && (
                    <p className="text-xs mt-0.5" style={{ color: '#9E9089' }}>
                      Target: {new Date(cm.targetDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeCustomMilestone(cm.tempId)}
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(224,82,82,0.1)' }}
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="#E05252" strokeWidth={2} className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {customMilestones.length === 0 && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm"
            style={{ border: '2px dashed #D4C9BF', color: '#9E9089' }}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v10M3 8h10" />
            </svg>
            Tambah milestone sendiri
          </button>
        )}
      </div>

      {/* Save button */}
      <div className="px-5 pt-4 pb-4">
        <Button onClick={handleSave} loading={saving} fullWidth size="lg">
          Aktifkan {totalSelected + customMilestones.length} milestone
        </Button>
      </div>
    </div>
  )
}
