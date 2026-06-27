import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UndanganClient } from './UndanganClient'

export default async function UndanganPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: wedding }, { data: profile }] = await Promise.all([
    supabase.from('weddings').select('id').eq('user_id', user.id).single(),
    supabase.from('profiles').select('groom_name, bride_name').eq('id', user.id).single(),
  ])
  if (!wedding) redirect('/onboarding/step-1')

  const { data: guests } = await supabase
    .from('guests')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('name')

  return (
    <UndanganClient
      guests={guests ?? []}
      weddingId={wedding.id}
      groomName={profile?.groom_name || 'Pengantin Pria'}
      brideName={profile?.bride_name || 'Pengantin Wanita'}
    />
  )
}
