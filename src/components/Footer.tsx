import Link from 'next/link'
import { BookOpen, FileText, Home, Mail, Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer
      className="page-shell mt-12 border-t"
      style={{ borderColor: 'rgba(224, 197, 132, 0.1)' }}
    >
      <div className="content-wrap py-8 md:py-10">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-extrabold"
                style={{
                  borderColor: 'rgba(214, 163, 74, 0.26)',
                  background:
                    'linear-gradient(135deg, rgba(224, 182, 92, 0.2), rgba(88, 196, 170, 0.14))',
                }}
              >
                <span className="accent-text">LH</span>
              </div>
              <span className="text-base font-extrabold text-white">
                <span className="accent-text">Logixa</span> Help
              </span>
            </div>
            <p className="mt-3 text-sm muted leading-relaxed">
              مجتمع تقني عربي — اسأل، شارك الحلول، واستفيد من تجارب غيرك.
            </p>
          </div>

          <div className="md:mr-8">
            <span className="eyebrow">تصفح سريع</span>
            <nav className="mt-3 flex flex-col gap-2">
              <Link href="/" className="text-sm muted hover:text-white transition-colors flex items-center gap-2">
                <Home className="h-3.5 w-3.5" />
                الرئيسية
              </Link>
              <Link href="/#sections" className="text-sm muted hover:text-white transition-colors flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5" />
                الأقسام
              </Link>
              <Link href="/search" className="text-sm muted hover:text-white transition-colors flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                البحث
              </Link>
              <Link href="/t/new" className="text-sm muted hover:text-white transition-colors flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                اسأل
              </Link>
            </nav>
          </div>

          <div>
            <span className="eyebrow">قانوني</span>
            <nav className="mt-3 flex flex-col gap-2">
              <Link href="/privacy" className="text-sm muted hover:text-white transition-colors flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" />
                سياسة الخصوصية
              </Link>
              <Link href="/terms" className="text-sm muted hover:text-white transition-colors flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                شروط الاستخدام
              </Link>
            </nav>
          </div>
        </div>

        <hr className="divider-gradient mt-6 mb-4" />

        <div className="flex flex-col gap-2 text-xs muted md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Logixa Help. المحتوى تحت مسؤولية كاتبه.</span>
          <span>نسخة 1.0</span>
        </div>
      </div>
    </footer>
  )
}
