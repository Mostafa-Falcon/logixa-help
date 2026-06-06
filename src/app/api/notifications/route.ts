import { NextRequest, NextResponse } from "next/server"
import { collection, getDocs, query, where, orderBy, limit, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid")
  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 })

  const snap = await getDocs(
    query(collection(db, "notifications"), where("recipientUid", "==", uid), orderBy("createdAt", "desc"), limit(50)),
  )
  const notifications = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  const unread = notifications.filter((n: any) => !n.isRead).length

  return NextResponse.json({ notifications, unread })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { notification_id } = body

  if (notification_id) {
    await updateDoc(doc(db, "notifications", notification_id), { isRead: true })
  }

  return NextResponse.json({ success: true })
}
