import Link from 'next/link'
import { ArrowLeft, BookOpen, Layers, MessageSquare, Plus, Search, Sparkles, TrendingUp, UserPlus, Zap } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { safeCount, safeQuery } from '@/lib/safe-data'
import type { Category } from '@/lib/types'

type HomeThread = {
  id: number
  title: string
  slug: string
  views: number
  replies_count: number
  created_at: string
  category: { name: string; slug: string } | null
}

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()

  const categories = await safeQuery(
    supabase.from('categories').select('*').order('sort_order').returns<Category[]>(),
    [],
  )

  const totalThreads = await safeCount(
    supabase.from('threads').select('*', { count: 'exact', head: true }),
  )

  const totalReplies = await safeCount(
    supabase.from('replies').select('*', { count: 'exact', head: true }),
  )

  const totalUsers = await safeCount(
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  )

  const latestUser = await safeQuery(
    supabase.from('profiles').select('username').order('created_at', { ascending: false }).limit(1).single<{ username: string }>(),
    null,
  )

  const latestThreads = await safeQuery(
    supabase.from('threads').select('id, title, slug, views, replies_count, created_at, category:category_id(name, slug)').eq('status', 'published').order('created_at', { ascending: false }).limit(6).returns<HomeThread[]>(),
    [],
  )

  return (
    <div className="content-wrap space-y-6">
      <PageHeader
        eyebrow="منتدى عربي شامل مبني للنمو والثقة"
        title="أسئلة عملية، إجابات واضحة، وأقسام تتوسع مع احتياج الناس."
        description="ابدأ من التقنية، الموبايل، البرمجة، الذكاء الاصطناعي، الأعمال أو الأسئلة العامة. كل موضوع جيد هنا يتحول لصفحة قابلة للبحث والمشاركة والرجوع لها."
        actions={
          <>
            <Button asChild variant="primary">
              <Link href="/t/new">
                <Zap className="h-4 w-4" />
                اكتب سؤالك الآن
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/search">
                <Search className="h-4 w-4" />
                ابحث عن حل جاهز
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="stat-grid">
          <StatCard label="الموضوعات" value={totalThreads} />
          <StatCard label="الردود" value={totalReplies} />
          <StatCard label="الأعضاء" value={totalUsers} />
          <StatCard label="الأقسام" value={categories.length} />
        </div>

        <Card variant="soft" className="p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
            <TrendingUp className="h-4 w-4 accent-text" />
            اتجاه النمو
          </div>
          <div className="space-y-3 text-sm muted">
            <p>المنتدى يبدأ بأقسام قوية في البحث، ثم يتوسع بأقسام جديدة كلما ظهر طلب واضح.</p>
            <p>الصفحة الجيدة لازم تقرأ بسهولة، تتفهرس بسرعة، وتستوعب إعلانًا محترمًا بدون إزعاج.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="meta-pill">
              <Layers className="h-4 w-4" />
              قابل للتوسع
            </span>
            <span className="meta-pill">
              <BookOpen className="h-4 w-4" />
              صفحات قابلة للأرشفة
            </span>
            {latestUser?.username && <span className="meta-pill">آخر عضو: {latestUser.username}</span>}
          </div>
        </Card>
      </div>

      <section id="sections" className="scroll-mt-24 space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow">الأقسام الأساسية</span>
            <h2 className="mt-2 text-2xl font-extrabold text-white">ابدأ من القسم الأقرب لسؤالك</h2>
            <p className="mt-2 max-w-2xl text-sm muted">
              الأقسام قابلة للتوسع من لوحة الإدارة، لكن كل قسم لازم يبقى واضح بما يكفي ليخدم الزائر والبحث.
            </p>
          </div>
          <Button asChild variant="ghost" className="self-start md:self-auto">
            <Link href="/search">
              اذهب للبحث
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {categories.length === 0 ? (
          <Card padding="lg" className="text-center">
            <div className="mx-auto node-icon text-2xl">
              <Layers className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-xl font-extrabold text-white">المنتدي لسه جديد — أول قسم ينتظرك</h3>
            <p className="mx-auto mt-3 max-w-lg text-sm muted">
          الأقسام بتتضاف من لوحة الإدارة المخصصة للمشرفين، لكن المحتوى الحقيقي بيبدألما أول شخص يفتح موضوع. الـ admin يقدر يضيف الأقسام اللي تناسب جمهور المنتدى.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button asChild variant="primary">
                <Link href="/admin">
                  <Plus className="h-4 w-4" />
                  إدارة الأقسام
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/t/new">
                  <MessageSquare className="h-4 w-4" />
                  اكتب أول موضوع
                </Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {categories.map((category) => (
              <Card key={category.id} variant="section" className="node block p-5 no-underline md:p-6">
                <Link href={`/c/${category.slug}`} className="block">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="node-icon text-xl">{category.icon}</div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="node-title text-lg">{category.name}</h3>
                          <Badge variant="brand">قسم نشط</Badge>
                        </div>
                        <p className="node-desc max-w-3xl">{category.description}</p>
                        <div className="node-stats-row">
                          <span>
                            الموضوعات: <strong>{category.threads_count}</strong>
                          </span>
                          <span>
                            الردود: <strong>{category.replies_count}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="meta-pill">
                      ادخل القسم
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
        <Card padding="md" className="text-center">
          <div className="mx-auto node-icon text-xl">1</div>
          <h3 className="mt-3 text-base font-extrabold text-white">اكتب مشكلتك</h3>
          <p className="mt-2 text-sm muted">وصف واضح ومباشر للمشكلة أو الاستفسار التقني اللي عندك</p>
        </Card>
        <Card padding="md" className="text-center">
          <div className="mx-auto node-icon text-xl">2</div>
          <h3 className="mt-3 text-base font-extrabold text-white">استقبل الحلول</h3>
          <p className="mt-2 text-sm muted">المجتمع والمساعدين بيقدموا إجابات عملية ومجربة</p>
        </Card>
        <Card padding="md" className="text-center">
          <div className="mx-auto node-icon text-xl">3</div>
          <h3 className="mt-3 text-base font-extrabold text-white">اختر الأفضل</h3>
          <p className="mt-2 text-sm muted">صوت للإجابة اللي ساعدتك عشان تفيد غيرك في المستقبل</p>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
        <Card variant="soft" className="p-5">
          <span className="eyebrow">انتشار منظم</span>
          <h2 className="mt-3 text-2xl font-extrabold text-white">كل قسم جديد لازم يفتح باب بحث جديد</h2>
          <p className="mt-3 text-sm muted">
            التوسع الحقيقي مش عدد أقسام كبير وخلاص. التوسع الصح إن كل قسم يبقى له جمهور، أسئلة متكررة،
            وصف واضح، ومواضيع افتتاحية تخليه مفيد من أول يوم.
          </p>
          <div className="mt-4 grid gap-2">
            <span className="meta-pill">عنوان قابل للبحث</span>
            <span className="meta-pill">وصف مباشر</span>
            <span className="meta-pill">موضوعات افتتاحية</span>
          </div>
        </Card>

        <section className="block-container">
          <div className="block-header">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              أحدث النقاشات
            </span>
            <span className="muted text-sm">{latestThreads?.length ?? 0} موضوع</span>
          </div>

          {latestThreads.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto node-icon text-xl">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-lg font-extrabold text-white">أول نقاش في المنتدى لسه مستنيك</h3>
              <p className="mx-auto mt-2 max-w-md text-sm muted">
                أي موضوع تقني عندك — مشكلة، استفسار، أو شرح — ممكن يبقى أول محتوى مفيد في المنتدى.
              </p>
              <div className="mt-4">
                <Button asChild variant="primary">
                  <Link href="/t/new">
                    <Plus className="h-4 w-4" />
                    اكتب أول موضوع
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {latestThreads.map((thread, index) => (
                <Link
                  key={thread.id}
                  href={`/t/${thread.slug}`}
                  className="node block no-underline"
                  style={{
                    borderBottom:
                      index < latestThreads.length - 1 ? '1px solid rgba(224, 197, 132, 0.1)' : 'none',
                  }}
                >
                  <div className="node-body">
                    <div className="node-icon">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="node-main">
                      <div className="node-title">{thread.title}</div>
                      <div className="node-stats-row">
                        {thread.category && (
                          <span>
                            في <strong>{thread.category.name}</strong>
                          </span>
                        )}
                        <span>
                          المشاهدات: <strong>{thread.views}</strong>
                        </span>
                        <span>
                          الردود: <strong>{thread.replies_count}</strong>
                        </span>
                      </div>
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
