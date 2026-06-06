import { doc, getDoc, setDoc, collection, query, where, getDocs, limit as fLimit } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function createProfileIfNeeded(user: {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}) {
  const profileSnap = await getDoc(doc(db, "profiles", user.uid))
  if (!profileSnap.exists()) {
    const baseUsername = (user.displayName || user.email?.split("@")[0] || "user")
      .replace(/\s+/g, "_")
      .toLowerCase()
    let username = baseUsername

    const existing = await getDocs(
      query(collection(db, "profiles"), where("username", "==", username), fLimit(1)),
    )
    if (!existing.empty) {
      for (let i = 1; i < 100; i++) {
        const next = await getDocs(
          query(collection(db, "profiles"), where("username", "==", `${baseUsername}${i}`), fLimit(1)),
        )
        if (next.empty) { username = `${baseUsername}${i}`; break }
      }
    }

    await setDoc(doc(db, "profiles", user.uid), {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "مستخدم جديد",
      username,
      role: "user",
      avatarUrl: user.photoURL || "",
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
}
