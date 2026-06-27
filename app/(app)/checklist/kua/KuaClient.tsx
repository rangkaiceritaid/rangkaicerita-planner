'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Badge } from '@/components/ui/Badge'
import type { KuaDocument } from '@/types/database'

const GROUP_LABELS: Record<string, string> = {
  both: '👫 Kedua Calon Pengantin',
  groom: '🤵 Calon Pengantin Pria',
  bride: '👰 Calon Pengantin Wanita',
  wali: '👴 Wali Nikah',
}

interface Props {
  docs: KuaDocument[]
  weddingId: string
}

export function KuaClient({ docs: initialDocs }: Props) {
  const [docs, setDocs] = useState(initialDocs)
  const supabase = createClient()

  const checked = docs.filter(d => d.is_checked).length

  async function toggleDoc(id: string, current: boolean) {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, is_checked: !current } : d))
    await supabase.from('kua_documents').update({ is_checked: !current }).eq('id', id)
  }

  const groups = ['both', 'groom', 'bride', 'wali'] as const
  const docsByGroup = Object.fromEntries(
    groups.map(g => [g, docs.filter(d => d.required_for === g)])
  )

  return (
    <div>
      <PageHeader title="Dokumen KUA" subtitle={`${checked} dari ${docs.length} lengkap`} backHref="/checklist" />

      {/* Progress bar */}
      <div className="px-5 mb-5">
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#EDE5DC' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${docs.length > 0 ? (checked / docs.length) * 100 : 0}%`, backgroundColor: '#2D4A3E' }}
          />
        </div>
        <p className="text-xs mt-1.5 text-right" style={{ color: '#6B6560' }}>
          {docs.length > 0 ? Math.round((checked / docs.length) * 100) : 0}% lengkap
        </p>
      </div>

      {/* Info card */}
      <div className="px-5 mb-5">
        <div className="rounded-xl p-3.5 flex gap-3" style={{ backgroundColor: 'rgba(181,112,79,0.08)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#B5704F" strokeWidth={1.8} className="w-5 h-5 flex-shrink-0 mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <p className="text-xs leading-relaxed" style={{ color: '#9A5C3C' }}>
            Persyaratan dokumen dapat berbeda-beda tergantung KUA setempat. Konfirmasi langsung ke KUA kota pernikahanmu untuk kepastian.
          </p>
        </div>
      </div>

      {/* Grouped docs */}
      {groups.map((group) => {
        const groupDocs = docsByGroup[group]
        if (!groupDocs || groupDocs.length === 0) return null
        const groupDone = groupDocs.filter(d => d.is_checked).length

        return (
          <div key={group} className="px-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>{GROUP_LABELS[group]}</h3>
              <span className="text-xs" style={{ color: '#6B6560' }}>{groupDone}/{groupDocs.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {groupDocs.map((doc) => (
                <Card key={doc.id} className="flex items-start gap-3">
                  <Checkbox
                    checked={doc.is_checked}
                    onChange={() => toggleDoc(doc.id, doc.is_checked)}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium"
                      style={{
                        color: doc.is_checked ? '#6B6560' : '#1A1A1A',
                        textDecoration: doc.is_checked ? 'line-through' : 'none',
                      }}
                    >
                      {doc.name}
                    </p>
                    {doc.description && (
                      <p className="text-xs mt-0.5" style={{ color: '#6B6560' }}>{doc.description}</p>
                    )}
                    {doc.copies_needed > 1 && (
                      <Badge variant="gray" className="mt-1">{doc.copies_needed}x rangkap</Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
