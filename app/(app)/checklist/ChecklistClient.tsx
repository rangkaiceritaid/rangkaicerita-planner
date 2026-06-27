'use client'

import Link from 'next/link'
import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { Task } from '@/types/database'

type FilterType = 'semua' | 'aktif' | 'selesai' | 'belum'

interface MilestoneWithTasks {
  id: string
  title: string
  description: string | null
  target_date: string | null
  sort_order: number
  tasks: Task[]
}

interface Props {
  milestones: MilestoneWithTasks[]
  weddingId: string
  totalTemplates: number
  activatedCount: number
}

export function ChecklistClient({ milestones, totalTemplates, activatedCount }: Props) {
  const [filter, setFilter] = useState<FilterType>('semua')

  const allTasks = milestones.flatMap(m => m.tasks)
  const totalTasks = allTasks.length
  const doneTasks = allTasks.filter(t => t.is_completed).length

  const filters: { key: FilterType; label: string }[] = [
    { key: 'semua', label: 'Semua' },
    { key: 'aktif', label: 'Sedang berjalan' },
    { key: 'selesai', label: 'Selesai' },
    { key: 'belum', label: 'Belum mulai' },
  ]

  function filterMilestone(m: MilestoneWithTasks) {
    if (filter === 'semua') return true
    const tasks = m.tasks
    const done = tasks.filter(t => t.is_completed).length
    if (filter === 'selesai') return done === tasks.length && tasks.length > 0
    if (filter === 'aktif') return done > 0 && done < tasks.length
    if (filter === 'belum') return done === 0
    return true
  }

  const visible = milestones.filter(filterMilestone)

  return (
    <div>
      <PageHeader
        title="Checklist Persiapan"
        subtitle={`${milestones.length} milestone · ${totalTasks} tugas · ${doneTasks} selesai`}
      />

      {/* Template picker banner */}
      <div className="px-5 mb-4">
        <Link
          href="/checklist/template"
          className="flex items-center justify-between px-4 py-3.5 rounded-2xl"
          style={{ backgroundColor: 'rgba(181,112,79,0.08)', border: '1.5px dashed rgba(181,112,79,0.4)' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📝</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#B5704F' }}>Pilih kategori persiapan</p>
              <p className="text-xs mt-0.5" style={{ color: '#6B6560' }}>
                {activatedCount > 0
                  ? `${activatedCount} dari ${totalTemplates} kategori aktif`
                  : 'Venue, vendor, busana, KUA, seserahan & lainnya'}
              </p>
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="#B5704F" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: filter === f.key ? '#B5704F' : '#EDE5DC',
                color: filter === f.key ? '#fff' : '#6B6560',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state jika belum ada tugas */}
      {totalTasks === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-semibold mb-1" style={{ color: '#1A1A1A' }}>Belum ada tugas</p>
          <p className="text-sm mb-5" style={{ color: '#6B6560' }}>Mulai pilih template untuk mengaktifkan tugas persiapan pernikahanmu</p>
          <Link
            href="/checklist/template"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: '#B5704F' }}
          >
            Pilih template sekarang
          </Link>
        </div>
      ) : (
        <div className="px-5 flex flex-col gap-3 pb-4">
          {visible.map((m) => {
            const total = m.tasks.length
            const done = m.tasks.filter(t => t.is_completed).length
            const pct = total > 0 ? Math.round((done / total) * 100) : 0
            const isDone = pct === 100

            return (
              <Card key={m.id}>
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: '#6B6560' }}>
                    {m.title}
                  </span>
                  <span className="text-xs font-bold" style={{ color: isDone ? '#2D4A3E' : '#B5704F' }}>
                    {pct}%
                  </span>
                </div>
                <h3 className="text-base font-semibold mb-1" style={{ color: '#1A1A1A' }}>
                  {m.description || m.title}
                </h3>
                <p className="text-sm mb-3" style={{ color: '#6B6560' }}>
                  {done} dari {total} tugas selesai
                </p>
                <ProgressBar value={pct} height={5} color={isDone ? '#2D4A3E' : '#B5704F'} />
                <div className="flex items-center justify-between mt-3">
                  <Badge variant={isDone ? 'green' : 'brown'}>
                    {isDone ? 'Selesai' : 'Sedang berjalan'}
                  </Badge>
                  <Link
                    href={`/checklist/${m.id}`}
                    className="flex items-center gap-1 text-sm font-medium"
                    style={{ color: '#B5704F' }}
                  >
                    {m.target_date && (
                      <span style={{ color: '#6B6560', fontSize: 12 }}>
                        Maks {new Date(m.target_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                </div>
              </Card>
            )
          })}

          {visible.length === 0 && (
            <div className="text-center py-12">
              <p style={{ color: '#6B6560' }}>Tidak ada milestone di kategori ini.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
