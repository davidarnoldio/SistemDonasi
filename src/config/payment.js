/**
 * Konfigurasi metode pembayaran rekening & QRIS resmi Yayasan KasihBersama.
 */

export const PAYMENT_GROUP_LABEL = 'Metode Pembayaran'

/**
 * Pilihan metode pembayaran.
 * `id` sesuai dengan nilai yang diizinkan kolom `donations.method`:
 * 'qris' | 'bca' | 'seabank'.
 */
export const paymentMethods = [
  {
    id: 'qris',
    label: 'QRIS',
    kind: 'qr',
    bankName: 'QRIS Semua Pembayaran',
    qrValue: 'https://kasihbersama.id/qris-donasi-nasional',
    description: 'BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana, ShopeePay, LinkAja',
  },
  {
    id: 'bca',
    label: 'Bank BCA',
    kind: 'bank',
    bankName: 'Bank Central Asia (BCA)',
    accountNumber: '1720398610',
    accountName: 'David Arnoldio Pratama',
    branch: 'KCU Jakarta Thamrin',
  },
  {
    id: 'seabank',
    label: 'SeaBank',
    kind: 'bank',
    bankName: 'SeaBank Indonesia',
    accountNumber: '901565563440',
    accountName: 'David Arnoldio Pratama',
    branch: 'Jakarta',
  },
]

/** Daftar id metode yang valid. */
export const METHOD_IDS = paymentMethods.map((method) => method.id)

/** Ambil data satu metode berdasarkan id. */
export function getPaymentMethod(id) {
  return paymentMethods.find((method) => method.id === id) ?? paymentMethods[0]
}
