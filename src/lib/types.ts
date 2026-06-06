export interface Profile {
  id: string
  uid: string
  username: string
  displayName: string
  email: string
  avatarUrl: string
  bio: string
  website: string
  github: string
  twitter: string
  role: "user" | "moderator" | "admin" | "owner"
  reputation: number
  threadCount: number
  replyCount: number
  createdAt: string
}

export interface Category {
  id: string
  name: string
  description: string
  icon: string
  order: number
  threadCount: number
  createdAt: string
  /** المجال العام للقسم: تقني / تعليم / صحة / ترفيه / أعمال / الخ */
  field?: string
  /** لون مخصص للقسم */
  accentColor?: string
}

export interface Thread {
  id: string
  title: string
  slug: string
  content: string
  categoryId: string
  authorUid: string
  authorUsername: string
  score: number
  replyCount: number
  viewCount: number
  isPinned: boolean
  isLocked: boolean
  isBestAnswer: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
  lastActivityAt: string
  categoryName?: string
}

export interface Reply {
  id: string
  threadId: string
  parentReplyId: string | null
  content: string
  authorUid: string
  authorUsername: string
  score: number
  isBestAnswer: boolean
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  threadCount: number
}