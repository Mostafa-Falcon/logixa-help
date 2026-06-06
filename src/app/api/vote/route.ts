import { NextRequest, NextResponse } from "next/server"
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, targetType, targetId, value } = body

  if (!userId || !targetType || !targetId || !value) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 })
  }

  const existing = await getDocs(
    query(
      collection(db, "votes"),
      where("userId", "==", userId),
      where("targetType", "==", targetType),
      where("targetId", "==", targetId),
    ),
  )

  if (!existing.empty) {
    const voteDoc = existing.docs[0]
    const voteData = voteDoc.data()

    if (voteData.value === value) {
      await deleteDoc(doc(db, "votes", voteDoc.id))
      return NextResponse.json({ action: "removed" })
    }

    await updateDoc(doc(db, "votes", voteDoc.id), { value, updatedAt: new Date().toISOString() })
    return NextResponse.json({ action: "changed" })
  }

  await addDoc(collection(db, "votes"), {
    userId,
    targetType,
    targetId,
    value,
    createdAt: new Date().toISOString(),
  })

  return NextResponse.json({ action: "added" })
}
