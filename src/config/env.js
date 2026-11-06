/**
 * Validasi environment variables saat aplikasi boot.
 * Menampilkan pesan jelas di layar jika belum dikonfigurasi.
 * Import ini di main.jsx SEBELUM App di-render.
 */
import { createClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()
const edgeCreate = (import.meta.env.VITE_SUPABASE_EDGE_CREATE ?? '').trim()
const edgeVerify = (import.meta.env.VITE_SUPABASE_EDGE_VERIFY ?? '').trim()

export const isConfigured = Boolean(url && anonKey)
export const edgeFunctions = {
  createDonation: edgeCreate || null,
  verifyDonation: edgeVerify || null,
}

export function buildClient() {
  if (!isConfigured) return null
  try {
    return createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
  } catch {
    return null
  }
}

export { url, anonKey }
