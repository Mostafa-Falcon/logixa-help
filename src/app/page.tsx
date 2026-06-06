"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowLeft, BookOpen, Layers, MessageSquare, Pin, Plus, Search, Sparkles, TrendingUp, Zap } from "lucide-react"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"

import { db } from "@/lib/firebase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import type { Category } from "@/lib/types"

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [totalThreads, setTotalThreads] = useState(0)
  const [totalReplies, setTotalReplies] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [latestUser, setLatestUser] = useState<string | null>(null)
  const [latestThreads, setLatestThreads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
          query(collection(db, "threads"), orderBy("createdAt", "desc"), limit(6)),
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

  return (
    <div className="content-wrap space-y-6">
      <section className="surface-card hero-panel px-6 py-8 md:px-8 md:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <span className="eyebrow">عندك مشكلة؟ إحنا هنا</span>
            <h1 className="page-title text-4xl md:text-5xl leading-[1.1]">
              مشكلة بتواجهك؟<br />
              <span className="accent-text">لاقي حلّها هنا</span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              في البرمجة، التقنية، الشغل، أو الدراسة—اكتب مشكلتك والمجتمع هيساعدك.
              كل سؤال بيتحول لمورد يفيد غيرك بعد ما تستفيد منه.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="primary">
              <Link href="/t/new">
                <Zap className="h-4 w-4" />
                اسأل سؤالك
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/search">
                <Search className="h-4 w-4" />
                دوّر على حل
              </Link>
            </Button>
          </div>
        </div>
      </section>

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
            المنتدى بينمو
          </div>
          <div className="space-y-3 text-sm muted">
            <p>كل قسم بيركز على مجال معين عشان تلاقي اللي يهمك بسرعة.</p>
            <p>الصفحات بتتناسب مع إعلانات محترمة بدون ما تزعجك — تجربة تصفح نضيفة.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="meta-pill">
              <Layers className="h-4 w-4" />
              بيتوسع مع الوقت
            </span>
            <span className="meta-pill">
              <BookOpen className="h-4 w-4" />
              محتوى بينفع غيرك
            </span>
            {latestUser && <span className="meta-pill">آخر عضو: {latestUser}</span>}
          </div>
        </Card>
      </div>

      <section id="sections" className="scroll-mt-24 space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow">الأقسام</span>
            <h2 className="mt-2 text-2xl font-extrabold text-white">اختار القسم اللي يناسب مشكلتك</h2>
            <p className="mt-2 max-w-2xl text-sm muted">كل قسم فيه مواضيع مفيدة. مش عارف تبدأ منين؟ جرب البحث الأول.</p>
          </div>
          <Button asChild variant="ghost" className="self-start md:self-auto">
            <Link href="/search">
              فتح البحث
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} variant="section" className="p-5 md:p-6"><div className="skeleton h-20" /></Card>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <Card padding="lg" className="text-center">
            <div className="mx-auto node-icon text-2xl">
              <Layers className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-xl font-extrabold text-white">لسه مفيش أقسام — أول واحد يضيف</h3>
            <p className="mx-auto mt-3 max-w-lg text-sm muted">أقسام جديدة بتتضاف من لوحة التحكم. المحتوى الحقيقي بيبدأ من أول موضوع.</p>
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
            {categories.map((category) => (
              <Card key={category.id} variant="section" className="node block p-5 no-underline md:p-6 card-glow">
                <Link href={`/c/${category.id}`} className="block">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="node-icon text-xl">{category.icon}</div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="node-title text-lg">{category.name}</h3>
                          <Badge variant="brand">قسم</Badge>
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
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card padding="md" className="text-center card-glow">
          <div className="mx-auto node-icon text-xl">1</div>
          <h3 className="mt-3 text-base font-extrabold text-white">اكتب مشكلتك</h3>
          <p className="mt-2 text-sm muted">وصف واضح ومباشر للمشكلة أو الاستفسار اللي محتاره</p>
        </Card>
        <Card padding="md" className="text-center card-glow">
          <div className="mx-auto node-icon text-xl">2</div>
          <h3 className="mt-3 text-base font-extrabold text-white">استقبل الحلول</h3>
          <p className="mt-2 text-sm muted">المجتمع بيشاركك تجاربه وحلوله العملية</p>
        </Card>
        <Card padding="md" className="text-center card-glow">
          <div className="mx-auto node-icon text-xl">3</div>
          <h3 className="mt-3 text-base font-extrabold text-white">اختر الأفضل</h3>
          <p className="mt-2 text-sm muted">صوت للإجابة اللي ساعدتك عشان غيرك يستفيد منها</p>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
        <Card variant="soft" className="p-5">
          <span className="eyebrow">نمو متقن</span>
          <h2 className="mt-3 text-2xl font-extrabold text-white">كل قسم بيفتح لك مجال جديد</h2>
          <p className="mt-3 text-sm muted">التوسع مش كتر الأقسام. كل قسم محتاج محتوى، أسئلة، ووصف واضح عشان يفيدك من أول يوم.</p>
          <div className="mt-4 grid gap-2">
            <span className="meta-pill">عنوان واضح</span>
            <span className="meta-pill">وصف مختصر</span>
            <span className="meta-pill">محتوى افتتاحي</span>
          </div>
        </Card>

        <section className="block-container">
          <div className="block-header">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              آخر المواضيع
            </span>
            <span className="muted text-sm">{latestThreads.length} موضوع</span>
          </div>

          {latestThreads.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto node-icon text-xl"><BookOpen className="h-6 w-6" /></div>
              <h3 className="mt-3 text-lg font-extrabold text-white">أول موضوع في المنتدى لسه مستنيك</h3>
              <p className="mx-auto mt-2 max-w-md text-sm muted">أي مشكلة أو استفسار عندك — ممكن يبقى أول محتوى مفيد يفيد غيرك كمان.</p>
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
                  style={{ borderBottom: index < latestThreads.length - 1 ? "1px solid rgba(224, 197, 132, 0.08)" : "none" }}
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
    </div>
  )
}
