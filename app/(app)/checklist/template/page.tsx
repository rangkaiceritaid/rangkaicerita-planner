import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TemplatePickerClient } from './TemplatePickerClient'

export default async function TemplatePickerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: wedding } = await supabase
    .from('weddings').select('id').eq('user_id', user.id).single()
  if (!wedding) redirect('/onboarding/step-1')

  const [{ data: templates }, { data: existingMilestones }] = await Promise.all([
    supabase.from('task_templates').select('*').order('sort_group').order('sort_order'),
    supabase.from('milestones').select('title').eq('wedding_id', wedding.id),
  ])

  // Group label yang sudah diaktifkan (ada milestonenya)
  const activatedGroups = new Set((existingMilestones ?? []).map(m => m.title))

  return (
    <TemplatePickerClient
      templates={templates ?? []}
      activatedGroups={activatedGroups}
      weddingId={wedding.id}
    />
  )
}
