import { initializeApp } from "firebase/app"
import { getAuth, signInAnonymously } from "firebase/auth"
import {
  getFirestore,
  doc,
  setDoc,
  writeBatch,
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
const auth = getAuth(app)
const db = getFirestore(app)

const categories = [
  { id: "web-dev", name: "تطوير الويب", description: "لغات البرمجة، إطارات العمل، مشاكل المواقع، HTML، CSS، JavaScript، React، Next.js", icon: "🌐", order: 1 },
  { id: "mobile-dev", name: "تطوير التطبيقات", description: "تطبيقات الموبايل، Flutter، React Native، Swift، Kotlin، مشاكل الأندرويد والآيفون", icon: "📱", order: 2 },
  { id: "backend", name: "الواجهة الخلفية", description: "السيرفرات، قواعد البيانات، الـ APIs، Node.js، Python، PHP، Laravel", icon: "⚙️", order: 3 },
  { id: "design", name: "التصميم", description: "تصميم واجهات المستخدم، UX، Figma، Photoshop، الألوان والمونتاج", icon: "🎨", order: 4 },
  { id: "windows", name: "ويندوز ومشاكله", description: "مشاكل ويندوز 10 و11، الإعدادات، التعريفات، أعطال النظام والتحديثات", icon: "🪟", order: 5 },
  { id: "devops", name: "السحابة والنشر", description: "Docker، CI/CD، السحابة، استضافة المواقع، VPS، domains", icon: "☁️", order: 6 },
  { id: "ai-ml", name: "الذكاء الاصطناعي", description: "تعلّم الآلة، ChatGPT، prompt engineering، أدوات الذكاء الاصطناعي", icon: "🤖", order: 7 },
  { id: "security", name: "الأمان والحماية", description: "الحماية من الاختراق، الخصوصية، التشفير، اختبار الاختراق الأخلاقي", icon: "🔒", order: 8 },
  { id: "networks", name: "الشبكات والإنترنت", description: "إعدادات الراوتر، مشاكل الإنترنت، الشبكات المحلية، الواي فاي", icon: "🌐", order: 9 },
  { id: "general", name: "نقاشات عامة", description: "أسئلة واستفسارات عامة، نقاشات مفتوحة، ومواضيع مش مرتبة", icon: "💬", order: 10 },
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
  { id: "thread-1", title: "ويندوز 11 بطيء بعد آخر تحديث؟ تعال نشوف الحل", content: "السلام عليكم، بعد آخر تحديث لويندوز 11 الكمبيوتر بقى بطيء جداً. جربت مسح الملفات المؤقتة وطفيت البرامج اللي على startup بس لسه المشكلة موجودة. حد عنده حل؟", slug: "windows-11-slow-after-update", categoryId: "windows", authorIndex: 2 },
  { id: "thread-2", title: "الواي فاي بيقطع كل شوية - إيه الحل؟", content: "عندي راوتر WE والواي فاي بيقطع كل 10 دقايق تقريباً. كلمت الدعم الفني قالولي مفيش مشكلة من عندهم. جربت أغير قناة الواي فاي ولسه المشكلة موجودة.", slug: "wifi-keeps-disconnecting", categoryId: "networks", authorIndex: 5 },
  { id: "thread-3", title: "أفضل طريقة لتعلم React في 2026؟", content: "أنا جديد في مجال الويب وعايز أبدأ أتعلم React. إيه أفضل المصادر والمسار اللي تمشوا عليه؟ وهل أبدأ بـ Next.js على طول ولا React العادية أولاً؟", slug: "react-learning-path-2026", categoryId: "web-dev", authorIndex: 2 },
  { id: "thread-4", title: "إزاي أحمي حسابي من الاختراق؟", content: "الناس بتقول إن فيه كتير بيحصلهم اختراق حسابات. إيه أهم حاجات أعملها عشان أحمي حسابي؟ غير إن الباسورد يكون قوي طبعاً. ولو حصل اختراق أعمل إيه؟", slug: "protect-account-hacking", categoryId: "security", authorIndex: 6 },
  { id: "thread-5", title: "إيه أفضل Framework للتطبيقات؟ Flutter ولا React Native؟", content: "عاوز أبدأ أتعلم تطوير تطبيقات موبايل. محتار بين Flutter و React Native. إيه اللي أفضل في 2026 من ناحية الشغل والطلب في السوق؟", slug: "flutter-vs-react-native-2026", categoryId: "mobile-dev", authorIndex: 4 },
  { id: "thread-6", title: "أفضل مواقع استضافة المواقع المصرية والعربية", content: "عايز أشتري استضافة لموقعي. فيه شركات كتير، محتار بين SiteGround و Hostinger والاستضافات المحلية. إيه التجارب والاقتراحات؟", slug: "best-web-hosting-arab", categoryId: "devops", authorIndex: 6 },
  { id: "thread-7", title: "ازاي أستخدم ChatGPT باحترافية في الشغل؟", content: "عندي شكلياً ChatGPT أداة مفيدة بس مش عاوز أستخدمه غلط ولا أتكل عليه. عايز أعرف إزاي أستفيد منه في الشكل اليومي من غير ما أضر نفسي.", slug: "use-chatgpt-professionally", categoryId: "ai-ml", authorIndex: 3 },
  { id: "thread-8", title: "الكمبيوتر بيعمل Restart لوحده - أسباب وحلول", content: "رابع مرة النهارده الكمبيوتر يعمل restart فجأة من غير أي رسالة خطأ. المشكلة بدأت من أسبوع. حد عنده فكرة إيه السبب؟", slug: "pc-random-restart-causes", categoryId: "windows", authorIndex: 1 },
  { id: "thread-9", title: "UI/UX: إزاي تصمم موقع يجذب الزوار ويخليهم يفضلوا؟", content: "عايز أعرف أساسيات تصميم واجهات المستخدم. إيه اللي يخلي الزائر يحس إن الموقع محترم ويثق فيه من أول نظرة؟ ألوان؟ خطوط؟ ترتيب؟", slug: "ui-ux-basics-arabic", categoryId: "design", authorIndex: 3 },
  { id: "thread-10", title: "إزاي أتعلم البرمجة من الصفر في 2026؟", content: "عندي 25 سنة وعايز أتعلم البرمجة/M عايز أبدأ. مش عارف إيه أفضل لغة أبدأ منها. ناس بتقول Python وناس بتقول JavaScript. عايز نصيحة عملية لمجال الشغل.", slug: "learn-programming-from-scratch", categoryId: "web-dev", authorIndex: 0 },
  { id: "thread-11", title: "مشكلة شاشة الموت الزرقاء في ويندوز 10 و 11", content: "بتظهرلي شاشة زرقاء (Blue Screen) كل فين وفين وبتقول VIDEO_TDR_FAILURE. جربت أحدث كارت الشاشة ولسه المشكلة موجودة. حد يعرف حل؟", slug: "blue-screen-error-fix", categoryId: "windows", authorIndex: 5 },
  { id: "thread-12", title: "إيه هو التعدين وأجهزة الكمبيوتر؟ وهل لسه مربح؟", content: "كتير بيسمع عن التعدين وقدرة أجهزة الكمبيوتر عليه. عايز أعرف بصراحة: التعدين لسه مربح في 2026 ولا خلاص؟ وإيه القطع المطلوبة لو عاوز أبدأ؟", slug: "crypto-mining-2026", categoryId: "general", authorIndex: 4 },
]

const replies = [
  { threadId: "thread-1", content: "جرب تدخل على Device Manager وتشوف قسم System Devices، دور على أي حاجة عليها علامة صفراء. كمان جرب تشوف درجة حرارة المعالج يمكن سخونية.", authorIndex: 1 },
  { threadId: "thread-1", content: "أكتر حاجة بتسبب البطء بعد التحديثات هي الـ background apps. اكتب msconfig و shut down كل حاجة مش ضرورية.", authorIndex: 6 },
  { threadId: "thread-2", content: "جرب تغير DNS بتاعك لـ Google DNS: 8.8.8.8 و 8.8.4.4. كتير من مشاكل التقطيع بتنحل كده.", authorIndex: 0 },
  { threadId: "thread-2", content: "كمان لو راوتر قديم، ممكن يكون هو المشكلة. جرب تعمل تحديث للـ firmware بتاع الراوتر.", authorIndex: 4 },
  { threadId: "thread-3", content: "ابدأ بـ JavaScript كويس الأول. خد شهرين تلاتة في الأساسيات، وبعدين React. متستعجلش.", authorIndex: 0 },
  { threadId: "thread-3", content: "أنا شايف تبدأ بـ Next.js على طول عشان في 2026 أغلب الشغل طالب Next.js.", authorIndex: 6 },
  { threadId: "thread-4", content: "أهم حاجة: فعّل الـ two-factor authentication على كل حساباتك. Google Authenticator أو SMS.", authorIndex: 1 },
  { threadId: "thread-4", content: "كمان بلاش تستخدم نفس الباسورد في أكتر من موقع. استخدم Bitwarden أو أي password manager.", authorIndex: 5 },
  { threadId: "thread-5", content: "جربت الاتنين. Flutter أسرع وأداء أحسن خصوصاً لو عايز تطبيق معقد.", authorIndex: 4 },
  { threadId: "thread-5", content: "React Native مع Expo دلوقتي بقى سهل جداً. ولو عايز تشتغل بسرعة، أنصحك بـ RN.", authorIndex: 6 },
  { threadId: "thread-6", content: "لو عايز استضافة محترمة وبأسعار كويسة، Hostinger كويسة جداً. وكمان فيه استضافات مصرية محترمة زي CityCloud.", authorIndex: 1 },
  { threadId: "thread-6", content: "شوف VPS من DigitalOcean أو Hetzner لو عندك خبرة. هتدفع أقل وتحكم أكتر.", authorIndex: 0 },
  { threadId: "thread-7", content: "استخدم ChatGPT كمساعد مش كبديل. خليه يصححلك الكود ويقترح حلول، بس متنساش تفهم الحل قبل ما تستخدمه.", authorIndex: 2 },
  { threadId: "thread-7", content: "أحسن استخدام: خليه يشرحلك حاجة معقدة بطريقة بسيطة. كأنه مدرس خصوصي.", authorIndex: 5 },
  { threadId: "thread-8", content: "جرب تشوف حرارة المعالج والكرت. نزل برنامج HWMonitor وراقب درجات الحرارة.", authorIndex: 0 },
  { threadId: "thread-8", content: "يمكن مشكلة في مصدر الطاقة (Power Supply). لو الباور سبلاي ضعيف أو قديم، ده سبب شائع للـ restart.", authorIndex: 6 },
  { threadId: "thread-9", content: "أهم حاجة: اعرف مين المستخدم بتاعك. صمم للزائر مش لنفسك. والتبسيط هو سر الجمال.", authorIndex: 2 },
  { threadId: "thread-9", content: "الألوان: متستخدمش أكتر من 3 ألوان أساسية. والمسافات البيضاء صديقتك.", authorIndex: 5 },
  { threadId: "thread-10", content: "ابدأ بـ Python لو عايز تدخل في الذكاء الاصطناعي وعلوم البيانات. وابدأ بـ JavaScript لو عايز تطوير مواقع.", authorIndex: 1 },
  { threadId: "thread-10", content: "أنصحك بـ JavaScript لأنها لغة واحدة تكفي للواجهة والخلفية. وشغلها كتير.", authorIndex: 6 },
  { threadId: "thread-11", content: "VIDEO_TDR_FAILURE غالباً مشكلة في كارت الشاشة. جرب تعمل DDU وتنظف التعريفات وتنصبها من جديد.", authorIndex: 0 },
  { threadId: "thread-11", content: "كمان جرب تقلل سرعة كارت الشاشة شوية عن طريق MSI Afterburner.", authorIndex: 5 },
  { threadId: "thread-12", content: "بصراحة التعدين على أجهزة الكمبيوتر الشخصية مش مربح دلوقتي زي الأول. الطاقة والتبريد بيكلفوا كتير.", authorIndex: 2 },
  { threadId: "thread-3", content: "أنصحك تشوف The Odin Project. مجاني ومنظم، وبياخدك من الصفر للاحتراف.", authorIndex: 3 },
  { threadId: "thread-10", content: "أهم حاجة: متضيعش وقت كتير في اختيار لغة. اختار واحدة والزمها. المهم الـ logic مش اللغة.", authorIndex: 4 },
]

async function seed() {
  console.log("🚀 Seeding started...\n")

  console.log("🔑 Signing in anonymously...")
  await signInAnonymously(auth)
  console.log("   ✅ Authenticated\n")

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
      createdAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
    })
  }
  await categoryBatch.commit()
  console.log(`   ✅ ${categories.length} categories added`)

  // 3. Seed threads
  console.log("\n💬 Seeding threads...")
  const now = new Date().toISOString()
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
    const replyId = `reply-${Math.random().toString(36).slice(2, 10)}`
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
