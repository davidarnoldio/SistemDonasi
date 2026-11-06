// Edge Function: create-donation
// Dipanggil saat donatur masuk Langkah 3 (Pilih Pembayaran). Membuat baris
// donasi berstatus 'pending' dan mengembalikan no. transaksi + kode unik yang
// di-generate SERVER-SIDE (tidak bisa dipalsukan/dipilih client).
//
// Deploy: supabase functions deploy create-donation --no-verify-jwt
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return fail(405, 'METHOD_NOT_ALLOWED', 'Gunakan POST.')

  const url = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !serviceKey) {
    return fail(500, 'NOT_CONFIGURED', 'Edge Function belum dikonfigurasi.')
  }

  let body
  try {
    body = await req.json()
  } catch {
    return fail(400, 'BAD_REQUEST', 'Body harus JSON.')
  }

  const payload = {
    campaign_slug: String(body?.campaign_slug ?? 'donasi-umum').trim(),
    donor_name: String(body?.donor_name ?? 'Hamba Allah').trim() || 'Hamba Allah',
    hide_name: Boolean(body?.hide_name),
    amount: Number(body?.amount),
    method: String(body?.method ?? ''),
    message: String(body?.message ?? '').trim() || null,
  }

  // --- Validasi server-side, aturan sama dengan Zod di frontend ---
  if (!Number.isInteger(payload.amount) || payload.amount < 10000 || payload.amount > 50000000) {
    return fail(400, 'INVALID_AMOUNT', 'Nominal donasi harus antara Rp 10.000 dan Rp 50.000.000.')
  }
  if (!['qris', 'bca', 'seabank'].includes(payload.method)) {
    return fail(400, 'INVALID_METHOD', 'Metode pembayaran tidak dikenal.')
  }
  if (payload.donor_name.length > 80) {
    return fail(400, 'INVALID_NAME', 'Nama donatur maksimal 80 karakter.')
  }
  if (payload.message && payload.message.length > 200) {
    return fail(400, 'INVALID_MESSAGE', 'Doa & dukungan maksimal 200 karakter.')
  }

  // Throttle ringan: 1 IP maksimal 10 donasi/menit lewat Upstash-style header
  // tidak tersedia di project ini, jadi cukup bergantung pada limit platform.

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
  const { data: row, error: rpcErr } = await admin
    .rpc('create_donation_server', { payload })
    .single()
  if (rpcErr) {
    return fail(500, 'INSERT_FAILED', 'Donasi gagal dibuat. Coba lagi.')
  }

  return json(200, {
    transaction_no: row.transaction_no,
    unique_code: row.unique_code,
    amount: row.amount,
    total: row.amount + row.unique_code,
    status: row.status,
  })
})
