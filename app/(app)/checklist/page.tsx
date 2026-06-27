import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChecklistClient } from './ChecklistClient'

export default async function ChecklistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: wedding } = await supabase
    .from('weddings').select('id').eq('user_id', user.id).single()
  if (!wedding) redirect('/onboarding/step-1')

  const [
    { data: milestones },
    { count: totalTemplates },
    { count: activatedCount },
  ] = await Promise.all([
    supabase
      .from('milestones')
      .select(`*, tasks(*)`)
      .eq('wedding_id', wedding.id)
      .order('sort_order'),
    supabase
      .from('task_templates')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('wedding_task_templates')
      .select('*', { count: 'exact', head: true })
      .eq('wedding_id', wedding.id),
  ])

  return (
    <ChecklistClient
      milestones={milestones ?? []}
      weddingId={wedding.id}
      totalTemplates={totalTemplates ?? 0}
      activatedCount={activatedCount ?? 0}
    />
  )
}
