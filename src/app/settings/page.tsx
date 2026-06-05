import { redirect } from 'next/navigation'
import { Settings } from 'lucide-react'

import { getCurrentUserWithProfile } from '@/lib/auth'
import { PageHeader } from '@/components/ui/page-header'

import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
  const { user } = await getCurrentUserWithProfile()

  if (!user) {
    redirect('/login?next=/settings')
  }

  return (
    <div className="content-wrap space-y-5">
      <PageHeader
        eyebrow="الإعدادات"
        title="تخصيص ملفك الشخصي"
        description="عدل اسمك المعروض، أضف نبذة عنك، أو غيّر صورتك الرمزية عشان تخلي حضورك واضح."
        icon={<Settings className="h-full w-full" />}
      />
      <SettingsForm />
    </div>
  )
}
