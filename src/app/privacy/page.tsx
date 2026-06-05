import type { Metadata } from 'next'
import Link from 'next/link'
import { HiChevronLeft, HiHome, HiShieldCheck } from 'react-icons/hi'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية',
}

export default function PrivacyPage() {
  return (
    <div className="content-wrap space-y-5">
      <div className="breadcrumb">
        <Link href="/" className="inline-flex items-center gap-1">
          <HiHome className="text-sm" />
          الرئيسية
        </Link>
        <HiChevronLeft className="text-xs" />
        <span>سياسة الخصوصية</span>
      </div>

      <section className="surface-card hero-panel px-5 py-6 md:px-7">
        <span className="eyebrow">الخصوصية والثقة</span>
        <div className="mt-4 flex items-start gap-4">
          <div className="node-icon">
            <HiShieldCheck />
          </div>
          <div>
            <h1 className="page-title text-3xl md:text-4xl">سياسة الخصوصية</h1>
            <p className="mt-3 max-w-3xl page-desc">
              هذه الصفحة تشرح كيف نتعامل مع بياناتك في Logixa Help، وما الذي نجمعه، ولماذا، وكيف نحافظ على
              تجربة محترمة وشفافة حتى مع التوسع والإعلانات لاحقًا.
            </p>
          </div>
        </div>
      </section>

      <section className="surface-card p-5 md:p-7">
        <div className="prose-content">
          <h2>1. ما الذي نجمعه؟</h2>
          <ul className="legal-list">
            <li>بيانات الحساب الأساسية مثل اسم المستخدم والبريد الإلكتروني.</li>
            <li>المحتوى الذي تنشره: أسئلة، إجابات، وتعليقات متعلقة باستخدامك للمنتدى.</li>
            <li>بيانات استخدام عامة مثل الصفحات التي تزورها ووقت الزيارة ونوع المتصفح.</li>
          </ul>

          <h2>2. لماذا نجمع هذه البيانات؟</h2>
          <ul className="legal-list">
            <li>لتشغيل الحسابات وربط المشاركات بأصحابها بشكل صحيح.</li>
            <li>لتحسين تجربة الاستخدام، سرعة التصفح، وترتيب المحتوى.</li>
            <li>لفهم الصفحات التي تفيد الزوار أكثر، وبالتالي تحسين المحتوى والهيكلة.</li>
            <li>لدعم أنظمة الإعلانات والتحليلات عندما يتم تفعيلها بطريقة متوافقة ومحترمة.</li>
          </ul>

          <h2>3. ملفات تعريف الارتباط</h2>
          <p>
            قد نستخدم cookies لحفظ الجلسة وتحسين تجربة الاستخدام. وقد تستخدم خدمات خارجية مثل أدوات
            التحليلات أو الإعلانات ملفات مشابهة عند تفعيلها داخل الموقع.
          </p>

          <h2>4. مشاركة البيانات</h2>
          <p>لا نبيع بياناتك. وقد تتم مشاركة بعض البيانات فقط في الحالات التالية:</p>
          <ul className="legal-list">
            <li>عند وجود التزام قانوني واضح.</li>
            <li>مع مزودي الخدمات الذين يساعدون في تشغيل المنصة تقنيًا.</li>
            <li>لحماية المنصة أو المستخدمين من إساءة الاستخدام أو السلوك الضار.</li>
          </ul>

          <h2>5. الأمان</h2>
          <p>
            نتخذ إجراءات أمنية معقولة لحماية البيانات، لكن لا يوجد نظام على الإنترنت يمكن اعتباره محصنًا
            بالكامل. لذلك نوصي دائمًا باستخدام كلمة سر قوية وعدم مشاركتها.
          </p>

          <h2>6. حقوقك</h2>
          <ul className="legal-list">
            <li>طلب الوصول إلى بياناتك الأساسية.</li>
            <li>طلب تصحيح البيانات غير الدقيقة.</li>
            <li>طلب حذف الحساب أو بعض البيانات عندما يكون ذلك ممكنًا تقنيًا وقانونيًا.</li>
          </ul>

          <h2>7. التعديلات</h2>
          <p>
            قد يتم تحديث هذه السياسة مع تطور المشروع أو إضافة خدمات جديدة. أي تعديل جوهري سيظهر هنا بشكل
            واضح.
          </p>
        </div>
      </section>
    </div>
  )
}
