import { ListSkeleton } from '@/components/ui/PageSkeleton'

export default function Loading() {
  return (
    <div>
      <div className="px-5 pt-6 pb-4">
        <div className="w-8 h-8 rounded-full animate-pulse mb-4" style={{ backgroundColor: '#E8E0D8' }} />
        <div className="h-5 w-48 rounded-xl animate-pulse mb-1.5" style={{ backgroundColor: '#E8E0D8' }} />
        <div className="h-3 w-28 rounded-xl animate-pulse" style={{ backgroundColor: '#E8E0D8' }} />
      </div>
      <div className="px-5 mb-4">
        <div className="h-2 w-full rounded-full animate-pulse" style={{ backgroundColor: '#E8E0D8' }} />
      </div>
      <div className="px-5">
        <ListSkeleton count={6} />
      </div>
    </div>
  )
}
