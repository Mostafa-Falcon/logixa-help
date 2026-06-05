import { auth } from "@/lib/firebase"

export async function getCurrentUserWithProfile() {
  const user = auth.currentUser
  if (!user) return { user: null, profile: null }
  return { user: { id: user.uid, email: user.email }, profile: null }
}
