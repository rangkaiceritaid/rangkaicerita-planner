// Reusable skeleton shimmer untuk loading state

function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className ?? ''}`}
      style={{ backgroundColor: '#E8E0D8', ...style }}
    />
  )
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: '#fff', border: '1.5px solid #F0EAE2' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`flex items-center gap-3 ${i > 0 ? 'mt-3' : ''}`}>
          <Shimmer className="w-9 h-9 flex-shrink-0" style={{ borderRadius: 12 }} />
          <div className="flex-1">
            <Shimmer className="h-3 w-3/4 mb-1.5" />
            <Shimmer className="h-2.5 w-1/2" />
          </div>
          <Shimmer className="h-3 w-14 flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid #F0EAE2' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 bg-white"
          style={{ borderTop: i > 0 ? '1px solid #F5F0EB' : 'none' }}>
          <Shimmer className="w-8 h-8 flex-shrink-0" style={{ borderRadius: 10 }} />
          <div className="flex-1">
            <Shimmer className="h-3 w-2/3 mb-1.5" />
            <Shimmer className="h-2 w-1/3" />
          </div>
          <Shimmer className="h-5 w-12 flex-shrink-0" style={{ borderRadius: 20 }} />
        </div>
      ))}
    </div>
  )
}

export function BerandaSkeleton() {
  return (
    <div className="px-5 pt-12">
      {/* header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Shimmer className="h-3 w-10 mb-2" />
          <Shimmer className="h-6 w-44 mb-1.5" />
          <Shimmer className="h-3 w-20" />
        </div>
        <Shimmer className="w-10 h-10" style={{ borderRadius: 40 }} />
      </div>
      {/* countdown */}
      <div className="rounded-2xl p-5 mb-4 text-center" style={{ backgroundColor: '#fff', border: '1.5px solid #F0EAE2' }}>
        <Shimmer className="h-3 w-40 mx-auto mb-3" />
        <Shimmer className="h-14 w-24 mx-auto mb-2" />
        <Shimmer className="h-3 w-16 mx-auto mb-4" />
        <div className="flex justify-center gap-2">
          <Shimmer className="h-8 w-16" style={{ borderRadius: 20 }} />
          <Shimmer className="h-8 w-16" style={{ borderRadius: 20 }} />
          <Shimmer className="h-8 w-16" style={{ borderRadius: 20 }} />
        </div>
      </div>
      {/* tugas */}
      <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: '#fff', border: '1.5px solid #F0EAE2' }}>
        <Shimmer className="h-4 w-32 mb-3" />
        <CardSkeleton rows={2} />
      </div>
      {/* budget */}
      <div className="rounded-2xl p-4" style={{ backgroundColor: '#fff', border: '1.5px solid #F0EAE2' }}>
        <Shimmer className="h-4 w-24 mb-3" />
        <div className="flex gap-4">
          <Shimmer className="w-16 h-16 flex-shrink-0" style={{ borderRadius: 40 }} />
          <div className="flex-1">
            <Shimmer className="h-5 w-28 mb-1.5" />
            <Shimmer className="h-3 w-20 mb-2" />
            <Shimmer className="h-2 w-full" style={{ borderRadius: 4 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ChecklistSkeleton() {
  return (
    <div>
      <div className="px-5 pt-6 pb-4">
        <Shimmer className="h-7 w-48 mb-1.5" />
        <Shimmer className="h-3 w-36" />
      </div>
      <div className="px-5 mb-4">
        <Shimmer className="h-14 w-full" style={{ borderRadius: 16 }} />
      </div>
      <div className="px-5 mb-4 flex gap-2">
        {[80, 120, 90, 100].map((w, i) => (
          <Shimmer key={i} className="h-8" style={{ width: w, borderRadius: 20 }} />
        ))}
      </div>
      <div className="px-5 flex flex-col gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-2xl p-4" style={{ backgroundColor: '#fff', border: '1.5px solid #F0EAE2' }}>
            <Shimmer className="h-3 w-20 mb-2" />
            <Shimmer className="h-5 w-40 mb-1.5" />
            <Shimmer className="h-3 w-28 mb-3" />
            <Shimmer className="h-1.5 w-full" style={{ borderRadius: 4 }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function AnggaranSkeleton() {
  return (
    <div>
      <div className="px-5 pt-6 pb-4">
        <Shimmer className="h-7 w-32 mb-1" />
      </div>
      <div className="px-5 mb-4">
        <div className="rounded-2xl p-4" style={{ backgroundColor: '#fff', border: '1.5px solid #F0EAE2' }}>
          <div className="flex gap-4 items-center">
            <Shimmer className="w-16 h-16 flex-shrink-0" style={{ borderRadius: 40 }} />
            <div className="flex-1">
              <Shimmer className="h-6 w-28 mb-1.5" />
              <Shimmer className="h-3 w-36 mb-2" />
              <div className="flex gap-3">
                <Shimmer className="h-3 w-20" />
                <Shimmer className="h-3 w-16" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-5 mb-4">
        <Shimmer className="h-11 w-full" style={{ borderRadius: 16 }} />
      </div>
      <div className="px-5 flex gap-2 mb-4">
        {[1, 2, 3].map(i => (
          <Shimmer key={i} className="flex-1 h-14" style={{ borderRadius: 12 }} />
        ))}
      </div>
      <div className="px-5">
        <ListSkeleton count={5} />
      </div>
    </div>
  )
}

export function UndanganSkeleton() {
  return (
    <div>
      <div className="px-5 pt-6 pb-4">
        <Shimmer className="h-7 w-44 mb-1" />
        <Shimmer className="h-3 w-16" />
      </div>
      <div className="px-5 mb-4 flex gap-2">
        {[1, 2, 3, 4].map(i => (
          <Shimmer key={i} className="flex-1 h-16" style={{ borderRadius: 12 }} />
        ))}
      </div>
      <div className="px-5 mb-3">
        <Shimmer className="h-12 w-full" style={{ borderRadius: 12 }} />
      </div>
      <div className="px-5 mb-4 flex gap-2">
        {[80, 70, 70, 90].map((w, i) => (
          <Shimmer key={i} className="h-8" style={{ width: w, borderRadius: 20 }} />
        ))}
      </div>
      <div className="px-5">
        <ListSkeleton count={5} />
      </div>
    </div>
  )
}

export function ProfilSkeleton() {
  return (
    <div className="px-5 pt-6">
      <Shimmer className="h-7 w-24 mb-6" />
      <div className="flex flex-col items-center mb-6">
        <Shimmer className="w-20 h-20 mb-3" style={{ borderRadius: 40 }} />
        <Shimmer className="h-4 w-32" />
      </div>
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i}>
            <Shimmer className="h-3 w-24 mb-1.5" />
            <Shimmer className="h-12 w-full" style={{ borderRadius: 12 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
