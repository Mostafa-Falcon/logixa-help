import type { Metadata } from 'next'
import Link from 'next/link'
import { HiChevronLeft, HiHome, HiScale } from 'react-icons/hi'

export const metadata: Metadata = {
  title: 'شروط الاستخدام',
}

export default function TermsPage() {
  return (
    <div className="content-wrap space-y-5">
      <div className="breadcrumb">
        <Link href="/" className="inline-flex items-center gap-1">
          <HiHome className="text-sm" />
          الرئيسية
        </Link>
        <HiChevronLeft className="text-xs" />
        <span>شروط الاستخدام</span>
      </div>

      <section className="surface-card hero-panel px-5 py-6 md:px-7">
        <span className="eyebrow">قواعد واضحة من البداية</span>
        <div className="mt-4 flex items-start gap-4">
          <div className="node-icon">
            <HiScale />
          </div>
          <div>
            <h1 className="page-title text-3xl md:text-4xl">شروط الاستخدام</h1>
            <p className="mt-3 max-w-3xl page-desc">
              الهدف من هذه الشروط ليس التعقيد، بل وضع أرضية واضحة: المنتدى مفتوح للمساعدة والمحتوى المفيد،
              وليس للفوضى أو الإساءة أو التحايل.
            </p>
          </div>
        </div>
      </section>

      <section className="surface-card p-5 md:p-7">
        <div className="prose-content">
          <h2>1. القبول بالشروط</h2>
          <p>
            باستخدامك Logixa Help فأنت توافق على هذه الشروط. إذا لم تكن موافقًا عليها، يرجى عدم استخدام
            المنصة.
          </p>

          <h2>2. مسؤولية المحتوى</h2>
          <p>أنت مسؤول عن أي محتوى تنشره داخل المنتدى. ويجب أن يكون المحتوى:</p>
          <ul className="legal-list">
            <li>قانونيًا وغير منتهك لحقوق الآخرين.</li>
            <li>واضحًا وغير مضلل أو احتيالي.</li>
            <li>بعيدًا عن الرسائل الدعائية المزعجة أو الروابط الضارة.</li>
          </ul>

          <h2>3. السلوك داخل المنتدى</h2>
          <ul className="legal-list">
            <li>يمنع نشر الإساءة أو التحرش أو الإهانة أو الاستفزاز المقصود.</li>
            <li>يمنع انتحال الشخصيات أو ادعاء صلاحيات غير حقيقية.</li>
            <li>يمنع نشر محتوى تقني ضار بقصد الإيذاء أو التخريب.</li>
            <li>يجب احترام اختلاف الآراء طالما كان النقاش في إطار محترم.</li>
          </ul>

          <h2>4. الحسابات</h2>
          <p>
            أنت مسؤول عن حماية حسابك وكلمة السر الخاصة بك، وعن أي نشاط يتم عبر الحساب ما لم يتم إثبات
            استخدام غير مصرح به.
          </p>

          <h2>5. حقوق المنصة</h2>
          <p>
            نحتفظ بحق تعديل أو حذف المحتوى المخالف، وتقييد أو إيقاف الحسابات التي تسيء استخدام المنصة أو
            تضر بتجربتها أو سمعتها.
          </p>

          <h2>6. الملكية الفكرية</h2>
          <p>
            يظل المحتوى الذي تنشره مملوكًا لك، لكنك تمنح المنصة حق عرضه وتنظيمه وفهرسته داخل الموقع بالقدر
            اللازم لتشغيل الخدمة.
          </p>

          <h2>7. إخلاء المسؤولية</h2>
          <p>
            المنصة تقدم المحتوى كما هو. لسنا مسؤولين عن أي ضرر مباشر أو غير مباشر ناتج عن الاعتماد الكامل
            على أي مشاركة منشورة من المستخدمين.
          </p>

          <h2>8. التحديثات</h2>
          <p>
            قد يتم تعديل هذه الشروط مع نمو المشروع أو إضافة مزايا جديدة. الاستمرار في استخدام الموقع بعد
            التعديل يعني قبولك للصيغة الأحدث.
          </p>
        </div>
      </section>
    </div>
  )
}
