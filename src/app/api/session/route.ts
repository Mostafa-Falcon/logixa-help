import { NextRequest, NextResponse } from "next/server"
import { collection, addDoc, getDocs, query, where, orderBy, limit, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { user_id, ip_address, user_agent } = body

  if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 })

  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()

  const oldSessions = await getDocs(
    query(collection(db, "user_sessions"), where("user_id", "==", user_id)),
  )
  for (const s of oldSessions.docs) {
    await deleteDoc(doc(db, "user_sessions", s.id))
  }

  await addDoc(collection(db, "user_sessions"), {
    user_id,
    last_seen_at: new Date().toISOString(),
    ip_address: ip_address || "",
    user_agent: user_agent || "",
  })

  const onlineSnap = await getDocs(
    query(collection(db, "user_sessions"), where("last_seen_at", ">=", fifteenMinAgo)),
  )

  return NextResponse.json({ online_count: onlineSnap.size })
}
