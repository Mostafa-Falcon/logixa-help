export interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url: string
  bio: string
  role: "member" | "trusted" | "moderator" | "admin"
  reputation: number
  threads_count: number
  replies_count: number
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  sort_order: number
  threads_count: number
  replies_count: number
  last_activity_at: string | null
}

export interface Thread {
  id: string
  category_id: string
  author_id: string
  title: string
  slug: string
  body: string
  is_pinned: boolean
  is_locked: boolean
  status: "published" | "pending" | "hidden"
  views: number
  replies_count: number
  votes_count: number
  best_answer_id: string | null
  created_at: string
  updated_at: string
  authorUsername?: string
  authorAvatarUrl?: string
  categoryName?: string
  categorySlug?: string
}

export interface Reply {
  id: string
  thread_id: string
  author_id: string
  body: string
  is_best_answer: boolean
  status: "visible" | "hidden"
  votes_count: number
  created_at: string
  updated_at: string
  authorUsername?: string
  authorAvatarUrl?: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  threads_count: number
}
