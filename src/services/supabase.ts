/**
 * Backend boundary for a future Supabase/PostgreSQL connection.
 * Use only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the browser.
 * Never put a service-role key in the frontend.
 */
export function getPublicSupabaseConfig() {
  return {
    url: import.meta.env.VITE_SUPABASE_URL as string | undefined,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
  }
}

export function isBackendConfigured(): boolean {
  const { url, anonKey } = getPublicSupabaseConfig()
  return Boolean(url && anonKey)
}
