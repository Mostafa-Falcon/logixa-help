import { NextRequest, NextResponse } from "next/server"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid")
  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 })

  const snap = await getDoc(doc(db, "profiles", uid))
  if (!snap.exists()) return NextResponse.json({ error: "not found" }, { status: 404 })

  return NextResponse.json({ profile: { id: snap.id, ...snap.data() } })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { uid, display_name, bio } = body

  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 })

  await updateDoc(doc(db, "profiles", uid), {
    ...(display_name !== undefined && { display_name }),
    ...(bio !== undefined && { bio }),
    updated_at: new Date().toISOString(),
  })

  return NextResponse.json({ success: true })
}
