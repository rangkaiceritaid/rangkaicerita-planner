'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatRupiah, formatRupiahShort } from '@/constants/budgetCategories'
import type { Wedding, BudgetCategory, BudgetItem, Expense, PaymentStatus } from '@/types/database'

// ─── constants ─────────────────────────────────────────────────────────────

const PAYMENT_OPTIONS: { key: PaymentStatus; label: string; color: string; bg: string }[] = [
  { key: 'lunas',       label: 'Lunas',       color: '#2D6A4F', bg: 'rgba(45,106,79,0.1)' },
  { key: 'dp',          label: 'DP',          color: '#B5704F', bg: 'rgba(181,112,79,0.12)' },
  { key: 'belum_bayar', label: 'Belum Bayar', color: '#6B6560', bg: 'rgba(107,101,96,0.1)' },
]

// ─── helpers ───────────────────────────────────────────────────────────────

function paymentBadge(status: PaymentStatus | null | undefined) {
  return PAYMENT_OPTIONS.find(o => o.key === (status ?? 'lunas')) ?? PAYMENT_OPTIONS[0]
}

function parseAmount(raw: string): number {
  return parseInt(raw.replace(/\D/g, ''), 10) || 0
}

function fmtInput(raw: string): string {
  const n = parseInt(raw.replace(/\D/g, ''), 10)
  return isNaN(n) ? '' : n.toLocaleString('id-ID')
}

// ─── props ─────────────────────────────────────────────────────────────────

interface Props {
  wedding: Wedding
  categories: BudgetCategory[]
  items: BudgetItem[]
  expenses: Expense[]
}

// ─── Donut chart ────────────────────────────────────────────────────────────

function DonutChart({ segments }: { segments: { color: string; value: number }[] }) {
  const R = 54
  const stroke = 14
  const C = 2 * Math.PI * R
  const total = segments.reduce((s, g) => s + g.value, 0)
  if (total === 0) {
    return (
      <svg viewBox="0 0 128 128" className="w-full h-full">
        <circle cx="64" cy="64" r={R} fill="none" stroke="#EDE5DC" strokeWidth={stroke} />
      </svg>
    )
  }
  let offset = 0
  const slices = segments.filter(g => g.value > 0).map((g, i) => {
    const dash = (g.value / total) * C
    const s = { ...g, dash, offset, key: i }
    offset += dash + 0.5
    return s
  })
  return (
    <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
      <circle cx="64" cy="64" r={R} fill="none" stroke="#EDE5DC" strokeWidth={stroke} />
      {slices.map(s => (
        <circle key={s.key} cx="64" cy="64" r={R} fill="none"
          stroke={s.color} strokeWidth={stroke}
          strokeDasharray={`${s.dash} ${C - s.dash}`}
          strokeDashoffset={-s.offset}
        />
      ))}
    </svg>
  )
}

// ─── Expense form bottom sheet ──────────────────────────────────────────────

function ExpenseSheet({ categories, items, initial, weddingId, onClose, onSave }: {
  categories: BudgetCategory[]
  items: BudgetItem[]
  initial?: Expense
  weddingId: string
  onClose: () => void
  onSave: (exp: Expense) => void
}) {
  const [catId, setCatId] = useState(initial?.category_id ?? '')
  const [itemId, setItemId] = useState(initial?.item_id ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [amount, setAmount] = useState(initial ? initial.amount.toLocaleString('id-ID') : '')
  const [vendor, setVendor] = useState(initial?.vendor_name ?? '')
  const [status, setStatus] = useState<PaymentStatus>(initial?.payment_status ?? 'lunas')
  const [date, setDate] = useState(initial?.payment_date ?? '')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const catItems = items.filter(i => i.category_id === catId)

  function handleItemPick(id: string) {
    setItemId(id)
    const item = items.find(i => i.id === id)
    if (item) {
      if (!name) setName(item.name)
      if (!amount && item.estimated_price > 0) setAmount(item.estimated_price.toLocaleString('id-ID'))
    }
  }

  async function save() {
    if (!name.trim() || !amount) return
    setSaving(true)
    const payload = {
      name: name.trim(),
      amount: parseAmount(amount),
      category_id: catId || null,
      item_id: itemId || null,
      vendor_name: vendor || null,
      payment_status: status,
      payment_date: date || null,
    }
    if (initial) {
      const { data } = await supabase.from('expenses').update(payload).eq('id', initial.id).select().single()
      if (data) onSave(data as Expense)
    } else {
      const { data } = await supabase.from('expenses').insert({ ...payload, wedding_id: weddingId }).select().single()
      if (data) onSave(data as Expense)
    }
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full rounded-t-3xl p-5" style={{ backgroundColor: '#fff', maxWidth: 430 }}
        onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: '#E0D8D0' }} />
        <p className="text-sm font-bold mb-4" style={{ color: '#1A1A1A' }}>
          {initial ? 'Edit Pengeluaran' : 'Catat Pengeluaran'}
        </p>
        <div className="flex flex-col gap-3">
          {/* Kategori + Item */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium block mb-1" style={{ color: '#6B6560' }}>Kategori</label>
              <select value={catId} onChange={e => { setCatId(e.target.value); setItemId('') }}
                className="w-full h-11 rounded-xl px-3 text-xs outline-none"
                style={{ backgroundColor: '#F5F0EB', color: '#1A1A1A' }}>
                <option value="">— pilih —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            {catItems.length > 0 && (
              <div className="flex-1">
                <label className="text-xs font-medium block mb-1" style={{ color: '#6B6560' }}>Item</label>
                <select value={itemId} onChange={e => handleItemPick(e.target.value)}
                  className="w-full h-11 rounded-xl px-3 text-xs outline-none"
                  style={{ backgroundColor: '#F5F0EB', color: '#1A1A1A' }}>
                  <option value="">— pilih —</option>
                  {catItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <Input placeholder="Nama pengeluaran *" value={name}
            onChange={e => setName(e.target.value)} autoFocus />
          <Input placeholder="Jumlah *" inputMode="numeric" value={amount}
            onChange={e => setAmount(fmtInput(e.target.value))}
            leftIcon={<span className="text-xs">Rp</span>} />

          {/* Status */}
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: '#6B6560' }}>Status</label>
            <div className="flex gap-2">
              {PAYMENT_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => setStatus(opt.key)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: status === opt.key ? opt.color : '#EDE5DC',
                    color: status === opt.key ? '#fff' : '#6B6560',
                  }}>{opt.label}</button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium block mb-1" style={{ color: '#6B6560' }}>Tanggal</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full h-11 rounded-xl px-3 text-sm outline-none"
                style={{ backgroundColor: '#F5F0EB', color: '#1A1A1A', border: '1.5px solid transparent' }}
                onFocus={e => (e.target.style.borderColor = '#B5704F')}
                onBlur={e => (e.target.style.borderColor = 'transparent')} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium block mb-1" style={{ color: '#6B6560' }}>Vendor</label>
              <input placeholder="Nama vendor" value={vendor} onChange={e => setVendor(e.target.value)}
                className="w-full h-11 rounded-xl px-3 text-sm outline-none"
                style={{ backgroundColor: '#F5F0EB', color: '#1A1A1A', border: '1.5px solid transparent' }}
                onFocus={e => (e.target.style.borderColor = '#B5704F')}
                onBlur={e => (e.target.style.borderColor = 'transparent')} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={save} loading={saving} size="sm">{initial ? 'Simpan' : 'Catat'}</Button>
            <Button variant="ghost" size="sm" onClick={onClose}>Batal</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── main ───────────────────────────────────────────────────────────────────

export function AnggaranClient({ wedding, categories: initialCategories, items: initialItems, expenses: initialExpenses }: Props) {
  const [tab, setTab] = useState<'budgeting' | 'pengeluaran'>('budgeting')
  const [categories, setCategories] = useState(initialCategories)
  const [items, setItems] = useState(initialItems)
  const [expenses, setExpenses] = useState(initialExpenses)

  // budgeting ui state
  const [expandedCat, setExpandedCat] = useState<string | null>(null)
  const [editCatId, setEditCatId] = useState<string | null>(null)
  const [editCatName, setEditCatName] = useState('')
  const [editCatIcon, setEditCatIcon] = useState('')
  const [savingCat, setSavingCat] = useState(false)
  const [showAddCat, setShowAddCat] = useState(false)
  const [newCat, setNewCat] = useState({ name: '', icon: '' })
  const [addingCat, setAddingCat] = useState(false)
  // per-category add item
  const [addItemCatId, setAddItemCatId] = useState<string | null>(null)
  const [newItem, setNewItem] = useState({ name: '', price: '' })
  const [addingItem, setAddingItem] = useState(false)
  // inline item edit
  const [editItemId, setEditItemId] = useState<string | null>(null)
  const [editItemName, setEditItemName] = useState('')
  const [editItemPrice, setEditItemPrice] = useState('')
  const [savingItem, setSavingItem] = useState(false)

  // pengeluaran ui state
  const [showExpSheet, setShowExpSheet] = useState(false)
  const [editExp, setEditExp] = useState<Expense | null>(null)
  const [deleteExpId, setDeleteExpId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const supabase = createClient()

  // ── derived ─────────────────────────────────────────────────────────────
  const totalBudget = wedding.total_budget
  const totalEstimated = useMemo(() => items.reduce((s, i) => s + i.estimated_price, 0), [items])
  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses])
  const spentPct = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0

  function getItemsForCat(catId: string) { return items.filter(i => i.category_id === catId) }
  function getSpentForCat(catId: string) { return expenses.filter(e => e.category_id === catId).reduce((s, e) => s + e.amount, 0) }
  function getEstimatedForCat(catId: string) { return items.filter(i => i.category_id === catId).reduce((s, i) => s + i.estimated_price, 0) }
  function getSpentForItem(itemId: string) { return expenses.filter(e => e.item_id === itemId).reduce((s, e) => s + e.amount, 0) }

  const donutSegments = useMemo(() =>
    categories.map(c => ({ color: c.color ?? '#C4B49A', value: getEstimatedForCat(c.id) }))
  , [categories, items])

  // ── category actions ────────────────────────────────────────────────────
  function openEditCat(cat: BudgetCategory) {
    setEditCatId(cat.id)
    setEditCatName(cat.name)
    setEditCatIcon(cat.icon ?? '')
  }

  async function saveEditCat() {
    if (!editCatId) return
    setSavingCat(true)
    const { data } = await supabase.from('budget_categories')
      .update({ name: editCatName.trim(), icon: editCatIcon || null })
      .eq('id', editCatId).select().single()
    if (data) setCategories(prev => prev.map(c => c.id === editCatId ? data as BudgetCategory : c))
    setEditCatId(null)
    setSavingCat(false)
  }

  async function deleteCat(catId: string) {
    await supabase.from('budget_categories').delete().eq('id', catId)
    setCategories(prev => prev.filter(c => c.id !== catId))
    setItems(prev => prev.filter(i => i.category_id !== catId))
    setEditCatId(null)
  }

  async function addCategory() {
    if (!newCat.name.trim()) return
    setAddingCat(true)
    const { data } = await supabase.from('budget_categories').insert({
      wedding_id: wedding.id,
      name: newCat.name.trim(),
      icon: newCat.icon || null,
      allocated_amount: 0,
      allocated_pct: 0,
      color: '#C4B49A',
      sort_order: categories.length + 1,
      is_custom: true,
    }).select().single()
    if (data) {
      setCategories(prev => [...prev, data as BudgetCategory])
      setExpandedCat((data as BudgetCategory).id)
    }
    setNewCat({ name: '', icon: '' })
    setShowAddCat(false)
    setAddingCat(false)
  }

  // ── item actions ────────────────────────────────────────────────────────
  async function addItem() {
    if (!addItemCatId || !newItem.name.trim()) return
    setAddingItem(true)
    const { data } = await supabase.from('budget_items').insert({
      wedding_id: wedding.id,
      category_id: addItemCatId,
      name: newItem.name.trim(),
      estimated_price: parseAmount(newItem.price),
      sort_order: getItemsForCat(addItemCatId).length + 1,
    }).select().single()
    if (data) setItems(prev => [...prev, data as BudgetItem])
    setNewItem({ name: '', price: '' })
    setAddItemCatId(null)
    setAddingItem(false)
  }

  function openEditItem(item: BudgetItem) {
    setEditItemId(item.id)
    setEditItemName(item.name)
    setEditItemPrice(item.estimated_price > 0 ? item.estimated_price.toLocaleString('id-ID') : '')
  }

  async function saveEditItem() {
    if (!editItemId) return
    setSavingItem(true)
    const { data } = await supabase.from('budget_items')
      .update({ name: editItemName.trim(), estimated_price: parseAmount(editItemPrice) })
      .eq('id', editItemId).select().single()
    if (data) setItems(prev => prev.map(i => i.id === editItemId ? data as BudgetItem : i))
    setEditItemId(null)
    setSavingItem(false)
  }

  async function deleteItem(itemId: string) {
    await supabase.from('budget_items').delete().eq('id', itemId)
    setItems(prev => prev.filter(i => i.id !== itemId))
  }

  // ── expense actions ─────────────────────────────────────────────────────
  function handleExpSaved(exp: Expense) {
    if (editExp) setExpenses(prev => prev.map(e => e.id === exp.id ? exp : e))
    else setExpenses(prev => [exp, ...prev])
    setEditExp(null)
  }

  async function deleteExpense() {
    if (!deleteExpId) return
    setDeleting(true)
    await supabase.from('expenses').delete().eq('id', deleteExpId)
    setExpenses(prev => prev.filter(e => e.id !== deleteExpId))
    setDeleteExpId(null)
    setDeleting(false)
  }

  const groupedExpenses = useMemo(() => {
    const groups: Record<string, Expense[]> = {}
    expenses.forEach(e => {
      const key = e.payment_date
        ? new Date(e.payment_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'Tanpa Tanggal'
      if (!groups[key]) groups[key] = []
      groups[key].push(e)
    })
    return groups
  }, [expenses])

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader title="Anggaran" />

      {/* Summary card */}
      <div className="px-5 mb-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <DonutChart segments={donutSegments} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold" style={{ color: '#B5704F' }}>{spentPct}%</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xl font-bold" style={{ color: '#1A1A1A' }}>{formatRupiahShort(totalSpent)}</p>
              <p className="text-xs mt-0.5" style={{ color: '#6B6560' }}>realisasi dari {formatRupiah(totalBudget)}</p>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#B5704F' }} />
                  <span className="text-[10px]" style={{ color: '#6B6560' }}>Est. {formatRupiahShort(totalEstimated)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#2D6A4F' }} />
                  <span className="text-[10px]" style={{ color: '#6B6560' }}>Sisa {formatRupiahShort(Math.max(totalBudget - totalSpent, 0))}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="flex rounded-2xl p-1" style={{ backgroundColor: '#EDE5DC' }}>
          {(['budgeting', 'pengeluaran'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: tab === t ? '#fff' : 'transparent',
                color: tab === t ? '#1A1A1A' : '#6B6560',
                boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}>
              {t === 'budgeting' ? 'Budgeting' : 'Pengeluaran'}
            </button>
          ))}
        </div>
      </div>

      {/* ══ TAB BUDGETING ══ */}
      {tab === 'budgeting' && (
        <div className="px-5 pb-6">

          {/* Totals row */}
          <div className="flex gap-2 mb-4">
            {[
              { label: 'Total Budget', value: totalBudget, color: '#1A1A1A' },
              { label: 'Estimasi', value: totalEstimated, color: '#B5704F' },
              { label: 'Sisa Est.', value: totalBudget - totalEstimated, color: totalEstimated > totalBudget ? '#E05252' : '#2D6A4F' },
            ].map(s => (
              <div key={s.label} className="flex-1 px-3 py-2.5 rounded-xl text-center"
                style={{ backgroundColor: '#F5F0EB' }}>
                <p className="text-xs font-bold" style={{ color: s.color }}>{formatRupiahShort(s.value)}</p>
                <p className="text-[9px] mt-0.5" style={{ color: '#9E9089' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Category + items list */}
          <div className="flex flex-col gap-2 mb-3">
            {categories.map(cat => {
              const catItems = getItemsForCat(cat.id)
              const estimated = getEstimatedForCat(cat.id)
              const spent = getSpentForCat(cat.id)
              const isExpanded = expandedCat === cat.id
              const isEditingCat = editCatId === cat.id

              return (
                <div key={cat.id} className="rounded-2xl overflow-hidden"
                  style={{ border: '1.5px solid #F0EAE2', backgroundColor: '#fff' }}>

                  {/* Category header */}
                  {isEditingCat ? (
                    <div className="flex items-center gap-2 px-3 py-2.5"
                      style={{ borderBottom: isExpanded ? '1px solid #F5F0EB' : 'none' }}>
                      <input value={editCatIcon} onChange={e => setEditCatIcon(e.target.value)}
                        placeholder="📦" maxLength={2}
                        className="w-9 h-9 rounded-lg text-center text-base outline-none flex-shrink-0"
                        style={{ backgroundColor: '#F5F0EB' }} />
                      <input value={editCatName} onChange={e => setEditCatName(e.target.value)}
                        className="flex-1 h-9 rounded-lg px-2 text-sm outline-none"
                        style={{ backgroundColor: '#F5F0EB', color: '#1A1A1A' }} autoFocus />
                      <button onClick={saveEditCat} disabled={savingCat}
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white"
                        style={{ backgroundColor: '#B5704F' }}>
                        {savingCat ? '...' : 'Simpan'}
                      </button>
                      <button onClick={() => setEditCatId(null)}
                        className="text-xs font-medium px-2 py-1.5 rounded-lg"
                        style={{ color: '#6B6560', backgroundColor: '#F5F0EB' }}>✕</button>
                      {cat.is_custom && (
                        <button onClick={() => deleteCat(cat.id)}
                          className="text-xs font-medium px-2 py-1.5 rounded-lg"
                          style={{ color: '#E05252', backgroundColor: 'rgba(224,82,82,0.08)' }}>Hapus</button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 w-full px-4 py-3 cursor-pointer"
                      onClick={() => setExpandedCat(isExpanded ? null : cat.id)}>
                      <span className="text-base w-6 text-center flex-shrink-0">{cat.icon ?? '📦'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>{cat.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px]" style={{ color: '#9E9089' }}>
                            Est. {estimated > 0 ? formatRupiahShort(estimated) : '—'}
                          </span>
                          {spent > 0 && (
                            <span className="text-[10px]" style={{ color: '#B5704F' }}>
                              · Realisasi {formatRupiahShort(spent)}
                            </span>
                          )}
                          {catItems.length > 0 && (
                            <span className="text-[10px]" style={{ color: '#9E9089' }}>
                              · {catItems.length} item
                            </span>
                          )}
                        </div>
                      </div>
                      <button onClick={e => { e.stopPropagation(); openEditCat(cat) }}
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'rgba(107,101,96,0.08)' }}>
                        <svg viewBox="0 0 12 12" fill="none" stroke="#6B6560" strokeWidth={1.5} className="w-2.5 h-2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 1.5a1 1 0 011.414 1.414L3.5 9.33l-1.75.335.335-1.75L8.5 1.5z" />
                        </svg>
                      </button>
                      <svg viewBox="0 0 16 16" fill="none" stroke="#9E9089" strokeWidth={1.8} className="w-4 h-4 flex-shrink-0 transition-transform"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6l4 4 4-4" />
                      </svg>
                    </div>
                  )}

                  {/* Items */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid #F5F0EB' }}>
                      {catItems.map((item, idx) => {
                        const itemSpent = getSpentForItem(item.id)
                        const isEditingItem = editItemId === item.id
                        return (
                          <div key={item.id} className="flex items-center gap-3 px-4 py-2.5"
                            style={{ borderTop: idx > 0 ? '1px solid #FAFAF8' : 'none', backgroundColor: '#FAFAF8' }}>
                            {isEditingItem ? (
                              <>
                                <input value={editItemName} onChange={e => setEditItemName(e.target.value)}
                                  className="flex-1 h-8 rounded-lg px-2 text-xs outline-none"
                                  style={{ backgroundColor: '#fff', border: '1.5px solid #B5704F', color: '#1A1A1A' }} autoFocus />
                                <div className="flex items-center gap-1 flex-shrink-0"
                                  style={{ backgroundColor: '#fff', border: '1.5px solid #B5704F', borderRadius: 8, paddingLeft: 6 }}>
                                  <span className="text-[10px]" style={{ color: '#9E9089' }}>Rp</span>
                                  <input value={editItemPrice}
                                    onChange={e => setEditItemPrice(fmtInput(e.target.value))}
                                    inputMode="numeric"
                                    className="w-20 h-8 px-1 text-xs outline-none bg-transparent"
                                    style={{ color: '#1A1A1A' }} />
                                </div>
                                <button onClick={saveEditItem} disabled={savingItem}
                                  className="text-[10px] font-semibold px-2 py-1 rounded-lg text-white flex-shrink-0"
                                  style={{ backgroundColor: '#B5704F' }}>{savingItem ? '...' : '✓'}</button>
                                <button onClick={() => setEditItemId(null)}
                                  className="text-[10px] px-1.5 py-1 rounded-lg flex-shrink-0"
                                  style={{ color: '#6B6560', backgroundColor: '#EDE5DC' }}>✕</button>
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5"
                                  style={{ backgroundColor: cat.color ?? '#C4B49A' }} />
                                <p className="flex-1 text-xs" style={{ color: '#1A1A1A' }}>{item.name}</p>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-xs font-semibold" style={{ color: '#1A1A1A' }}>
                                    {item.estimated_price > 0 ? formatRupiahShort(item.estimated_price) : '—'}
                                  </p>
                                  {itemSpent > 0 && (
                                    <p className="text-[9px]" style={{ color: '#B5704F' }}>
                                      Realisasi {formatRupiahShort(itemSpent)}
                                    </p>
                                  )}
                                </div>
                                <button onClick={() => openEditItem(item)}
                                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: 'rgba(107,101,96,0.08)' }}>
                                  <svg viewBox="0 0 12 12" fill="none" stroke="#6B6560" strokeWidth={1.5} className="w-2.5 h-2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 1.5a1 1 0 011.414 1.414L3.5 9.33l-1.75.335.335-1.75L8.5 1.5z" />
                                  </svg>
                                </button>
                                <button onClick={() => deleteItem(item.id)}
                                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: 'rgba(224,82,82,0.06)' }}>
                                  <svg viewBox="0 0 12 12" fill="none" stroke="#E05252" strokeWidth={1.5} className="w-2.5 h-2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 3h9M4 3V2h4v1M5 5.5v3M7 5.5v3M2.5 3l.5 7h6l.5-7" />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        )
                      })}

                      {/* Add item form */}
                      {addItemCatId === cat.id ? (
                        <div className="flex items-center gap-2 px-4 py-2.5"
                          style={{ borderTop: catItems.length > 0 ? '1px solid #F0EAE2' : 'none', backgroundColor: '#F5F0EB' }}>
                          <input value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
                            placeholder="Nama item *" autoFocus
                            className="flex-1 h-8 rounded-lg px-2 text-xs outline-none"
                            style={{ backgroundColor: '#fff', border: '1.5px solid #B5704F', color: '#1A1A1A' }} />
                          <div className="flex items-center flex-shrink-0"
                            style={{ backgroundColor: '#fff', border: '1.5px solid #E0D8D0', borderRadius: 8, paddingLeft: 6 }}>
                            <span className="text-[10px]" style={{ color: '#9E9089' }}>Rp</span>
                            <input value={newItem.price} onChange={e => setNewItem(p => ({ ...p, price: fmtInput(e.target.value) }))}
                              inputMode="numeric" placeholder="0"
                              className="w-20 h-8 px-1 text-xs outline-none bg-transparent"
                              style={{ color: '#1A1A1A' }} />
                          </div>
                          <button onClick={addItem} disabled={addingItem}
                            className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg text-white flex-shrink-0"
                            style={{ backgroundColor: '#B5704F' }}>{addingItem ? '...' : 'Tambah'}</button>
                          <button onClick={() => setAddItemCatId(null)}
                            className="text-[10px] px-2 py-1.5 rounded-lg flex-shrink-0"
                            style={{ color: '#6B6560', backgroundColor: '#EDE5DC' }}>Batal</button>
                        </div>
                      ) : (
                        <button onClick={() => { setAddItemCatId(cat.id); setNewItem({ name: '', price: '' }) }}
                          className="flex items-center gap-1.5 w-full px-4 py-2.5 text-xs font-medium"
                          style={{ borderTop: catItems.length > 0 ? '1px solid #F0EAE2' : 'none', color: '#B5704F', backgroundColor: '#FAFAF8' }}>
                          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 2v8M2 6h8" />
                          </svg>
                          Tambah item
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Add category */}
          {showAddCat ? (
            <Card>
              <p className="text-xs font-bold mb-2" style={{ color: '#1A1A1A' }}>Kategori Baru</p>
              <div className="flex gap-2 mb-2">
                <input value={newCat.icon} onChange={e => setNewCat(p => ({ ...p, icon: e.target.value }))}
                  placeholder="📦" maxLength={2}
                  className="w-10 h-10 rounded-xl text-center text-lg outline-none flex-shrink-0"
                  style={{ backgroundColor: '#F5F0EB' }} />
                <Input placeholder="Nama kategori *" value={newCat.name}
                  onChange={e => setNewCat(p => ({ ...p, name: e.target.value }))} autoFocus />
              </div>
              <div className="flex gap-2">
                <Button onClick={addCategory} loading={addingCat} size="sm">Tambah</Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAddCat(false)}>Batal</Button>
              </div>
            </Card>
          ) : (
            <button onClick={() => setShowAddCat(true)}
              className="flex items-center gap-2 text-sm font-medium py-3 w-full"
              style={{ color: '#B5704F' }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v10M3 8h10" />
              </svg>
              Tambah Kategori
            </button>
          )}
        </div>
      )}

      {/* ══ TAB PENGELUARAN ══ */}
      {tab === 'pengeluaran' && (
        <div className="px-5 pb-6">
          {/* payment summary pills */}
          <div className="flex gap-2 mb-4">
            {PAYMENT_OPTIONS.map(opt => {
              const total = expenses.filter(e => (e.payment_status ?? 'lunas') === opt.key).reduce((s, e) => s + e.amount, 0)
              return (
                <div key={opt.key} className="flex-1 px-3 py-2.5 rounded-xl text-center"
                  style={{ backgroundColor: opt.bg }}>
                  <p className="text-xs font-bold" style={{ color: opt.color }}>{formatRupiahShort(total)}</p>
                  <p className="text-[9px] font-medium mt-0.5" style={{ color: opt.color }}>{opt.label}</p>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold" style={{ color: '#6B6560' }}>{expenses.length} transaksi</p>
            <button onClick={() => { setEditExp(null); setShowExpSheet(true) }}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: '#B5704F', color: '#fff' }}>
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-2.5 h-2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 2v8M2 6h8" />
              </svg>
              Catat
            </button>
          </div>

          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-2xl mb-2">💸</p>
              <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>Belum ada pengeluaran</p>
              <p className="text-xs mt-1" style={{ color: '#6B6560' }}>Tap "Catat" untuk mencatat transaksi</p>
            </div>
          ) : (
            Object.entries(groupedExpenses).map(([date, exps]) => (
              <div key={date} className="mb-3">
                <p className="text-[10px] font-semibold mb-1.5 uppercase tracking-wide" style={{ color: '#9E9089' }}>{date}</p>
                <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid #F0EAE2' }}>
                  {exps.map((exp, i) => {
                    const cat = categories.find(c => c.id === exp.category_id)
                    const item = items.find(it => it.id === exp.item_id)
                    const badge = paymentBadge(exp.payment_status)
                    return (
                      <div key={exp.id} className="flex items-center gap-3 px-4 py-3"
                        style={{ borderTop: i > 0 ? '1px solid #F5F0EB' : 'none', backgroundColor: '#fff' }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                          style={{ backgroundColor: cat?.color ? `${cat.color}15` : '#EDE5DC' }}>
                          {cat?.icon ?? '💸'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: '#1A1A1A' }}>{exp.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {item && <span className="text-[10px]" style={{ color: '#B5704F' }}>{item.name}</span>}
                            {item && cat && <span className="text-[10px]" style={{ color: '#9E9089' }}>·</span>}
                            {cat && <span className="text-[10px]" style={{ color: '#9E9089' }}>{cat.name}</span>}
                            {exp.vendor_name && <span className="text-[10px]" style={{ color: '#9E9089' }}>· {exp.vendor_name}</span>}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold" style={{ color: '#1A1A1A' }}>{formatRupiahShort(exp.amount)}</p>
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 inline-block"
                            style={{ backgroundColor: badge.bg, color: badge.color }}>{badge.label}</span>
                        </div>
                        <div className="flex gap-1 ml-1">
                          <button onClick={() => { setEditExp(exp); setShowExpSheet(true) }}
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(107,101,96,0.08)' }}>
                            <svg viewBox="0 0 12 12" fill="none" stroke="#6B6560" strokeWidth={1.5} className="w-2.5 h-2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 1.5a1 1 0 011.414 1.414L3.5 9.33l-1.75.335.335-1.75L8.5 1.5z" />
                            </svg>
                          </button>
                          <button onClick={() => setDeleteExpId(exp.id)}
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(224,82,82,0.08)' }}>
                            <svg viewBox="0 0 12 12" fill="none" stroke="#E05252" strokeWidth={1.5} className="w-2.5 h-2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 3h9M4 3V2h4v1M5 5.5v3M7 5.5v3M2.5 3l.5 7h6l.5-7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── modals ── */}
      {showExpSheet && (
        <ExpenseSheet categories={categories} items={items}
          initial={editExp ?? undefined} weddingId={wedding.id}
          onClose={() => { setShowExpSheet(false); setEditExp(null) }}
          onSave={handleExpSaved} />
      )}

      {deleteExpId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setDeleteExpId(null)}>
          <div className="w-full rounded-2xl p-5" style={{ backgroundColor: '#fff', maxWidth: 320 }}
            onClick={e => e.stopPropagation()}>
            <p className="text-sm font-bold text-center mb-1" style={{ color: '#1A1A1A' }}>Hapus pengeluaran?</p>
            <p className="text-xs text-center mb-5" style={{ color: '#6B6560' }}>
              <span className="font-semibold" style={{ color: '#1A1A1A' }}>
                {expenses.find(e => e.id === deleteExpId)?.name}
              </span>{' '}akan dihapus.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteExpId(null)}
                className="flex-1 h-11 rounded-xl text-sm font-semibold border-2"
                style={{ color: '#B5704F', borderColor: '#B5704F', backgroundColor: 'transparent' }}>Batal</button>
              <button onClick={deleteExpense} disabled={deleting}
                className="flex-1 h-11 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: '#E05252' }}>{deleting ? 'Menghapus...' : 'Hapus'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
