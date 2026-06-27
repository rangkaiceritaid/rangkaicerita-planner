'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { getDaysUntilWedding, getCountdownBreakdown } from '@/lib/dates'
import { formatRupiahShort, formatRupiah } from '@/constants/budgetCategories'
import type { Profile, Wedding, Task, BudgetCategory } from '@/types/database'

interface MilestoneWithTasks {
  id: string
  title: string
  sort_order: number
  tasks: { id: string; is_completed: boolean }[]
}

interface Props {
  profile: Profile | null
  wedding: Wedding | null
  monthTasks: Task[]
  milestones: MilestoneWithTasks[]
  totalSpent: number
  categories: BudgetCategory[]
}

function deadlineBadge(due_date: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(due_date)
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000)
  if (diffDays < 0) return { label: `Terlambat`, color: '#E05252', bg: 'rgba(224,82,82,0.1)' }
  if (diffDays === 0) return { label: 'Hari ini', color: '#E07B22', bg: 'rgba(224,123,34,0.1)' }
  if (diffDays <= 3) return { label: `${diffDays} hari lagi`, color: '#B5704F', bg: 'rgba(181,112,79,0.12)' }
  return {
    label: due.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    color: '#6B6560',
    bg: 'rgba(107,101,96,0.08)',
  }
}

export function BerandaClient({ profile, wedding, monthTasks: initialTasks, milestones, totalSpent, categories }: Props) {
  const [tasks, setTasks] = useState(initialTasks)
  const supabase = createClient()

  const days = wedding?.akad_date ? getDaysUntilWedding(wedding.akad_date) : null
  const breakdown = wedding?.akad_date ? getCountdownBreakdown(wedding.akad_date) : null
  const totalBudget = wedding?.total_budget ?? 0
  const spentPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  const coupleName = profile
    ? profile.groom_name && profile.bride_name
      ? `${profile.groom_name} & ${profile.bride_name}`
      : profile.groom_name || 'Pasangan'
    : 'Pasangan'

  async function toggleTask(taskId: string, current: boolean) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: !current } : t))
    await supabase.from('tasks').update({
      is_completed: !current,
      completed_at: !current ? new Date().toISOString() : null,
    }).eq('id', taskId)
  }

  return (
    <div className="px-5 pt-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm" style={{ color: '#6B6560' }}>Halo,</p>
          <Link href="/profil" className="flex items-center gap-1.5 group">
            <h1 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>{coupleName}</h1>
            <svg viewBox="0 0 24 24" fill="none" stroke="#B5704F" strokeWidth={2} className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
          </Link>
          {days !== null && (
            <p className="text-sm mt-0.5" style={{ color: '#6B6560' }}>{days} hari lagi</p>
          )}
        </div>
        <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EDE5DC' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#6B6560" strokeWidth={1.8} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </button>
      </div>

      {/* Countdown Widget */}
      {wedding?.akad_date && breakdown && (
        <Card className="mb-4 text-center">
          <p className="text-sm font-medium mb-2" style={{ color: '#B5704F' }}>
            {new Date(wedding.akad_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <div className="text-6xl font-bold mb-1" style={{ color: '#B5704F' }}>
            {breakdown.totalDays}
          </div>
          <p className="text-sm" style={{ color: '#6B6560' }}>hari lagi</p>
          <div className="flex justify-center gap-3 mt-4 flex-wrap">
            {[
              { val: breakdown.months, label: 'bln' },
              { val: breakdown.weeks, label: 'mgg' },
              { val: breakdown.totalDays, label: 'hr' },
            ].map(({ val, label }) => (
              <div key={label} className="px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(181,112,79,0.1)', color: '#B5704F' }}>
                {val} {label}
              </div>
            ))}
            {wedding.kota_pernikahan && (
              <div className="px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(181,112,79,0.1)', color: '#B5704F' }}>
                {wedding.kota_pernikahan}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Tugas Bulan Ini */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-base" style={{ color: '#1A1A1A' }}>Tugas Bulan Ini</h2>
            <p className="text-xs mt-0.5" style={{ color: '#6B6560' }}>
              {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Link href="/checklist" className="text-sm font-medium" style={{ color: '#B5704F' }}>Lihat semua</Link>
        </div>
        {tasks.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: '#6B6560' }}>
            Tidak ada tugas dengan deadline bulan ini 🎉
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {tasks.map((task) => {
              const badge = task.due_date ? deadlineBadge(task.due_date) : null
              return (
                <div key={task.id} className="flex items-start gap-3">
                  <Checkbox
                    checked={task.is_completed}
                    onChange={() => toggleTask(task.id, task.is_completed)}
                  />
                  <div className="flex-1 min-w-0">
                    <span
                      className="text-sm leading-snug"
                      style={{
                        color: task.is_completed ? '#6B6560' : '#1A1A1A',
                        textDecoration: task.is_completed ? 'line-through' : 'none',
                      }}
                    >
                      {task.title}
                    </span>
                    {badge && (
                      <div className="mt-1">
                        <span
                          className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: badge.bg, color: badge.color }}
                        >
                          <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5">
                            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M6 3.5V6l1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                          {badge.label}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Budget Widget */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-base" style={{ color: '#1A1A1A' }}>Anggaran</h2>
          <Link href="/anggaran" className="text-sm font-medium" style={{ color: '#B5704F' }}>Lihat detail</Link>
        </div>
        <div className="flex items-center gap-4">
          {/* Donut */}
          <div className="relative flex-shrink-0">
            <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#EDE5DC" strokeWidth="10" />
              <circle
                cx="32" cy="32" r="26" fill="none"
                stroke="#B5704F" strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 26 * spentPct / 100} ${2 * Math.PI * 26}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold rotate-0" style={{ color: '#B5704F' }}>
              {spentPct}%
            </span>
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: '#1A1A1A' }}>{formatRupiahShort(totalSpent)}</p>
            <p className="text-xs mt-0.5" style={{ color: '#6B6560' }}>terpakai dari {formatRupiahShort(totalBudget)}</p>
            <ProgressBar value={spentPct} height={4} className="mt-2 w-32" />
          </div>
        </div>
      </Card>

      {/* Milestones scroll */}
      {milestones.length > 0 && (
        <div className="mb-4">
          <h2 className="font-semibold text-base mb-3" style={{ color: '#1A1A1A' }}>Milestone</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {milestones.map((m) => {
              const total = m.tasks.length
              const done = m.tasks.filter(t => t.is_completed).length
              const pct = total > 0 ? Math.round((done / total) * 100) : 0
              const isDone = pct === 100
              return (
                <Link
                  key={m.id}
                  href={`/checklist/${m.id}`}
                  className="flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: isDone ? '#2D4A3E' : '#fff',
                    color: isDone ? '#fff' : '#1A1A1A',
                    border: isDone ? 'none' : '1.5px solid #E0D8D0',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isDone && (
                    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                      <path d="M3 8l3.5 3.5L13 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {!isDone && (
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#B5704F' }} />
                  )}
                  {m.title}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
