'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatRupiah } from '@/constants/budgetCategories'
import type { SeserahanItem } from '@/types/database'

interface Props {
  items: SeserahanItem[]
  weddingId: string
}

export function SeserahanClient({ items: initialItems, weddingId }: Props) {
  const [items, setItems] = useState(initialItems)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [adding, setAdding] = useState(false)
  const supabase = createClient()

  const checked = items.filter(i => i.is_checked).length
  const totalEstimate = items.reduce((s, i) => s + i.estimated_price, 0)

  async function toggleItem(id: string, current: boolean) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_checked: !current } : i))
    await supabase.from('seserahan_items').update({ is_checked: !current }).eq('id', id)
  }

  async function addItem() {
    if (!newName.trim()) return
    setAdding(true)
    const price = parseInt(newPrice.replace(/\D/g, '') || '0', 10)
    const { data } = await supabase.from('seserahan_items').insert({
      wedding_id: weddingId,
      name: newName.trim(),
      estimated_price: price,
      sort_order: items.length + 1,
    }).select().single()

    if (data) {
      setItems(prev => [...prev, data])
      setNewName('')
      setNewPrice('')
      setShowAdd(false)
    }
    setAdding(false)
  }

  return (
    <div>
      <PageHeader title="List Seserahan" subtitle={`${checked} dari ${items.length} siap`} backHref="/checklist" />

      {/* Stats */}
      <div className="px-5 mb-4">
        <Card>
          <div className="flex justify-between">
            <div>
              <p className="text-xs" style={{ color: '#6B6560' }}>Sudah siap</p>
              <p className="text-lg font-bold" style={{ color: '#2D4A3E' }}>{checked} item</p>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: '#6B6560' }}>Estimasi total</p>
              <p className="text-lg font-bold" style={{ color: '#B5704F' }}>{formatRupiah(totalEstimate)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Items */}
      <div className="px-5 flex flex-col gap-2 mb-4">
        {items.map((item) => (
          <Card key={item.id} className="flex items-center gap-3">
            <Checkbox checked={item.is_checked} onChange={() => toggleItem(item.id, item.is_checked)} />
            <div className="flex-1">
              <p
                className="text-sm font-medium"
                style={{
                  color: item.is_checked ? '#6B6560' : '#1A1A1A',
                  textDecoration: item.is_checked ? 'line-through' : 'none',
                }}
              >
                {item.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#6B6560' }}>Qty: {item.quantity}</p>
            </div>
            {item.estimated_price > 0 && (
              <span className="text-sm font-medium flex-shrink-0" style={{ color: '#B5704F' }}>
                {formatRupiah(item.estimated_price)}
              </span>
            )}
          </Card>
        ))}
      </div>

      {/* Add */}
      <div className="px-5">
        {showAdd ? (
          <Card>
            <div className="flex flex-col gap-3">
              <Input
                placeholder="Nama item seserahan..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
              <Input
                placeholder="Estimasi harga (opsional)"
                type="text"
                inputMode="numeric"
                value={newPrice}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '')
                  setNewPrice(raw ? parseInt(raw).toLocaleString('id-ID') : '')
                }}
                leftIcon={<span className="text-sm">Rp</span>}
              />
              <div className="flex gap-2">
                <Button onClick={addItem} loading={adding} size="sm">Tambah</Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Batal</Button>
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
            Tambah item seserahan
          </button>
        )}
      </div>
    </div>
  )
}
