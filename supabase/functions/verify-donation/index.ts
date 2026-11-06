// Edge Function: verify-donation
// Dipakai dashboard admin untuk ubah status donasi (verified/rejected).
// Kredensial admin divalidasi lewat env ADMIN_EMAIL + ADMIN_PASSWORD_HASH
// (SHA-256), dikirim client di header x-admin-auth (base64 "email:password").
// Sesi disimpan di sessionStorage dengan token acak dari response.
//
// Deploy: supabase functions deploy verify-donation --no-verify-jwt
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

/** Validasi kredensial admin dari header x-admin-auth (base64 email:password). */
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

  let body
  try {
    body = await req.json()
  } catch {
    return fail(400, 'BAD_REQUEST', 'Body harus JSON.')
  }

  const transactionNo = String(body?.transaction_no ?? '').trim()
  const status = String(body?.status ?? '')
  const reason = String(body?.rejection_reason ?? '').trim() || null

  if (!transactionNo) return fail(400, 'MISSING_TX', 'Nomor transaksi wajib diisi.')
  if (!['verified', 'rejected'].includes(status)) {
    return fail(400, 'INVALID_STATUS', 'Status harus "verified" atau "rejected".')
  }
  if (status === 'rejected' && !reason) {
    return fail(400, 'MISSING_REASON', 'Alasan penolakan wajib diisi.')
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
  const { data, error } = await admin
    .from('donations')
    .update({
      status,
      rejection_reason: reason,
      verified_at: status === 'verified' ? new Date().toISOString() : null,
    })
    .eq('transaction_no', transactionNo)
    .select('transaction_no, status')
    .single()

  if (error) {
    return fail(500, 'UPDATE_FAILED', 'Gagal memperbarui status donasi.')
  }
  return json(200, { ok: true, donation: data })
})
