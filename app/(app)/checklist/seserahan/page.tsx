import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SeserahanClient } from './SeserahanClient'

export default async function SeserahanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: wedding } = await supabase.from('weddings').select('id').eq('user_id', user.id).single()
  if (!wedding) redirect('/onboarding/step-1')

  const { data: items } = await supabase
    .from('seserahan_items')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('sort_order')

  return <SeserahanClient items={items ?? []} weddingId={wedding.id} />
}
