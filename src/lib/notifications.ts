import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function createNotification(
  recipientUid: string,
  type: "reply" | "vote" | "best_answer" | "report_update" | "mod_action",
  title: string,
  body?: string,
  link?: string,
) {
  try {
    await addDoc(collection(db, "notifications"), {
      recipientUid,
      type,
      title,
      body: body || "",
      link: link || "",
      isRead: false,
      createdAt: new Date().toISOString(),
    })
  } catch {
    // silently fail
  }
}
