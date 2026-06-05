'use client'

import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type VoteTargetType = 'thread' | 'reply'

interface VoteButtonsProps {
  targetType: VoteTargetType
  targetId: number
  initialVotes: number
  initialUserVote: number | null
}

function normalizeVote(vote: number | null | undefined): number | null {
  if (vote === 1 || vote === -1) return vote
  return null
}

export default function VoteButtons({
  targetType,
  targetId,
  initialVotes,
  initialUserVote,
}: VoteButtonsProps) {
  const [votes, setVotes] = useState(initialVotes)
  const [userVote, setUserVote] = useState<number | null>(normalizeVote(initialUserVote))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchVote() {
      try {
        const res = await fetch(`/api/vote?type=${targetType}&ids=${targetId}`)
        if (!res.ok) return
        const data = await res.json()
        const vote = data.votes?.[0]
        setUserVote(normalizeVote(vote?.value))
      } catch {
        // silently fail
      }
    }

    fetchVote()
  }, [targetType, targetId])

  const handleVote = useCallback(
    async (value: number) => {
      if (loading) return
      setLoading(true)

      const prevUserVote = userVote
      const prevVotes = votes

      let nextUserVote: number | null
      let nextVotes: number

      if (userVote === value) {
        nextUserVote = null
        nextVotes = votes - value
      } else if (userVote === null) {
        nextUserVote = value
        nextVotes = votes + value
      } else {
        nextUserVote = value
        nextVotes = votes - userVote + value
      }

      setUserVote(nextUserVote)
      setVotes(nextVotes)

      try {
        const res = await fetch('/api/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetType, targetId, value }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'فشل التصويت')
        }
      } catch (err) {
        setUserVote(prevUserVote)
        setVotes(prevVotes)
        toast.error(err instanceof Error ? err.message : 'حدث خطأ أثناء التصويت')
      } finally {
        setLoading(false)
      }
    },
    [loading, userVote, votes, targetType, targetId],
  )

  return (
    <div className="inline-flex items-center gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={loading}
        onClick={() => handleVote(1)}
        className={cn(
          'h-7 w-7 rounded-full p-0 transition-colors',
          userVote === 1
            ? 'text-[var(--color-accent)]'
            : 'text-[var(--color-text-dim)] hover:text-[var(--color-accent)]',
        )}
        aria-label="تصويت إيجابي"
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </Button>

      <span
        className={cn(
          'min-w-[1.8rem] text-center text-xs font-bold tabular-nums leading-none',
          votes > 0
            ? 'text-[var(--color-accent)]'
            : votes < 0
              ? 'text-[var(--color-danger)]'
              : 'text-[var(--color-text-dim)]',
        )}
      >
        {votes}
      </span>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={loading}
        onClick={() => handleVote(-1)}
        className={cn(
          'h-7 w-7 rounded-full p-0 transition-colors',
          userVote === -1
            ? 'text-[var(--color-danger)]'
            : 'text-[var(--color-text-dim)] hover:text-[var(--color-danger)]',
        )}
        aria-label="تصويت سلبي"
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
