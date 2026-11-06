import { createClient } from '@supabase/supabase-js'

// Hanya anon (public) key yang boleh dipakai di frontend. JANGAN PERNAH memakai
// service_role key di sini: semua yang ada di folder src ikut terkirim ke browser.
const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

function buildClient() {
  // Belum dikonfigurasi: aplikasi tetap jalan (mode demo lokal), tidak crash.
  if (!url || !anonKey) return null
  try {
    return createClient(url, anonKey, {
      // Tidak ada login pengguna, jadi sesi tidak perlu disimpan di browser.
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
  } catch {
    // URL tidak valid (mis. salah salin). Perlakukan sebagai belum dikonfigurasi.
    return null
  }
}

export const supabase = buildClient()
export const isSupabaseConfigured = supabase !== null

// URL Edge Function (service_role, dipakai untuk insert donasi & verifikasi admin)
const projectRef = url.startsWith('https://') ? url.split('https://')[1]?.split('.')[0] : null
const functionsBase = projectRef ? `https://${projectRef}.supabase.co/functions/v1` : null
export const EDGE_CREATE_DONATION = functionsBase ? `${functionsBase}/create-donation` : null
export const EDGE_SUBMIT_PROOF = functionsBase ? `${functionsBase}/submit-donation` : null
export const EDGE_VERIFY_DONATION = functionsBase ? `${functionsBase}/verify-donation` : null
export const EDGE_LIST_DONATIONS = functionsBase ? `${functionsBase}/list-donations` : null
