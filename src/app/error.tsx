"use client"

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="content-wrap">
      <div className="surface-card p-10 text-center">
        <div className="text-6xl font-extrabold text-red-400 mb-4">!</div>
        <h1 className="text-2xl font-extrabold text-white">حدث خطأ غير متوقع</h1>
        <p className="mt-3 text-sm muted max-w-md mx-auto">فيه حاجة غلط. حاول تاني أو راجع الاتصال.</p>
        <div className="mt-6">
          <button type="button" onClick={reset} className="btn btn-primary">حاول مرة أخرى</button>
        </div>
      </div>
    </div>
  )
}
