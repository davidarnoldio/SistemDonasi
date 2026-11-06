// Semua format angka memakai Intl.NumberFormat('id-ID'): titik sebagai pemisah ribuan.
const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})
const numberFormatter = new Intl.NumberFormat('id-ID')
const sizeFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 })
const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** 50000 -> "Rp 50.000" */
export function formatRupiah(value) {
  return rupiahFormatter.format(value)
}

/** 50000 -> "50.000" */
export function formatNumber(value) {
  return numberFormatter.format(value)
}

// Nominal maksimal 50.000.000 (8 digit). Input boleh sampai 9 digit supaya pesan
// "Maksimal donasi ..." bisa tampil saat pengguna mengetik terlalu besar.
const MAX_AMOUNT_DIGITS = 9

/** Teks input -> angka. Hanya digit yang diterima: "5a0.000" -> 50000 */
export function parseAmountInput(text) {
  const digits = String(text).replace(/\D/g, '').slice(0, MAX_AMOUNT_DIGITS)
  return digits ? Number(digits) : 0
}

/** Angka -> teks input dengan titik ribuan. 0 ditampilkan kosong. */
export function formatAmountInput(amount) {
  return amount > 0 ? numberFormatter.format(amount) : ''
}

/** Kode unik 3 digit (100 sampai 999) untuk membantu mencocokkan transfer. */
export function generateUniqueCode() {
  return Math.floor(Math.random() * 900) + 100
}

/** Nomor transaksi berformat KB-YYYYMMDD-XXXXXX (XXXXXX = 6 digit acak). */
export function generateTransactionNo(now = new Date()) {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')
  return `KB-${year}${month}${day}-${random}`
}

/** 1536000 -> "1,5 MB" */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${sizeFormatter.format(bytes / (1024 * 1024))} MB`
}

/** "2026-11-02T04:00:00Z" -> "2 November 2026". Mengembalikan "" jika tidak valid. */
export function formatDate(isoString) {
  const date = new Date(isoString)
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date)
}
