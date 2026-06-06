<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# مشروع المنتدى (Logixa Help)

منتدى عربي تقني مبني بـ Next.js 16 + Firebase (Auth + Firestore) + TailwindCSS v4.
كل الصفحات Client Components. Google sign-in بس (مفيش Email/Password).

## Firestore Conventions
- **كل الحقول camelCase** (ممنوع snake_case): `categoryId`, `authorUid`, `replyCount`, `viewCount`, `isPinned`, `isRead`, `createdAt`, `updatedAt`, `displayName`, `avatarUrl`, `threadCount`, `replyCount`, `recipientUid`, `targetType`, `targetId`, `reviewedAt`, `lastSeenAt` إلخ
- **Category doc ID = slug** — `setDoc(doc(db, "categories", slug), {...})` مش `addDoc`
- **Threads/Replies**: `addDoc` عادي (مع `slug` كحقل للعناوين)
- **Profile doc ID = Firebase Auth UID** — `setDoc(doc(db, "profiles", user.uid), {...})`
- **Datestamps**: `new Date().toISOString()` (strings, مش serverTimestamp)
- **Security Rules**: `allow read: if true; allow write: if request.auth != null`

## ملفات تم إصلاحها من snake_case → camelCase
- 11 API route files (`categories`, `threads`, `replies`, `vote`, `reports`, `reports/[id]`, `notifications`, `profile`, `session`, `users`, `users/[username]`)
- UI pages: `admin`, `notifications`, `settings/SettingsForm`, `moderate`, `search`, `u/[username]`, `components/Sidebar`, `components/ReportButton`
- `lib/safe-data.ts`, `lib/notifications.ts`

## Type Fixes
- `Profile.role`: `"user" | "moderator" | "admin" | "owner"` (الـ seed بيستخدم `"admin"`)
- `Badge` component: variants `"brand" | "accent" | "success"` بس (مفيش `"outline"`)
- كل صفحة بتستخدم `any` type للـ Firestore docs (جوا useEffect)

## Admin Page
- بيستخدم `orderBy("order")` بدل `orderBy("sort_order")`
- بيعمل category بـ `setDoc(doc(db, "categories", slug), {...})` — يعني doc ID = slug
- الحقول: `order`, `threadCount`, `createdAt`

## Build
- `npx tsc --noEmit`: 0 errors
- `npx next build`: 25 pages, 0 errors, ~64s compile
- Deployed on Vercel: `https://logixa-help.vercel.app`
