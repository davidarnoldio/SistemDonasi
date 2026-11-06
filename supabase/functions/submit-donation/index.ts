// Edge Function: submit-donation
// Menerima JSON { campaign_slug, donor_name, hide_name, amount, method, message }
// dan file bukti (multipart/form-data) atau link path upload sebelumnya.
// Insert donasi + upload bukti memakai service_role (bypass RLS) supaya:
//  - anon tidak butuh policy insert/update apa pun (permukaan serangan kecil)
//  - no. transaksi & kode unik di-generate server-side (idempotent, tak bisa dipalsukan)
//
// Deploy: supabase functions deploy submit-donation --no-verify-jwt
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MAX_BYTES = 2 * 1024 * 1024
const ALLOWED_MIME = ['image/jpeg', 'image/png']

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

// Deteksi tipe file dari magic bytes (bukan sekadar mime yang dikirim client)
function sniffMime(bytes) {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png'
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  return null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return fail(405, 'METHOD_NOT_ALLOWED', 'Gunakan POST.')

  const url = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !serviceKey) {
    return fail(500, 'NOT_CONFIGURED', 'Edge Function belum dikonfigurasi (SUPABASE_URL / SERVICE_ROLE_KEY).')
  }

  // Membatasi ukuran body sebelum diproses (proteksi dasar spam).
  const contentLength = Number(req.headers.get('content-length') ?? 0)
  if (contentLength > MAX_BYTES + 64 * 1024) {
    return fail(413, 'FILE_TOO_LARGE', 'Ukuran file terlalu besar. Maksimal 2 MB.')
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

  try {
    const form = await req.formData()
    const get = (k) => String(form.get(k) ?? '').trim()

    const payload = {
      campaign_slug: get('campaign_slug') || 'donasi-umum',
      donor_name: get('donor_name') || 'Hamba Allah',
      hide_name: get('hide_name') === 'true',
      amount: Number(get('amount')),
      method: get('method'),
      message: get('message'),
    }

    // --- Validasi server-side (sama aturan dengan Zod di frontend) ---
    if (!Number.isInteger(payload.amount) || payload.amount < 10000 || payload.amount > 50000000) {
      return fail(400, 'INVALID_AMOUNT', 'Nominal donasi harus antara Rp 10.000 dan Rp 50.000.000.')
    }
    if (!['qris', 'bca', 'seabank'].includes(payload.method)) {
      return fail(400, 'INVALID_METHOD', 'Metode pembayaran tidak dikenal.')
    }
    if (payload.donor_name.length < 1 || payload.donor_name.length > 80) {
      return fail(400, 'INVALID_NAME', 'Nama donatur 1-80 karakter.')
    }
    if (payload.message && payload.message.length > 200) {
      return fail(400, 'INVALID_MESSAGE', 'Doa & dukungan maksimal 200 karakter.')
    }

    // --- Validasi & upload bukti (multipart "proof") ---
    let proofPath = null
    const file = form.get('proof')
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_BYTES) {
        return fail(413, 'FILE_TOO_LARGE', 'Ukuran file terlalu besar. Maksimal 2 MB.')
      }
      const head = new Uint8Array(await file.slice(0, 12).arrayBuffer())
      const realMime = sniffMime(head)
      if (!realMime || !ALLOWED_MIME.includes(realMime)) {
        return fail(400, 'INVALID_FILE', 'File bukan gambar JPG/PNG yang valid.')
      }
      const ext = realMime === 'image/png' ? 'png' : 'jpg'
      proofPath = `proofs/${crypto.randomUUID()}.${ext}`
      const { error: upErr } = await admin.storage
        .from('proofs')
        .upload(proofPath, file, { contentType: realMime, upsert: false })
      if (upErr) return fail(500, 'UPLOAD_FAILED', 'Bukti transfer gagal diunggah. Coba lagi.')
    }

    // --- Insert via RPC SECURITY DEFINER: transaksi + kode unik server-side ---
    const { data: row, error: rpcErr } = await admin
      .rpc('create_donation_server', { payload: { ...payload, proof_path: proofPath } })
      .single()
    if (rpcErr) {
      return fail(500, 'INSERT_FAILED', 'Donasi gagal disimpan. Coba lagi.')
    }

    return json(200, {
      transaction_no: row.transaction_no,
      unique_code: row.unique_code,
      amount: row.amount,
      total: row.amount + row.unique_code,
      status: row.status,
      created_at: row.created_at,
    })
  } catch (err) {
    // Body bukan form-data yang valid, dsb. Jangan bocorkan detail internal.
    return fail(400, 'BAD_REQUEST', 'Permintaan tidak valid.')
  }
})
