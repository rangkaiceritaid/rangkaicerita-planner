import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KuaClient } from './KuaClient'

export default async function KuaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: wedding } = await supabase.from('weddings').select('id').eq('user_id', user.id).single()
  if (!wedding) redirect('/onboarding/step-1')

  const { data: docs } = await supabase
    .from('kua_documents')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('sort_order')

  return <KuaClient docs={docs ?? []} weddingId={wedding.id} />
}
