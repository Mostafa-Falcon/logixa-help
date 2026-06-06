"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowLeft, BookOpen, Layers, LogIn, MessageSquare, Pin, Plus, Search, Sparkles, TrendingUp, UserPlus, Zap, Globe, GraduationCap, HeartPulse, Briefcase, Gamepad2, Shield, Palette } from "lucide-react"
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore"

import { db } from "@/lib/firebase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import MonetagAd from "@/components/Monetag"
import type { Category } from "@/lib/types"

/** أيقونات المجالات المختلفة */
const FIELD_ICONS: Record<string, any> = {
  "تقنية": Zap,
  "تعليم": GraduationCap,
  "صحة": HeartPulse,
  "أعمال": Briefcase,
  "ترفيه": Gamepad2,
  "أمن": Shield,
  "فنون": Palette,
  "عام": Globe,
}

/** ألوان المجالات */
const FIELD_COLORS: Record<string, string> = {
  "تقنية": "#50b09e",
  "تعليم": "#d4a848",
  "صحة": "#e86060",
  "أعمال": "#3ab86b",
  "ترفيه": "#e8a848",
  "أمن": "#6c8cff",
  "فنون": "#c084fc",
  "عام": "#a4a094",
}

const SAMPLE_FIELDS = [
  { label: "تقنية", icon: Zap, color: "#50b09e" },
  { label: "تعليم", icon: GraduationCap, color: "#d4a848" },
  { label: "صحة", icon: HeartPulse, color: "#e86060" },
  { label: "أعمال", icon: Briefcase, color: "#3ab86b" },
  { label: "ترفيه", icon: Gamepad2, color: "#e8a848" },
  { label: "أمن", icon: Shield, color: "#6c8cff" },
  { label: "فنون", icon: Palette, color: "#c084fc" },
  { label: "عام", icon: Globe, color: "#a4a094" },
]

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [totalThreads, setTotalThreads] = useState(0)
  const [totalReplies, setTotalReplies] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [latestUser, setLatestUser] = useState<string | null>(null)
  const [latestThreads, setLatestThreads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeField, setActiveField] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const catSnap = await getDocs(query(collection(db, "categories"), orderBy("order")))
        const cats = catSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as Category)
        setCategories(cats)

        const [ts, rs, us] = await Promise.all([
          getDocs(collection(db, "threads")),
          getDocs(collection(db, "replies")),
          getDocs(query(collection(db, "profiles"), orderBy("createdAt", "desc"), limit(1))),
        ])
        setTotalThreads(ts.size)
        setTotalReplies(rs.size)
        setTotalUsers(us.size)
        if (!us.empty) setLatestUser(us.docs[0].data().username ?? null)

        const threadSnap = await getDocs(
          query(collection(db, "threads"), orderBy("createdAt", "desc"), limit(8)),
        )
        setLatestThreads(
          threadSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        )
      } catch (err) {
        console.error("Failed to load homepage", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  /** تصفية الأقسام حسب المجال */
  const filteredCategories = activeField
    ? categories.filter((c) => c.field === activeField)
    : categories

  /** تجميع الأقسام حسب المجال */
  const fields = new Map<string, Category[]>()
  for (const cat of categories) {
    const f = cat.field || "عام"
    if (!fields.has(f)) fields.set(f, [])
    fields.get(f)!.push(cat)
  }

  return (
    <div className="content-wrap space-y-6">
      {/* ─── Hero Section ─── */}
      <section className="surface-card hero-panel px-6 py-8 md:px-8 md:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <span className="eyebrow">منتدى عربي شامل</span>
            <h1 className="page-title text-4xl md:text-5xl leading-[1.1]">
              عندك سؤال أو استفسار؟<br />
              <span className="accent-text">تلاقي الإجابة هنا</span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              مجتمع عربي يجمع كل المجالات — تقنية، تعليم، صحة، أعمال، ترفيه، وأكثر.
              اطرح سؤالك، شارك بخبرتك، واستفيد من تجارب الآلاف.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="primary">
              <Link href="/t/new">
                <Zap className="h-4 w-4" />
                اطرح سؤالك
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/search">
                <Search className="h-4 w-4" />
                ابحث في المنتدى
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── إحصائيات سريعة ─── */}
      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="stat-grid">
          <StatCard label="مواضيع" value={loading ? "..." : totalThreads} />
          <StatCard label="إجابات" value={loading ? "..." : totalReplies} />
          <StatCard label="أعضاء" value={loading ? "..." : totalUsers} />
          <StatCard label="أقسام" value={loading ? "..." : categories.length} />
        </div>

        <Card variant="soft" className="p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
            <TrendingUp className="h-4 w-4 accent-text" />
            المنتدى بينمو كل يوم
          </div>
          <div className="space-y-3 text-sm muted">
            <p>كل مجال وله أقسامه المتخصصة — اختار اللي يناسبك وشارك.</p>
            <p>تصميم نظيف وسريع عشان تجربة قراءة مريحة على الجوال والديسكتوب.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="meta-pill">
              <Globe className="h-4 w-4" />
              مجالات متعددة
            </span>
            <span className="meta-pill">
              <BookOpen className="h-4 w-4" />
              محتوى يفيد غيرك
            </span>
            {latestUser && <span className="meta-pill">آخر عضو: {latestUser}</span>}
          </div>
        </Card>
      </div>

      {/* ─── رحلة الاستخدام ─── */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Card padding="md" className="text-center card-glow">
          <div className="mx-auto node-icon text-xl">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-base font-extrabold text-white">1. اكتب سؤالك</h3>
          <p className="mt-2 text-sm muted">وصف واضح ومباشر لاستفسارك في أي مجال</p>
        </Card>
        <Card padding="md" className="text-center card-glow">
          <div className="mx-auto node-icon text-xl">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-base font-extrabold text-white">2. استقبل الإجابات</h3>
          <p className="mt-2 text-sm muted">المجتمع العربي بيساعدك بتجاربه وحلوله</p>
        </Card>
        <Card padding="md" className="text-center card-glow">
          <div className="mx-auto node-icon text-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-base font-extrabold text-white">3. شارك وافيد غيرك</h3>
          <p className="mt-2 text-sm muted">صوّت للإجابة المفيدة عشان الكل يستفيد</p>
        </Card>
      </section>

      {/* ─── الأقسام حسب المجالات ─── */}
      <section id="sections" className="scroll-mt-24 space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow">الأقسام والمجالات</span>
            <h2 className="mt-2 text-2xl font-extrabold text-white">كل المجالات في مكان واحد</h2>
            <p className="mt-2 max-w-2xl text-sm muted">تقنية، تعليم، صحة، أعمال، ترفيه، وأكثر. اختر مجالك وشارك.</p>
          </div>
          <Button asChild variant="ghost" className="self-start md:self-auto">
            <Link href="/search">
              ابحث في الكل
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* ─── فلاتر المجالات ─── */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveField(null)}
            className={`field-badge transition-all ${!activeField ? "bg-white/10 text-white border-white/20" : "bg-white/5 text-muted border-white/10"}`}
            style={{ border: "1px solid" }}
          >
            <Globe className="h-3.5 w-3.5" />
            الكل
          </button>
          {SAMPLE_FIELDS.map((field) => {
            const Icon = field.icon
            const isActive = activeField === field.label
            return (
              <button
                key={field.label}
                onClick={() => setActiveField(isActive ? null : field.label)}
                className={`field-badge transition-all`}
                style={{
                  border: `1px solid ${isActive ? field.color : "rgba(200,180,140,0.12)"}`,
                  background: isActive ? `${field.color}22` : "rgba(20,23,25,0.85)",
                  color: isActive ? field.color : "var(--color-text-muted)",
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                {field.label}
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} variant="section" className="p-5 md:p-6"><div className="skeleton h-20" /></Card>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <Card padding="lg" className="text-center">
            <div className="mx-auto node-icon text-2xl">
              <Layers className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-xl font-extrabold text-white">
              {activeField ? `لسه مفيش أقسام في مجال "${activeField}"` : "لسه مفيش أقسام"}
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-sm muted">
              {activeField
                ? "قريبًا هتضاف أقسام جديدة في كل المجالات"
                : "أقسام جديدة بتتضاف من لوحة التحكم. أول محتوى حقيقي بيبدأ من أول موضوع."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button asChild variant="primary">
                <Link href="/admin"><Plus className="h-4 w-4" /> إضافة قسم</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/t/new"><MessageSquare className="h-4 w-4" /> أول موضوع</Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredCategories.map((category) => {
              const fieldColor = FIELD_COLORS[category.field || "عام"] || "#a4a094"
              const FieldIcon = FIELD_ICONS[category.field || "عام"] || Globe
              return (
                <Card key={category.id} variant="section" className="node block p-5 no-underline md:p-6 card-glow">
                  <Link href={`/c/${category.id}`} className="block">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className="node-icon text-xl"
                          style={{
                            background: `linear-gradient(135deg, ${fieldColor}22, ${fieldColor}11)`,
                            borderColor: `${fieldColor}33`,
                          }}
                        >
                          {category.icon}
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="node-title text-lg">{category.name}</h3>
                            <Badge variant="brand">قسم</Badge>
                            {category.field && (
                              <span
                                className="field-badge"
                                style={{
                                  background: `${fieldColor}15`,
                                  color: fieldColor,
                                  border: `1px solid ${fieldColor}25`,
                                }}
                              >
                                <FieldIcon className="h-3 w-3" />
                                {category.field}
                              </span>
                            )}
                          </div>
                          <p className="node-desc max-w-3xl">{category.description}</p>
                          <div className="node-stats-row">
                            <span>مواضيع: <strong>{category.threadCount}</strong></span>
                          </div>
                        </div>
                      </div>
                      <div className="meta-pill">
                        تصفّح
                        <ArrowLeft className="h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* ─── آخر المواضيع ─── */}
      <section className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
        <Card variant="soft" className="p-5">
          <span className="eyebrow">لأي مجال</span>
          <h2 className="mt-3 text-2xl font-extrabold text-white">المنتدى بيتوسع معاك</h2>
          <p className="mt-3 text-sm muted">تقدر تضيف أقسام جديدة من لوحة التحكم. كل مجال محتاج محتوى، أسئلة، ووصف واضح عشان يفيد الكل.</p>
          <div className="mt-4 grid gap-2">
            <span className="meta-pill">عنوان واضح</span>
            <span className="meta-pill">وصف مختصر</span>
            <span className="meta-pill">محتوى مفيد</span>
          </div>
        </Card>

        <section className="block-container">
          <div className="block-header">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              أحدث المواضيع
            </span>
            <span className="muted text-sm">{latestThreads.length} موضوع</span>
          </div>

          {latestThreads.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto node-icon text-xl"><BookOpen className="h-6 w-6" /></div>
              <h3 className="mt-3 text-lg font-extrabold text-white">أول موضوع في المنتدى لسه مستنيك</h3>
              <p className="mx-auto mt-2 max-w-md text-sm muted">أي سؤال أو استفسار عندك في أي مجال — ممكن يبقى أول محتوى مفيد يفيد غيرك كمان.</p>
              <div className="mt-4">
                <Button asChild variant="primary">
                  <Link href="/t/new"><Plus className="h-4 w-4" /> أول موضوع</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {latestThreads.map((thread: any, index: number) => (
                <Link
                  key={thread.id}
                  href={`/t/${thread.slug}`}
                  className="node block no-underline"
                  style={{ borderBottom: index < latestThreads.length - 1 ? "1px solid rgba(200, 180, 140, 0.08)" : "none" }}
                >
                  <div className="node-body">
                    <div className="node-icon"><BookOpen className="h-5 w-5" /></div>
                    <div className="node-main">
                      <div className="node-title">
                        {thread.isPinned && <Pin className="ml-1 inline h-3.5 w-3.5 text-amber-400" />}
                        {thread.title}
                      </div>
                      <div className="node-stats-row">
                        <span>مشاهدات: <strong>{thread.viewCount ?? 0}</strong></span>
                        <span>ردود: <strong>{thread.replyCount ?? 0}</strong></span>
                      </div>
                      {thread.tags?.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {thread.tags.map((tag: string) => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/60">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="meta-pill">
                      اقرأ
                      <ArrowLeft className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </section>

      {/* ─── دعوة للانضمام ─── */}
      <section className="surface-card hero-panel px-6 py-8 md:px-8 md:py-10 text-center">
        <span className="eyebrow justify-center">انضم للمجتمع</span>
        <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-white">شارك معرفتك مع المجتمع العربي</h2>
        <p className="mt-4 mx-auto max-w-2xl text-base muted">
          كل سؤال بتطرحه وكل إجابة بتكتبها بتضيف قيمة للمحتوى العربي على الإنترنت.
          سجل دلوقتي وابدأ.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild variant="primary">
            <Link href="/register">
              <UserPlus className="h-4 w-4" /> إنشاء حساب مجاني
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">
              <LogIn className="h-4 w-4" /> تسجيل الدخول
            </Link>
          </Button>
        </div>
      </section>

      <MonetagAd />
    </div>
  )
}