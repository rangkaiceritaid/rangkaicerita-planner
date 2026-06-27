import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BerandaClient } from './BerandaClient'

export default async function BerandaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: wedding }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('weddings').select('*').eq('user_id', user.id).single(),
  ])

  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const [{ data: monthTasks }, { data: milestones }, { data: expenses }, { data: categories }] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('wedding_id', wedding?.id ?? '')
      .eq('is_completed', false)
      .gte('due_date', firstDay)
      .lte('due_date', lastDay)
      .order('due_date')
      .limit(10),
    supabase
      .from('milestones')
      .select(`*, tasks(id, is_completed)`)
      .eq('wedding_id', wedding?.id ?? '')
      .order('sort_order')
      .limit(5),
    supabase.from('expenses').select('amount').eq('wedding_id', wedding?.id ?? ''),
    supabase.from('budget_categories').select('*').eq('wedding_id', wedding?.id ?? ''),
  ])

  const totalSpent = expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0

  return (
    <BerandaClient
      profile={profile}
      wedding={wedding}
      monthTasks={monthTasks ?? []}
      milestones={milestones ?? []}
      totalSpent={totalSpent}
      categories={categories ?? []}
    />
  )
}
