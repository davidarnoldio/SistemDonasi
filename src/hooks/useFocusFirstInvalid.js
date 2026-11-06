import { useEffect } from 'react'

/**
 * Setelah pengguna menekan "Lanjutkan" dan ada isian yang salah, pindahkan
 * fokus ke isian pertama yang bermasalah supaya pesan error langsung terbaca.
 * `attemptCount` bertambah setiap percobaan yang gagal.
 */
export function useFocusFirstInvalid(containerRef, attemptCount) {
  useEffect(() => {
    if (attemptCount === 0) return
    const target = containerRef.current?.querySelector(
      'input[aria-invalid="true"], textarea[aria-invalid="true"], [role="radiogroup"][aria-invalid="true"] input',
    )
    target?.focus()
  }, [attemptCount, containerRef])
}
