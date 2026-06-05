type SupabaseQuery<T> = {
  then: (
    onfulfilled: (value: { data: T | null; error: unknown }) => unknown,
  ) => unknown
}

type SupabaseCount = {
  then: (
    onfulfilled: (value: { count: number | null; error: unknown }) => unknown,
  ) => unknown
}

type SupabaseRpc = {
  then: (
    onfulfilled: (value: { data: unknown; error: unknown }) => unknown,
  ) => unknown
}

export async function safeQuery<T>(
  promise: SupabaseQuery<T>,
  fallback: T,
): Promise<T> {
  try {
    const result = await (promise as unknown as Promise<{ data: T | null; error: unknown }>)
    if (result.error) return fallback
    return result.data ?? fallback
  } catch {
    return fallback
  }
}

export async function safeCount(
  promise: SupabaseCount,
): Promise<number> {
  try {
    const result = await (promise as unknown as Promise<{ count: number | null; error: unknown }>)
    if (result.error) return 0
    return result.count ?? 0
  } catch {
    return 0
  }
}

export async function safeSingle<T>(
  promise: SupabaseQuery<T>,
): Promise<T | null> {
  try {
    const result = await (promise as unknown as Promise<{ data: T | null; error: unknown }>)
    if (result.error) return null
    return result.data
  } catch {
    return null
  }
}

export async function safeRpc(
  promise: SupabaseRpc,
): Promise<void> {
  try {
    await (promise as unknown as Promise<unknown>)
  } catch {
    // silently fail
  }
}
