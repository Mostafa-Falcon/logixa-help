import { createBrowserClient } from '@supabase/ssr'

function requireEnv(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }

  return value
}

const cookieOptions = {
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
}

let browserClient: ReturnType<typeof createBrowserClient> | undefined

export function createBrowserSupabaseClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
      requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
      {
      cookieOptions,
      },
    )
  }

  return browserClient
}
