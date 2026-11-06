// Edge Function: list-donations
// Mengembalikan daftar donasi untuk dashboard admin (termasuk yang pending).
// Dilindungi kredensial admin (header x-admin-auth, sama dengan verify-donation).
// Juga bisa mengembalikan signed URL bukti transfer (bucket privat) untuk
// pratinjau gambar di dashboard.
//
// Deploy: supabase functions deploy list-donations --no-verify-jwt
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-auth',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

function fail(status, code, message) {
  return json(status, { error: { code, message } })
}

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function isAdmin(req) {
  const expectedEmail = Deno.env.get('ADMIN_EMAIL')
  const expectedHash = Deno.env.get('ADMIN_PASSWORD_HASH') // sha256(password)
  const header = req.headers.get('x-admin-auth')
  if (!expectedEmail || !expectedHash || !header) return false
  try {
    const decoded = atob(header)
    const [email, ...rest] = decoded.split(':')
    if (email !== expectedEmail) return false
    const hash = await sha256Hex(rest.join(':'))
    return hash === expectedHash.toLowerCase()
  } catch {
    return false
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return fail(405, 'METHOD_NOT_ALLOWED', 'Gunakan POST.')

  if (!(await isAdmin(req))) {
    return fail(401, 'UNAUTHORIZED', 'Kredensial admin tidak valid.')
  }

  const url = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !serviceKey) return fail(500, 'NOT_CONFIGURED', 'Edge Function belum dikonfigurasi.')

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
  const { data, error } = await admin
    .from('donations')
    .select('id, transaction_no, campaign_slug, donor_name, hide_name, amount, unique_code, method, message, proof_path, status, rejection_reason, verified_at, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return fail(500, 'READ_FAILED', 'Data donasi gagal dimuat.')

  // Signed URL (1 jam) untuk tiap bukti transfer yang ada
  const withUrls = await Promise.all(
    (data ?? []).map(async (row) => {
      if (!row.proof_path) return { ...row, proof_url: null }
      const { data: signed } = await admin.storage
        .from('proofs')
        .createSignedUrl(row.proof_path, 3600)
      return { ...row, proof_url: signed?.signedUrl ?? null }
    }),
  )

  return json(200, { donations: withUrls })
})
