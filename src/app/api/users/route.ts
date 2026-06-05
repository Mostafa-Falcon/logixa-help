import { NextResponse } from "next/server"
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET() {
  const snap = await getDocs(query(collection(db, "profiles"), orderBy("created_at", "desc"), limit(50)))
  const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return NextResponse.json({ users })
}
