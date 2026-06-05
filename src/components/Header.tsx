'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  CirclePlus,
  Home,
  Layers,
  LogIn,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  UserPlus,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { OnlineCounter } from '@/components/OnlineCounter'

type HeaderUser = {
  username: string
  role: 'member' | 'trusted' | 'moderator' | 'admin'
}

const NAV_LINKS = [
  { href: '/', label: 'الرئيسية', icon: Home },
  { href: '/#sections', label: 'الأقسام', icon: Layers },
  { href: '/search', label: 'بحث', icon: Search },
  { href: '/t/new', label: 'اسأل سؤالًا', icon: CirclePlus },
]

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<HeaderUser | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    async function loadUser() {
      const res = await fetch('/api/users', { cache: 'no-store' })
      if (!res.ok) {
        setUser(null)
        return
      }

      const data = await res.json()
      if (data.profile?.username) {
        setUser({
          username: data.profile.username,
          role: data.profile.role,
        })
        return
      }

      setUser(null)
    }

    loadUser()
  }, [pathname])

  async function handleLogout() {
    const res = await fetch('/api/auth/logout', { method: 'POST' })
    if (!res.ok) {
      return
    }

    setUser(null)
    router.refresh()
    router.push('/')
  }

  return (
    <header
      className="sticky top-0 z-50 border-b transition-all duration-300"
      style={{
        borderColor: scrolled ? 'rgba(224, 197, 132, 0.18)' : 'rgba(224, 197, 132, 0.12)',
        background: scrolled ? 'rgba(17, 19, 15, 0.92)' : 'rgba(17, 19, 15, 0.78)',
        backdropFilter: 'blur(18px)',
        boxShadow: scrolled ? '0 20px 40px rgba(4, 7, 4, 0.24)' : 'none',
      }}
    >
      <div className="content-wrap">
        <div className="flex min-h-18 items-center justify-between gap-4 py-3">
          <Link href="/" className="group flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-lg border transition-shadow duration-300 group-hover:shadow-[0_0_20px_rgba(214,163,74,0.25)]"
              style={{
                borderColor: 'rgba(214, 163, 74, 0.26)',
                background:
                  'linear-gradient(135deg, rgba(224, 182, 92, 0.2), rgba(88, 196, 170, 0.14))',
              }}
            >
              <span className="text-base font-extrabold accent-text">LH</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-extrabold text-white">
                <span className="accent-text">Logixa</span> Help
              </div>
              <div className="text-xs muted">منتدى عربي شامل، سريع، وواضح</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Button
                  key={href}
                  asChild
                  variant="ghost"
                  className={`nav-link ${active ? 'active bg-white/5 text-white' : 'muted'}`}
                >
                  <Link href={href}>
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                </Button>
              )
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <OnlineCounter />
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Button asChild variant="outline">
                    <Link href="/admin">
                      <ShieldCheck className="h-4 w-4" />
                      لوحة التحكم
                    </Link>
                  </Button>
                )}
                <div className="surface-soft px-4 py-2 text-sm text-white">{user.username}</div>
                <Button type="button" onClick={handleLogout} variant="ghost">
                  <LogOut className="h-4 w-4" />
                  خروج
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link href="/login">
                    <LogIn className="h-4 w-4" />
                    دخول
                  </Link>
                </Button>
                <Button asChild variant="primary">
                  <Link href="/register">
                    <UserPlus className="h-4 w-4" />
                    إنشاء حساب
                  </Link>
                </Button>
              </>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div
          className="border-t lg:hidden page-fade-in"
          style={{ borderColor: 'rgba(224, 197, 132, 0.12)' }}
        >
          <div className="content-wrap py-3">
            <div className="surface-card surface-glass p-3">
              <div className="flex flex-col gap-2">
                {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                  <Button key={href} asChild variant="ghost" className="justify-start">
                    <Link href={href} onClick={() => setMenuOpen(false)}>
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  </Button>
                ))}

                {user ? (
                  <>
                    <hr className="divider-gradient my-1" />
                    <div className="flex items-center gap-2 px-1">
                      <div className="avatar h-8 w-8 text-xs">{user.username.slice(0, 1)}</div>
                      <span className="text-sm text-white font-bold">{user.username}</span>
                    </div>
                    {user.role === 'admin' && (
                      <Button asChild variant="outline" className="justify-start">
                        <Link href="/admin" onClick={() => setMenuOpen(false)}>
                          <ShieldCheck className="h-4 w-4" />
                          لوحة التحكم
                        </Link>
                      </Button>
                    )}
                    <Button type="button" onClick={handleLogout} variant="ghost" className="justify-start">
                      <LogOut className="h-4 w-4" />
                      خروج
                    </Button>
                  </>
                ) : (
                  <>
                    <hr className="divider-gradient my-1" />
                    <Button asChild variant="outline" className="justify-start">
                      <Link href="/login" onClick={() => setMenuOpen(false)}>
                        <LogIn className="h-4 w-4" />
                        دخول
                      </Link>
                    </Button>
                    <Button asChild variant="primary" className="justify-start">
                      <Link href="/register" onClick={() => setMenuOpen(false)}>
                        <UserPlus className="h-4 w-4" />
                        إنشاء حساب
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
