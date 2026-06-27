import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MilestoneDetailClient } from './MilestoneDetailClient'

export default async function MilestoneDetailPage({ params }: { params: Promise<{ milestoneId: string }> }) {
  const { milestoneId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: milestone } = await supabase
    .from('milestones')
    .select(`*, tasks(*)`)
    .eq('id', milestoneId)
    .single()

  if (!milestone) redirect('/checklist')

  return <MilestoneDetailClient milestone={milestone} />
}
