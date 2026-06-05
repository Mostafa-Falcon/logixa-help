"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { collection, getDocs, query, where, addDoc, deleteDoc, doc } from "firebase/firestore"
import { toast } from "sonner"

import { db, auth } from "@/lib/firebase"

interface VoteButtonsProps {
  targetType: "thread" | "reply"
  targetId: string
  votesCount: number
}

export function VoteButtons({ targetType, targetId, votesCount: initial }: VoteButtonsProps) {
  const [count, setCount] = useState(initial)
  const [userVote, setUserVote] = useState<number | null>(null)

  async function handleVote(value: number) {
    const user = auth.currentUser
    if (!user) { toast.error("يجب تسجيل الدخول للتصويت"); return }

    try {
      const existing = await getDocs(
        query(collection(db, "votes"), where("user_id", "==", user.uid), where("target_type", "==", targetType), where("target_id", "==", targetId)),
      )

      if (!existing.empty) {
        const vote = existing.docs[0]
        const voteData = vote.data() as { value: number }

        if (voteData.value === value) {
          await deleteDoc(doc(db, "votes", vote.id))
          setUserVote(null)
          setCount((c) => c - value)
          return
        }

        await deleteDoc(doc(db, "votes", vote.id))
        await addDoc(collection(db, "votes"), { user_id: user.uid, target_type: targetType, target_id: targetId, value, created_at: new Date().toISOString() })
        setUserVote(value)
        setCount((c) => c - voteData.value + value)
        return
      }

      await addDoc(collection(db, "votes"), { user_id: user.uid, target_type: targetType, target_id: targetId, value, created_at: new Date().toISOString() })
      setUserVote(value)
      setCount((c) => c + value)
    } catch {
      toast.error("حدث خطأ")
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button onClick={() => handleVote(1)} className={`p-1 rounded transition-colors ${userVote === 1 ? "text-green-400" : "text-text-dim hover:text-green-400"}`}>
        <ThumbsUp className="h-4 w-4" />
      </button>
      <span className="text-sm font-bold tabular-nums text-white">{count}</span>
      <button onClick={() => handleVote(-1)} className={`p-1 rounded transition-colors ${userVote === -1 ? "text-red-400" : "text-text-dim hover:text-red-400"}`}>
        <ThumbsDown className="h-4 w-4" />
      </button>
    </div>
  )
}
