import { NextRequest, NextResponse } from "next/server"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  await updateDoc(doc(db, "reports", id), {
    ...body,
    reviewed_at: new Date().toISOString(),
  })

  return NextResponse.json({ success: true })
}
