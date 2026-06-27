import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AnggaranClient } from './AnggaranClient'

export default async function AnggaranPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: wedding } = await supabase.from('weddings').select('*').eq('user_id', user.id).single()
  if (!wedding) redirect('/onboarding/step-1')

  const [{ data: categories }, { data: items }, { data: expenses }] = await Promise.all([
    supabase.from('budget_categories').select('*').eq('wedding_id', wedding.id).order('sort_order'),
    supabase.from('budget_items').select('*').eq('wedding_id', wedding.id).order('sort_order'),
    supabase.from('expenses').select('*').eq('wedding_id', wedding.id).order('created_at', { ascending: false }),
  ])

  return (
    <AnggaranClient
      wedding={wedding}
      categories={categories ?? []}
      items={items ?? []}
      expenses={expenses ?? []}
    />
  )
}
