import {
  EDGE_CREATE_DONATION,
  EDGE_LIST_DONATIONS,
  EDGE_SUBMIT_PROOF,
  EDGE_VERIFY_DONATION,
  isSupabaseConfigured,
  supabase,
} from './supabase.js'

export const PROOF_BUCKET = 'proofs'

/** Error dengan pesan yang siap ditampilkan ke pengguna (Bahasa Indonesia). */
export class DonationError extends Error {
  constructor(userMessage, { code = null, cause = null } = {}) {
    super(userMessage)
    this.name = 'DonationError'
    this.code = code
    this.cause = cause
  }
}

const NETWORK_MESSAGE = 'Gagal terhubung ke server. Periksa koneksi internet, lalu coba lagi.'

function requireConfigured() {
  if (!isSupabaseConfigured) {
    throw new DonationError(
      'Supabase belum terhubung. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY, lalu jalankan ulang aplikasi.',
      { code: 'NOT_CONFIGURED' },
    )
  }
}

function isNetworkError(error) {
  if (!error) return false
  const text = `${error.message ?? ''} ${error.details ?? ''}`.toLowerCase()
  return (
    error instanceof TypeError ||
    text.includes('failed to fetch') ||
    text.includes('networkerror') ||
    text.includes('load failed')
  )
}

/** Log error dengan aman: hanya message, tanpa objek yang bisa memuat key. */
function safeLog(prefix, error) {
  console.warn(`${prefix}: ${error?.message ?? error}`)
}

async function edgeFetch(url, options) {
  let response
  try {
    response = await fetch(url, options)
  } catch (thrown) {
    if (isNetworkError(thrown)) {
      throw new DonationError(NETWORK_MESSAGE, { code: 'NETWORK', cause: thrown })
    }
    throw new DonationError('Terjadi kesalahan tak terduga. Coba lagi.', { cause: thrown })
  }
  let body = null
  try {
    body = await response.json()
  } catch {
    // body bukan JSON (mis. HTML error page) — biarkan null
  }
  if (!response.ok) {
    const err = body?.error
    throw new DonationError(err?.message ?? 'Permintaan gagal diproses. Coba lagi.', {
      code: err?.code ?? `HTTP_${response.status}`,
      cause: null,
    })
  }
  return body
}

/**
 * Membuat baris donasi 'pending' via Edge Function create-donation.
 * No. transaksi dan kode unik di-generate SERVER-SIDE — client tidak bisa
 * memilih nilainya. Dipanggil saat donatur masuk Langkah 3.
 */
export async function createDonation({ campaignSlug, donorName, hideName, amount, method, message }) {
  requireConfigured()
  return edgeFetch(EDGE_CREATE_DONATION, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      campaign_slug: campaignSlug,
      donor_name: donorName,
      hide_name: hideName,
      amount,
      method,
      message,
    }),
  })
}

/**
 * Mengirim bukti transfer untuk donasi yang sudah dibuat (Langkah 4).
 * File divalidasi ulang di server (magic bytes + ukuran). Idempotent:
 * memakai transaction_no sebagai nama file sehingga retry tidak menduplikasi.
 */
export async function submitProof({ transactionNo, file }) {
  requireConfigured()
  const form = new FormData()
  form.append('transaction_no', transactionNo)
  form.append('proof', file)
  return edgeFetch(EDGE_SUBMIT_PROOF, {
    method: 'POST',
    body: form, // fetch set Content-Type multipart otomatis
  })
}

/**
 * Mengubah status donasi (verified/rejected) via Edge Function verify-donation.
 * Dipakai dashboard admin. Header x-admin-auth berisi base64 email:password.
 */
export async function verifyDonation({ transactionNo, status, rejectionReason, adminAuth }) {
  requireConfigured()
  return edgeFetch(EDGE_VERIFY_DONATION, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-auth': btoa(adminAuth),
    },
    body: JSON.stringify({
      transaction_no: transactionNo,
      status,
      rejection_reason: rejectionReason ?? null,
    }),
  })
}

/**
 * Mengambil donatur yang sudah diverifikasi lewat RPC `list_public_donors`.
 * Fungsi SECURITY DEFINER ini hanya mengembalikan baris berstatus 'verified',
 * menyamarkan nama yang disembunyikan, membatasi kolom, dan meng-clamp limit
 * (maks. 200) — jadi anon tidak pernah bisa membaca tabel `donations` langsung.
 */
export async function getVerifiedDonors({ limit = 100 } = {}) {
  requireConfigured()
  let result
  try {
    result = await supabase.rpc('list_public_donors', { limit_count: limit })
  } catch (thrown) {
    result = { data: null, error: thrown }
  }
  if (result.error) {
    safeLog('Gagal memuat daftar donatur', result.error)
    throw new DonationError('Daftar donatur gagal dimuat. Coba lagi beberapa saat lagi.', {
      code: result.error.code ?? null,
    })
  }
  return result.data ?? []
}

/**
 * Mengambil semua donasi untuk dashboard admin via Edge Function list-donations
 * (dilindungi kredensial admin; termasuk signed URL bukti transfer).
 */
export async function getAdminDonations(adminAuth) {
  requireConfigured()
  const body = await edgeFetch(EDGE_LIST_DONATIONS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-auth': btoa(adminAuth),
    },
    body: JSON.stringify({}),
  })
  return body?.donations ?? []
}
