import { z } from 'zod'
import { DONATION_RULES } from '../config/campaign.js'
import { METHOD_IDS } from '../config/payment.js'
import { formatRupiah } from './format.js'

const { minAmount, maxAmount, maxNameLength, maxMessageLength } = DONATION_RULES

/** Aturan bukti transfer: hanya JPG/PNG, maksimal 2 MB. */
export const PROOF_RULES = {
  maxBytes: 2 * 1024 * 1024,
  types: ['image/jpeg', 'image/png'],
}

export const donationSchema = z.object({
  amount: z
    .number()
    .int('Nominal harus berupa bilangan bulat.')
    .min(minAmount, `Minimal donasi ${formatRupiah(minAmount)}.`)
    .max(maxAmount, `Maksimal donasi ${formatRupiah(maxAmount)}.`),
  name: z.string().trim().max(maxNameLength, `Nama maksimal ${maxNameLength} karakter.`),
  hideName: z.boolean(),
  message: z.string().max(maxMessageLength, `Doa & dukungan maksimal ${maxMessageLength} karakter.`),
  method: z.string().refine((value) => METHOD_IDS.includes(value), 'Pilih salah satu metode pembayaran.'),
})

const amountSchema = donationSchema.shape.amount.min(1, 'Masukkan nominal donasi.')

const requiredNameSchema = z
  .string()
  .trim()
  .min(1, 'Nama lengkap wajib diisi.')
  .max(maxNameLength, `Nama maksimal ${maxNameLength} karakter.`)

const optionalNameSchema = donationSchema.shape.name

const messageSchema = donationSchema.shape.message

const methodSchema = donationSchema.shape.method

function firstIssue(result) {
  return result.success ? null : result.error.issues[0].message
}

/** Langkah 1. Mengembalikan objek error per field ({} jika valid). */
export function validateAmount(amount) {
  const message = firstIssue(amountSchema.safeParse(amount))
  return message ? { amount: message } : {}
}

/** Langkah 2. Nama wajib kecuali "Sembunyikan nama" dicentang. */
export function validateProfile({ name, hideName, message }) {
  const errors = {}
  const nameError = firstIssue((hideName ? optionalNameSchema : requiredNameSchema).safeParse(name))
  if (nameError) errors.name = nameError
  const messageError = firstIssue(messageSchema.safeParse(message))
  if (messageError) errors.message = messageError
  return errors
}

/** Langkah 3. */
export function validateMethod(method) {
  const message = firstIssue(methodSchema.safeParse(method ?? ''))
  return message ? { method: message } : {}
}

/** Validasi per langkah. Langkah 4 divalidasi lewat validateProofFile. */
export function validateStep(step, data) {
  if (step === 1) return validateAmount(data.amount)
  if (step === 2) return validateProfile(data)
  if (step === 3) return validateMethod(data.method)
  return {}
}

/** Membaca beberapa byte pertama file untuk mengenali JPG/PNG yang asli. */
async function sniffImageType(file) {
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  const isPng =
    head.length >= 8 &&
    head[0] === 0x89 &&
    head[1] === 0x50 &&
    head[2] === 0x4e &&
    head[3] === 0x47 &&
    head[4] === 0x0d &&
    head[5] === 0x0a &&
    head[6] === 0x1a &&
    head[7] === 0x0a
  if (isPng) return 'image/png'
  const isJpeg = head.length >= 3 && head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff
  return isJpeg ? 'image/jpeg' : null
}

/**
 * Validasi bukti transfer. Mengembalikan pesan error (string) atau null jika valid.
 * Selain tipe dan ukuran, isi file diperiksa agar file lain yang hanya diganti
 * namanya menjadi .png tidak lolos.
 */
export async function validateProofFile(file) {
  if (!file) return 'Pilih gambar bukti transfer terlebih dahulu.'
  if (!PROOF_RULES.types.includes(file.type)) {
    return 'Format file tidak didukung. Gunakan gambar JPG atau PNG.'
  }
  if (file.size === 0) return 'File kosong atau rusak. Pilih gambar lain.'
  if (file.size > PROOF_RULES.maxBytes) return 'Ukuran file terlalu besar. Maksimal 2 MB.'
  const realType = await sniffImageType(file)
  if (realType !== file.type) return 'File bukan gambar JPG atau PNG yang valid. Pilih gambar lain.'
  return null
}
