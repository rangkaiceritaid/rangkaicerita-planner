'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Task } from '@/types/database'

interface MilestoneWithTasks {
  id: string
  title: string
  description: string | null
  target_date: string | null
  wedding_id: string
  tasks: Task[]
}

interface AddTaskForm {
  title: string
  description: string
  link_url: string
  due_date: string
}

function deadlineBadge(due_date: string | null, is_completed: boolean) {
  if (!due_date || is_completed) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(due_date)
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000)

  if (diffDays < 0) return { label: `Terlambat ${Math.abs(diffDays)} hari`, color: '#E05252', bg: 'rgba(224,82,82,0.1)' }
  if (diffDays === 0) return { label: 'Hari ini', color: '#E07B22', bg: 'rgba(224,123,34,0.1)' }
  if (diffDays <= 7) return { label: `${diffDays} hari lagi`, color: '#B5704F', bg: 'rgba(181,112,79,0.1)' }
  return {
    label: due.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    color: '#6B6560',
    bg: 'rgba(107,101,96,0.08)',
  }
}

export function MilestoneDetailClient({ milestone }: { milestone: MilestoneWithTasks }) {
  const [tasks, setTasks] = useState(milestone.tasks.sort((a, b) => a.sort_order - b.sort_order))
  const [showAdd, setShowAdd] = useState(false)
  const [showOptional, setShowOptional] = useState(false)
  const [form, setForm] = useState<AddTaskForm>({ title: '', description: '', link_url: '', due_date: '' })
  const [adding, setAdding] = useState(false)
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  // Track which task is in "set deadline" mode
  const [deadlineEdit, setDeadlineEdit] = useState<string | null>(null)
  const [deadlineVal, setDeadlineVal] = useState('')
  const supabase = createClient()

  const done = tasks.filter(t => t.is_completed).length
  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0

  async function toggleTask(taskId: string, current: boolean) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: !current } : t))
    await supabase.from('tasks').update({
      is_completed: !current,
      completed_at: !current ? new Date().toISOString() : null,
    }).eq('id', taskId)
  }

  async function saveDeadline(taskId: string) {
    const due = deadlineVal || null
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, due_date: due } : t))
    await supabase.from('tasks').update({ due_date: due }).eq('id', taskId)
    setDeadlineEdit(null)
    setDeadlineVal('')
  }

  function openDeadlineEdit(task: Task) {
    setDeadlineEdit(task.id)
    setDeadlineVal(task.due_date ?? '')
    setExpandedTask(task.id)
  }

  async function addTask() {
    if (!form.title.trim()) return
    setAdding(true)
    const { data } = await supabase.from('tasks').insert({
      wedding_id: milestone.wedding_id,
      milestone_id: milestone.id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      link_url: form.link_url.trim() || null,
      due_date: form.due_date || null,
      is_system: false,
      is_active: true,
      sort_order: tasks.length + 1,
    }).select().single()

    if (data) {
      setTasks(prev => [...prev, data])
      setForm({ title: '', description: '', link_url: '', due_date: '' })
      setShowAdd(false)
      setShowOptional(false)
    }
    setAdding(false)
  }

  function toggleExpand(taskId: string) {
    setExpandedTask(prev => prev === taskId ? null : taskId)
    if (deadlineEdit === taskId) setDeadlineEdit(null)
  }

  return (
    <div>
      <PageHeader
        title={milestone.description || milestone.title}
        subtitle={`${done} dari ${tasks.length} tugas selesai`}
        backHref="/checklist"
      />

      {/* Progress */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>{milestone.title}</span>
          <span className="text-sm font-bold" style={{ color: '#B5704F' }}>{pct}%</span>
        </div>
        <ProgressBar value={pct} height={8} />
        {milestone.target_date && (
          <p className="text-xs mt-2" style={{ color: '#6B6560' }}>
            Target: {new Date(milestone.target_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
      </div>

      {/* Tasks */}
      <div className="px-5 flex flex-col gap-2 mb-4">
        {tasks.map((task) => {
          const isExpanded = expandedTask === task.id
          const hasExtra = task.description || task.link_url
          const isDeadlineEditing = deadlineEdit === task.id
          const badge = deadlineBadge(task.due_date, task.is_completed)

          return (
            <Card key={task.id} className="py-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={task.is_completed}
                  onChange={() => toggleTask(task.id, task.is_completed)}
                />
                <div className="flex-1 min-w-0">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="text-sm font-medium leading-snug"
                      style={{
                        color: task.is_completed ? '#6B6560' : '#1A1A1A',
                        textDecoration: task.is_completed ? 'line-through' : 'none',
                      }}
                    >
                      {task.title}
                    </p>
                    <button
                      onClick={() => toggleExpand(task.id)}
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: '#9E9089' }}
                    >
                      <svg
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                        className="w-4 h-4 transition-transform"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                  </div>

                  {/* Deadline badge */}
                  {badge && !isExpanded && (
                    <span
                      className="inline-flex items-center gap-1 text-xs font-medium mt-1 px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: badge.bg, color: badge.color }}
                    >
                      <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5">
                        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M6 3.5V6l1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      {badge.label}
                    </span>
                  )}

                  {/* Hints collapsed */}
                  {!isExpanded && (hasExtra || task.due_date) && (
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {task.description && <span className="text-xs" style={{ color: '#9E9089' }}>📄 Catatan</span>}
                      {task.link_url && <span className="text-xs" style={{ color: '#9E9089' }}>🔗 Link</span>}
                    </div>
                  )}

                  {/* Expanded panel */}
                  {isExpanded && (
                    <div className="mt-2 pt-2 flex flex-col gap-2" style={{ borderTop: '1px solid #F0EAE2' }}>

                      {/* Deadline section */}
                      {isDeadlineEditing ? (
                        <div>
                          <p className="text-xs font-medium mb-1.5" style={{ color: '#6B6560' }}>Tenggat waktu</p>
                          <div className="flex gap-2 items-center">
                            <input
                              type="date"
                              value={deadlineVal}
                              onChange={e => setDeadlineVal(e.target.value)}
                              className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                              style={{ backgroundColor: '#F5F0EB', color: '#1A1A1A', border: '1.5px solid #B5704F' }}
                            />
                            <button
                              onClick={() => saveDeadline(task.id)}
                              className="px-3 py-2 rounded-xl text-xs font-semibold text-white"
                              style={{ backgroundColor: '#B5704F' }}
                            >
                              Simpan
                            </button>
                            {task.due_date && (
                              <button
                                onClick={() => { setDeadlineVal(''); saveDeadline(task.id) }}
                                className="px-3 py-2 rounded-xl text-xs font-medium"
                                style={{ backgroundColor: '#F5F0EB', color: '#6B6560' }}
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => openDeadlineEdit(task)}
                          className="flex items-center gap-1.5 text-xs font-medium self-start px-2.5 py-1.5 rounded-lg"
                          style={{
                            backgroundColor: task.due_date ? badge?.bg : 'rgba(107,101,96,0.08)',
                            color: task.due_date ? badge?.color : '#6B6560',
                          }}
                        >
                          <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3">
                            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M7 4V7l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                          {task.due_date
                            ? `Tenggat: ${new Date(task.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                            : 'Tambah tenggat waktu'}
                        </button>
                      )}

                      {/* Description */}
                      {task.description && (
                        <p className="text-xs leading-relaxed" style={{ color: '#6B6560' }}>
                          {task.description}
                        </p>
                      )}

                      {/* Link */}
                      {task.link_url && (
                        <a
                          href={task.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg self-start"
                          style={{ backgroundColor: 'rgba(181,112,79,0.1)', color: '#B5704F' }}
                        >
                          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                            <path d="M6 10l4-4M10 6H7.5M10 6v2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
                          </svg>
                          Buka referensi
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Add task */}
      <div className="px-5 pb-8">
        {showAdd ? (
          <Card>
            <h3 className="font-semibold text-sm mb-3" style={{ color: '#1A1A1A' }}>Tugas baru</h3>
            <div className="flex flex-col gap-3">
              <Input
                placeholder="Nama tugas *"
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && !showOptional && addTask()}
                autoFocus
              />

              <button
                onClick={() => setShowOptional(p => !p)}
                className="flex items-center gap-1.5 text-xs font-medium self-start"
                style={{ color: '#B5704F' }}
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={showOptional ? 'M3 8h10' : 'M8 3v10M3 8h10'} />
                </svg>
                {showOptional ? 'Sembunyikan detail' : 'Tambah detail (opsional)'}
              </button>

              {showOptional && (
                <>
                  <div>
                    <p className="text-xs mb-1.5" style={{ color: '#9E9089' }}>Tenggat waktu (opsional)</p>
                    <input
                      type="date"
                      value={form.due_date}
                      onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                      style={{ backgroundColor: '#F5F0EB', color: '#1A1A1A', border: '1.5px solid transparent' }}
                      onFocus={e => (e.target.style.borderColor = '#B5704F')}
                      onBlur={e => (e.target.style.borderColor = 'transparent')}
                    />
                  </div>
                  <textarea
                    placeholder="Deskripsi (opsional)"
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={2}
                    className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
                    style={{ backgroundColor: '#F5F0EB', color: '#1A1A1A', border: '1.5px solid transparent' }}
                    onFocus={e => (e.target.style.borderColor = '#B5704F')}
                    onBlur={e => (e.target.style.borderColor = 'transparent')}
                  />
                  <Input
                    placeholder="Link referensi (opsional)"
                    value={form.link_url}
                    onChange={(e) => setForm(f => ({ ...f, link_url: e.target.value }))}
                    type="url"
                  />
                </>
              )}

              <div className="flex gap-2">
                <Button onClick={addTask} loading={adding} size="sm">Tambah</Button>
                <Button
                  variant="ghost" size="sm"
                  onClick={() => { setShowAdd(false); setForm({ title: '', description: '', link_url: '', due_date: '' }); setShowOptional(false) }}
                >
                  Batal
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 text-sm font-medium py-3 w-full"
            style={{ color: '#B5704F' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Tambah tugas
          </button>
        )}
      </div>
    </div>
  )
}
