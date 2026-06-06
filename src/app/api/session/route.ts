import { NextRequest, NextResponse } from "next/server"
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, ipAddress, userAgent } = body

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()

  const oldSessions = await getDocs(
    query(collection(db, "user_sessions"), where("userId", "==", userId)),
  )
  for (const s of oldSessions.docs) {
    await deleteDoc(doc(db, "user_sessions", s.id))
  }

  await addDoc(collection(db, "user_sessions"), {
    userId,
    lastSeenAt: new Date().toISOString(),
    ipAddress: ipAddress || "",
    userAgent: userAgent || "",
  })

  const onlineSnap = await getDocs(
    query(collection(db, "user_sessions"), where("lastSeenAt", ">=", fifteenMinAgo)),
  )

  return NextResponse.json({ online_count: onlineSnap.size })
}
