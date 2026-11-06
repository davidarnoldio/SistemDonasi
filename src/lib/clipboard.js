/** Menyalin teks ke clipboard. Mengembalikan true jika berhasil. */
export async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Izin ditolak atau konteks tidak aman: lanjut ke cara cadangan di bawah.
  }

  const previouslyFocused = document.activeElement
  const field = document.createElement('textarea')
  field.value = text
  field.setAttribute('readonly', '')
  field.style.position = 'fixed'
  field.style.opacity = '0'
  document.body.appendChild(field)
  field.select()
  let copied = false
  try {
    copied = document.execCommand('copy')
  } catch {
    copied = false
  }
  document.body.removeChild(field)
  // Kembalikan fokus agar pengguna keyboard tidak "terlempar" keluar dari modal.
  if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
  return copied
}
