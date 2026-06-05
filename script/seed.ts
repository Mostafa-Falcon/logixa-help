import { initializeApp } from "firebase/app"
import {
  getFirestore,
  doc,
  setDoc,
  writeBatch,
  Timestamp,
} from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDrcFJJG6jfDJTuMqJaM6UlgtZsIbbK1UM",
  authDomain: "logixa-help.firebaseapp.com",
  projectId: "logixa-help",
  storageBucket: "logixa-help.firebasestorage.app",
  messagingSenderId: "56555986008",
  appId: "1:56555986008:web:ce122cb0a75007497cfe2d",
  measurementId: "G-9QC9TQRLTW",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const categories = [
  { id: "web-dev", name: "تطوير الويب", description: "HTML, CSS, JavaScript, React, Next.js", icon: "🌐", order: 1 },
  { id: "mobile-dev", name: "تطوير التطبيقات", description: "Flutter, React Native, Swift, Kotlin", icon: "📱", order: 2 },
  { id: "backend", name: "الواجهة الخلفية", description: "Node.js, Python, PHP, databases, APIs", icon: "⚙️", order: 3 },
  { id: "design", name: "التصميم", description: "UI/UX, Figma, Photoshop, CSS animations", icon: "🎨", order: 4 },
  { id: "devops", name: " DevOps", description: "Docker, CI/CD, cloud, deployment", icon: "🚀", order: 5 },
  { id: "ai-ml", name: "الذكاء الاصطناعي", description: "Machine learning, LLMs, prompt engineering", icon: "🤖", order: 6 },
  { id: "security", name: "الأمان", description: "Cybersecurity, ethical hacking, best practices", icon: "🔒", order: 7 },
  { id: "general", name: "مواضيع عامة", description: "استفسارات عامة, نقاشات, أسئلة", icon: "💬", order: 8 },
]

const seedUsers = [
  { uid: "admin-1", username: "mostafa", displayName: "Mostafa", role: "owner", photoURL: "" },
  { uid: "mod-1", username: "techmod", displayName: "Tech Mod", role: "moderator", photoURL: "" },
  { uid: "user-1", username: "ahmed_dev", displayName: "Ahmed", role: "user", photoURL: "" },
  { uid: "user-2", username: "sara_design", displayName: "Sara", role: "user", photoURL: "" },
  { uid: "user-3", username: "mohamed_py", displayName: "Mohamed", role: "user", photoURL: "" },
  { uid: "user-4", username: "nadia_js", displayName: "Nadia", role: "user", photoURL: "" },
  { uid: "user-5", username: "khaled_full", displayName: "Khaled", role: "user", photoURL: "" },
]

const threads = [
  { id: "thread-1", title: "أفضل طريقة لتعلم React في 2026؟", content: "السلام عليكم، أنا جديد في مجال الويب وعايز أبدأ أتعلم React. إيه أفضل المصادر والمسار اللي تمشوا عليه؟", slug: "react-learning-path-2026", categoryId: "web-dev", authorIndex: 2 },
  { id: "thread-2", title: "مشكلة في flexbox - العناصر مش بتترتب صح", content: "عندي container فيه 3 عناصر، عايزهم يتقسموا بالتساوي.\n\nجربت flex:1 بس مش شغالة صح. حد عنده حل؟", slug: "flexbox-issue", categoryId: "web-dev", authorIndex: 5 },
  { id: "thread-3", title: "Next.js ولا React العادية في 2026؟", content: "عايز أبدأ مشروع جديد، هل أستخدم Next.js على طول ولا React عادية؟ المشروع عبارة عن منتدى تقني.", slug: "nextjs-vs-react-2026", categoryId: "web-dev", authorIndex: 6 },
  { id: "thread-4", title: "إيه أفضل framework للتطبيقات المحمولة؟", content: "Flutter vs React Native 2026. عايز رأيكم وتجاربكم في الاتنين.", slug: "best-mobile-framework-2026", categoryId: "mobile-dev", authorIndex: 4 },
  { id: "thread-5", title: "إزاي أحمي API بتاعي من الاستخدام المسيء؟", content: "عندي API عام، وعايز أحميه من الاستخدام المسيء. جربت rate limiting بس مش كافي. إيه أفضل الممارسات في 2026؟", slug: "secure-api-best-practices", categoryId: "security", authorIndex: 6 },
  { id: "thread-6", title: "فكرة مشروع تخرج - منصة تعليمية بالذكاء الاصطناعي", content: "عايز رأيكم في فكرة مشروع تخرج: منصة تعليمية بتستخدم AI لتوليد تمارين مخصصة لكل طالب حسب مستواه.", slug: "ai-education-platform-idea", categoryId: "ai-ml", authorIndex: 4 },
  { id: "thread-7", title: "دليل المبتدئين لـ Docker", content: "دليلك الشامل لتعلم Docker من الصفر - الحاويات, الصور, docker-compose, والنشر على السحابة.", slug: "docker-beginners-guide", categoryId: "devops", authorIndex: 1 },
  { id: "thread-8", title: "UI/UX: إزاي تصمم واجهة مستخدم تجذب الزوار؟", content: "نقاش عن أساسيات تصميم UI/UX: الألوان, التباين, المسافات, سرعة التحميل وتأثيرها على تجربة المستخدم.", slug: "ui-ux-design-tips", categoryId: "design", authorIndex: 3 },
  { id: "thread-9", title: "TypeScript strict mode - نعم ولا؟", content: "أنا متعود على JavaScript وعايز أنتقل لـ TypeScript. Strict mode متعب ولا يستاهل التعب؟ شاركونا تجاربكم.", slug: "typescript-strict-mode", categoryId: "web-dev", authorIndex: 2 },
  { id: "thread-10", title: "شرح الـ closure في JavaScript", content: "إيه هو الـ closure بالظبط؟ ليه بنستخدمه؟ عايز شرح مبسط بالأمثلة.", slug: "javascript-closure-explained", categoryId: "web-dev", authorIndex: 0 },
]

const replies = [
  { threadId: "thread-1", content: "عليكم السلام، أنصحك تبدأ بـ JavaScript كويس الأول، وبعدين تتعلم React من документаيته الرسمية.", authorIndex: 0 },
  { threadId: "thread-1", content: "أنا شايف تبدأ بـ Next.js من الأول، لأنه معمول على React. وفي 2026 أغلب الشغل بيطلب Next.js.", authorIndex: 6 },
  { threadId: "thread-2", content: "جرب تحط `gap: 1rem` عشان المسافات. ومتنساش `flex-wrap` لو المحتوى هيزيد.", authorIndex: 3 },
  { threadId: "thread-2", content: "كمان ممكن تستخدم `grid` بدل flexbox: `grid-template-columns: repeat(3, 1fr)`", authorIndex: 1 },
  { threadId: "thread-3", content: "Next.js طبعاً! خصوصاً مع App Router بقى سريع جداً.", authorIndex: 0 },
  { threadId: "thread-3", content: "أنا فضلت React العادية لأن مشروعي صغير ومش محتاج SSR. depends على احتياجك.", authorIndex: 2 },
  { threadId: "thread-4", content: "جربت الاتنين. Flutter أسرع وأداء أحسن، لكن React Native community أكبر.", authorIndex: 4 },
  { threadId: "thread-4", content: "React Native مع Expo بقى سهل جداً. ولو عايز cross-platform سريع، RN كويسة.", authorIndex: 6 },
  { threadId: "thread-5", content: "استخدم JWT مع refresh tokens, rate limiting لكل endpoint, وAPI keys للـ third-party clients.", authorIndex: 1 },
  { threadId: "thread-5", content: "كمان حط WAF قدام API (Cloudflare), وvalidate كل الـ input.", authorIndex: 0 },
  { threadId: "thread-6", content: "فكرة جميلة! ممكن تضيف recommendation system عشان تقترح تمارين حسب مستوى كل طالب.", authorIndex: 5 },
  { threadId: "thread-6", content: "شوف مكتبة LangChain لتوليد المحتوى بالذكاء الاصطناعي.", authorIndex: 0 },
  { threadId: "thread-7", content: "شرح جميل! أنصح تضيف موضوع عن multi-stage builds عشان تقليل حجم الصور.", authorIndex: 6 },
  { threadId: "thread-8", content: "أهم حاجة: اعرف مين المستخدم بتاعك. اعمل user persona الأول وبعدين صمم له.", authorIndex: 2 },
  { threadId: "thread-8", content: "نصيحة: استخدم `clamp()` في CSS عشان الـ typography تكون responsive.", authorIndex: 5 },
  { threadId: "thread-9", content: "strict mode يستاهل 100%، هتتعب أول أسبوع بس بعد كده هتدعيلي. الـ bugs بتقل بشكل كبير.", authorIndex: 0 },
  { threadId: "thread-9", content: "اتفق. الأخطاء اللي TypeScript بيمنعها كانت بتاخد مني ساعات في الـ debugging.", authorIndex: 6 },
  { threadId: "thread-10", content: "الـ closure هو function بتتذكر الـ variables من scope اللي اتعملت فيه، حتى بعد ما الـ scope ده يخلص.", authorIndex: 1 },
  { threadId: "thread-10", content: "أحسن مثال: `function makeCounter() { let count = 0; return () => ++count; }`", authorIndex: 5 },
  { threadId: "thread-1", content: "نصيحة: اشتغل على مشروع جنب التعلم. النظري من غير تطبيق مش هيفيد.", authorIndex: 3 },
]

async function seed() {
  console.log("🚀 Seeding started...\n")

  // 1. Seed profiles
  console.log("👤 Seeding profiles...")
  const profileBatch = writeBatch(db)
  for (const u of seedUsers) {
    const ref = doc(db, "profiles", u.uid)
    profileBatch.set(ref, {
      uid: u.uid,
      username: u.username,
      displayName: u.displayName,
      role: u.role,
      email: `${u.username}@logixa-seed.com`,
      avatarUrl: u.photoURL,
      bio: "",
      website: "",
      github: "",
      twitter: "",
      reputation: 0,
      threadCount: 0,
      replyCount: 0,
      createdAt: Timestamp.now(),
    })
  }
  await profileBatch.commit()
  console.log(`   ✅ ${seedUsers.length} profiles created`)

  // 2. Seed categories
  console.log("\n📁 Seeding categories...")
  const categoryBatch = writeBatch(db)
  for (const cat of categories) {
    const ref = doc(db, "categories", cat.id)
    categoryBatch.set(ref, {
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      order: cat.order,
      threadCount: 0,
      createdAt: Timestamp.now(),
    })
  }
  await categoryBatch.commit()
  console.log(`   ✅ ${categories.length} categories added`)

  // 3. Seed threads
  console.log("\n💬 Seeding threads...")
  const now = Timestamp.now()
  for (const t of threads) {
    const author = seedUsers[t.authorIndex]
    const ref = doc(db, "threads", t.id)
    await setDoc(ref, {
      title: t.title,
      slug: t.slug,
      content: t.content,
      categoryId: t.categoryId,
      authorUsername: author.username,
      authorUid: author.uid,
      score: Math.floor(Math.random() * 20) + 1,
      replyCount: 0,
      viewCount: Math.floor(Math.random() * 200) + 10,
      isPinned: false,
      isLocked: false,
      tags: [],
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
    })
    console.log(`   ✅ ${t.title}`)
  }

  // 4. Seed replies
  console.log("\n📝 Seeding replies...")
  for (const r of replies) {
    const author = seedUsers[r.authorIndex]
    const replyId = `reply-${crypto.randomUUID().slice(0, 8)}`
    const ref = doc(db, "replies", replyId)
    await setDoc(ref, {
      threadId: r.threadId,
      content: r.content,
      authorUsername: author.username,
      authorUid: author.uid,
      parentReplyId: null,
      score: Math.floor(Math.random() * 10) + 1,
      createdAt: now,
      updatedAt: now,
    })
  }
  console.log(`   ✅ ${replies.length} replies added`)

  // 5. Update counts
  console.log("\n📊 Updating counts...")
  for (const cat of categories) {
    const count = threads.filter(t => t.categoryId === cat.id).length
    const catRef = doc(db, "categories", cat.id)
    await setDoc(catRef, { threadCount: count }, { merge: true })
  }
  for (const u of seedUsers) {
    const threadCount = threads.filter(t => t.authorIndex === seedUsers.indexOf(u)).length
    const replyCount = replies.filter(r => r.authorIndex === seedUsers.indexOf(u)).length
    const profileRef = doc(db, "profiles", u.uid)
    await setDoc(profileRef, { threadCount, replyCount }, { merge: true })
  }
  console.log("   ✅ Counts updated")

  console.log("\n🎉 Seeding complete!")
}

seed().catch(console.error)
