"use client"

import { Suspense, useEffect, useState } from "react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"

import { db } from "@/lib/firebase"
import NewThreadComposer from "./NewThreadComposer"

function NewThreadPageInner() {
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    getDocs(query(collection(db, "categories"), orderBy("order")))
      .then((snap) => setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
  }, [])

  return <NewThreadComposer categories={categories} />
}

export default function NewThreadPage() {
  return (
    <Suspense fallback={<div className="content-wrap"><div className="surface-card p-8 text-sm muted">جارٍ التحميل...</div></div>}>
      <NewThreadPageInner />
    </Suspense>
  )
}
