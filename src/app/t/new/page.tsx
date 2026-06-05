import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Category } from '@/lib/types'

import NewThreadComposer from './NewThreadComposer'

export const dynamic = 'force-dynamic'

export default async function NewThreadPage() {
  const supabase = await createServerSupabaseClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')
    .returns<Category[]>()

  return <NewThreadComposer categories={categories ?? []} />
}
