import Link from "next/link"

export default function NotFound() {
  return (
    <div className="content-wrap">
      <div className="surface-card p-10 text-center">
        <div className="text-6xl font-extrabold accent-text mb-4">404</div>
        <h1 className="text-2xl font-extrabold text-white">الصفحة غير موجودة</h1>
        <p className="mt-3 text-sm muted max-w-md mx-auto">الصفحة اللي بتدور عليها مش موجودة أو اتحذفت. ممكن تكون دخلت رابط غلط.</p>
        <div className="mt-6">
          <Link href="/" className="btn btn-primary">الرئيسية</Link>
        </div>
      </div>
    </div>
  )
}
