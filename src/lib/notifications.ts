import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function createNotification(
  userId: string,
  type: "reply" | "vote" | "best_answer" | "report_update" | "mod_action",
  title: string,
  body?: string,
  link?: string,
) {
  try {
    await addDoc(collection(db, "notifications"), {
      user_id: userId,
      type,
      title,
      body: body || "",
      link: link || "",
      is_read: false,
      created_at: new Date().toISOString(),
    })
  } catch {
    // silently fail
  }
}
