"use client"

import { useRouter } from "next/navigation"
import { Settings } from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import { PageHeader } from "@/components/ui/page-header"
import SettingsForm from "./SettingsForm"

export default function SettingsPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()

  if (loading) return <div className="content-wrap"><div className="surface-card p-8 text-sm muted">جارٍ التحميل...</div></div>
  if (!profile) { router.push("/login?next=/settings"); return null }

  return (
    <div className="content-wrap space-y-5">
      <PageHeader
        eyebrow="الإعدادات"
        title="تخصيص ملفك الشخصي"
        description="عدل اسمك المعروض، أضف نبذة عنك، عشان تخلي حضورك واضح."
        icon={<Settings className="h-full w-full" />}
      />
      <SettingsForm />
    </div>
  )
}
