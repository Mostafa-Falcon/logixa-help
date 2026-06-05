export interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url: string
  bio: string
  role: 'member' | 'trusted' | 'moderator' | 'admin'
  reputation: number
  threads_count: number
  replies_count: number
  created_at: string
}

export interface Category {
  id: number
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
  id: number
  category_id: number
  author_id: string
  title: string
  slug: string
  body: string
  is_pinned: boolean
  is_locked: boolean
  views: number
  replies_count: number
  votes_count: number
  best_answer_id: number | null
  created_at: string
  updated_at: string
  author?: Pick<Profile, 'username' | 'avatar_url'>
  category?: Pick<Category, 'name' | 'slug'>
  tags?: string[]
}

export interface Reply {
  id: number
  thread_id: number
  author_id: string
  body: string
  is_best_answer: boolean
  votes_count: number
  created_at: string
  updated_at: string
  author?: Pick<Profile, 'username' | 'avatar_url'>
}

export interface Tag {
  id: number
  name: string
  slug: string
  threads_count: number
}
