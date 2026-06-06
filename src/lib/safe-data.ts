import {
  collection,
  query as fq,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  type QueryConstraint,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export { doc, collection }

export async function safeGet<T>(
  collectionName: string,
  docId: string,
): Promise<T | null> {
  try {
    const snap = await getDoc(doc(db, collectionName, docId))
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() } as T
  } catch {
    return null
  }
}

export async function safeQuery<T>(
  collectionName: string,
  constraints: QueryConstraint[],
): Promise<T[]> {
  try {
    const q = fq(collection(db, collectionName), ...constraints)
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T)
  } catch {
    return []
  }
}

export async function safeCount(
  collectionName: string,
  constraints: QueryConstraint[],
): Promise<number> {
  try {
    const q = fq(collection(db, collectionName), ...constraints)
    const snap = await getDocs(q)
    return snap.size
  } catch {
    return 0
  }
}

export async function safeAdd(
  collectionName: string,
  data: Record<string, unknown>,
): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date().toISOString(),
    })
    return ref.id
  } catch {
    return null
  }
}

export async function safeUpdate(
  collectionName: string,
  docId: string,
  data: Record<string, unknown>,
): Promise<boolean> {
  try {
    await updateDoc(doc(db, collectionName, docId), {
      ...data,
      updatedAt: new Date().toISOString(),
    })
    return true
  } catch {
    return false
  }
}

export async function safeDelete(
  collectionName: string,
  docId: string,
): Promise<boolean> {
  try {
    await deleteDoc(doc(db, collectionName, docId))
    return true
  } catch {
    return false
  }
}

export async function safeSet(
  collectionName: string,
  docId: string,
  data: Record<string, unknown>,
): Promise<boolean> {
  try {
    await setDoc(doc(db, collectionName, docId), {
      ...data,
      createdAt: new Date().toISOString(),
    })
    return true
  } catch {
    return false
  }
}
