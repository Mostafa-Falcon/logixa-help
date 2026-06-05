import { NextRequest, NextResponse } from "next/server"
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { user_id, target_type, target_id, value } = body

  if (!user_id || !target_type || !target_id || !value) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 })
  }

  const existing = await getDocs(
    query(
      collection(db, "votes"),
      where("user_id", "==", user_id),
      where("target_type", "==", target_type),
      where("target_id", "==", target_id),
    ),
  )

  if (!existing.empty) {
    const voteDoc = existing.docs[0]
    const voteData = voteDoc.data()

    if (voteData.value === value) {
      await deleteDoc(doc(db, "votes", voteDoc.id))
      return NextResponse.json({ action: "removed" })
    }

    await updateDoc(doc(db, "votes", voteDoc.id), { value, updated_at: new Date().toISOString() })
    return NextResponse.json({ action: "changed" })
  }

  await addDoc(collection(db, "votes"), {
    user_id,
    target_type,
    target_id,
    value,
    created_at: new Date().toISOString(),
  })

  return NextResponse.json({ action: "added" })
}
